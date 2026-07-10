/**
 * saveEngine tests (Task 14, PLAN.md §11).
 *
 * Acceptance (V2, S6):
 *   - serialize(rootState, slotName) → JSON string accepted by
 *     SaveSlotV2Schema.parse (round-trip integrity).
 *   - serialize emits ONLY the 7 declared fields (no state leak from
 *     RootState; defensive against future widening).
 *   - deserialize throws on invalid JSON.
 *   - deserialize throws on schemaVersion 0 and 3 (unknown versions with no
 *     registered migration).
 *   - deserialize accepts a valid V2 payload and returns the parsed object.
 *   - deserialize LIFTS a legacy V1 payload via MIGRATION_MAP[1]: every
 *     ledger trace gains stageOneAncestryId derived from its own
 *     (sourceTaskId, sourceChoiceId) — lossless backfill (Q31).
 */
import { makeStageOneAncestryId } from '@schemas/resultTrace.schema'
import { describe, it, expect } from 'vitest'
import {
  serialize,
  deserialize,
  MIGRATION_MAP,
  CURRENT_SCHEMA_VERSION,
} from '@systems/saveEngine'
import {
  SaveSlotV2Schema,
  type SaveSlotV1,
  type SaveSlotV2,
} from '@schemas/saveSlot.schema'
import type { ResultTrace } from '@schemas/resultTrace.schema'
import type { RootState } from '@state/store'
import {
  fxTaskId,
  fxChoiceId,
  fxConsequenceId,
  fxTraceId,
  fxMeters,
} from '@tests/schemas/fixtures'
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'

function makeHook(): ConsequenceHook {
  return {
    id: fxConsequenceId('cons-save-001'),
    sourceTaskId: fxTaskId('task-save-001'),
    sourceChoiceId: fxChoiceId('choice-save-001'),
    traceHint: 'A consequence is pending.',
    ledgerEntry: 'Pending: the worker has not yet retaliated.',
    revealCondition: { type: 'PHASE', phase: 'CONSEQUENCE_RETURN' },
    whyNow: 'They are waiting for inspection day.',
    whatChanged: 'Nothing visible yet.',
  }
}

function makeTrace(): ResultTrace {
  return {
    id: fxTraceId('trace-save-001'),
    sourceTaskId: fxTaskId('task-save-001'),
    sourceChoiceId: fxChoiceId('choice-save-001'),
    stageOneAncestryId: makeStageOneAncestryId('task-save-001', 'choice-save-001'),
    timestamp: 1_700_000_000_000,
    body: 'You pushed the workers.',
  }
}

/**
 * Build a `RootState`-shaped fixture WITHOUT instantiating the actual store.
 * We only set the fields the engine reads — the engine narrows its input via
 * its `SerializeInput` interface, so missing slice methods are irrelevant
 * here. Cast through unknown to satisfy the strict RootState type.
 */
function makeRootStateLike(): RootState {
  return {
    meters: fxMeters({ CAPITAL: 5, HUMAN_WELFARE: 3, OWNER_CONTROL: 7 }),
    scheduledConsequences: [makeHook()],
    ledger: [makeTrace()],
    phase: 'INSPECTION',
    // Fields below are intentionally not narrowed in saveEngine. They are
    // present on RootState but MUST NOT appear in the serialized output.
    currentPromptId: null,
    installedModules: {},
    flags: new Set<string>(['SILAS_OVERRIDE_AVAILABLE']),
    currentInspectionSceneIndex: null,
    capitalDeployedThisQuarter: true,
    pendingFiredHooks: [],
    lastSavedAt: null,
    isHydrated: true,
  } as unknown as RootState
}

