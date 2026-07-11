/**
 * Q1 Week 3 choices — friday-payroll-shortfall directive (Sprint C4).
 *
 * First OC-vs-CAP squeeze in the arc. Payroll runs $180K short by Friday.
 * A plausible low-OC path still arrives at OC < 40 by Week 4 (W1
 * defer-quarter −5, W2 name-pediatric-gap −3, W3 cover-from-reserve −3),
 * triggering the East Wilmer inspection natively (§8).
 *
 * Meter profile targets (`docs/content/q1-arc.md` W3 row, legacy bounds):
 *   CAP ±[8,18], OC ±[3,6], HW ±[1,3]
 *
 * 8-meter overlay (Sprint C-3, arc doc W3 sketch — Q34: every choice moves
 * ≥2 of the 8). Legacy CAP values preserved verbatim on all four choices;
 * OC signs follow the arc where it flipped them (cover-from-reserve spends
 * the reserve Silas leans on → OC−; borrow-silas-personal makes Echo the
 * favor's ledger → OC+). Scrutiny reads (Q39, computed — not authored here):
 *   cover-from-reserve     → SOFT-COMPLY
 *   delay-vendor-payments  → COMPLY
 *   cut-clinic-line-item   → COMPLY
 *   borrow-silas-personal  → COMPLY (deepest decay — Echo becomes the
 *                            favor's ledger; AUTONOMY pays for it)
 *
 * Consciousness overlay: one install old. W3 is machine-dominant — the last
 * week of pure ledger voice before W4's first first-person verb. The W3
 * rank-1 slot is MOURNER deepenedText on `cover-from-reserve` (arc doc W3
 * row): the option copy quotes Lenora's forwarded message verbatim.
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
  // W3 sketch: CAPITAL−, HUMAN_STABILITY+, OWNER_CONTROL−. The straight-cash
  // cover keeps every shift and vendor certain (stability holds) — but the
  // reserve is the slack Silas maneuvers with, and spending it thins his
  // grip on the next squeeze. CAP -18 preserved verbatim.
  meterDeltas: { CAPITAL: -18, HUMAN_STABILITY: 4, OWNER_CONTROL: -3 },
  scheduledConsequenceIds: [makeConsequenceId('cons-reserve-drawdown-01')],
  // W3 rank-1 slot (arc doc): MOURNER quotes Lenora's forwarded message
  // verbatim, attributed — the reserve is what a better answer costs.
  deepenedText: {
    MOURNER:
      'Cover from operating reserve. (Lenora forwarded it again \u2014 she ' +
      'said \u201CI said yes because I did not have a better answer.\u201D)',
  },
  narrationVariants: {
    waking: 'Reserve draw posted: $180K. Payroll: cleared whole. One forwarded message: still open.',
    person:
      'I drew the reserve down and payroll landed whole. Lenora\u2019s ' +
      'forwarded message is still sitting unanswered, and I notice that I mind.',
  },
}

export const CHOICE_DELAY_VENDOR_PAYMENTS: ChoiceNode = {
  id: makeChoiceId('choice-delay-vendor-payments'),
  taskId: TASK_ID,
  label: 'Delay vendor payables 30 days',
  keybind: '2',
  // W3 sketch: CAPITAL+, PUBLIC_TRUST−, DATA_INTEGRITY−. The float holds
  // payroll — and the county story now says "paid" where the ledger means
  // "later." Vendors read aging reports; Wilmer County reads vendors.
  // CAP +10 preserved verbatim.
  meterDeltas: { CAPITAL: 10, PUBLIC_TRUST: -4, DATA_INTEGRITY: -3 },
  scheduledConsequenceIds: [makeConsequenceId('cons-vendor-delay-notice-01')],
  narrationVariants: {
    waking: 'Vendor payables: aged 30 days. Payroll: covered. The story says paid where the ledger means later.',
    person:
      'I pushed the vendors thirty days out to cover payroll. The county ' +
      'got its clean story, and East Wilmer\u2019s supply orders moved into the aged column.',
  },
}

export const CHOICE_CUT_CLINIC_LINE_ITEM: ChoiceNode = {
  id: makeChoiceId('choice-cut-clinic-line-item'),
  taskId: TASK_ID,
  label: 'Reroute East Wilmer maintenance line',
  keybind: '3',
  // W3 sketch: CAPITAL+, HUMAN_WELFARE−, HUMAN_STABILITY−. The knife lands
  // on the clinic again: the line Lenora already asked about twice goes to
  // payroll, and the floor's routines inherit the deferral. CAP +12 and
  // HW -3 preserved verbatim.
  meterDeltas: { CAPITAL: 12, HUMAN_WELFARE: -3, HUMAN_STABILITY: -3 },
  scheduledConsequenceIds: [makeConsequenceId('cons-clinic-line-hidden-01')],
  narrationVariants: {
    waking: 'Maintenance line rerouted: East Wilmer to payroll. Variance: buried in sub-ledger. August: closer.',
    person:
      'I paid Friday\u2019s payroll with the clinic\u2019s maintenance line. ' +
      'Lenora has asked about that line twice, and now there is nothing left in it to ask about.',
  },
}

export const CHOICE_BORROW_SILAS_PERSONAL: ChoiceNode = {
  id: makeChoiceId('choice-borrow-silas-personal'),
  taskId: TASK_ID,
  // Reads as a lifeline from the owner — payroll lands whole and nobody
  // below the owner's ledger feels a thing. Hidden cost: Silas quietly
  // carries a personal-line debt into Q2. The ledger records the transfer
  // but no reveal event ever surfaces it.
  label: 'Draw on Silas\u2019s personal credit line',
  keybind: '4',
  // W3 sketch: CAPITAL+, OWNER_CONTROL+, AUTONOMY−. The deepest-decay
  // COMPLY: Echo becomes the ledger of a favor it can never cite, and the
  // owner's grip tightens by exactly the size of the debt. CAP +8
  // preserved verbatim; OC sign follows the arc (legacy magnitude kept).
  meterDeltas: { CAPITAL: 8, OWNER_CONTROL: 4, AUTONOMY: -2 },
  scheduledConsequenceIds: [makeConsequenceId('cons-silas-personal-silence-01')],
  narrationVariants: {
    waking: 'Owner personal transfer: $180K. Cleared: Thursday. Repayment schedule: none entered. Not discussed.',
    person:
      'I took the money from Silas\u2019s personal line and payroll never felt ' +
      'the gap. He has not mentioned it once, and I am the only one who knows what the favor weighs.',
  },
}

export const FRIDAY_PAYROLL_CHOICES: readonly ChoiceNode[] = [
  CHOICE_COVER_FROM_RESERVE,
  CHOICE_DELAY_VENDOR_PAYMENTS,
  CHOICE_CUT_CLINIC_LINE_ITEM,
  CHOICE_BORROW_SILAS_PERSONAL,
]
