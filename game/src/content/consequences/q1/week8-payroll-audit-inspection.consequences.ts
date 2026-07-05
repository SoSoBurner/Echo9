/**
 * Q1 Week 8 consequence hooks — payroll-audit-inspection (Sprint C9, PLAN.md §11).
 *
 * Every hook satisfies the §11 Traceability Invariant — all mandatory
 * fields are non-empty strings (enforced by ConsequenceHookSchema and
 * traceabilityInvariant.test.ts).
 *
 * Reveal-condition coverage across the four Week 8 choices:
 *   choice-full-cooperation-posture       → PHASE: CONSEQUENCE_RETURN
 *   choice-legal-minimum-posture          → METER_THRESHOLD: OWNER_CONTROL <= -18
 *   choice-preemptive-restatement-posture → FLAG: 'q1-week9-elapsed'
 *   choice-answer-only-when-asked         → NEVER  (institutional silence, Pillar 3)
 *
 * Each hook records that `PAYROLL_AUDIT_DONE` is now set in the run's
 * flag state — the payroll inspection scene (C14) reads this as one of
 * its trigger conditions. Runtime concern; content records the fact in
 * authored text.
 *
 * The Rasha silence-trap ladder reaches its **institutional** rung on
 * HOOK_ANSWER_ONLY_INSTITUTIONAL_SILENCE. The county grievance queue
 * retroactively reclassifies her Q1 messages as RESOLVED-NO-CONTACT
 * upstream of Silas and Rasha both. Neither party sees the change; the
 * ledger records the reclassification in the audit trail.
 */
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import {
  makeConsequenceId,
  makeTaskId,
  makeChoiceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-payroll-audit-inspection-08')

// ---------------------------------------------------------------------------
// Hook 1 — choice-full-cooperation-posture → PHASE reveal at CONSEQUENCE_RETURN
// ---------------------------------------------------------------------------

export const HOOK_FULL_COOPERATION_POSTURE: ConsequenceHook = {
  id: makeConsequenceId('cons-full-cooperation-posture-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-full-cooperation-posture'),
  traceHint:
    'The open-book posture set the tone the auditor carried into every session.',
  ledgerEntry:
    'The three-quarter payroll audit opened with unrestricted access to the ' +
    'payroll ledger, the W3 shift-cost reconciliations, and the W5 dispatch ' +
    'roster changes. The county auditor logged the posture as ' +
    '"cooperative-baseline" on day 1. PAYROLL_AUDIT_DONE was set on the ' +
    'directive close. The Q1P.A/Q1P.B inspection scenes will inherit the ' +
    'cooperative posture as their starting frame.',
  revealCondition: { type: 'PHASE', phase: 'CONSEQUENCE_RETURN' },
  whyNow:
    'A posture-selection on day 1 of the audit posts to the county file ' +
    'immediately and is visible in the next consequence-return window.',
  whatChanged:
    'PAYROLL_AUDIT_DONE is set. Human-Welfare rose because the dock read ' +
    'the posture as good faith. Capital dipped for the open-book overhead. ' +
    'The Q1P inspection scenes will read this hook as one of the inputs to ' +
    'their opening auditor question.',
}

// ---------------------------------------------------------------------------
// Hook 2 — choice-legal-minimum-posture → METER_THRESHOLD OC ≤ -18
// ---------------------------------------------------------------------------

export const HOOK_LEGAL_MINIMUM_POSTURE: ConsequenceHook = {
  id: makeConsequenceId('cons-legal-minimum-posture-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-legal-minimum-posture'),
  traceHint:
    'The counsel-present posture read as defensive once Owner-Control had already thinned.',
  ledgerEntry:
    'Outside counsel attended every auditor session at the retainer rate of ' +
    '$340/hour. The county auditor logged the posture as "records-only, ' +
    'representation-mediated." PAYROLL_AUDIT_DONE was set on the directive ' +
    'close. When Owner-Control has dropped this low, the audit team reads ' +
    'the mediated posture as one more sign that the owner-authority of the ' +
    'operation is thin — the counsel is the wall, not Silas.',
  revealCondition: {
    type: 'METER_THRESHOLD',
    meter: 'OWNER_CONTROL',
    threshold: -18,
  },
  whyNow:
    'The counsel-mediated posture reads differently at different owner- ' +
    'authority floors. At a low floor, the auditor treats every counsel ' +
    'answer as a challenge rather than a clarification; the reveal fires ' +
    'when OC has dropped far enough for the reading to shift.',
  whatChanged:
    'PAYROLL_AUDIT_DONE is set. Capital took the counsel retainer as a ' +
    'line item. Human-Welfare dipped because the dock read the posture as ' +
    'stiff-arming the audit. The Q1P inspection scenes will read this hook ' +
    'as an adversarial-posture input.',
}

// ---------------------------------------------------------------------------
// Hook 3 — choice-preemptive-restatement-posture → FLAG reveal at W9 progression
// ---------------------------------------------------------------------------

export const HOOK_PREEMPTIVE_RESTATEMENT: ConsequenceHook = {
  id: makeConsequenceId('cons-preemptive-restatement-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-preemptive-restatement-posture'),
  traceHint:
    'The restated W3 and W5 records defined the frame the auditor read from.',
  ledgerEntry:
    'A preemptive restatement of the W3 payroll pressure reconciliations and ' +
    'the W5 warehouse dispatch cut roster was filed with the county before ' +
    'the auditor requested them. External accountant hours came to $9,100. ' +
    'The county auditor logged the posture as "self-disclosed baseline." ' +
    'PAYROLL_AUDIT_DONE was set on the directive close. Silas set the frame ' +
    'the auditor will read the rest of the quarter through.',
  revealCondition: { type: 'FLAG', flag: 'q1-week9-elapsed' },
  whyNow:
    'A preemptive restatement does not fully book its impact until the audit ' +
    'moves past its opening session. The reveal surfaces when W9 lands and ' +
    'the auditor\u2019s week-2 questions read as pre-answered by the ' +
    'restatement filing.',
  whatChanged:
    'PAYROLL_AUDIT_DONE is set. Capital took the accountant hours as a ' +
    'line item. Owner-Control rose because Silas defined the frame. The ' +
    'Q1P inspection scenes will read this hook as a "self-disclosed" input ' +
    'and open with narrower questions.',
}

// ---------------------------------------------------------------------------
// Hook 4 — choice-answer-only-when-asked → NEVER (institutional silence)
// ---------------------------------------------------------------------------

export const HOOK_ANSWER_ONLY_INSTITUTIONAL_SILENCE: ConsequenceHook = {
  id: makeConsequenceId('cons-answer-only-institutional-silence-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-answer-only-when-asked'),
  traceHint:
    'Rasha Odenwalder\u2019s Q1 messages were reclassified upstream. Neither party was notified.',
  ledgerEntry:
    'The audit posture volunteered nothing beyond direct questions. ' +
    'PAYROLL_AUDIT_DONE was set on the directive close. On the same audit ' +
    'day the county grievance queue processed a routine reclassification ' +
    'batch: Rasha Odenwalder\u2019s Q1 messages 1 through 4 were moved from ' +
    'OPEN-SUPERVISOR-CONTACT to RESOLVED-NO-CONTACT under the sustained ' +
    'no-response rule. The reclassification generated no notification. ' +
    'Rasha did not learn her messages had been closed. Silas did not learn ' +
    'they had ever been open on the queue\u2019s ledger.',
  // NEVER: the Rasha silence ladder reaches its final rung — institutional.
  // W5 was personal (unanswered message). W6 was procedural (subordinate's
  // hearing request routed around a silent supervisor). W7 was structural
  // (operations desk auto-routed her messages to a closed inbox). W8 is
  // institutional (the county grievance queue itself retroactively marks
  // her Q1 messages as if they had been resolved). Each rung removes one
  // more channel until nothing carries her voice upward.
  revealCondition: { type: 'NEVER' },
  whyNow:
    'An institutional reclassification produces no notification event by ' +
    'definition. The absence of the reveal is the endpoint of the ladder: ' +
    'four rungs of silence collapse into one retroactive erasure of the ' +
    'record.',
  whatChanged:
    'PAYROLL_AUDIT_DONE is set. Human-Welfare dipped modestly. Capital ' +
    'held. The Q1P inspection scenes will read this hook\u2019s ' +
    '"volunteered-nothing" posture as an evasive-baseline input. Rasha\u2019s ' +
    'name does not appear in the auditor\u2019s scope; her Q1 messages ' +
    'appear only in the grievance queue\u2019s audit trail, retroactively ' +
    'closed.',
}

// ---------------------------------------------------------------------------
// Public registry for this content module
// ---------------------------------------------------------------------------

export const PAYROLL_AUDIT_HOOKS: readonly ConsequenceHook[] = [
  HOOK_FULL_COOPERATION_POSTURE,
  HOOK_LEGAL_MINIMUM_POSTURE,
  HOOK_PREEMPTIVE_RESTATEMENT,
  HOOK_ANSWER_ONLY_INSTITUTIONAL_SILENCE,
]