describe('saveEngine — serialize', () => {
  it('produces a JSON string that parses into a SaveSlotV2Schema-valid object', () => {
    const json = serialize(makeRootStateLike(), 'Slot A')
    expect(typeof json).toBe('string')

    const parsed = JSON.parse(json)
    expect(() => SaveSlotV2Schema.parse(parsed)).not.toThrow()
  })

  it('writes ONLY the 7 declared SaveSlotV1 fields (no state leak)', () => {
    const json = serialize(makeRootStateLike(), 'Slot A')
    const parsed = JSON.parse(json) as Record<string, unknown>

    expect(Object.keys(parsed).sort()).toEqual(
      [
        'schemaVersion',
        'slotName',
        'savedAt',
        'meters',
        'scheduledConsequences',
        'currentPhase',
        'ledger',
      ].sort(),
    )

    // Defense: forbidden RootState fields MUST NOT leak.
    expect(parsed).not.toHaveProperty('flags')
    expect(parsed).not.toHaveProperty('installedModule')
    expect(parsed).not.toHaveProperty('installedModules')
    expect(parsed).not.toHaveProperty('currentPromptId')
    expect(parsed).not.toHaveProperty('capitalDeployedThisQuarter')
    expect(parsed).not.toHaveProperty('pendingFiredHooks')
    expect(parsed).not.toHaveProperty('isHydrated')
    expect(parsed).not.toHaveProperty('lastSavedAt')
    expect(parsed).not.toHaveProperty('phase') // mapped to currentPhase
  })

  it('maps RootState.phase to SaveSlotV1.currentPhase', () => {
    const json = serialize(makeRootStateLike(), 'Slot A')
    const parsed = JSON.parse(json) as SaveSlotV2
    expect(parsed.currentPhase).toBe('INSPECTION')
  })

  it('stamps schemaVersion as CURRENT_SCHEMA_VERSION (2 since S6)', () => {
    const json = serialize(makeRootStateLike(), 'Slot A')
    const parsed = JSON.parse(json) as SaveSlotV2
    expect(parsed.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(parsed.schemaVersion).toBe(2)
  })

  it('uses the caller-provided slot name verbatim', () => {
    const json = serialize(makeRootStateLike(), 'My Save')
    const parsed = JSON.parse(json) as SaveSlotV2
    expect(parsed.slotName).toBe('My Save')
  })

  it('stamps savedAt with a number close to Date.now() at write time', () => {
    const before = Date.now()
    const json = serialize(makeRootStateLike(), 'Slot A')
    const after = Date.now()
    const parsed = JSON.parse(json) as SaveSlotV2
    expect(typeof parsed.savedAt).toBe('number')
    expect(parsed.savedAt).toBeGreaterThanOrEqual(before)
    expect(parsed.savedAt).toBeLessThanOrEqual(after)
  })
})

/** Legacy pre-S6 trace shape — no stageOneAncestryId. */
function makeLegacyTrace(): Omit<ResultTrace, 'stageOneAncestryId'> {
  const { stageOneAncestryId: _omit, ...legacy } = makeTrace()
  void _omit
  return legacy
}

function makeValidV1(): SaveSlotV1 {
  return {
    schemaVersion: 1,
    slotName: 'Slot A',
    savedAt: 1_700_000_000_000,
    meters: fxMeters({ CAPITAL: 5, HUMAN_WELFARE: 3, OWNER_CONTROL: 7 }),
    scheduledConsequences: [makeHook()],
    currentPhase: 'INSPECTION',
    ledger: [makeLegacyTrace()],
  }
}

function makeValidV2(): SaveSlotV2 {
  return {
    schemaVersion: 2,
    slotName: 'Slot A',
    savedAt: 1_700_000_000_000,
    meters: fxMeters({ CAPITAL: 5, HUMAN_WELFARE: 3, OWNER_CONTROL: 7 }),
    scheduledConsequences: [makeHook()],
    currentPhase: 'INSPECTION',
    ledger: [makeTrace()],
  }
}

describe('saveEngine — deserialize', () => {
  it('accepts a valid V2 payload and returns the parsed object', () => {
    const json = JSON.stringify(makeValidV2())
    const parsed = deserialize(json)
    expect(parsed.schemaVersion).toBe(2)
    expect(parsed.slotName).toBe('Slot A')
    expect(parsed.meters.CAPITAL).toBe(5)
    expect(parsed.currentPhase).toBe('INSPECTION')
    expect(parsed.ledger).toHaveLength(1)
    expect(parsed.scheduledConsequences).toHaveLength(1)
  })

  it('lifts a legacy V1 payload — backfills stageOneAncestryId from source fields (Q31)', () => {
    const v1 = makeValidV1()
    const parsed = deserialize(JSON.stringify(v1))
    expect(parsed.schemaVersion).toBe(2)
    expect(parsed.ledger).toHaveLength(1)
    const lifted = parsed.ledger[0]!
    const legacy = v1.ledger[0]!
    expect(lifted.stageOneAncestryId).toBe(
      makeStageOneAncestryId(legacy.sourceTaskId, legacy.sourceChoiceId),
    )
    // Backfill is lossless — every original field survives.
    expect(lifted.id).toBe(legacy.id)
    expect(lifted.body).toBe(legacy.body)
    expect(lifted.timestamp).toBe(legacy.timestamp)
  })

  it('rejects malformed JSON', () => {
    expect(() => deserialize('not json')).toThrow()
    expect(() => deserialize('{broken')).toThrow()
  })

  it('rejects schemaVersion 0 (no migration registered)', () => {
    const v0 = JSON.stringify({ ...makeValidV2(), schemaVersion: 0 })
    expect(() => deserialize(v0)).toThrow(/schema/i)
  })

  it('rejects schemaVersion 3 (no migration registered)', () => {
    const v3 = JSON.stringify({ ...makeValidV2(), schemaVersion: 3 })
    expect(() => deserialize(v3)).toThrow(/schema/i)
  })

  it('rejects a v2 payload that fails Zod validation (missing meter key)', () => {
    const bad = JSON.stringify({
      ...makeValidV2(),
      meters: { CAPITAL: 1, HUMAN_WELFARE: 1 },
    })
    expect(() => deserialize(bad)).toThrow()
  })

  it('rejects a payload missing schemaVersion entirely', () => {
    const { schemaVersion: _omit, ...rest } = makeValidV2()
    void _omit
    expect(() => deserialize(JSON.stringify(rest))).toThrow()
  })
})

describe('saveEngine — MIGRATION_MAP', () => {
  it('registers exactly the V1 → V2 lift (S6)', () => {
    expect(MIGRATION_MAP).toBeDefined()
    expect(Object.keys(MIGRATION_MAP)).toEqual(['1'])
    expect(typeof MIGRATION_MAP[1]).toBe('function')
  })

  it('deserialize on schemaVersion === CURRENT_SCHEMA_VERSION never consults MIGRATION_MAP', () => {
    // A clean V2 payload must round-trip untouched — the chain walker bails
    // out immediately at the current version.
    const valid: SaveSlotV2 = {
      schemaVersion: 2,
      slotName: 'X',
      savedAt: 1,
      meters: fxMeters(),
      scheduledConsequences: [],
      currentPhase: 'BOOT',
      ledger: [],
    }
    const out = deserialize(JSON.stringify(valid))
    expect(out).toEqual(valid)
  })
})

describe('saveEngine — round-trip', () => {
  it('serialize → deserialize yields an equivalent payload', () => {
    const root = makeRootStateLike()
    const json = serialize(root, 'Round Trip')
    const back = deserialize(json)

    expect(back.slotName).toBe('Round Trip')
    expect(back.schemaVersion).toBe(2)
    expect(back.currentPhase).toBe('INSPECTION')
    expect(back.meters).toEqual(root.meters)
    expect(back.scheduledConsequences).toHaveLength(1)
    expect(back.ledger).toHaveLength(1)
  })
})
