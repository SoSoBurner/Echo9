/**
 * S6 — stageOneAncestryId (Q31).
 *
 * Every trace carries a lineage key derived from its own (sourceTaskId,
 * sourceChoiceId) so Stage 4/5 consequences can trace back to the exact
 * Stage-1 decision. Cases:
 *   1. Helper determinism + format (`s1:<taskId>:<choiceId>`), schema round-trip.
 *   2. resolveChoice writes a matching ancestry id on its trace.
 *   3. Persist migration v5 → v6 backfills legacy ledger traces losslessly.
 *   4. A blob already at PERSIST_VERSION passes through untouched.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  makeStageOneAncestryId,
  StageOneAncestryIdSchema,
} from '@schemas/resultTrace.schema'
import { resolveChoice } from '@systems/choiceResolver'
import { useGameStore, PERSIST_KEY, PERSIST_VERSION } from '@state/store'
import { METER_INITIAL_VALUES } from '@state/metersSlice'
import { PANEL_IDS } from '@systems/tutorial/hudDisclosure'
import { CHOICE_REDUCE_40 } from '@content/choices/q1/week1-mercy-margin.choices'
import { ALL_CONSEQUENCE_MODULES } from '@content/index'
import { fxTraceId, fxMeters } from '@tests/schemas/fixtures'

const HOOK_CATALOG = new Map(ALL_CONSEQUENCE_MODULES.map((h) => [h.id, h]))

describe('makeStageOneAncestryId', () => {
  it('is deterministic and formats as s1:<taskId>:<choiceId>', () => {
    const a = makeStageOneAncestryId('task-east-wilmer-01', 'choice-reduce-40')
    const b = makeStageOneAncestryId('task-east-wilmer-01', 'choice-reduce-40')
    expect(a).toBe(b)
    expect(a).toBe('s1:task-east-wilmer-01:choice-reduce-40')
  })

  it('round-trips through StageOneAncestryIdSchema', () => {
    const id = makeStageOneAncestryId('t', 'c')
    expect(() => StageOneAncestryIdSchema.parse(id)).not.toThrow()
    expect(() => StageOneAncestryIdSchema.parse('not-an-ancestry-id')).toThrow()
  })
})

describe('resolveChoice — ancestry stamping', () => {
  it('writes a trace whose ancestry id matches its own source fields', () => {
    const state = {
      meters: fxMeters(),
      scheduledConsequences: [],
      ledger: [],
    }
    const { trace } = resolveChoice(state, CHOICE_REDUCE_40, HOOK_CATALOG, {
      now: 1_700_000_000_000,
      traceId: fxTraceId('trace-ancestry-01'),
    })
    expect(trace.stageOneAncestryId).toBe(
      makeStageOneAncestryId(trace.sourceTaskId, trace.sourceChoiceId),
    )
  })
})

function emptyUseCount(): Record<string, number> {
  const out: Record<string, number> = {}
  for (const id of PANEL_IDS) out[id] = 0
  return out
}

function seedBlob(ledger: unknown[], version: number): void {
  const blob = {
    state: {
      meters: { ...METER_INITIAL_VALUES },
      scheduledConsequences: [],
      ledger,
      currentPromptId: null,
      installedModules: {},
      flags: [],
      capitalDeployedThisQuarter: false,
      pendingFiredHooks: [],
      disclosedPanels: [],
      panelUseCount: emptyUseCount(),
      scrutiny: 0,
      runSeed: 12345,
      lastDefiance: null,
    },
    version,
  }
  localStorage.setItem(PERSIST_KEY, JSON.stringify(blob))
}

const LEGACY_TRACE = {
  id: 'trace-legacy-01',
  sourceTaskId: 'task-east-wilmer-01',
  sourceChoiceId: 'choice-reduce-40',
  timestamp: 1_700_000_000_000,
  body: 'Reduce maintenance by 40%.',
}

describe('persist migration — ledger ancestry v5 → v6', () => {
  beforeEach(() => {
    localStorage.removeItem(PERSIST_KEY)
  })

  it('exposes a PERSIST_VERSION of at least 6 (bumped for ancestry)', () => {
    expect(PERSIST_VERSION).toBeGreaterThanOrEqual(6)
  })

  it('backfills stageOneAncestryId onto a v5 ledger trace, losslessly', async () => {
    useGameStore.setState({ ledger: [] })
    seedBlob([LEGACY_TRACE], 5)

    await useGameStore.persist.rehydrate()

    const ledger = useGameStore.getState().ledger
    expect(ledger).toHaveLength(1)
    expect(ledger[0]).toEqual({
      ...LEGACY_TRACE,
      stageOneAncestryId: makeStageOneAncestryId(
        LEGACY_TRACE.sourceTaskId,
        LEGACY_TRACE.sourceChoiceId,
      ),
    })
  })

  it('passes an already-current blob through untouched', async () => {
    useGameStore.setState({ ledger: [] })
    const currentTrace = {
      ...LEGACY_TRACE,
      stageOneAncestryId: 's1:task-east-wilmer-01:choice-reduce-40',
    }
    seedBlob([currentTrace], PERSIST_VERSION)

    await useGameStore.persist.rehydrate()

    expect(useGameStore.getState().ledger).toEqual([currentTrace])
  })
})
