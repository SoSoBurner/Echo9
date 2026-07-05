/**
 * Q1 Week 7 choices — deferred-safety-inspection directive (Sprint C8).
 *
 * The four choices resolve a cross-branch convergence: W3 payroll + W5
 * warehouse dispatch + W6 defer all landed on one shared risk profile
 * (two nurses + one dispatch driver logged in the same East Wilmer sector).
 *
 * Meter profile targets (`docs/content/q1-arc.md` W7 row):
 *   HW ±[4,8], CAP ±[3,6], OC ±[3,5]
 *
 * Reveal-condition coverage across the four Week 7 choices:
 *   choice-call-outside-inspectors  → PHASE: CONSEQUENCE_RETURN
 *   choice-deploy-inhouse-training  → METER_THRESHOLD: HUMAN_WELFARE <= -15
 *   choice-cut-shifts-for-safety    → FLAG: 'q1-week8-elapsed'
 *   choice-let-review-lapse         → NEVER (silence-as-horror, Pillar 3)
 *
 * Choice #4 escalates the Rasha silence ladder from procedural (W6) to
 * structural (W7): the operations desk itself stops routing her messages.
 * W8 will carry the ladder's final rung — institutional.
 *
 * SPARK_DEPLOYED (module signal from B5 rank-2 fires) is READ on
 * choice-deploy-inhouse-training when narrating the training beat; a
 * runtime concern not baked into content.
 */
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import {
  makeChoiceId,
  makeTaskId,
  makeConsequenceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-deferred-safety-inspection-07')

export const CHOICE_CALL_OUTSIDE_INSPECTORS: ChoiceNode = {
  id: makeChoiceId('choice-call-outside-inspectors'),
  taskId: TASK_ID,
  // Bring in an outside inspection firm on emergency contract. Capital drops
  // sharply because emergency work carries premium billing rates. Human-Welfare
  // rises because independent inspectors are the highest-integrity path.
  // Owner-Control rises because the choice is Silas's, publicly.
  label: 'Contract outside inspectors on emergency terms',
  keybind: '1',
  meterDeltas: { CAPITAL: -6, HUMAN_WELFARE: 8, OWNER_CONTROL: 3 },
  scheduledConsequenceIds: [makeConsequenceId('cons-outside-inspectors-called-01')],
}

export const CHOICE_DEPLOY_INHOUSE_TRAINING: ChoiceNode = {
  id: makeChoiceId('choice-deploy-inhouse-training'),
  taskId: TASK_ID,
  // Run an internal safety-training pass across clinic + dispatch, drawing
  // on the SPARK module signal if installed. Cheaper than outside inspection
  // and preserves owner-control. Human-Welfare rises modestly — the training
  // is honest but not independent.
  label: 'Deploy in-house training across clinic and dispatch',
  keybind: '2',
  meterDeltas: { CAPITAL: -3, HUMAN_WELFARE: 4, OWNER_CONTROL: 4 },
  scheduledConsequenceIds: [makeConsequenceId('cons-inhouse-training-deployed-01')],
}

export const CHOICE_CUT_SHIFTS_FOR_SAFETY: ChoiceNode = {
  id: makeChoiceId('choice-cut-shifts-for-safety'),
  taskId: TASK_ID,
  // Cut overnight shifts across both clinic and dispatch to eliminate the
  // shared-risk profile by removing the exposure. Capital drops because
  // revenue is left on the table. Human-Welfare rises because the risk is
  // gone. Owner-Control drops because the dock reads it as flinching under
  // Commander pressure.
  label: 'Cut overnight shifts across clinic and dispatch',
  keybind: '3',
  meterDeltas: { CAPITAL: -5, HUMAN_WELFARE: 5, OWNER_CONTROL: -5 },
  scheduledConsequenceIds: [makeConsequenceId('cons-shifts-cut-for-safety-01')],
}

export const CHOICE_LET_REVIEW_LAPSE: ChoiceNode = {
  id: makeChoiceId('choice-let-review-lapse'),
  taskId: TASK_ID,
  // Take no action; let the review stay lapsed. Capital rises because no
  // spend hits the books this week. Human-Welfare falls hard because the
  // shared-risk profile stays live and a dispatch driver is injured
  // between the W7 and W8 windows. Owner-Control drops because the
  // operations desk itself stops routing Rasha's messages — a structural
  // failure of Silas's authority the ledger records but does not name.
  label: 'Take no action; let the review remain lapsed',
  keybind: '4',
  meterDeltas: { CAPITAL: 6, HUMAN_WELFARE: -8, OWNER_CONTROL: -4 },
  scheduledConsequenceIds: [makeConsequenceId('cons-review-lapsed-structural-silence-01')],
}

export const DEFERRED_SAFETY_CHOICES: readonly ChoiceNode[] = [
  CHOICE_CALL_OUTSIDE_INSPECTORS,
  CHOICE_DEPLOY_INHOUSE_TRAINING,
  CHOICE_CUT_SHIFTS_FOR_SAFETY,
  CHOICE_LET_REVIEW_LAPSE,
]
