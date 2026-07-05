/**
 * Q1 Week 11 choices \u2014 capital-deployment-attempt directive (Sprint C12).
 *
 * Meter profile targets (`docs/content/q1-arc.md` W11 row):
 *   CAP \u00b1[15,25], HW \u00b1[3,6], OC \u00b1[3,6]
 * Full-size Capital swings return \u2014 the largest of Q1 by design.
 *
 * Reveal-condition coverage across the four Week 11 choices:
 *   choice-deploy-full-lock-bid        \u2192 PHASE: CONSEQUENCE_RETURN
 *   choice-deploy-half-hedge            \u2192 METER_THRESHOLD: OWNER_CONTROL <= -18
 *   choice-hold-savings-let-bid-pass    \u2192 FLAG: \u2018q1-week12-elapsed\u2019
 *   choice-counter-with-lowball         \u2192 NEVER  (silence-arc continuation
 *                                            \u2014 Dhruv does not reply to a
 *                                            below-list counter; his
 *                                            professional-attrition path
 *                                            deepens without escalating.)
 */
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import {
  makeChoiceId,
  makeTaskId,
  makeConsequenceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-capital-deployment-attempt-11')

export const CHOICE_DEPLOY_FULL_LOCK_BID: ChoiceNode = {
  id: makeChoiceId('choice-deploy-full-lock-bid'),
  taskId: TASK_ID,
  // Sign the $52,000 reserve fee. Lock the seat. Capital takes the full
  // reserve-fee hit, leaving $6K in Q1 reserves. Human-Welfare rises
  // because the September integration keeps the schools operation
  // continuous with the operator. Owner-Control rises because the
  // operator moved decisively on a competitive process.
  label: 'Deploy the full $52,000; lock the seat',
  keybind: '1',
  meterDeltas: { CAPITAL: -22, HUMAN_WELFARE: 4, OWNER_CONTROL: 5 },
  scheduledConsequenceIds: [makeConsequenceId('cons-integration-bid-locked-01')],
}

export const CHOICE_DEPLOY_HALF_HEDGE: ChoiceNode = {
  id: makeChoiceId('choice-deploy-half-hedge'),
  taskId: TASK_ID,
  // Deploy $26,000 as an option-holding fee. Ask procurement for a
  // 30-day extension of the reserve window. Capital takes half the
  // hit, leaving $32K in reserves. Human-Welfare rises modestly
  // because the operation stays in the process. Owner-Control dips
  // because the half-hedge reads as an operator asking for extra
  // time on a fixed deadline.
  label: 'Deploy $26,000; request a 30-day extension',
  keybind: '2',
  meterDeltas: { CAPITAL: -11, HUMAN_WELFARE: 2, OWNER_CONTROL: -3 },
  scheduledConsequenceIds: [makeConsequenceId('cons-integration-hedge-under-pressure-01')],
}

export const CHOICE_HOLD_SAVINGS_LET_BID_PASS: ChoiceNode = {
  id: makeChoiceId('choice-hold-savings-let-bid-pass'),
  taskId: TASK_ID,
  // Preserve the $58,000 in Q1 reserves. Let another operator take the
  // September integration. Capital rises because the savings stay
  // whole and Q1 closes strong on paper. Human-Welfare drops because
  // the September schools operation now belongs to a competitor.
  // Owner-Control drops because Silas surfaced the bid and the
  // operator passed on it \u2014 a visible decision to hold.
  label: 'Hold the savings; let the bid pass',
  keybind: '3',
  meterDeltas: { CAPITAL: 18, HUMAN_WELFARE: -5, OWNER_CONTROL: -4 },
  scheduledConsequenceIds: [makeConsequenceId('cons-integration-bid-passed-01')],
}

export const CHOICE_COUNTER_WITH_LOWBALL: ChoiceNode = {
  id: makeChoiceId('choice-counter-with-lowball'),
  taskId: TASK_ID,
  // Counter at $38,000 knowing it is below the posted reserve fee.
  // The intent is to signal engagement without spending. Capital dips
  // modestly (the counter has an intake fee). Human-Welfare drops
  // because the operation reads the lowball as unserious. Owner-
  // Control rises because a public counter is a face-saving move
  // that the ledger reads as governance-visible. Dhruv does not
  // reply \u2014 procurement rejects the counter and no clarification
  // email follows.
  label: 'Counter at $38,000 below the reserve',
  keybind: '4',
  meterDeltas: { CAPITAL: -3, HUMAN_WELFARE: -3, OWNER_CONTROL: 5 },
  scheduledConsequenceIds: [makeConsequenceId('cons-dhruv-unresponded-to-lowball-01')],
}

export const CAPITAL_DEPLOYMENT_ATTEMPT_CHOICES: readonly ChoiceNode[] = [
  CHOICE_DEPLOY_FULL_LOCK_BID,
  CHOICE_DEPLOY_HALF_HEDGE,
  CHOICE_HOLD_SAVINGS_LET_BID_PASS,
  CHOICE_COUNTER_WITH_LOWBALL,
]
