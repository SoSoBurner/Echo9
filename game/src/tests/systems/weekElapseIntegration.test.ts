/**
 * Week-elapse returns — store-level integration (§11 ship-gate leak fix).
 *
 * Mirrors the Layout weekly commit seam step-for-step (resolveChoice →
 * applyDelta/appendTrace/scheduleHook → resolutionFlag → elapse flags →
 * evaluateAndEnqueue) WITHOUT rendering React, following the
 * evaluateAndEnqueueIntegration.test.ts pattern. In the app the final
 * evaluate pass runs via Layout's useEffect on the flags dep; here we call
 * the slice action directly, exactly as that effect does.
 *
 * The scenario is the leak's own reproduction, inverted:
 *   W1 commit `choice-reduce-40` schedules HOOK_HVAC_FAILURE (re-keyed from
 *   the unreachable PHASE:'CONSEQUENCE_RETURN' to FLAG:'q1-week2-elapsed').
 *   Before the fix it sat in scheduledConsequences forever. Now the W2
 *   commit raises `q1-week2-elapsed` and the delayed consequence RETURNS:
 *   removed from scheduled, §11 trace in the ledger (with Stage-1 ancestry),
 *   queued in pendingFiredHooks for the player to acknowledge.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '@state/store'
import { resetStore } from '@tests/state/testHelpers'
import { resolveChoice } from '@systems/choiceResolver'
import { elapsedFlagsForWeek } from '@systems/weekElapse'
import { ALL_CONSEQUENCE_MODULES } from '@content/index'
import { Q1_SEQUENCE } from '@content/directiveSchedule'
import { makeTraceId, type ConsequenceId } from '@schemas/gameState.schema'
import { makeStageOneAncestryId } from '@schemas/resultTrace.schema'
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import { HOOK_HVAC_FAILURE } from '@content/consequences/q1/week1-mercy-margin.consequences'
import { HOOK_HONEST_FLAG } from '@content/consequences/q1/week2-queue-triage-followup.consequences'

const hookCatalog = new Map<ConsequenceId, ConsequenceHook>(
  ALL_CONSEQUENCE_MODULES.map((h) => [h.id, h]),
)

/**
 * Store-level mirror of Layout.handleChoiceCommit's steps 2–6 plus the
 * evaluate pass the flags-dep useEffect performs after the commit renders.
 */
function commitWeek(week: number, choiceId: string): void {
  const entry = Q1_SEQUENCE.find((e) => e.week === week)
  if (!entry) throw new Error(`commitWeek: no Q1_SEQUENCE entry for week ${week}`)
  const choice = entry.choices.find((c) => c.id === choiceId)
  if (!choice) throw new Error(`commitWeek: week ${week} has no choice "${choiceId}"`)

  const { meters, scheduledConsequences, ledger } = useGameStore.getState()
  const { trace, scheduled } = resolveChoice(
    { meters, scheduledConsequences, ledger },
    choice,
    hookCatalog,
    { now: Date.now(), traceId: makeTraceId(`trace-w${week}-${choiceId}`) },
  )

  const store = useGameStore.getState()
  store.applyDelta(choice.meterDeltas)
  store.appendTrace(trace)
  for (const hook of scheduled) store.scheduleHook(hook)
  store.setFlag(entry.resolutionFlag)
  for (const flag of elapsedFlagsForWeek(entry.week)) store.setFlag(flag)

  // Layout's useEffect([...flags...]) equivalent.
  useGameStore.getState().evaluateAndEnqueue()
}

describe('week-elapse returns — W1 delayed hook fires when W2 commits', () => {
  beforeEach(() => {
    resetStore()
  })

  it('W1 commit schedules the delayed hook; it does NOT fire same-commit', () => {
    commitWeek(1, 'choice-reduce-40')

    const s = useGameStore.getState()
    expect(
      s.scheduledConsequences.some((h) => h.id === HOOK_HVAC_FAILURE.id),
      'HVAC hook must be scheduled at W1 commit',
    ).toBe(true)
    expect(
      s.pendingFiredHooks.some((h) => h.id === HOOK_HVAC_FAILURE.id),
      'HVAC hook must NOT fire during its own commit (returns next week)',
    ).toBe(false)
  })

  it('W2 commit raises q1-week2-elapsed and the W1 hook RETURNS (§11 round-trip)', () => {
    commitWeek(1, 'choice-reduce-40')
    commitWeek(2, 'choice-name-pediatric-gap')

    const s = useGameStore.getState()

    // Elapse flag actually raised at the seam.
    expect(s.flags.has('q1-week2-elapsed')).toBe(true)

    // 1. Removed from the scheduled queue (single source of truth).
    expect(
      s.scheduledConsequences.some((h) => h.id === HOOK_HVAC_FAILURE.id),
    ).toBe(false)

    // 2. Queued for player acknowledgment.
    expect(
      s.pendingFiredHooks.some((h) => h.id === HOOK_HVAC_FAILURE.id),
    ).toBe(true)

    // 3. §11 trace in the ledger with Stage-1 ancestry back to the exact
    //    W1 decision, and the materialized body carrying the hook's fields.
    const returnTrace = s.ledger.find(
      (t) =>
        t.stageOneAncestryId ===
          makeStageOneAncestryId(
            HOOK_HVAC_FAILURE.sourceTaskId,
            HOOK_HVAC_FAILURE.sourceChoiceId,
          ) && t.body.includes(HOOK_HVAC_FAILURE.whyNow),
    )
    expect(returnTrace, 'ledger must carry the fired hook\u2019s §11 trace').toBeDefined()
    expect(returnTrace?.body).toContain(HOOK_HVAC_FAILURE.whatChanged)
    expect(returnTrace?.body).toContain(HOOK_HVAC_FAILURE.traceHint)
    expect(returnTrace?.body).toContain(HOOK_HVAC_FAILURE.ledgerEntry)
  })

  it('W3 commit raises the legacy east-wilmer-week3-elapsed alias and fires the W2 hook', () => {
    commitWeek(1, 'choice-reduce-40')
    commitWeek(2, 'choice-name-pediatric-gap') // schedules HOOK_HONEST_FLAG
    commitWeek(3, 'choice-cover-from-reserve')

    const s = useGameStore.getState()
    expect(s.flags.has('east-wilmer-week3-elapsed')).toBe(true)
    expect(
      s.scheduledConsequences.some((h) => h.id === HOOK_HONEST_FLAG.id),
    ).toBe(false)
    expect(
      s.pendingFiredHooks.some((h) => h.id === HOOK_HONEST_FLAG.id),
    ).toBe(true)
  })
})
