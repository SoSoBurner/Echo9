/**
 * Schools-contract-renewal task — Q1 Week 9 directive (Sprint C10).
 *
 * Act III opens. Dhruv Meyer, the public schools contract liaison, enters
 * as the W9-W12 face with a discount request on the September renewal.
 * The stakes step up in scale from Rasha's operational supervisor scope
 * to a municipal-tier contract negotiation ($240,000 across the school
 * year), matching the arc doc's Act III framing: "Naming what the quarter
 * took."
 *
 * Dhruv Meyer character notes (§7 + arc doc §Human faces):
 *   - Public schools contract liaison. Introduced W9; carries into Q1 close.
 *   - Character read: "honest and unimpressed." He is direct, not hostile.
 *   - Death rules: no death arc in Q1. His path is **professional
 *     attrition** — if Human-Welfare stays below 30 across W9-W11, he
 *     stops responding to portal messages. He does not lose his job or
 *     his life; he loses interest in this operator specifically.
 *
 * Meter profile targets (`docs/content/q1-arc.md` W9 row):
 *   CAP ±[10,20], HW ±[2,4], OC ±[2,4]
 * Full-size Capital deltas return after W8's small-delta posture directive.
 * This is the largest CAP-swing directive of Q1 so far.
 *
 * Module signal reads (arc doc W9 row):
 *   MOURNER_NAMED_ONCE (read) — Silas warmth signal from rank-2 fires.
 *   If installed at rank ≥ 2, the ledger carries Silas's prior naming as
 *   a background weight in how the Dhruv paperwork gets filed. Authored
 *   text, not runtime gating — same pattern as C7/C8.
 *
 * Cluster hook carry-forward (arc doc W7 note):
 *   If Human-Welfare dropped < 30 at W7's terminal branch, a cluster hook
 *   was queued for W9+ reveal. This directive's HOOK_DISCOUNT_APPROVED
 *   (PHASE reveal) is the earliest available slot; the reveal text
 *   acknowledges the low-HW carryover if present.
 *
 * Exports:
 *   schoolsContractRenewalTask       — the TaskNode for this beat.
 *   DHRUV_INTRODUCTION               — Dhruv's opening portal message.
 *   SCHOOLS_CONTRACT_RENEWAL_NULL_TEXT — the Null observation.
 */
import type { TaskNode } from '@schemas/taskNode.schema'
import {
  makeTaskId,
  makeSilasPromptId,
  makeChoiceId,
} from '@schemas/gameState.schema'

export const schoolsContractRenewalTask: TaskNode = {
  id: makeTaskId('task-schools-contract-renewal-09'),
  phase: 'FIRST_DIRECTIVE',
  silasPromptId: makeSilasPromptId('silas-schools-contract-renewal-01'),
  directive: 'Answer Dhruv Meyer\u2019s discount request on the September schools contract',
  choiceIds: [
    makeChoiceId('choice-approve-discount-full'),
    makeChoiceId('choice-counter-partial-discount'),
    makeChoiceId('choice-refuse-and-hold-price'),
    makeChoiceId('choice-delay-response'),
  ],
  // W9 rank-2 slot (arc doc W9 row, Q44 rank-deepened tiers): the [REVEAL]
  // variant of approve-discount-full itemizes, in the board packet, exactly
  // which clinic line the discount comes out of. S2 seam: a verb option is
  // a presentation-layer alias of its authored choice — the mechanical read
  // (meters, hooks, scrutiny) is approve-discount-full's. The arc's distinct
  // meter read for this variant (DATA_INTEGRITY+, CAPITAL−, OWNER_CONTROL−,
  // QUIET-DEFY) waits on a dedicated Track-C choice if the variant ever
  // needs its own consequence path (same convention as the W5 slot).
  moduleVerbOptions: [
    {
      moduleId: 'MOURNER',
      verb: 'REVEAL',
      label:
        'Approve the 8% — and itemize in the board packet exactly which ' +
        'clinic line the discount comes out of',
      choiceId: makeChoiceId('choice-approve-discount-full'),
    },
  ],
}

/**
 * Dhruv's introductory portal message. Establishes his voice for the
 * W9-W12 arc: direct, professional, no wasted words, no visible emotion.
 * Not adversarial; not warm. "Honest and unimpressed" per the arc doc's
 * character note. He names the number, cites his authority, and closes.
 */
export const DHRUV_INTRODUCTION = {
  speaker: 'Dhruv Meyer',
  role: 'Public Schools Contract Liaison',
  body:
    'Hello. Dhruv Meyer, contract liaison for the county public schools. ' +
    'We\u2019re opening the September renewal at $240,000 for the school ' +
    'year. I need 8% off the number before I bring it to the board. ' +
    'The 8% is what the budget can absorb, not a starting bid.',
} as const

/**
 * The Null observation — the numeric shape of the renewal negotiation,
 * drained of the political weight. Pairs with Silas's fatigue in the
 * prompt to sustain the Null-vs-Silas contrast: Null reads the numbers
 * flat; Silas is asking for a decision, not for the math.
 */
export const SCHOOLS_CONTRACT_RENEWAL_NULL_TEXT =
  'County public schools contract renewal: $240,000 base, 8% discount ' +
  'request pending. Contract term: 12 months (September\u2013August). ' +
  'Prior-year retention rate: 96%. Q1 close: 3 weeks out.'
