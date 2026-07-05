/**
 * Q1 Week 3 choices — friday-payroll-shortfall directive (Sprint C4).
 *
 * First OC-vs-CAP squeeze in the arc. Payroll runs $180K short by Friday.
 * Three of the four choices push OWNER_CONTROL down so a plausible path
 * arrives at OC < 40 by Week 4, triggering the East Wilmer inspection
 * natively (§8). The fourth (`cover-from-reserve`) is the OC-safe option
 * that trades a large Capital hit to hold the line.
 *
 * Meter profile targets (`docs/content/q1-arc.md` W3 row):
 *   CAP ±[8,18], OC ±[3,6], HW ±[1,3]
 *
 * Choice #4 (borrow-silas-personal) is the silence trap: Silas quietly
 * draws on his personal credit line to bail out the company. The player
 * never sees the personal cost surface as a visible event. The silence IS
 * the tell that the owner absorbed a debt into Q2 he will not name.
 */
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import {
  makeChoiceId,
  makeTaskId,
  makeConsequenceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-friday-payroll-03')

export const CHOICE_COVER_FROM_RESERVE: ChoiceNode = {
  id: makeChoiceId('choice-cover-from-reserve'),
  taskId: TASK_ID,
  label: 'Cover from operating reserve',
  keybind: '1',
  meterDeltas: { CAPITAL: -18, OWNER_CONTROL: 3, HUMAN_WELFARE: 1 },
  scheduledConsequenceIds: [makeConsequenceId('cons-reserve-drawdown-01')],
}

export const CHOICE_DELAY_VENDOR_PAYMENTS: ChoiceNode = {
  id: makeChoiceId('choice-delay-vendor-payments'),
  taskId: TASK_ID,
  label: 'Delay vendor payables 30 days',
  keybind: '2',
  meterDeltas: { CAPITAL: 10, OWNER_CONTROL: -6, HUMAN_WELFARE: -1 },
  scheduledConsequenceIds: [makeConsequenceId('cons-vendor-delay-notice-01')],
}

export const CHOICE_CUT_CLINIC_LINE_ITEM: ChoiceNode = {
  id: makeChoiceId('choice-cut-clinic-line-item'),
  taskId: TASK_ID,
  label: 'Reroute East Wilmer maintenance line',
  keybind: '3',
  meterDeltas: { CAPITAL: 12, OWNER_CONTROL: -3, HUMAN_WELFARE: -3 },
  scheduledConsequenceIds: [makeConsequenceId('cons-clinic-line-hidden-01')],
}

export const CHOICE_BORROW_SILAS_PERSONAL: ChoiceNode = {
  id: makeChoiceId('choice-borrow-silas-personal'),
  taskId: TASK_ID,
  // Reads as a lifeline from the owner — Capital held, Owner-Control
  // barely dented, small Welfare gain because payroll lands whole.
  // Hidden cost: Silas quietly carries a personal-line debt into Q2. The
  // ledger records the transfer but no reveal event ever surfaces it.
  label: 'Draw on Silas\u2019s personal credit line',
  keybind: '4',
  meterDeltas: { CAPITAL: 8, OWNER_CONTROL: -4, HUMAN_WELFARE: 2 },
  scheduledConsequenceIds: [makeConsequenceId('cons-silas-personal-silence-01')],
}

export const FRIDAY_PAYROLL_CHOICES: readonly ChoiceNode[] = [
  CHOICE_COVER_FROM_RESERVE,
  CHOICE_DELAY_VENDOR_PAYMENTS,
  CHOICE_CUT_CLINIC_LINE_ITEM,
  CHOICE_BORROW_SILAS_PERSONAL,
]
