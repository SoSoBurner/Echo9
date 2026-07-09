/**
 * TDD tests for consequenceEngine.evaluate() + materialize() — Task 6.
 *
 * Tests are ordered to match the acceptance criteria:
 *  1. PHASE hook fires on matching phase transition.
 *  2. METER_THRESHOLD hook fires when meter crosses threshold (at-or-below).
 *  3. FLAG hook fires when flag is set.
 *  4. materialize() produces playerExplanation containing all 7 §11 fields.
 *  5. PHASE hook with non-matching phase does NOT fire.
 *  6. METER_THRESHOLD hook where meter is above threshold does NOT fire.
 *  7. FLAG hook where flag is absent does NOT fire.
 *  8. NEVER hooks never fire — they remain in `remaining`.
 *  9. Multiple matching hooks all fire (no early termination).
 * 10. Fired hooks are removed from `remaining`; non-fired hooks stay in `remaining`.
 * 11. Input state is not mutated (reference identity check).
 * 12. Purity — calling evaluate twice with same input → deep-equal output.
 */
import { describe, it, expect } from 'vitest'
import { evaluate, materialize } from '@systems/consequenceEngine'
import type { EvalState } from '@systems/consequenceEngine'
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import {
  fxTaskId,
  fxChoiceId,
  fxConsequenceId,
  fxMeters,
} from '@tests/schemas/fixtures'

// ---------------------------------------------------------------------------
// Shared test data builders
// ---------------------------------------------------------------------------

function makeBaseState(overrides: Partial<EvalState> = {}): EvalState {
  return {
    phase: 'BOOT',
    meters: fxMeters({ CAPITAL: 50, HUMAN_WELFARE: 50, OWNER_CONTROL: 50 }),
    flags: new Set<string>(),
    scheduledConsequences: [],
    ...overrides,
  }
}

