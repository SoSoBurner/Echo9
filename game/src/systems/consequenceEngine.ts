/**
 * consequenceEngine — pure queue evaluator + materializer (PLAN.md §8, §14 Task 6).
 *
 * Two pure exported functions:
 *
 *   evaluate(state)   — predicate-only. Partitions state.scheduledConsequences
 *                       into { fired, remaining } by matching each hook's
 *                       revealCondition against the snapshot. Never mutates state,
 *                       never writes to the ledger, never generates IDs or reads
 *                       the clock. The store wrapper (T8+) takes `fired`, generates
 *                       TraceIds + timestamps, and appends traces to the ledger.
 *
 *   materialize(hook) — pure string builder. Produces a playerExplanation that
 *                       contains all 7 §11 field values (Decision 6).
 *
 * Pre-decided deviations:
 *
 *  Decision 1 — Two pure functions; evaluate is predicate-only.
 *  Decision 2 — EvalState is a narrow local type alias; does NOT include ledger.
 *  Decision 3 — DebugEvent is defined locally; NOT imported from choiceResolver.
 *  Decision 4 — METER_THRESHOLD uses at-or-below semantics (state.meters[m] <= threshold).
 *               EA may add a `direction` field if Capital-style ascent thresholds are needed.
 *  Decision 5 — NEVER hooks never fire; they stay in `remaining` forever.
 *  Decision 6 — materialize() produces a human-readable playerExplanation string
 *               containing all 7 §11 field values (verified via toContain in tests).
 */
import type { ConsequenceHook, RevealCondition } from '@schemas/consequenceHook.schema'
import type { MeterKey, ConsequenceId, SlicePhase } from '@schemas/gameState.schema'

// ---------------------------------------------------------------------------
// EvalState — narrow local type alias (Decision 2). No ledger; no flags slice
// in the store yet — the T8 wrapper will adapt or create one.
// ---------------------------------------------------------------------------

export type EvalState = {
  phase: SlicePhase
  meters: Record<MeterKey, number>
  flags: ReadonlySet<string>
  scheduledConsequences: ConsequenceHook[]
}

// ---------------------------------------------------------------------------
// DebugEvent — defined locally (Decision 3). Independent of choiceResolver.
// ---------------------------------------------------------------------------

export type DebugEvent =
  | { type: 'HOOK_EVALUATED'; hookId: ConsequenceId; conditionType: RevealCondition['type']; matched: boolean }
  | { type: 'HOOK_FIRED'; hookId: ConsequenceId }

// ---------------------------------------------------------------------------
// evaluate — predicate-only queue partitioner.
// ---------------------------------------------------------------------------

/**
 * Evaluates every hook in state.scheduledConsequences against the current
 * snapshot. Returns { fired, remaining, debugEvents }.
 *
 * Guarantees:
 *  - state is never mutated.
 *  - No Date.now() call; no id generation.
 *  - Same inputs → same outputs (referentially transparent).
 */
export function evaluate(state: EvalState): {
  fired: ConsequenceHook[]
  remaining: ConsequenceHook[]
  debugEvents: DebugEvent[]
} {
  const fired: ConsequenceHook[] = []
  const remaining: ConsequenceHook[] = []
  const debugEvents: DebugEvent[] = []

  for (const hook of state.scheduledConsequences) {
    const matched = matchesCondition(hook.revealCondition, state, hook.id)

    debugEvents.push({
      type: 'HOOK_EVALUATED',
      hookId: hook.id,
      conditionType: hook.revealCondition.type,
      matched,
    })

    if (matched) {
      fired.push(hook)
      debugEvents.push({ type: 'HOOK_FIRED', hookId: hook.id })
    } else {
      remaining.push(hook)
    }
  }

  return { fired, remaining, debugEvents }
}

// ---------------------------------------------------------------------------
// matchesCondition — pure predicate for a single RevealCondition.
// ---------------------------------------------------------------------------

function matchesCondition(
  condition: RevealCondition,
  state: EvalState,
  hookId: ConsequenceId,
): boolean {
  switch (condition.type) {
    case 'PHASE':
      return state.phase === condition.phase

    case 'METER_THRESHOLD': {
      // Decision 4: at-or-below semantics — matches when the meter value has
      // descended to or below the threshold. EA may add a `direction` field if
      // Capital-style ascent thresholds are needed.
      const value = state.meters[condition.meter]
      if (value === undefined) {
        throw new Error(
          `consequenceEngine: meter "${condition.meter}" not found in state.meters. ` +
          `This is a content authoring bug — hook id: "${hookId}".`,
        )
      }
      return value <= condition.threshold
    }

    case 'FLAG':
      return state.flags.has(condition.flag)

    case 'NEVER':
      // Decision 5: NEVER hooks stay in the queue forever (silence-as-horror).
      return false
  }
}

// ---------------------------------------------------------------------------
// materialize — pure string builder for all 7 §11 fields (Decision 6).
// ---------------------------------------------------------------------------

/**
 * Produces a human-readable playerExplanation string containing all 7 §11
 * field values. Tests verify each value appears via toContain(), not exact
 * equality, so the format may evolve without breaking the acceptance contract.
 */
export function materialize(hook: ConsequenceHook): { playerExplanation: string } {
  const playerExplanation = [
    `WHY NOW: ${hook.whyNow}`,
    `WHAT CHANGED: ${hook.whatChanged}`,
    `TRACE: ${hook.traceHint}`,
    `LEDGER: ${hook.ledgerEntry}`,
    `SOURCE TASK: ${hook.sourceTaskId}`,
    `SOURCE CHOICE: ${hook.sourceChoiceId}`,
    `REVEAL: ${serializeCondition(hook.revealCondition)}`,
  ].join('\n')

  return { playerExplanation }
}

/**
 * Serializes a RevealCondition to a human-readable string.
 * Includes the condition-type discriminant AND the inner value so that the
 * phase name, meter name, or flag name all appear verbatim in the output
 * (§11 field 5 test coverage).
 */
function serializeCondition(condition: RevealCondition): string {
  switch (condition.type) {
    case 'PHASE':
      return `PHASE:${condition.phase}`
    case 'METER_THRESHOLD':
      return `METER_THRESHOLD:${condition.meter}:${condition.threshold}`
    case 'FLAG':
      return `FLAG:${condition.flag}`
    case 'NEVER':
      return 'NEVER'
  }
}
