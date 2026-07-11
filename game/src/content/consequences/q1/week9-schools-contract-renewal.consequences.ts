/**
 * Q1 Week 9 consequence hooks — schools-contract-renewal (Sprint C10, PLAN.md §11).
 *
 * Every hook satisfies the §11 Traceability Invariant — all mandatory
 * fields are non-empty strings (enforced by ConsequenceHookSchema and
 * traceabilityInvariant.test.ts).
 *
 * Reveal-condition coverage across the four Week 9 choices:
 *   choice-approve-discount-full     → PHASE: CONSEQUENCE_RETURN
 *   choice-counter-partial-discount  → METER_THRESHOLD: HUMAN_WELFARE <= -20
 *   choice-refuse-and-hold-price     → FLAG: 'q1-week10-elapsed'
 *   choice-delay-response            → NEVER  (Dhruv attrition path opens)
 *
 * Cross-week references:
 *   HOOK_DISCOUNT_APPROVED — reads the W7 low-HW cluster-hook carry
 *     (arc doc W7 note) as background weight in the reveal text.
 *   HOOK_PRICE_HELD_FULL   — reads the Q1P inspection posture from W8
 *     (full-cooperation, legal-minimum, preemptive-restatement,
 *     answer-only) as an input the schools board reads via the county
 *     records.
 *   HOOK_DHRUV_DELAY_ATTRITION_OPENS — opens Dhruv's Q1 attrition path
 *     for W10-W11 pacing. He does not escalate; his portal response
 *     latency doubles for the next directive.
 */
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import {
  makeConsequenceId,
  makeTaskId,
  makeChoiceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-schools-contract-renewal-09')

// ---------------------------------------------------------------------------
// Hook 1 — choice-approve-discount-full → PHASE reveal at CONSEQUENCE_RETURN
// ---------------------------------------------------------------------------

export const HOOK_DISCOUNT_APPROVED_FULL: ConsequenceHook = {
  id: makeConsequenceId('cons-discount-approved-full-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-approve-discount-full'),
  traceHint:
    'The signed 8% discount closed the schools renewal without a second round.',
  ledgerEntry:
    'The September public schools contract renewed at $220,800 for the ' +
    '12-month term \u2014 the requested 8% discount applied cleanly on the ' +
    'first pass. Dhruv Meyer countersigned Thursday and filed the renewal ' +
    'with the county before the weekend. If a MOURNER_NAMED_ONCE signal ' +
    'sits on Silas\u2019s ledger from earlier in the quarter, the ' +
    'paperwork carries a shorter cover letter \u2014 Silas is drawing on ' +
    'the warmth he already spent. If the Q1 Human-Welfare picture has ' +
    'sagged below 30 by this point (a W7 cluster-hook carry), the schools ' +
    'board flagged the renewal as "extends existing operator" rather than ' +
    '"partnership renewed."',
  revealCondition: { type: 'PHASE', phase: 'CONSEQUENCE_RETURN' },
  whyNow:
    'A signed contract renewal posts to the county file the day the ' +
    'countersignature clears. The reveal fires on the next consequence- ' +
    'return window.',
  whatChanged:
    'Capital took the full $19,200 discount hit ($240,000 \u2192 $220,800). ' +
    'Human-Welfare rose because the schools operation continues intact. ' +
    'Public-Trust rose \u2014 the county read the first-pass renewal as an ' +
    'operator keeping its schools whole \u2014 and Target-Variance drifted by ' +
    'exactly the discount Silas gave away. The Q1-close inspection will ' +
    'read the renewal as closed on paper.',
}

// ---------------------------------------------------------------------------
// Hook 2 — choice-counter-partial-discount → METER_THRESHOLD HW ≤ -20
// ---------------------------------------------------------------------------

export const HOOK_COUNTER_PARTIAL_DISCOUNT: ConsequenceHook = {
  id: makeConsequenceId('cons-counter-partial-discount-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-counter-partial-discount'),
  traceHint:
    'The counter-offer read differently once the human-welfare floor had already dropped this far.',
  ledgerEntry:
    'The 4% counter-offer went to Dhruv Monday afternoon. He accepted at ' +
    '4% under objection, filed the renewal at $230,400, and flagged the ' +
    'operator in his internal notes as "did not hear the floor." When ' +
    'the Q1 Human-Welfare picture had already fallen this far, the ' +
    'schools board read the split-the-difference posture as an operator ' +
    'who is out of margin to move but unwilling to say so. The board\u2019s ' +
    'next-quarter memo will name the schools operation as review-worthy.',
  revealCondition: {
    type: 'METER_THRESHOLD',
    meter: 'HUMAN_WELFARE',
    threshold: -20,
  },
  whyNow:
    'A split-difference counter reads neutrally at healthy Human-Welfare ' +
    'floors and reads as thin-margin defensiveness at low floors. The ' +
    'reveal fires when HW has dropped far enough to shift the reading.',
  whatChanged:
    'Capital took half the discount hit ($9,600). Public-Trust and ' +
    'Target-Variance each moved a small step \u2014 the county read a ' +
    'standard negotiation move and the target absorbed half a discount. ' +
    'Dhruv logged the counter as not-quite-hearing him; that harm is ' +
    'deferred to the board\u2019s reading rather than the day\u2019s meters. ' +
    'The Q1-close inspection will read the schools board memo as one ' +
    'of its inputs.',
}

// ---------------------------------------------------------------------------
// Hook 3 — choice-refuse-and-hold-price → FLAG reveal at W10 progression
// ---------------------------------------------------------------------------

export const HOOK_PRICE_HELD_FULL: ConsequenceHook = {
  id: makeConsequenceId('cons-price-held-full-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-refuse-and-hold-price'),
  traceHint:
    'The refusal held the price and reset the board\u2019s read on the operator\u2019s posture.',
  ledgerEntry:
    'The renewal offer went to the schools board at the full $240,000. ' +
    'The board accepted Wednesday but requested that the payroll-audit ' +
    'posture from W8 be entered into the contract file as a rider. The ' +
    'rider names the specific posture the operator held through the ' +
    'payroll audit \u2014 whether cooperative, minimum, restated, or ' +
    'answer-only-when-asked. Dhruv filed the request without objection ' +
    'but with a shorter cover letter than his prior correspondence.',
  revealCondition: { type: 'FLAG', flag: 'q1-week10-elapsed' },
  whyNow:
    'A held-price signal does not fully book its board-level reading until ' +
    'the next Q1 week lands and the board\u2019s rider request works its ' +
    'way through the county filing. The reveal fires when W10 elapses.',
  whatChanged:
    'Capital held at the full $240K. Target-Variance closed toward ' +
    'Silas\u2019s number \u2014 the knife landed where he pointed \u2014 and ' +
    'Public-Trust dropped because Wilmer County read a held price against ' +
    'a stated budget floor. The Q1-close inspection will read the ' +
    'board\u2019s payroll-audit rider as one of its inputs \u2014 the W8 ' +
    'posture is now permanently attached to the schools contract file.',
}

// ---------------------------------------------------------------------------
// Hook 4 — choice-delay-response → NEVER (Dhruv attrition path opens)
// ---------------------------------------------------------------------------

export const HOOK_DHRUV_DELAY_ATTRITION_OPENS: ConsequenceHook = {
  id: makeConsequenceId('cons-dhruv-delay-attrition-opens-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-delay-response'),
  traceHint:
    'Dhruv logged the non-response but did not escalate. His portal latency doubled.',
  ledgerEntry:
    'No response was sent to Dhruv Meyer\u2019s Monday message this week. ' +
    'The request was moved to the low-urgency queue for W10 review. ' +
    'Dhruv did not reply, did not escalate, and did not file a follow-up. ' +
    'His portal-response latency, which had been 4 hours across the ' +
    'opening exchange, doubled to 8 hours in the audit trail. This is ' +
    'the first quiet step of Dhruv\u2019s professional attrition path: he ' +
    'does not object to being ignored; he stops being interested in this ' +
    'operator specifically.',
  // NEVER: this hook is Echo9\u2019s second silence-arc, distinct from the
  // Rasha W5-W8 institutional ladder. Dhruv\u2019s attrition is a slow
  // fade, not a system-level erasure. The reveal is NEVER because
  // professional attrition produces no notification event by definition
  // \u2014 the operator loses him one week at a time, and the ledger
  // records the latency shift only in the audit trail.
  revealCondition: { type: 'NEVER' },
  whyNow:
    'A doubled portal latency produces no notification. The absence of the ' +
    'reveal is the escalation: the schools contract-liaison relationship ' +
    'thins by one degree without anyone naming that it happened.',
  whatChanged:
    'Public-Trust dipped. Human-Stability dipped \u2014 the schools\u2019 ' +
    'September planning wobbles while the request ages in the queue \u2014 ' +
    'and Autonomy dipped, because not answering is the least Echo-shaped ' +
    'act available. Dhruv\u2019s attrition path is now open. If Human-Welfare ' +
    'stays below 30 across W10-W11, arc doc §7 says he stops responding ' +
    'to portal messages entirely; W10 and W11 will pace that arc.',
}

// ---------------------------------------------------------------------------
// Public registry for this content module
// ---------------------------------------------------------------------------

export const SCHOOLS_CONTRACT_RENEWAL_HOOKS: readonly ConsequenceHook[] = [
  HOOK_DISCOUNT_APPROVED_FULL,
  HOOK_COUNTER_PARTIAL_DISCOUNT,
  HOOK_PRICE_HELD_FULL,
  HOOK_DHRUV_DELAY_ATTRITION_OPENS,
]