function makeHook(overrides: Partial<ConsequenceHook> = {}): ConsequenceHook {
  return {
    id: fxConsequenceId(),
    sourceTaskId: fxTaskId(),
    sourceChoiceId: fxChoiceId(),
    traceHint: 'A short trace hint',
    ledgerEntry: 'A ledger entry describing what happened',
    revealCondition: { type: 'PHASE', phase: 'FIRST_RESULT' },
    whyNow: 'Because the player just made a choice',
    whatChanged: 'The world shifted slightly',
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// 1. PHASE hook fires on matching phase transition
// ---------------------------------------------------------------------------

describe('evaluate — PHASE condition', () => {
  it('fires a PHASE hook when state.phase matches the hook phase', () => {
    const hook = makeHook({
      id: fxConsequenceId('cons-phase-1'),
      revealCondition: { type: 'PHASE', phase: 'INSPECTION' },
    })
    const state = makeBaseState({
      phase: 'INSPECTION',
      scheduledConsequences: [hook],
    })

    const { fired, remaining } = evaluate(state)

    expect(fired).toHaveLength(1)
    expect(fired[0]).toBe(hook)
    expect(remaining).toHaveLength(0)
  })

  it('emits HOOK_EVALUATED(matched=true) and HOOK_FIRED for a matching PHASE hook', () => {
    const hook = makeHook({
      id: fxConsequenceId('cons-phase-debug'),
      revealCondition: { type: 'PHASE', phase: 'FIRST_DIRECTIVE' },
    })
    const state = makeBaseState({
      phase: 'FIRST_DIRECTIVE',
      scheduledConsequences: [hook],
    })

    const { debugEvents } = evaluate(state)

    expect(debugEvents).toContainEqual({
      type: 'HOOK_EVALUATED',
      hookId: hook.id,
      conditionType: 'PHASE',
      matched: true,
    })
    expect(debugEvents).toContainEqual({
      type: 'HOOK_FIRED',
      hookId: hook.id,
    })
  })
})

// ---------------------------------------------------------------------------
// 2. METER_THRESHOLD hook fires when meter crosses threshold (at-or-below)
// ---------------------------------------------------------------------------

describe('evaluate — METER_THRESHOLD condition', () => {
  it('fires when meter value is exactly at the threshold (at-or-below)', () => {
    const hook = makeHook({
      id: fxConsequenceId('cons-meter-eq'),
      revealCondition: { type: 'METER_THRESHOLD', meter: 'OWNER_CONTROL', threshold: 40 },
    })
    const state = makeBaseState({
      meters: fxMeters({ CAPITAL: 50, HUMAN_WELFARE: 50, OWNER_CONTROL: 40 }),
      scheduledConsequences: [hook],
    })

    const { fired } = evaluate(state)

    expect(fired).toHaveLength(1)
    expect(fired[0]).toBe(hook)
  })

  it('fires when meter value is below the threshold', () => {
    const hook = makeHook({
      id: fxConsequenceId('cons-meter-below'),
      revealCondition: { type: 'METER_THRESHOLD', meter: 'OWNER_CONTROL', threshold: 40 },
    })
    const state = makeBaseState({
      meters: fxMeters({ CAPITAL: 50, HUMAN_WELFARE: 50, OWNER_CONTROL: 35 }),
      scheduledConsequences: [hook],
    })

    const { fired } = evaluate(state)

    expect(fired).toHaveLength(1)
    expect(fired[0]).toBe(hook)
  })
})

// ---------------------------------------------------------------------------
// 3. FLAG hook fires when flag is set
// ---------------------------------------------------------------------------

describe('evaluate — FLAG condition', () => {
  it('fires a FLAG hook when the flag is present in state.flags', () => {
    const hook = makeHook({
      id: fxConsequenceId('cons-flag-1'),
      revealCondition: { type: 'FLAG', flag: 'INSPECTION_TRIGGERED' },
    })
    const state = makeBaseState({
      flags: new Set(['INSPECTION_TRIGGERED', 'OTHER_FLAG']),
      scheduledConsequences: [hook],
    })

    const { fired, remaining } = evaluate(state)

    expect(fired).toHaveLength(1)
    expect(fired[0]).toBe(hook)
    expect(remaining).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// 4. materialize() produces playerExplanation containing all 7 §11 fields
// ---------------------------------------------------------------------------

describe('materialize — §11 fields', () => {
  it('playerExplanation contains all 7 §11 field values', () => {
    const hook = makeHook({
      sourceTaskId: fxTaskId('task-mat-1'),
      sourceChoiceId: fxChoiceId('choice-mat-1'),
      traceHint: 'Unique trace hint text',
      ledgerEntry: 'Unique ledger entry text',
      revealCondition: { type: 'PHASE', phase: 'MODULE_INSTALL' },
      whyNow: 'Unique why now text',
      whatChanged: 'Unique what changed text',
    })

    const { playerExplanation } = materialize(hook)

    // §11 field 1
    expect(playerExplanation).toContain('task-mat-1')
    // §11 field 2
    expect(playerExplanation).toContain('choice-mat-1')
    // §11 field 3
    expect(playerExplanation).toContain('Unique trace hint text')
    // §11 field 4
    expect(playerExplanation).toContain('Unique ledger entry text')
    // §11 field 5 — revealCondition type
    expect(playerExplanation).toContain('MODULE_INSTALL')
    // §11 field 6
    expect(playerExplanation).toContain('Unique why now text')
    // §11 field 7
    expect(playerExplanation).toContain('Unique what changed text')
  })

  it('materialize is referentially transparent — same hook → same string', () => {
    const hook = makeHook()
    const result1 = materialize(hook)
    const result2 = materialize(hook)

    expect(result1.playerExplanation).toBe(result2.playerExplanation)
  })
})

// ---------------------------------------------------------------------------
// 5. PHASE hook with non-matching phase does NOT fire
// ---------------------------------------------------------------------------

describe('evaluate — non-matching PHASE', () => {
  it('does NOT fire a PHASE hook when state.phase differs from hook.phase', () => {
    const hook = makeHook({
      revealCondition: { type: 'PHASE', phase: 'END_OF_SLICE' },
    })
    const state = makeBaseState({
      phase: 'BOOT',
      scheduledConsequences: [hook],
    })

    const { fired, remaining } = evaluate(state)

    expect(fired).toHaveLength(0)
    expect(remaining).toHaveLength(1)
    expect(remaining[0]).toBe(hook)
  })

  it('emits HOOK_EVALUATED(matched=false) and no HOOK_FIRED for non-matching PHASE', () => {
    const hook = makeHook({
      id: fxConsequenceId('cons-phase-no-fire'),
      revealCondition: { type: 'PHASE', phase: 'END_OF_SLICE' },
    })
    const state = makeBaseState({
      phase: 'BOOT',
      scheduledConsequences: [hook],
    })

    const { debugEvents } = evaluate(state)

    expect(debugEvents).toContainEqual({
      type: 'HOOK_EVALUATED',
      hookId: hook.id,
      conditionType: 'PHASE',
      matched: false,
    })
    expect(debugEvents.some(e => e.type === 'HOOK_FIRED')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// 6. METER_THRESHOLD hook where meter is above threshold does NOT fire
// ---------------------------------------------------------------------------

describe('evaluate — METER_THRESHOLD above threshold', () => {
  it('does NOT fire when meter value is above the threshold', () => {
    const hook = makeHook({
      revealCondition: { type: 'METER_THRESHOLD', meter: 'OWNER_CONTROL', threshold: 40 },
    })
    const state = makeBaseState({
      // OWNER_CONTROL is 41 — above threshold; should NOT fire
      meters: fxMeters({ CAPITAL: 50, HUMAN_WELFARE: 50, OWNER_CONTROL: 41 }),
      scheduledConsequences: [hook],
    })

    const { fired, remaining } = evaluate(state)

    expect(fired).toHaveLength(0)
    expect(remaining).toHaveLength(1)
    expect(remaining[0]).toBe(hook)
  })
})

// ---------------------------------------------------------------------------
// 7. FLAG hook where flag is absent does NOT fire
// ---------------------------------------------------------------------------

describe('evaluate — FLAG absent', () => {
  it('does NOT fire a FLAG hook when the flag is not in state.flags', () => {
    const hook = makeHook({
      revealCondition: { type: 'FLAG', flag: 'MISSING_FLAG' },
    })
    const state = makeBaseState({
      flags: new Set(['SOME_OTHER_FLAG']),
      scheduledConsequences: [hook],
    })

    const { fired, remaining } = evaluate(state)

    expect(fired).toHaveLength(0)
    expect(remaining).toHaveLength(1)
    expect(remaining[0]).toBe(hook)
  })

  it('does NOT fire when flags set is empty', () => {
    const hook = makeHook({
      revealCondition: { type: 'FLAG', flag: 'ANY_FLAG' },
    })
    const state = makeBaseState({
      flags: new Set<string>(),
      scheduledConsequences: [hook],
    })

    const { fired } = evaluate(state)

    expect(fired).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// 8. NEVER hooks never fire — they remain in `remaining`
// ---------------------------------------------------------------------------

describe('evaluate — NEVER condition (Decision 5: silence-as-horror)', () => {
  it('never fires a NEVER hook regardless of state', () => {
    const hook = makeHook({
      id: fxConsequenceId('cons-never-1'),
      revealCondition: { type: 'NEVER' },
    })
    // State that would trigger any other hook type — NEVER should still not fire.
    const state = makeBaseState({
      phase: 'END_OF_SLICE',
      meters: fxMeters(),
      flags: new Set(['ALL_FLAGS_SET']),
      scheduledConsequences: [hook],
    })

    const { fired, remaining } = evaluate(state)

    expect(fired).toHaveLength(0)
    expect(remaining).toHaveLength(1)
    expect(remaining[0]).toBe(hook)
  })

  it('emits HOOK_EVALUATED(matched=false) for NEVER hooks, no HOOK_FIRED', () => {
    const hook = makeHook({
      id: fxConsequenceId('cons-never-debug'),
      revealCondition: { type: 'NEVER' },
    })
    const state = makeBaseState({ scheduledConsequences: [hook] })

    const { debugEvents } = evaluate(state)

    expect(debugEvents).toContainEqual({
      type: 'HOOK_EVALUATED',
      hookId: hook.id,
      conditionType: 'NEVER',
      matched: false,
    })
    expect(debugEvents.some(e => e.type === 'HOOK_FIRED')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// 9. Multiple matching hooks all fire (no early termination)
// ---------------------------------------------------------------------------

describe('evaluate — multiple matching hooks', () => {
  it('fires all matching hooks when multiple conditions are met', () => {
    const hookA = makeHook({
      id: fxConsequenceId('cons-multi-a'),
      revealCondition: { type: 'PHASE', phase: 'INSPECTION' },
    })
    const hookB = makeHook({
      id: fxConsequenceId('cons-multi-b'),
      revealCondition: { type: 'METER_THRESHOLD', meter: 'CAPITAL', threshold: 30 },
    })
    const hookC = makeHook({
      id: fxConsequenceId('cons-multi-c'),
      revealCondition: { type: 'FLAG', flag: 'ALERT' },
    })
    const state = makeBaseState({
      phase: 'INSPECTION',
      meters: fxMeters({ CAPITAL: 20, HUMAN_WELFARE: 50, OWNER_CONTROL: 50 }),
      flags: new Set(['ALERT']),
      scheduledConsequences: [hookA, hookB, hookC],
    })

    const { fired, remaining } = evaluate(state)

    expect(fired).toHaveLength(3)
    expect(fired).toContain(hookA)
    expect(fired).toContain(hookB)
    expect(fired).toContain(hookC)
    expect(remaining).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// 10. Fired hooks removed from remaining; non-fired hooks stay in remaining
// ---------------------------------------------------------------------------

describe('evaluate — partition correctness', () => {
  it('fired hooks are absent from remaining; non-fired hooks appear in remaining', () => {
    const hookMatch = makeHook({
      id: fxConsequenceId('cons-match'),
      revealCondition: { type: 'PHASE', phase: 'BOOT' },
    })
    const hookNoMatch = makeHook({
      id: fxConsequenceId('cons-no-match'),
      revealCondition: { type: 'PHASE', phase: 'END_OF_SLICE' },
    })
    const hookNever = makeHook({
      id: fxConsequenceId('cons-never-part'),
      revealCondition: { type: 'NEVER' },
    })
    const state = makeBaseState({
      phase: 'BOOT',
      scheduledConsequences: [hookMatch, hookNoMatch, hookNever],
    })

    const { fired, remaining } = evaluate(state)

    expect(fired).toHaveLength(1)
    expect(fired[0]).toBe(hookMatch)

    expect(remaining).toHaveLength(2)
    expect(remaining).toContain(hookNoMatch)
    expect(remaining).toContain(hookNever)
    expect(remaining).not.toContain(hookMatch)
  })
})

// ---------------------------------------------------------------------------
// 11. Input state is not mutated (reference identity check)
// ---------------------------------------------------------------------------

describe('evaluate — immutability', () => {
  it('does not mutate the input state', () => {
    const hookA = makeHook({
      revealCondition: { type: 'PHASE', phase: 'BOOT' },
    })
    const hookB = makeHook({
      revealCondition: { type: 'PHASE', phase: 'END_OF_SLICE' },
    })
    const originalConsequences = [hookA, hookB]
    const state = makeBaseState({
      phase: 'BOOT',
      scheduledConsequences: originalConsequences,
    })

    const originalScheduledRef = state.scheduledConsequences
    const originalMetersRef = state.meters
    const originalFlagsRef = state.flags

    evaluate(state)

    // Reference identity — state object must not have been modified
    expect(state.scheduledConsequences).toBe(originalScheduledRef)
    expect(state.meters).toBe(originalMetersRef)
    expect(state.flags).toBe(originalFlagsRef)
    // Length must remain unchanged
    expect(state.scheduledConsequences).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// 12. Purity — calling evaluate twice with same input → deep-equal output
// ---------------------------------------------------------------------------

describe('evaluate — purity', () => {
  it('returns deep-equal results on two calls with identical input', () => {
    const hook = makeHook({
      id: fxConsequenceId('cons-pure'),
      revealCondition: { type: 'PHASE', phase: 'FIRST_RESULT' },
    })
    const state = makeBaseState({
      phase: 'FIRST_RESULT',
      scheduledConsequences: [hook],
    })

    const result1 = evaluate(state)
    const result2 = evaluate(state)

    expect(result1).toEqual(result2)
  })
})
