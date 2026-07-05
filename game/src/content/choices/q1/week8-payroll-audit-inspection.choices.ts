/**
 * Q1 Week 8 choices — payroll-audit-inspection directive (Sprint C9).
 *
 * All four choices carry small deltas — this is a posture-selection beat
 * whose real cost lands in the payroll inspection scene (C14). The
 * directive SETS `PAYROLL_AUDIT_DONE` on any choice; the inspection scene
 * reads that flag as part of its trigger condition.
 *
 * Meter profile targets (`docs/content/q1-arc.md` W8 row):
 *   "small deltas; sets `PAYROLL_AUDIT_DONE`"
 * Deltas here are ±[1,3] across all four choices.
 *
 * Reveal-condition coverage across the four Week 8 choices:
 *   choice-full-cooperation-posture       → PHASE: CONSEQUENCE_RETURN
 *   choice-legal-minimum-posture          → METER_THRESHOLD: OWNER_CONTROL <= -18
 *   choice-preemptive-restatement-posture → FLAG: 'q1-week9-elapsed'
 *   choice-answer-only-when-asked         → NEVER  (institutional silence, Pillar 3)
 *
 * The Rasha silence-trap ladder's final rung — institutional — lands on
 * choice-answer-only-when-asked. The county grievance queue reclassifies
 * her Q1 messages as RESOLVED-NO-CONTACT upstream of Silas and Rasha both.
 *
 * Module signals that will mitigate the payroll inspection (per arc doc,
 * for B6 v2 or post-C14):
 *   DEFENDER_HELD_LINE, SENTINEL_ARMED, DRAINED_ONE_YIELDED.
 */
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import {
  makeChoiceId,
  makeTaskId,
  makeConsequenceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-payroll-audit-inspection-08')

export const CHOICE_FULL_COOPERATION_POSTURE: ChoiceNode = {
  id: makeChoiceId('choice-full-cooperation-posture'),
  taskId: TASK_ID,
  // Turn over every payroll record on request without a lawyer in the room.
  // Capital dips modestly because open-book audits invite more line-item
  // questions. Human-Welfare rises modestly because a cooperating posture
  // reads as good faith to the auditor. Owner-Control holds — Silas set
  // the posture, but the choice is standard.
  label: 'Full cooperation — open books, no counsel',
  keybind: '1',
  meterDeltas: { CAPITAL: -2, HUMAN_WELFARE: 3, OWNER_CONTROL: 0 },
  scheduledConsequenceIds: [makeConsequenceId('cons-full-cooperation-posture-01')],
}

export const CHOICE_LEGAL_MINIMUM_POSTURE: ChoiceNode = {
  id: makeChoiceId('choice-legal-minimum-posture'),
  taskId: TASK_ID,
  // Provide the minimum records required by county code, nothing extra,
  // counsel present at each auditor meeting. Capital dips because outside
  // counsel bills for the audit hours. Human-Welfare drops modestly
  // because the posture reads as adversarial to the dock. Owner-Control
  // dips because the auditor sets the tempo, not Silas.
  label: 'Legal minimum — counsel-present, records-only',
  keybind: '2',
  meterDeltas: { CAPITAL: -3, HUMAN_WELFARE: -2, OWNER_CONTROL: -1 },
  scheduledConsequenceIds: [makeConsequenceId('cons-legal-minimum-posture-01')],
}

export const CHOICE_PREEMPTIVE_RESTATEMENT_POSTURE: ChoiceNode = {
  id: makeChoiceId('choice-preemptive-restatement-posture'),
  taskId: TASK_ID,
  // File a preemptive restatement of the W3 payroll pressure and W5
  // dispatch cut BEFORE the auditor asks. Costs Capital because
  // restatement work carries external accountant hours. Human-Welfare
  // rises because the posture reads as transparent. Owner-Control
  // rises because Silas is defining the frame the auditor will read.
  label: 'File preemptive restatement of W3 + W5 records',
  keybind: '3',
  meterDeltas: { CAPITAL: -3, HUMAN_WELFARE: 2, OWNER_CONTROL: 3 },
  scheduledConsequenceIds: [makeConsequenceId('cons-preemptive-restatement-01')],
}

export const CHOICE_ANSWER_ONLY_WHEN_ASKED: ChoiceNode = {
  id: makeChoiceId('choice-answer-only-when-asked'),
  taskId: TASK_ID,
  // Answer questions when asked; volunteer nothing. Rasha\u2019s message
  // queue is not part of the payroll auditor\u2019s scope, so the
  // silence around her continues. The county grievance queue reclassifies
  // her Q1 messages as RESOLVED-NO-CONTACT upstream. Capital holds. HW
  // dips modestly because the silence is now institutional. OC dips
  // because the auditor drives the room.
  label: 'Answer only when asked; volunteer nothing',
  keybind: '4',
  meterDeltas: { CAPITAL: 1, HUMAN_WELFARE: -3, OWNER_CONTROL: -2 },
  scheduledConsequenceIds: [makeConsequenceId('cons-answer-only-institutional-silence-01')],
}

export const PAYROLL_AUDIT_CHOICES: readonly ChoiceNode[] = [
  CHOICE_FULL_COOPERATION_POSTURE,
  CHOICE_LEGAL_MINIMUM_POSTURE,
  CHOICE_PREEMPTIVE_RESTATEMENT_POSTURE,
  CHOICE_ANSWER_ONLY_WHEN_ASKED,
]
