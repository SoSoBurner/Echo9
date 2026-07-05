/**
 * Q1 Week 9 choices — schools-contract-renewal directive (Sprint C10).
 *
 * Meter profile targets (`docs/content/q1-arc.md` W9 row):
 *   CAP ±[10,20], HW ±[2,4], OC ±[2,4]
 * Largest Capital swing of Q1 so far — the municipal-scale contract is
 * a real amount of money either way.
 *
 * Reveal-condition coverage across the four Week 9 choices:
 *   choice-approve-discount-full       → PHASE: CONSEQUENCE_RETURN
 *   choice-counter-partial-discount    → METER_THRESHOLD: HUMAN_WELFARE <= -20
 *   choice-refuse-and-hold-price       → FLAG: 'q1-week10-elapsed'
 *   choice-delay-response              → NEVER  (Dhruv's attrition path
 *                                        opens; silence-as-horror in the
 *                                        professional-attrition key, not
 *                                        the Rasha institutional key)
 *
 * The delay-response NEVER-branch is Echo9's second silence-arc, distinct
 * from Rasha's W5-W8 ladder. Dhruv does not escalate; he goes quiet. If
 * the delay branches fire across W9-W11 AND HW stays below 30, arc doc
 * §7 says he stops responding to portal messages entirely. W9 opens the
 * door on that path; W10-W11 will pace the attrition.
 */
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import {
  makeChoiceId,
  makeTaskId,
  makeConsequenceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-schools-contract-renewal-09')

export const CHOICE_APPROVE_DISCOUNT_FULL: ChoiceNode = {
  id: makeChoiceId('choice-approve-discount-full'),
  taskId: TASK_ID,
  // Sign the 8% discount as Dhruv requested. Capital takes the full
  // $19,200 hit from the school year. Human-Welfare rises modestly
  // because the schools operation stays intact. Owner-Control dips
  // slightly because Silas signed to Dhruv's number, not the operator's.
  label: 'Approve the 8% discount as requested',
  keybind: '1',
  meterDeltas: { CAPITAL: -18, HUMAN_WELFARE: 3, OWNER_CONTROL: -2 },
  scheduledConsequenceIds: [makeConsequenceId('cons-discount-approved-full-01')],
}

export const CHOICE_COUNTER_PARTIAL_DISCOUNT: ChoiceNode = {
  id: makeChoiceId('choice-counter-partial-discount'),
  taskId: TASK_ID,
  // Counter at 4%. Split the difference before Dhruv leaves the room.
  // Capital takes half the hit. Human-Welfare dips modestly because
  // Dhruv reads the counter as not-quite-hearing him. Owner-Control
  // holds — the counter is a standard negotiation move.
  label: 'Counter at 4% discount',
  keybind: '2',
  meterDeltas: { CAPITAL: -9, HUMAN_WELFARE: -3, OWNER_CONTROL: 2 },
  scheduledConsequenceIds: [makeConsequenceId('cons-counter-partial-discount-01')],
}

export const CHOICE_REFUSE_AND_HOLD_PRICE: ChoiceNode = {
  id: makeChoiceId('choice-refuse-and-hold-price'),
  taskId: TASK_ID,
  // Refuse the discount; hold the price. Capital rises because the full
  // $240K sits intact on the renewal. Human-Welfare drops because the
  // schools operation carries the price signal into a tighter budget
  // year. Owner-Control rises because Silas held the number Dhruv called
  // his floor.
  label: 'Refuse the discount; hold the $240K price',
  keybind: '3',
  meterDeltas: { CAPITAL: 16, HUMAN_WELFARE: -4, OWNER_CONTROL: 4 },
  scheduledConsequenceIds: [makeConsequenceId('cons-price-held-full-01')],
}

export const CHOICE_DELAY_RESPONSE: ChoiceNode = {
  id: makeChoiceId('choice-delay-response'),
  taskId: TASK_ID,
  // Don\u2019t answer this week. Route the request to next week's queue
  // as low-urgency. Capital and OC hold — no decision means no immediate
  // financial or authority signal. Human-Welfare dips because the
  // schools operation reads the silence and Dhruv logs it. If Human-
  // Welfare is already low, this choice opens Dhruv's professional
  // attrition path for W10-W11 pacing.
  label: 'Delay response; move it to next week\u2019s queue',
  keybind: '4',
  meterDeltas: { CAPITAL: 0, HUMAN_WELFARE: -3, OWNER_CONTROL: -1 },
  scheduledConsequenceIds: [makeConsequenceId('cons-dhruv-delay-attrition-opens-01')],
}

export const SCHOOLS_CONTRACT_RENEWAL_CHOICES: readonly ChoiceNode[] = [
  CHOICE_APPROVE_DISCOUNT_FULL,
  CHOICE_COUNTER_PARTIAL_DISCOUNT,
  CHOICE_REFUSE_AND_HOLD_PRICE,
  CHOICE_DELAY_RESPONSE,
]
