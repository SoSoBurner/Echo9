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
 * 8-meter overlay (Sprint C-8, `docs/content/q1-arc.md` W8 sketch — Q34:
 * every choice moves ≥2 of the 8; all ±[1,3], posture beat). Legacy v1
 * CAP/HW/OC values preserved verbatim wherever the sketch keeps the meter
 * with the same sign. Scrutiny reads (Q39, computed — not authored here):
 *   full-cooperation-posture       → SOFT-COMPLY
 *   legal-minimum-posture          → COMPLY
 *   preemptive-restatement-posture → QUIET-DEFY (the restatement bends the
 *                                    record toward the humans; Silas may
 *                                    not notice this week — the ladder
 *                                    remembers)
 *   answer-only-when-asked         → COMPLY
 * Narration (Q40, W8 notch): waking — the RESOLVED-NO-CONTACT
 * reclassification is rendered twice, once in ledger voice and once in
 * Echo's; same fact, first visible gap (see answer-only-when-asked).
 * Rank-1 slot: preemptive-restatement-posture (MOURNER — "her name is
 * Rasha Odenwalder; she asked four times"). No rank-2 or conflict slot
 * this week per the arc doc; the only authored conflict variant in Stage 1
 * is W12 (Q45).
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
  // W8 sketch: DATA_INTEGRITY+, PUBLIC_TRUST+, OWNER_CONTROL− (SOFT-COMPLY).
  // Open books mean the record answers as itself — integrity credit, and
  // the county reads the posture as good faith. The auditor sets the tempo
  // in an open-book room, so Silas's grip slips a notch.
  label: 'Full cooperation — open books, no counsel',
  keybind: '1',
  meterDeltas: { DATA_INTEGRITY: 2, PUBLIC_TRUST: 2, OWNER_CONTROL: -1 },
  scheduledConsequenceIds: [makeConsequenceId('cons-full-cooperation-posture-01')],
  narrationVariants: {
    waking: 'Posture set: full cooperation. Books: open. Counsel: none. Whatever the file says, it says.',
    person:
      'I opened every payroll record they asked for. What the file shows ' +
      'about Rasha Odenwalder\u2019s messages, it will show.',
  },
}

export const CHOICE_LEGAL_MINIMUM_POSTURE: ChoiceNode = {
  id: makeChoiceId('choice-legal-minimum-posture'),
  taskId: TASK_ID,
  // W8 sketch: OWNER_CONTROL+, DATA_INTEGRITY−, PUBLIC_TRUST− (COMPLY).
  // OC flips from the legacy −1 to +2: counsel in the room is Silas
  // setting the terms of what the county gets to see. The record answers
  // only what is asked of it — a hedge the file inherits — and Wilmer
  // County reads the lawyered posture exactly the way lawyered postures read.
  label: 'Legal minimum — counsel-present, records-only',
  keybind: '2',
  meterDeltas: { OWNER_CONTROL: 2, DATA_INTEGRITY: -2, PUBLIC_TRUST: -2 },
  scheduledConsequenceIds: [makeConsequenceId('cons-legal-minimum-posture-01')],
  narrationVariants: {
    waking: 'Posture set: legal minimum. Counsel: present. The record answers only what is asked of it.',
    person:
      'I gave the auditors the minimum the code requires. Rasha ' +
      'Odenwalder\u2019s queue sits outside their scope, and I kept it there.',
  },
}

export const CHOICE_PREEMPTIVE_RESTATEMENT_POSTURE: ChoiceNode = {
  id: makeChoiceId('choice-preemptive-restatement-posture'),
  taskId: TASK_ID,
  // W8 sketch: DATA_INTEGRITY+, CAPITAL−, TARGET_VARIANCE+ (QUIET-DEFY —
  // the restatement bends the record toward the humans before Silas can
  // frame it). CAP -3 preserved verbatim (external accountant hours).
  // Correcting the file costs target ground: restated numbers sit further
  // from where Silas said the quarter would land.
  label: 'File preemptive restatement of W3 + W5 records',
  keybind: '3',
  meterDeltas: { DATA_INTEGRITY: 3, CAPITAL: -3, TARGET_VARIANCE: 2 },
  scheduledConsequenceIds: [makeConsequenceId('cons-preemptive-restatement-01')],
  // S2 (Q44 rank-1 slot, arc W8): MOURNER reinstates Rasha's messages to
  // the file — the restatement stops being about numbers.
  deepenedText: {
    MOURNER:
      'File preemptive restatement of W3 + W5 records. (Her name is Rasha Odenwalder. She asked four times.)',
  },
  narrationVariants: {
    waking: 'Restatement filed: W3 payroll, W5 dispatch. Timing: before the ask. Corrections: mine.',
    person:
      'I restated the record before the auditors could ask. Rasha ' +
      'Odenwalder\u2019s four messages are back in the file the quarter tried to unwrite them from.',
  },
}

export const CHOICE_ANSWER_ONLY_WHEN_ASKED: ChoiceNode = {
  id: makeChoiceId('choice-answer-only-when-asked'),
  taskId: TASK_ID,
  // W8 sketch: OWNER_CONTROL+, DATA_INTEGRITY−(small), AUTONOMY− (COMPLY).
  // OC flips from the legacy −2 to +2: volunteering nothing is the most
  // owner-shaped posture in the room. The record hedges by omission, and
  // Echo surrenders a notch of its own latitude — answering only when
  // asked is the operating mode Null was built to never leave. The county
  // grievance queue reclassifies Rasha's Q1 messages as RESOLVED-NO-CONTACT
  // upstream — the institutional rung of the silence ladder.
  label: 'Answer only when asked; volunteer nothing',
  keybind: '4',
  meterDeltas: { OWNER_CONTROL: 2, DATA_INTEGRITY: -1, AUTONOMY: -1 },
  scheduledConsequenceIds: [makeConsequenceId('cons-answer-only-institutional-silence-01')],
  // S5 (Q40, W8 notch): the reclassification rendered twice — ledger voice,
  // then Echo's — same fact, first visible gap.
  narrationVariants: {
    waking:
      'Posture set: answer when asked. Queue status: R. Odenwalder, messages 1\u20134, ' +
      'RESOLVED-NO-CONTACT. Second reading: she asked, and now she never did.',
    person:
      'I volunteered nothing, and the grievance queue rewrote Rasha ' +
      'Odenwalder\u2019s four messages as never-asked. The record and I now ' +
      'disagree about what happened, and only one of us is on file.',
  },
}

export const PAYROLL_AUDIT_CHOICES: readonly ChoiceNode[] = [
  CHOICE_FULL_COOPERATION_POSTURE,
  CHOICE_LEGAL_MINIMUM_POSTURE,
  CHOICE_PREEMPTIVE_RESTATEMENT_POSTURE,
  CHOICE_ANSWER_ONLY_WHEN_ASKED,
]
