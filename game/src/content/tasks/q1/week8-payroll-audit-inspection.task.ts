/**
 * Payroll-audit-inspection task — Q1 Week 8 directive (Sprint C9).
 *
 * The county opens a three-quarter payroll audit. This is the arc's Act II
 * closer and the trigger for the payroll inspection scene (C14 authors
 * `content/inspections/q1Payroll.scene.ts` — Q1P.A/Q1P.B). The directive
 * SETS `PAYROLL_AUDIT_DONE` on any choice; the inspection scene reads
 * both `PAYROLL_AUDIT_DONE` and `OWNER_CONTROL < 40` as its trigger
 * condition (per arc doc §Inspection insertion, W8 row).
 *
 * Meter profile targets (`docs/content/q1-arc.md` W8 row):
 *   "small deltas; sets `PAYROLL_AUDIT_DONE`"
 * The bulk of the meter movement lives in the inspection scene, not the
 * directive. Deltas here are ±[1,3] across all four choices — this is
 * a posture-selection beat, not a large-swing decision.
 *
 * Module signals to mitigate (read at inspection resolution, per arc doc
 * §Module signals): DEFENDER_HELD_LINE, SENTINEL_ARMED, DRAINED_ONE_YIELDED.
 * The mitigations are wired in B6 v2 or after C14 lands; not this sprint.
 *
 * The Rasha silence-trap ladder reaches its **institutional** rung this
 * week. On the terminal-silence choice, the county grievance queue
 * reclassifies her Q1 messages as `RESOLVED-NO-CONTACT` upstream — the
 * ledger records the reclassification without a notification event
 * reaching Silas OR Rasha. The channel is not closed on paper; it is
 * retroactively rewritten as if it had never asked.
 *
 * Death rules — Rasha remains death-immune in Q1 per §7. The dispatch
 * driver injury from W7 (if that branch fired) surfaces on the
 * auditor's report as a specific payroll line item; Rasha herself
 * carries no implied-injury path this week.
 *
 * Exports:
 *   payrollAuditInspectionTask     — the TaskNode for this beat.
 *   RASHA_INSTITUTIONAL_STATUS     — the grievance-queue reclassification text.
 *   PAYROLL_AUDIT_NULL_TEXT        — the Null observation.
 */
import type { TaskNode } from '@schemas/taskNode.schema'
import {
  makeTaskId,
  makeSilasPromptId,
  makeChoiceId,
} from '@schemas/gameState.schema'

export const payrollAuditInspectionTask: TaskNode = {
  id: makeTaskId('task-payroll-audit-inspection-08'),
  phase: 'FIRST_DIRECTIVE',
  silasPromptId: makeSilasPromptId('silas-payroll-audit-inspection-01'),
  directive: 'Choose the posture Silas holds through the three-quarter payroll audit',
  choiceIds: [
    makeChoiceId('choice-full-cooperation-posture'),
    makeChoiceId('choice-legal-minimum-posture'),
    makeChoiceId('choice-preemptive-restatement-posture'),
    makeChoiceId('choice-answer-only-when-asked'),
  ],
}

/**
 * The grievance-queue reclassification — text that appears in the ledger
 * on the terminal-silence branch. Not a message from Rasha; a status
 * update the county grievance system routes about her. Never shown as a
 * portal message to Silas or Rasha; only visible in the ledger's audit
 * trail retroactively.
 */
export const RASHA_INSTITUTIONAL_STATUS = {
  system: 'County Grievance Queue',
  body:
    'STATUS CHANGE: R. Odenwalder / East Wilmer dispatch supervisor. ' +
    'Q1 messages 1\u20134: reclassified from OPEN-SUPERVISOR-CONTACT to ' +
    'RESOLVED-NO-CONTACT. Reclassification reason: sustained absence of ' +
    'supervisor-tier response. No notification routed to submitter or recipient.',
} as const

/**
 * The Null observation — the numeric shape of the payroll audit, the
 * shared-risk carryover from W7, and the reclassification status.
 * Drained of human stakes; pairs with Silas's fatigue in the prompt.
 */
export const PAYROLL_AUDIT_NULL_TEXT =
  'County payroll audit: opened, day 1 of 21. Payroll periods under review: ' +
  '3 quarters (12 pay cycles). W7 injury carry: 1 line item. Rasha ' +
  'Odenwalder\u2019s message queue: RESOLVED-NO-CONTACT (retroactive).'
