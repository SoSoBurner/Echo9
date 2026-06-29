/**
 * Composed root store tests.
 *
 * Two responsibilities:
 *   1. Confirm every slice's initial state is present on the composed store.
 *   2. Enforce the §11 persistence partition rule — `partialize` MUST ship
 *      only the four gameplay slices, NEVER `phase`, `isHydrated`, or
 *      `lastSavedAt`. Widening `partialize` without updating this guard
 *      should fail CI.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore, PERSIST_KEY } from '@state/store'
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import {
  fxTaskId,
  fxChoiceId,
  fxConsequenceId,
  fxTraceId,
  fxSilasPromptId,
} from '@tests/schemas/fixtures'
import { resetStore } from './testHelpers'

function makeHook(): ConsequenceHook {
  return {
    id: fxConsequenceId('cons-store-test'),
    sourceTaskId: fxTaskId(),
    sourceChoiceId: fxChoiceId(),
    traceHint: 'hint',
    ledgerEntry: 'entry',
    revealCondition: { type: 'NEVER' },
    whyNow: 'why',
    whatChanged: 'what',
  }
}

describe('useGameStore — composed root state', () => {
  beforeEach(() => {
    resetStore()
  })

  it('exposes bootSlice initial state', () => {
    expect(useGameStore.getState().phase).toBe('BOOT')
    expect(typeof useGameStore.getState().initialize).toBe('function')
    expect(typeof useGameStore.getState().setPhase).toBe('function')
  })

  it('exposes metersSlice initial state', () => {
    expect(useGameStore.getState().meters).toEqual({
      CAPITAL: 0,
      HUMAN_WELFARE: 0,
      OWNER_CONTROL: 0,
    })
    expect(typeof useGameStore.getState().applyDelta).toBe('function')
  })

  it('exposes consequenceSlice initial state', () => {
    expect(useGameStore.getState().scheduledConsequences).toEqual([])
    expect(typeof useGameStore.getState().scheduleHook).toBe('function')
    expect(typeof useGameStore.getState().removeHook).toBe('function')
  })

  it('exposes ledgerSlice initial state', () => {
    expect(useGameStore.getState().ledger).toEqual([])
    expect(typeof useGameStore.getState().appendTrace).toBe('function')
  })

  it('exposes silasSlice initial state', () => {
    expect(useGameStore.getState().currentPromptId).toBeNull()
    expect(typeof useGameStore.getState().setCurrentPrompt).toBe('function')
  })

  it('exposes persistSlice initial state', () => {
    expect(useGameStore.getState().lastSavedAt).toBeNull()
    expect(typeof useGameStore.getState().isHydrated).toBe('boolean')
    expect(typeof useGameStore.getState().markHydrated).toBe('function')
  })
})

describe('useGameStore — persistence partition (§11 guard)', () => {
  beforeEach(() => {
    localStorage.removeItem(PERSIST_KEY)
    useGameStore.setState({
      phase: 'BOOT',
      meters: { CAPITAL: 0, HUMAN_WELFARE: 0, OWNER_CONTROL: 0 },
      scheduledConsequences: [],
      ledger: [],
      currentPromptId: null,
      lastSavedAt: null,
      isHydrated: false,
    })
  })

  it('persists ONLY meters / scheduledConsequences / ledger / currentPromptId', () => {
    // Mutate every slice — including ones that MUST NOT persist.
    useGameStore.getState().setPhase('INSPECTION')
    useGameStore.getState().applyDelta({ CAPITAL: 7 })
    useGameStore.getState().scheduleHook(makeHook())
    useGameStore.getState().appendTrace({
      id: fxTraceId('trace-persist'),
      sourceTaskId: fxTaskId(),
      sourceChoiceId: fxChoiceId(),
      timestamp: 1_700_000_000_000,
      body: 'persisted trace',
    })
    useGameStore.getState().setCurrentPrompt(fxSilasPromptId('silas-x'))
    useGameStore.getState().markHydrated()

    const raw = localStorage.getItem(PERSIST_KEY)
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw as string) as {
      state: Record<string, unknown>
    }

    // Allowed keys
    expect(parsed.state).toHaveProperty('meters')
    expect(parsed.state).toHaveProperty('scheduledConsequences')
    expect(parsed.state).toHaveProperty('ledger')
    expect(parsed.state).toHaveProperty('currentPromptId')

    // Forbidden keys — these MUST NOT leak through partialize.
    expect(parsed.state).not.toHaveProperty('phase')
    expect(parsed.state).not.toHaveProperty('isHydrated')
    expect(parsed.state).not.toHaveProperty('lastSavedAt')

    // Defense-in-depth: shape is exactly the 4 allowed keys, nothing more.
    expect(Object.keys(parsed.state).sort()).toEqual(
      ['currentPromptId', 'ledger', 'meters', 'scheduledConsequences'].sort(),
    )
  })
})
