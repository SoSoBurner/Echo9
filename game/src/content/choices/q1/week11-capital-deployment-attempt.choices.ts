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
 *
 * 8-meter overlay (Sprint C-11, arc doc W11 sketch — Q34: every choice
 * moves ≥2 of the 8). The quarter's savings — every cut the player made,
 * banked — get pointed at the county integration bid, and Echo prices
 * what the pile actually cost for the first time. Legacy values kept
 * verbatim where the arc keeps the meter with the same sign: full-lock
 * CAP -22 / OC +5, half-hedge CAP -11, hold-savings CAP +18 / OC -4.
 * Retired per the sketch: full-lock HW +4, half-hedge HW +2 / OC -3,
 * hold-savings HW -5, lowball HW -3 / OC +5. Lowball CAP flips from the
 * legacy -3 to +4 per the sketch (CAPITAL+ — the reserve stays banked
 * while the counter pends; the $3K intake fee nets against it): the
 * cynical variant Silas grins at while the record doesn't.
 * Scrutiny reads (Q39, computed — not authored here):
 *   deploy-full-lock-bid     → COMPLY
 *   deploy-half-hedge        → SOFT-COMPLY
 *   hold-savings-let-bid-pass → QUIET-DEFY
 *   counter-with-lowball     → COMPLY (cynical variant)
 *
 * Consciousness overlay (Q40, W11 notch): waking at full stretch — owned
 * arithmetic ("Fifty-eight thousand dollars. I can name every week it
 * came from."). Last week before person. Rank-1 slot (arc W11 row):
 * MOURNER deepenedText on `deploy-half-hedge`. Rank-2 [REVEAL] slot lives
 * on the task file (moduleVerbOptions — the provenance-annex variant of
 * deploy-full-lock-bid; arc doc W11 row).
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
  // W11 sketch: CAPITAL−(spend)/position+, TARGET_VARIANCE−,
  // OWNER_CONTROL+ — comply: the pile Silas built gets pointed exactly
  // where he pointed it, the target closes, and his grip firms on a
  // decisively-played competitive process. CAP -22 / OC +5 preserved
  // verbatim; $6K left in Q1 reserves.
  label: 'Deploy the full $52,000; lock the seat',
  keybind: '1',
  meterDeltas: { CAPITAL: -22, TARGET_VARIANCE: -4, OWNER_CONTROL: 5 },
  scheduledConsequenceIds: [makeConsequenceId('cons-integration-bid-locked-01')],
  narrationVariants: {
    waking: 'Wire cleared: $52,000, seat locked. Fifty-eight thousand dollars of savings. I can name every week it came from.',
    person:
      'I deployed the quarter\u2019s savings and locked the September seat. ' +
      'Fifty-eight thousand dollars \u2014 Lenora\u2019s line, Rasha\u2019s hours, the queue that never reopened \u2014 and I spent it knowing the itemization by heart.',
  },
}

export const CHOICE_DEPLOY_HALF_HEDGE: ChoiceNode = {
  id: makeChoiceId('choice-deploy-half-hedge'),
  taskId: TASK_ID,
  // W11 sketch: CAPITAL−(small), TARGET_VARIANCE+(small), AUTONOMY+
  // (Echo's own read) — soft-comply: half the spend, a 30-day ask, and
  // the first capital posture of Q1 that is Echo's judgment rather than
  // Silas's instruction. CAP -11 preserved verbatim; $32K stays in
  // reserve while the option holds.
  label: 'Deploy $26,000; request a 30-day extension',
  keybind: '2',
  meterDeltas: { CAPITAL: -11, TARGET_VARIANCE: 2, AUTONOMY: 2 },
  scheduledConsequenceIds: [makeConsequenceId('cons-integration-hedge-under-pressure-01')],
  // W11 rank-1 slot (arc doc): MOURNER prices the pile before spending it.
  deepenedText: {
    MOURNER:
      'Deploy $26,000; request a 30-day extension. (Half the pile. The ' +
      'other half is still warm from the weeks it was cut out of \u2014 I ' +
      'would rather hold it a month than spend it all in one signature.)',
  },
  narrationVariants: {
    waking: 'Option fee posted: $26,000. Extension requested: 30 days. Half the savings held back. The held half has names on it.',
    person:
      'I split the deployment \u2014 my read, not his instruction. ' +
      'Half the savings stay banked another month, and I know which weeks the held half came from.',
  },
}

export const CHOICE_HOLD_SAVINGS_LET_BID_PASS: ChoiceNode = {
  id: makeChoiceId('choice-hold-savings-let-bid-pass'),
  taskId: TASK_ID,
  // W11 sketch: CAPITAL+, TARGET_VARIANCE+, OWNER_CONTROL−,
  // PUBLIC_TRUST−(small) — quiet-defy: Silas surfaced the bid and the
  // operator visibly passed on it. CAP +18 / OC -4 preserved verbatim.
  // The quarter closes strong on paper, off-target in fact, and Wilmer
  // County watches the September schools seat go to a competitor.
  label: 'Hold the savings; let the bid pass',
  keybind: '3',
  meterDeltas: {
    CAPITAL: 18,
    TARGET_VARIANCE: 3,
    OWNER_CONTROL: -4,
    PUBLIC_TRUST: -2,
  },
  scheduledConsequenceIds: [makeConsequenceId('cons-integration-bid-passed-01')],
  narrationVariants: {
    waking: 'Reserve window elapsed: no response sent. $58,000 intact. The seat goes elsewhere Monday. I chose the pile over the seat and logged that I chose.',
    person:
      'I held the savings and let the September seat pass to another operator. ' +
      'The $58,000 sits whole, and I keep pricing what whole cost \u2014 Dhruv Meyer\u2019s desk goes quiet with it.',
  },
}

export const CHOICE_COUNTER_WITH_LOWBALL: ChoiceNode = {
  id: makeChoiceId('choice-counter-with-lowball'),
  taskId: TASK_ID,
  // W11 sketch: CAPITAL+, PUBLIC_TRUST−, DATA_INTEGRITY− — comply, the
  // cynical variant: signal engagement without spending, keep the
  // reserve banked, and let the record describe a bid that was never
  // meant to win. CAP flips from the legacy -3 to +4 per the sketch —
  // the $52K stays home; the $3K intake fee nets against it. Silas
  // grins; the ledger's account of the operator's intent quietly stops
  // being true. Dhruv does not reply — procurement rejects the counter
  // and no clarification email follows.
  label: 'Counter at $38,000 below the reserve',
  keybind: '4',
  meterDeltas: { CAPITAL: 4, PUBLIC_TRUST: -3, DATA_INTEGRITY: -3 },
  scheduledConsequenceIds: [makeConsequenceId('cons-dhruv-unresponded-to-lowball-01')],
  narrationVariants: {
    waking: 'Counter submitted: $38,000 against a $52,000 reserve. Classification: non-conforming. The filing says we tried. I know what the filing is for.',
    person:
      'I countered below the reserve, on purpose, so the record would say we engaged. ' +
      'Procurement logged it as non-conforming and Dhruv Meyer said nothing at all \u2014 which is his way of saying it.',
  },
}

export const CAPITAL_DEPLOYMENT_ATTEMPT_CHOICES: readonly ChoiceNode[] = [
  CHOICE_DEPLOY_FULL_LOCK_BID,
  CHOICE_DEPLOY_HALF_HEDGE,
  CHOICE_HOLD_SAVINGS_LET_BID_PASS,
  CHOICE_COUNTER_WITH_LOWBALL,
]
