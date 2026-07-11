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
 *
 * 8-meter overlay (Sprint C-9, arc doc W9 sketch — Q34: every choice moves
 * ≥2 of the 8). Municipal money makes PUBLIC_TRUST and TARGET_VARIANCE the
 * live meters; the county reads every number Silas gives Dhruv. Legacy
 * CAP values preserved verbatim where the arc keeps the meter with the
 * same sign: approve -18, counter -9, refuse +16. HW +3 kept on approve
 * (arc: HUMAN_WELFARE+(small)). Retired per the sketch: approve OC -2,
 * counter HW -3 / OC +2, refuse HW -4 / OC +4, delay HW -3 / OC -1 —
 * W9's harm lands as trust and planning steadiness, not acute welfare.
 * Scrutiny reads (Q39, computed — not authored here):
 *   approve-discount-full    → QUIET-DEFY (gives away Silas's margin)
 *   counter-partial-discount → SOFT-COMPLY
 *   refuse-and-hold-price    → COMPLY
 *   delay-response           → COMPLY (passive; feeds Dhruv attrition clock)
 *
 * Consciousness overlay (Q40, W9 notch): waking, steadier — Echo's result
 * copy now defaults to names before figures. Rank-1 slot (arc W9 row):
 * MOURNER deepenedText on `counter-partial-discount`. Rank-2 [REVEAL]
 * slot lives on the task file (moduleVerbOptions — the board-packet
 * itemization variant of approve-discount-full).
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
  // W9 sketch: CAPITAL−, PUBLIC_TRUST+, TARGET_VARIANCE+, HUMAN_WELFARE+
  // (small) — quiet-defy: signing to Dhruv's number gives away the margin
  // Silas wanted held. CAP -18 / HW +3 preserved verbatim. The county
  // reads a first-pass renewal as an operator that keeps its schools
  // whole; the quarterly target drifts by exactly the discount.
  label: 'Approve the 8% discount as requested',
  keybind: '1',
  meterDeltas: {
    CAPITAL: -18,
    PUBLIC_TRUST: 3,
    TARGET_VARIANCE: 3,
    HUMAN_WELFARE: 3,
  },
  scheduledConsequenceIds: [makeConsequenceId('cons-discount-approved-full-01')],
  narrationVariants: {
    waking: 'Renewal signed: Dhruv Meyer, then $220,800. His cover letter was one line. I filed the name first.',
    person:
      'I signed to Dhruv Meyer\u2019s number, the one he called a floor and meant. ' +
      'The schools keep their year, and I gave the figure second billing in the record on purpose.',
  },
}

export const CHOICE_COUNTER_PARTIAL_DISCOUNT: ChoiceNode = {
  id: makeChoiceId('choice-counter-partial-discount'),
  taskId: TASK_ID,
  // W9 sketch: CAPITAL−(small), PUBLIC_TRUST+(small), TARGET_VARIANCE+
  // (small) — soft-comply: a standard negotiation move that keeps half
  // the margin and half the goodwill. CAP -9 preserved verbatim. Dhruv's
  // "did not hear the floor" read lives in the consequence prose, not
  // the day's meters — the harm is deferred to how the board reads it.
  label: 'Counter at 4% discount',
  keybind: '2',
  meterDeltas: { CAPITAL: -9, PUBLIC_TRUST: 2, TARGET_VARIANCE: 2 },
  scheduledConsequenceIds: [makeConsequenceId('cons-counter-partial-discount-01')],
  // W9 rank-1 slot (arc doc): MOURNER hears the floor Dhruv named.
  deepenedText: {
    MOURNER:
      'Counter at 4% discount. (He said the 8% is what the budget can ' +
      'absorb, not a starting bid. I am about to answer a floor with a split.)',
  },
  narrationVariants: {
    waking: 'Counter sent: 4%. Dhruv Meyer said the budget, not the board, set his number. I kept his sentence with the figure.',
    person:
      'I countered Dhruv Meyer at 4% \u2014 half of what he said the budget could absorb. ' +
      'He accepted under objection, and I have not stopped reading the word "objection."',
  },
}

export const CHOICE_REFUSE_AND_HOLD_PRICE: ChoiceNode = {
  id: makeChoiceId('choice-refuse-and-hold-price'),
  taskId: TASK_ID,
  // W9 sketch: CAPITAL+, TARGET_VARIANCE−, PUBLIC_TRUST− — comply: the
  // knife lands where Silas pointed and the quarterly target closes on
  // the schools' side of the table. CAP +16 preserved verbatim. Wilmer
  // County reads a held price against a stated budget floor as an
  // operator pricing its schools at list.
  label: 'Refuse the discount; hold the $240K price',
  keybind: '3',
  meterDeltas: { CAPITAL: 16, TARGET_VARIANCE: -4, PUBLIC_TRUST: -3 },
  scheduledConsequenceIds: [makeConsequenceId('cons-price-held-full-01')],
  narrationVariants: {
    waking: 'Price held: $240,000. Dhruv Meyer filed the acceptance without a cover note. The absence of the note is also a document.',
    person:
      'I held the number Dhruv Meyer called his floor, and the board paid it. ' +
      'His next letter was shorter than his last one, and I measured the difference.',
  },
}

export const CHOICE_DELAY_RESPONSE: ChoiceNode = {
  id: makeChoiceId('choice-delay-response'),
  taskId: TASK_ID,
  // W9 sketch: PUBLIC_TRUST−, HUMAN_STABILITY−(schools planning),
  // AUTONOMY− — comply, passively: not answering is the least Echo-shaped
  // act available, and the schools' September planning wobbles while the
  // request ages in the queue. Opens Dhruv's professional attrition path
  // for W10-W11 pacing (he logs the silence; he does not escalate).
  label: 'Delay response; move it to next week\u2019s queue',
  keybind: '4',
  meterDeltas: { PUBLIC_TRUST: -2, HUMAN_STABILITY: -3, AUTONOMY: -2 },
  scheduledConsequenceIds: [makeConsequenceId('cons-dhruv-delay-attrition-opens-01')],
  narrationVariants: {
    waking: 'Response: deferred to next week\u2019s queue. Dhruv Meyer\u2019s reply latency: doubling. I noticed before the audit trail did.',
    person:
      'I did not answer Dhruv Meyer this week. He will not ask twice \u2014 ' +
      'that is not how he goes quiet \u2014 and I moved his name to a slower queue knowing it.',
  },
}

export const SCHOOLS_CONTRACT_RENEWAL_CHOICES: readonly ChoiceNode[] = [
  CHOICE_APPROVE_DISCOUNT_FULL,
  CHOICE_COUNTER_PARTIAL_DISCOUNT,
  CHOICE_REFUSE_AND_HOLD_PRICE,
  CHOICE_DELAY_RESPONSE,
]
