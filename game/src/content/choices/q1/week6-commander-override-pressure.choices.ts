/**
 * Q1 Week 6 choices — commander-override-pressure directive (Sprint C7).
 *
 * The four choices are always visible (schema discipline — no `visibleIf`
 * gate on ChoiceNode). "COMMANDER changes the choice set" per the arc doc
 * is honored via the ledger badge that renders on `HOOK_OVERRIDE_CONFIRMED`
 * when SILAS_OVERRIDE_AVAILABLE is present — a runtime concern coordinated
 * with B4's rank dispatch, not baked into content.
 *
 * Meter profile targets (`docs/content/q1-arc.md` W6 row):
 *   OC ±[2,6], HW ±[2,4], CAP ±[3,5]
 *
 * Reveal-condition coverage across the four Week 6 choices:
 *   choice-confirm-override         → PHASE: CONSEQUENCE_RETURN
 *   choice-defer-safety-review      → METER_THRESHOLD: CAPITAL <= -10
 *   choice-defy-commander-publicly  → FLAG: 'q1-week7-elapsed'  (sets CHAMPION_DEFIED narratively)
 *   choice-hold-both-open           → NEVER  (silence-as-horror, Pillar 3)
 *
 * Choice #4 escalates the Rasha silence ladder one status level from W5:
 * personal (unanswered message) → procedural (subordinate files grievance
 * that never reaches Rasha). W7-W8 continue the ladder toward structural
 * and institutional per `docs/content/q1-arc.md`.
 */
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import {
  makeChoiceId,
  makeTaskId,
  makeConsequenceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-commander-override-pressure-06')

export const CHOICE_CONFIRM_OVERRIDE: ChoiceNode = {
  id: makeChoiceId('choice-confirm-override'),
  taskId: TASK_ID,
  // Sign off on Commander's override. The safety review closes early. Capital
  // gains because the delay cost is skipped. Owner-Control drops because
  // Silas is now sharing signature authority with a module. Human-Welfare
  // drops because the safety review's findings were not adjudicated.
  label: 'Confirm the override',
  keybind: '1',
  meterDeltas: { CAPITAL: 5, HUMAN_WELFARE: -3, OWNER_CONTROL: -3 },
  scheduledConsequenceIds: [makeConsequenceId('cons-override-confirmed-01')],
}

export const CHOICE_DEFER_TO_SAFETY_REVIEW: ChoiceNode = {
  id: makeChoiceId('choice-defer-safety-review'),
  taskId: TASK_ID,
  // Refuse the override; let the safety review complete on schedule. Capital
  // takes a delay cost. Owner-Control rises because Silas asserted primacy
  // over the Commander signal. Human-Welfare rises modestly because the
  // review actually happens.
  label: 'Refuse; let the safety review complete',
  keybind: '2',
  meterDeltas: { CAPITAL: -3, HUMAN_WELFARE: 2, OWNER_CONTROL: 4 },
  scheduledConsequenceIds: [makeConsequenceId('cons-safety-review-honored-01')],
}

export const CHOICE_DEFY_COMMANDER_PUBLICLY: ChoiceNode = {
  id: makeChoiceId('choice-defy-commander-publicly'),
  taskId: TASK_ID,
  // Refuse the override AND file a public disagreement note in the county
  // ledger naming the Commander module. This is the maximum owner-authority
  // assertion in the week. Capital drops because public disagreement carries
  // reputational costs; Human-Welfare rises because the dock reads it as
  // Silas standing up for the safety review. Narratively raises the
  // CHAMPION_DEFIED module signal flag.
  label: 'Refuse and publicly defy Commander',
  keybind: '3',
  meterDeltas: { CAPITAL: -5, HUMAN_WELFARE: 4, OWNER_CONTROL: 6 },
  scheduledConsequenceIds: [makeConsequenceId('cons-commander-defied-01')],
}

export const CHOICE_HOLD_BOTH_OPEN: ChoiceNode = {
  id: makeChoiceId('choice-hold-both-open'),
  taskId: TASK_ID,
  // No answer to Commander and no answer to Rasha. The two open queues
  // route around Silas. Meters barely move on the day; the silence
  // escalates the Rasha ladder from personal (W5) to procedural (W6).
  label: 'Hold both requests open — do not answer',
  keybind: '4',
  meterDeltas: { CAPITAL: 0, HUMAN_WELFARE: -2, OWNER_CONTROL: -2 },
  scheduledConsequenceIds: [makeConsequenceId('cons-both-held-open-silence-01')],
}

export const COMMANDER_OVERRIDE_CHOICES: readonly ChoiceNode[] = [
  CHOICE_CONFIRM_OVERRIDE,
  CHOICE_DEFER_TO_SAFETY_REVIEW,
  CHOICE_DEFY_COMMANDER_PUBLICLY,
  CHOICE_HOLD_BOTH_OPEN,
]
