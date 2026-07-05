/**
 * Q1 Week 6 consequence hooks — commander-override-pressure (Sprint C7, PLAN.md §11).
 *
 * Every hook satisfies the §11 Traceability Invariant — all mandatory
 * fields are non-empty strings (enforced by ConsequenceHookSchema and
 * traceabilityInvariant.test.ts).
 *
 * Reveal-condition coverage across the four Week 6 choices:
 *   choice-confirm-override         → PHASE: CONSEQUENCE_RETURN
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
// Hook 1 — choice-confirm-override → PHASE reveal at CONSEQUENCE_RETURN
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
  revealCondition: { type: 'PHASE', phase: 'CONSEQUENCE_RETURN' },
  whyNow:
    'A closed safety review posts to the county paperwork registry the same ' +
    'business day the override is signed. The reversal is immediate.',
  whatChanged:
    'Two safety findings sit in a "rolled forward" state on the county filing. ' +
    'Owner-Control drops because Commander is now co-authorized on safety ' +
    'decisions; if Commander is not installed, Silas absorbed the same drop ' +
    'without the module\u2019s cover.',
}

// ---------------------------------------------------------------------------
// Hook 2 — choice-defer-safety-review → METER_THRESHOLD reveal at CAP ≤ -10
// ---------------------------------------------------------------------------

export const HOOK_SAFETY_REVIEW_HONORED: ConsequenceHook = {
  id: makeConsequenceId('cons-safety-review-honored-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-defer-safety-review'),
  traceHint:
    'Deferring the override to the safety review cost cash on the next capital call.',
  ledgerEntry:
    'The East Wilmer safety review closed on schedule with both findings ' +
    'adjudicated. The delay pushed one Capital call into the following week ' +
    'and cost $6,400 in stopgap contract labor across the shift boundary. ' +
    'Commander\u2019s override request was returned unsigned to the module ' +
    'authority.',
  revealCondition: { type: 'METER_THRESHOLD', meter: 'CAPITAL', threshold: -10 },
  whyNow:
    'A completed safety review costs less than the injury it prevents but more ' +
    'than the day it was budgeted for. When Capital drops far enough that the ' +
    'stopgap labor cost becomes visible in the cash column, the deferment ' +
    'shows up as the line item that broke the budget for that week.',
  whatChanged:
    'Owner-Control rises because Silas asserted primacy over the Commander ' +
    'signal on the record. The safety findings are closed rather than rolled ' +
    'forward; W7\u2019s deferred-safety-inspection directive inherits a ' +
    'cleaner starting posture.',
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
    'CHAMPION_DEFIED is raised. Downstream directives read it as "Silas has ' +
    'shown he will refuse a module in writing." Capital took a reputational ' +
    'hit but Owner-Control and Human-Welfare both moved up. Rasha received no ' +
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
