/**
 * evaluateAndEnqueue integration tests (Task 12).
 *
 * The thin store action evaluateAndEnqueue() bridges the pure
 * consequenceEngine.evaluate() with the eventQueueSlice + ledgerSlice +
 * consequenceSlice. Per PLAN.md §8:
 *
 *   "consequenceEngine.evaluate(state) runs at every phase transition.
 *    On fire: ConsequenceReturnPanel opens with all 7 §11 fields visible."
 *
 * Contract tested here:
 *   - A PHASE hook whose phase matches `state.phase` fires:
 *       * removed from scheduledConsequences
 *       * appended to ledger as a ResultTrace
 *       * pushed onto pendingFiredHooks
 *   - A NEVER hook never fires (stays in scheduledConsequences).
 *   - Already-pending hooks aren't re-fired (idempotency under repeat calls).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '@state/store'
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import { fxTaskId, fxChoiceId, fxConsequenceId } from '@tests/schemas/fixtures'
import { resetStore } from '@tests/state/testHelpers'

function phaseHook(idSuffix: string): ConsequenceHook {
  return {
    id: fxConsequenceId(`cons-int-${idSuffix}`),
    sourceTaskId: fxTaskId(),
    sourceChoiceId: fxChoiceId(),
    traceHint: `hint-${idSuffix}`,
    ledgerEntry: `entry-${idSuffix}`,
    revealCondition: { type: 'PHASE', phase: 'CONSEQUENCE_RETURN' },
    whyNow: `why-${idSuffix}`,
    whatChanged: `what-${idSuffix}`,
  }
}

function neverHook(idSuffix: string): ConsequenceHook {
  return {
    id: fxConsequenceId(`cons-int-${idSuffix}`),
    sourceTaskId: fxTaskId(),
    sourceChoiceId: fxChoiceId(),
    traceHint: `hint-${idSuffix}`,
    ledgerEntry: `entry-${idSuffix}`,
    revealCondition: { type: 'NEVER' },
    whyNow: `why-${idSuffix}`,
    whatChanged: `what-${idSuffix}`,
  }
}

describe('evaluateAndEnqueue — integration', () => {
  beforeEach(() => {
    resetStore()
  })

  it('fires a matching PHASE hook into pendingFiredHooks and ledger, removing from scheduled', () => {
    const hook = phaseHook('phase-match')
    useGameStore.getState().scheduleHook(hook)
    useGameStore.getState().setPhase('CONSEQUENCE_RETURN')

    useGameStore.getState().evaluateAndEnqueue()

    const s = useGameStore.getState()
    expect(s.pendingFiredHooks).toHaveLength(1)
    expect(s.pendingFiredHooks[0]?.id).toBe(hook.id)
    expect(s.scheduledConsequences).toEqual([])
    expect(s.ledger).toHaveLength(1)
    const trace = s.ledger[0]
    expect(trace?.sourceTaskId).toBe(hook.sourceTaskId)
    expect(trace?.sourceChoiceId).toBe(hook.sourceChoiceId)
    // Body must contain all 7 §11 field values (via materialize()).
    expect(trace?.body).toContain(hook.whyNow)
    expect(trace?.body).toContain(hook.whatChanged)
    expect(trace?.body).toContain(hook.traceHint)
    expect(trace?.body).toContain(hook.ledgerEntry)
  })

  it('does NOT fire a NEVER hook — stays in scheduledConsequences', () => {
    const hook = neverHook('never-stays')
    useGameStore.getState().scheduleHook(hook)
    useGameStore.getState().setPhase('CONSEQUENCE_RETURN')

    useGameStore.getState().evaluateAndEnqueue()

    const s = useGameStore.getState()
    expect(s.pendingFiredHooks).toEqual([])
    expect(s.scheduledConsequences).toHaveLength(1)
    expect(s.scheduledConsequences[0]?.id).toBe(hook.id)
    expect(s.ledger).toEqual([])
  })

  it('does NOT fire a PHASE hook when phase mismatches', () => {
    const hook = phaseHook('phase-miss')
    useGameStore.getState().scheduleHook(hook)
    useGameStore.getState().setPhase('FIRST_DIRECTIVE')

    useGameStore.getState().evaluateAndEnqueue()

    expect(useGameStore.getState().pendingFiredHooks).toEqual([])
    expect(useGameStore.getState().scheduledConsequences).toHaveLength(1)
  })

  it('repeat calls are idempotent — does not re-fire an already-fired hook', () => {
    const hook = phaseHook('idempotent')
    useGameStore.getState().scheduleHook(hook)
    useGameStore.getState().setPhase('CONSEQUENCE_RETURN')

    useGameStore.getState().evaluateAndEnqueue()
    useGameStore.getState().evaluateAndEnqueue()

    const s = useGameStore.getState()
    expect(s.pendingFiredHooks).toHaveLength(1)
    expect(s.ledger).toHaveLength(1)
  })
})
