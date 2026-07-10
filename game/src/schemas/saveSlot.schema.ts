/**
 * SaveSlot — the persisted, versioned save format.
 *
 * `schemaVersion` is the migration wedge: the loader (saveEngine) branches on
 * the literal and walks MIGRATION_MAP until the payload is current. Boot
 * transients and UI state are NOT persisted (§11): only meters, scheduled
 * consequences, current phase, and the ledger.
 *
 * V2 (S6): ledger traces carry a required `stageOneAncestryId` (Q31). V1 is
 * kept as the legacy shape — its ledger uses the pre-S6 trace layout — so the
 * V1→V2 migration in saveEngine can validate/lift old exports.
 *
 * `meters` is a full Record<MeterKey, number> (not Partial) because every
 * meter must have a defined value at save time.
 */
import { z } from 'zod'
import {
  MeterKeySchema,
  SlicePhaseSchema,
} from '@schemas/gameState.schema'
import { ConsequenceHookSchema } from '@schemas/consequenceHook.schema'
import { ResultTraceSchema } from '@schemas/resultTrace.schema'

/** Pre-S6 trace shape — no stageOneAncestryId. Used only by the V1 legacy schema. */
const LegacyResultTraceV1Schema = ResultTraceSchema.omit({
  stageOneAncestryId: true,
})

/** Legacy V1 slot shape (pre-S6 exports). Deserialization lifts this to V2. */
export const SaveSlotV1Schema = z.object({
  schemaVersion: z.literal(1),
  slotName: z.string().min(1),
  /** Date.now() at save time. */
  savedAt: z.number(),
  meters: z.record(MeterKeySchema, z.number()),
  scheduledConsequences: z.array(ConsequenceHookSchema),
  currentPhase: SlicePhaseSchema,
  ledger: z.array(LegacyResultTraceV1Schema),
})

export type SaveSlotV1 = z.infer<typeof SaveSlotV1Schema>

export const SaveSlotV2Schema = z.object({
  schemaVersion: z.literal(2),
  slotName: z.string().min(1),
  /** Date.now() at save time. */
  savedAt: z.number(),
  /** Every meter has a defined value at save time. */
  meters: z.record(MeterKeySchema, z.number()),
  /** Hooks queued but not yet revealed. */
  scheduledConsequences: z.array(ConsequenceHookSchema),
  currentPhase: SlicePhaseSchema,
  /** Immutable ledger of fired consequences and resolved directives. */
  ledger: z.array(ResultTraceSchema),
})

export type SaveSlotV2 = z.infer<typeof SaveSlotV2Schema>
