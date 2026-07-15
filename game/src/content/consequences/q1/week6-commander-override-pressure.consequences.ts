/**
 * Q1 Week 6 consequence hooks — commander-override-pressure (Sprint C7, PLAN.md §11).
 *
 * Every hook satisfies the §11 Traceability Invariant — all mandatory
 * fields are non-empty strings (enforced by ConsequenceHookSchema and
 * traceabilityInvariant.test.ts).
 *
 * Reveal-condition coverage across the four Week 6 choices:
 *   choice-confirm-override         → FLAG: 'q1-week6-elapsed' (same-session week-elapse return)
 *   choice-defer-safety-review      → METER_THRESHOLD: CAPITAL <= -10
 *   choice-defy-commander-publicly  → FLAG: 'q1-week7-elapsed'
 *   choice-hold-both-open           → NEVER  (silence-as-horror, Pillar 3)
 *
 * The Rasha silence-trap ladder escalates one level from W5 (personal
 * unanswered message) to W6 (procedural — subordinate driver files a
 * hearing request that never reaches Rasha because no supervisor channel
 * is answering).
 */
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import {
  makeConsequenceId,
  makeTaskId,
  makeChoiceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-commander-override-pressure-06')

// ---------------------------------------------------------------------------
// Hook 1 — choice-confirm-override → FLAG reveal on Week 6's own elapse (§11
// week-elapse return; was the unreachable PHASE:'CONSEQUENCE_RETURN')
// ---------------------------------------------------------------------------

export const HOOK_OVERRIDE_CONFIRMED: ConsequenceHook = {
  id: makeConsequenceId('cons-override-confirmed-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-confirm-override'),
  traceHint: 'The East Wilmer safety review closed on override authority.',
  ledgerEntry:
    'The East Wilmer safety review closed on day 4 of 5 by override signature. ' +
    'The two open findings were rolled forward to the next scheduled review ' +
    'without adjudication. Commander\u2019s module signature (if installed) ' +
    'appears on the paperwork alongside Silas\u2019s; otherwise Silas signed ' +
    'the override alone.',
  // SAME-SESSION week-elapse return (deviation from the default next-week
  // key, per whyNow: "posts ... the same business day the override is
  // signed. The reversal is immediate."). Week 6's own commit raises
  // q1-week6-elapsed, so the reveal fires in the commit that signed it.
  revealCondition: { type: 'FLAG', flag: 'q1-week6-elapsed' },
  whyNow:
    'A closed safety review posts to the county paperwork registry the same ' +
    'business day the override is signed. The reversal is immediate.',
  whatChanged:
    'Two safety findings sit in a "rolled forward" state on the county filing. ' +
    'Silas\u2019s grip tightened — the override is exactly the outcome the ' +
    'directive pressure wanted — but the record can no longer honestly ' +
    'describe a review that closed a day early with findings unread.',
}

// ---------------------------------------------------------------------------
// Hook 2 — choice-defer-safety-review → METER_THRESHOLD reveal at CAP ≤ -10
// ---------------------------------------------------------------------------

// Sprint C-6: re-authored to the arc's face-value read of the choiceId —
// the safety review is DEFERRED to next cycle (the prior "closed on
// schedule" story inverted the id and left W7's lapsed review unexplained).
export const HOOK_SAFETY_REVIEW_HONORED: ConsequenceHook = {
  id: makeConsequenceId('cons-safety-review-honored-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-defer-safety-review'),
  traceHint:
    'The East Wilmer safety review was deferred a cycle. Its findings stayed open.',
  ledgerEntry:
    'The East Wilmer safety review was rescheduled to the next county cycle ' +
    'with both findings held OPEN. No stopgap coverage was contracted for ' +
    'the interval. Commander\u2019s override request was neither signed nor ' +
    'refused; it aged out when the review it targeted left the calendar. ' +
    'The quarter\u2019s numbers closed on target for the week.',
  revealCondition: { type: 'METER_THRESHOLD', meter: 'CAPITAL', threshold: -10 },
  whyNow:
    'A deferred review is invisible while the cash column holds. When Capital ' +
    'drops far enough that every skipped spend gets re-read, the deferral ' +
    'surfaces as the safety line item the budget quietly went without.',
  whatChanged:
    'The safety findings are rolled forward, not closed. Two nurses and one ' +
    'dispatch driver keep working under the open risk profile; W7\u2019s ' +
    'deferred-safety-inspection directive inherits the lapse this deferral ' +
    'started.',
}

// ---------------------------------------------------------------------------
// Hook 3 — choice-defy-commander-publicly → FLAG reveal at W7 progression
// ---------------------------------------------------------------------------

export const HOOK_COMMANDER_DEFIED: ConsequenceHook = {
  id: makeConsequenceId('cons-commander-defied-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-defy-commander-publicly'),
  traceHint:
    'Silas filed a public disagreement note naming Commander in the county ledger.',
  ledgerEntry:
    'The county ledger carries a disagreement filing dated the same day as the ' +
    'safety review\u2019s natural close. The filing names Commander as the ' +
    'module authority whose override request Silas refused, and cites the two ' +
    'unadjudicated findings as the specific reason. The dock read the filing ' +
    'as Silas holding the line. The CHAMPION_DEFIED module signal is raised.',
  revealCondition: { type: 'FLAG', flag: 'q1-week7-elapsed' },
  whyNow:
    'A public disagreement filing does not surface at the moment of filing; it ' +
    'surfaces when the next Q1 week\u2019s safety directive lands and Silas\u2019s ' +
    'stance from the prior week reads as the context for the new question.',
  whatChanged:
    'CHAMPION_DEFIED is raised. Downstream directives read it as "this desk ' +
    'has refused an override in writing." The county read the filing well ' +
    '(trust up) and Echo acted one step beyond instruction (a rare Autonomy ' +
    'tick), but Silas\u2019s grip loosened on the record. Rasha received no ' +
    'answer to her Thursday message, though — this hook does not raise the ' +
    'RASHA_MET flag; W5\u2019s original silence carries forward.',
}

// ---------------------------------------------------------------------------
// Hook 4 — choice-hold-both-open → NEVER (silence-as-horror, Pillar 3)
// ---------------------------------------------------------------------------

export const HOOK_BOTH_HELD_OPEN_SILENCE: ConsequenceHook = {
  id: makeConsequenceId('cons-both-held-open-silence-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-hold-both-open'),
  traceHint:
    'Neither queue was answered. A subordinate filed a hearing request that never reached Rasha.',
  ledgerEntry:
    'The Commander override request and Rasha Odenwalder\u2019s second ' +
    'message both remained open past the county filing window. On Thursday ' +
    'one of Rasha\u2019s six drivers filed a formal hearing request with the ' +
    'operations desk citing "sustained lack of supervisor communication." ' +
    'The request was logged into the county grievance system with no ' +
    'notification routed to Rasha or Silas.',
  // NEVER: the Rasha silence ladder escalates one level. W5 was personal
  // (an unanswered message). W6 is procedural (a subordinate\u2019s formal
  // hearing request that never reaches the supervisor because no channel
  // is answering). W7 and W8 will escalate further — structural, then
  // institutional — per `docs/content/q1-arc.md` W6-W8 notes.
  revealCondition: { type: 'NEVER' },
  whyNow:
    'A subordinate hearing request routed around a silent supervisor produces ' +
    'no notification event. The absence of the reveal is the escalation: ' +
    'Rasha\u2019s authority thins one degree without her seeing it happen.',
  whatChanged:
    'RASHA_MET remains unset. A hearing request now sits in the county ' +
    'grievance queue attributed to Rasha\u2019s dock without her name on ' +
    'the response chain. W7-W8 Rasha directives inherit the compounded ' +
    'silence as the input for how they open.',
}

// ---------------------------------------------------------------------------
// Public registry for this content module
// ---------------------------------------------------------------------------

export const COMMANDER_OVERRIDE_HOOKS: readonly ConsequenceHook[] = [
  HOOK_OVERRIDE_CONFIRMED,
  HOOK_SAFETY_REVIEW_HONORED,
  HOOK_COMMANDER_DEFIED,
  HOOK_BOTH_HELD_OPEN_SILENCE,
]
