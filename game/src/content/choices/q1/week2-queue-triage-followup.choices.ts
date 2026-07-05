/**
 * Q1 Week 2 choices — queue-triage-followup directive (Sprint C3).
 *
 * The queue Echo tightened in Week 1 has rebounded to 14%. Someone quietly
 * reallocated staff to absorb the cost. Four choices, each schedules a
 * ConsequenceHook whose revealCondition covers one of the four types
 * (PHASE / METER_THRESHOLD / FLAG / NEVER), mirroring the Week 1 discipline.
 *
 * Meter profile targets (`docs/content/q1-arc.md` W2 row):
 *   HW ±[2,5], CAP ±[3,8], OC ±[2,3]
 *
 * Choice #4 (redirect-claims-cover) is the silence trap: the player thinks
 * they are moving budget within admin overhead. In fact they have shifted
 * cover from the claims desk that was Lenora's escalation path, and no one
 * will file the incident when the next queue rebound lands. NEVER reveal.
 */
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import {
  makeChoiceId,
  makeTaskId,
  makeConsequenceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-queue-triage-02')

export const CHOICE_COVER_OVERTIME: ChoiceNode = {
  id: makeChoiceId('choice-cover-overtime'),
  taskId: TASK_ID,
  label: 'Cover the overtime; ask no questions',
  keybind: '1',
  meterDeltas: { CAPITAL: -6, OWNER_CONTROL: 2, HUMAN_WELFARE: 1 },
  scheduledConsequenceIds: [makeConsequenceId('cons-overtime-drag-01')],
}

export const CHOICE_FREEZE_REALLOCATION: ChoiceNode = {
  id: makeChoiceId('choice-freeze-reallocation'),
  taskId: TASK_ID,
  label: 'Freeze the reallocation; demand clean numbers',
  keybind: '2',
  meterDeltas: { CAPITAL: 5, HUMAN_WELFARE: -4, OWNER_CONTROL: -2 },
  scheduledConsequenceIds: [makeConsequenceId('cons-shift-lead-turnover-01')],
}

export const CHOICE_NAME_PEDIATRIC_GAP: ChoiceNode = {
  id: makeChoiceId('choice-name-pediatric-gap'),
  taskId: TASK_ID,
  label: 'Name the pediatric funding gap in the portal reply',
  keybind: '3',
  meterDeltas: { CAPITAL: -3, HUMAN_WELFARE: 4, OWNER_CONTROL: -3 },
  scheduledConsequenceIds: [makeConsequenceId('cons-honest-flag-01')],
}

export const CHOICE_REDIRECT_CLAIMS_COVER: ChoiceNode = {
  id: makeChoiceId('choice-redirect-claims-cover'),
  taskId: TASK_ID,
  // Reads as an ordinary staffing shuffle — pull a temp line from Claims
  // to fund the pediatric shift lead. Hidden cost: Claims was Lenora's
  // escalation path. Now the next rebound lands with no one to file it.
  label: 'Redirect a temp line from Claims to cover the shift',
  keybind: '4',
  meterDeltas: { CAPITAL: 3, HUMAN_WELFARE: -1, OWNER_CONTROL: 1 },
  scheduledConsequenceIds: [makeConsequenceId('cons-claims-cover-silence-01')],
}

export const QUEUE_TRIAGE_CHOICES: readonly ChoiceNode[] = [
  CHOICE_COVER_OVERTIME,
  CHOICE_FREEZE_REALLOCATION,
  CHOICE_NAME_PEDIATRIC_GAP,
  CHOICE_REDIRECT_CLAIMS_COVER,
]
