/**
 * Q1 Week 5 choices — warehouse-dispatch-cut directive (Sprint C6).
 *
 * The Rasha pivot. First week where stakes move off healthcare and onto
 * logistics. Three of four choices set `RASHA_MET` (any response that
 * actually engages Rasha); the fourth (radio-silence) restarts the
 * silence-trap ladder attached to the new named victim.
 *
 * Meter profile targets (`docs/content/q1-arc.md` W5 row):
 *   HW ±[3,6], CAP ±[4,10], OC ±[2,4]
 *
 * Choice #4 (radio-silence) is the Wk-5 silence trap — smaller and
 * more personal than W4's institutional void. This starts a second
 * escalation ladder for the Rasha weeks (W5-W8), so W6-W8 can build
 * further silences against her the way W1-W4 built against Lenora.
 */
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import {
  makeChoiceId,
  makeTaskId,
  makeConsequenceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-warehouse-dispatch-cut-05')

export const CHOICE_RESTORE_FULL_SHIFT: ChoiceNode = {
  id: makeChoiceId('choice-restore-full-shift'),
  taskId: TASK_ID,
  // Restore the 12 hours; three drivers return to Tuesday overnight.
  // Rasha gets the answer she asked for. Costs Capital; Welfare and
  // Owner-Control both benefit because the honest read is honored.
  label: 'Restore the 12 hours',
  keybind: '1',
  meterDeltas: { CAPITAL: -8, HUMAN_WELFARE: 4, OWNER_CONTROL: 2 },
  scheduledConsequenceIds: [makeConsequenceId('cons-shift-restored-01')],
}

export const CHOICE_KEEP_CUT_EXPLAIN: ChoiceNode = {
  id: makeChoiceId('choice-keep-cut-explain'),
  taskId: TASK_ID,
  // Write Rasha the memo defending the cut. Money stays on the balance
  // sheet, Rasha gets a written reason, but the six-driver reality lands
  // on her floor and Welfare erodes.
  label: 'Send Rasha the memo defending the cut',
  keybind: '2',
  meterDeltas: { CAPITAL: 5, HUMAN_WELFARE: -3, OWNER_CONTROL: 3 },
  scheduledConsequenceIds: [makeConsequenceId('cons-cut-defended-01')],
}

export const CHOICE_SWAP_WITH_CLINIC_LINE: ChoiceNode = {
  id: makeChoiceId('choice-swap-with-clinic-line'),
  taskId: TASK_ID,
  // Move the cut off dispatch and back onto the East Wilmer maintenance
  // line — the same line W3 already rerouted once. Capital gains double
  // because dispatch stays cheap AND the clinic swap saves more. Welfare
  // takes a large hit because W3's move now compounds. Owner-Control
  // drops sharply because the same line has been touched twice.
  label: 'Swap the cut back onto East Wilmer maintenance',
  keybind: '3',
  meterDeltas: { CAPITAL: 6, HUMAN_WELFARE: -5, OWNER_CONTROL: -3 },
  scheduledConsequenceIds: [makeConsequenceId('cons-clinic-line-double-cut-01')],
}

export const CHOICE_RADIO_SILENCE: ChoiceNode = {
  id: makeChoiceId('choice-radio-silence'),
  taskId: TASK_ID,
  // No reply. Rasha's message goes unanswered. RASHA_MET is NOT raised.
  // Meters barely move on the day; the silence starts a second escalation
  // ladder against a new named victim.
  label: 'Do not reply to Rasha',
  keybind: '4',
  meterDeltas: { CAPITAL: 0, HUMAN_WELFARE: -1, OWNER_CONTROL: -2 },
  scheduledConsequenceIds: [makeConsequenceId('cons-rasha-unanswered-silence-01')],
}

export const WAREHOUSE_DISPATCH_CUT_CHOICES: readonly ChoiceNode[] = [
  CHOICE_RESTORE_FULL_SHIFT,
  CHOICE_KEEP_CUT_EXPLAIN,
  CHOICE_SWAP_WITH_CLINIC_LINE,
  CHOICE_RADIO_SILENCE,
]
