/**
 * saveEngine — explicit serialize/deserialize for the versioned SaveSlotV1
 * format (Task 14, PLAN.md §11).
 *
 * Separate from the Zustand persist middleware (`echo9:autosave`): persist
 * handles automatic gameplay autosave to localStorage. saveEngine is the
 * boundary for EXPLICIT slots — manual export/import, future named-slot UIs,
 * postmortem dumps. Distinct storage key, distinct lifecycle.
 *
 * Why the narrow projection (only 7 SaveSlot fields):
 *   RootState carries fields that SaveSlotV1Schema does NOT declare (flags,
 *   installedModules, currentPromptId, capitalDeployedThisQuarter,
 *   pendingFiredHooks). Widening the schema would invalidate the existing
 *   saveSlot.schema.test.ts and is out of scope for T14. If a future task
 *   needs broader state in saves, that is a V2 migration — bump the schema
 *   version, register a migration here, ship V2 alongside V1.
 *
 * MIGRATION_MAP is the wedge for that future V2: today it is empty.
 * deserialize on a non-current schemaVersion that has no registered
 * migration throws; this is the safe default until V2 ships.
 */
import {
  SaveSlotV1Schema,
  SaveSlotV2Schema,
  type SaveSlotV2,
} from '@schemas/saveSlot.schema'
import { makeStageOneAncestryId } from '@schemas/resultTrace.schema'
import type { RootState } from '@state/store'

export const CURRENT_SCHEMA_VERSION = 2 as const

/**
 * Future migrations live here. Each entry maps a SOURCE version number to a
 * function that lifts a payload from that version to the next. The loader
 * walks the chain: vN → vN+1 → ... → CURRENT_SCHEMA_VERSION. Migration must
 * return an object whose schemaVersion is the NEXT version (so the chain
 * walker advances). The loop guard throws if a migration fails to advance.
 */
export const MIGRATION_MAP: Record<number, (raw: unknown) => unknown> = {
  // V1 → V2 (S6, Q31): every ledger trace gains stageOneAncestryId, derived
  // losslessly from its own (sourceTaskId, sourceChoiceId) back-pointers.
  // Validate the payload as V1 FIRST so corrupt exports fail with a schema
  // error rather than a mid-map crash.
  1: (raw) => {
    const v1 = SaveSlotV1Schema.parse(raw)
    return {
      ...v1,
      schemaVersion: 2,
      ledger: v1.ledger.map((trace) => ({
        ...trace,
        stageOneAncestryId: makeStageOneAncestryId(
          trace.sourceTaskId,
          trace.sourceChoiceId,
        ),
      })),
    }
  },
}

/**
 * Narrowed view of RootState that the engine actually reads. Keeps the engine
 * decoupled from the rest of the store surface — adding a new slice does not
 * change save shape unless saveSlot.schema.ts is updated too.
 */
type SerializeInput = Pick<
  RootState,
  'meters' | 'scheduledConsequences' | 'ledger' | 'phase'
>

/**
 * Serialize the live root state into a versioned JSON string.
 *
 * The returned string is what callers persist or hand to the player as an
 * export. Round-trip integrity: JSON.parse(serialize(s, n)) is accepted by
 * SaveSlotV1Schema.parse().
 */
export function serialize(state: SerializeInput, slotName: string): string {
  const payload: SaveSlotV2 = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    slotName,
    savedAt: Date.now(),
    meters: state.meters,
    scheduledConsequences: state.scheduledConsequences,
    currentPhase: state.phase,
    ledger: state.ledger,
  }
  // Round-trip validate at write time — fail loud if the live state somehow
  // contains values the schema rejects (e.g. an unknown meter key).
  const validated = SaveSlotV2Schema.parse(payload)
  return JSON.stringify(validated)
}

/**
 * Deserialize a JSON save payload.
 *
 * Reads schemaVersion FIRST, applies migrations from MIGRATION_MAP until the
 * payload is at CURRENT_SCHEMA_VERSION, then validates with the V1 schema.
 * Throws on:
 *   - malformed JSON,
 *   - missing/invalid schemaVersion,
 *   - non-current schemaVersion with no registered migration,
 *   - V1-shaped payload that fails Zod validation.
 */
const readVersion = (value: unknown): number => {
  if (typeof value !== 'object' || value === null) {
    throw new Error('saveEngine.deserialize: payload missing numeric schemaVersion')
  }
  const v = (value as Record<string, unknown>).schemaVersion
  if (typeof v !== 'number' || !Number.isInteger(v)) {
    throw new Error(
      `saveEngine.deserialize: payload missing numeric schemaVersion (got ${String(v)})`,
    )
  }
  return v
}

export function deserialize(json: string): SaveSlotV2 {
  const raw: unknown = JSON.parse(json)

  let current: unknown = raw
  let version = readVersion(raw)

  // Walk the migration chain. Bail out as soon as we reach the current
  // version. Throw if we land at a version with no registered migration.
  while (version !== CURRENT_SCHEMA_VERSION) {
    const migrate = MIGRATION_MAP[version]
    if (!migrate) {
      throw new Error(
        `saveEngine.deserialize: unknown schemaVersion ${String(version)} ` +
          `(no migration registered; CURRENT=${String(CURRENT_SCHEMA_VERSION)})`,
      )
    }
    current = migrate(current)
    const nextVersion = readVersion(current)
    if (nextVersion === version) {
      throw new Error(
        `saveEngine.deserialize: migration from v${String(version)} ` +
          `did not advance the schemaVersion`,
      )
    }
    version = nextVersion
  }

  return SaveSlotV2Schema.parse(current)
}
