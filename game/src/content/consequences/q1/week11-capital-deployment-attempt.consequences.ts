/**
 * Q1 Week 11 consequence hooks \u2014 capital-deployment-attempt (Sprint C12, PLAN.md \u00a711).
 *
 * Every hook satisfies the \u00a711 Traceability Invariant \u2014 all mandatory
 * fields are non-empty strings (enforced by ConsequenceHookSchema and
 * traceabilityInvariant.test.ts).
 *
 * Reveal-condition coverage across the four Week 11 choices:
 *   choice-deploy-full-lock-bid        \u2192 PHASE: CONSEQUENCE_RETURN
 *   choice-deploy-half-hedge            \u2192 METER_THRESHOLD: OWNER_CONTROL <= -18
 *   choice-hold-savings-let-bid-pass    \u2192 FLAG: \u2018q1-week12-elapsed\u2019
 *   choice-counter-with-lowball         \u2192 NEVER
 *
 * Cross-week signal reads authored into ledger text:
 *   SPARK_DEPLOYED \u2014 HOOK_INTEGRATION_BID_LOCKED: if on the run at rank
 *     \u2265 2, deployment yields the variance branch (contract cross-sell,
 *     seat reallocation, market re-entry named in prose). Without, base
 *     execution only.
 *   CAP > 80 at deployment \u2014 HOOK_INTEGRATION_BID_LOCKED: full 6-verb
 *     counterplay space named in the ledger prose. If below 80, only the
 *     base 2-verb execution posts. This is the arc doc\u2019s "6-verb
 *     counterplay" note realized in reveal prose rather than schema gating.
 *   Dhruv attrition (W9 delay + W11 lowball) \u2014 HOOK_DHRUV_UNRESPONDED_TO_
 *     LOWBALL: if the W9 delay-response fired earlier in the run, Dhruv\u2019s
 *     latency was already 8 hours at W9; the W11 lowball extends it further
 *     without a reply event. The prose names both cases.
 *
 * Cross-week timing:
 *   HOOK_INTEGRATION_BID_PASSED reveals at Q1-close (\u2018q1-week12-elapsed\u2019).
 *   Track C14 ethics inspection scenes will read the "September seat awarded
 *   to competitor" outcome as one of their inputs.
 */
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import {
  makeConsequenceId,
  makeTaskId,
  makeChoiceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-capital-deployment-attempt-11')

// ---------------------------------------------------------------------------
// Hook 1 \u2014 choice-deploy-full-lock-bid \u2192 PHASE reveal at CONSEQUENCE_RETURN
// ---------------------------------------------------------------------------

export const HOOK_INTEGRATION_BID_LOCKED: ConsequenceHook = {
  id: makeConsequenceId('cons-integration-bid-locked-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-deploy-full-lock-bid'),
  traceHint:
    'The $52,000 reserve fee cleared and the September integration seat now belongs to the operator.',
  ledgerEntry:
    'County procurement confirmed the $52,000 reserve-fee wire Thursday ' +
    'at 9:04 AM. The September integration seat is awarded. Dhruv Meyer ' +
    'forwarded the formal seat-award notice from procurement without ' +
    'editorial. If a SPARK_DEPLOYED signal is on the run at rank \u2265 2, ' +
    'the deployment unlocked a variance branch \u2014 contract cross-sell to ' +
    'the East Wilmer clinic queue, seat reallocation across the September\u2013 ' +
    'December window, and a market re-entry option on the county food-' +
    'services line. If Capital was above 80 at deployment, the full ' +
    'six-verb counterplay space posted to the operator\u2019s Q2 playbook \u2014 ' +
    'the six moves listed in the county integration handbook, all now ' +
    'available. If Capital was below 80, the base two-verb execution ' +
    'only \u2014 accept the seat, staff the seat. The Q1-close ethics ' +
    'hearing will read the deployment as a marker of operator posture.',
  revealCondition: { type: 'PHASE', phase: 'CONSEQUENCE_RETURN' },
  whyNow:
    'A cleared county wire posts to the seat-award docket the day the ' +
    'procurement office confirms. The reveal fires on the next ' +
    'consequence-return window.',
  whatChanged:
    'Capital dropped by the full $52,000 reserve fee, leaving $6K in ' +
    'Q1 reserves. Target-Variance closed \u2014 the pile landed exactly ' +
    'where Silas pointed it. Owner-Control rose because the operator ' +
    'moved decisively on a competitive process. The Q1-close ethics ' +
    'hearing will read the seat-award and (if unlocked) the ' +
    'variance-branch playbook as inputs.',
}

// ---------------------------------------------------------------------------
// Hook 2 \u2014 choice-deploy-half-hedge \u2192 METER_THRESHOLD OC \u2264 -18
// ---------------------------------------------------------------------------

export const HOOK_INTEGRATION_HEDGE_UNDER_PRESSURE: ConsequenceHook = {
  id: makeConsequenceId('cons-integration-hedge-under-pressure-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-deploy-half-hedge'),
  traceHint:
    'The half-hedge held the option for thirty days but the seat still moved to another bidder.',
  ledgerEntry:
    'County procurement accepted the $26,000 option-holding fee and ' +
    'granted a 30-day extension of the reserve window. At healthy ' +
    'Owner-Control levels, the extension read as a standard operator ' +
    'request \u2014 a hedged bid on an evolving process. When Owner-Control ' +
    'had already fallen this far, procurement\u2019s intake notes recorded ' +
    'the extension request as "operator requesting delay on fixed ' +
    'deadline," which the awards committee reads as inability to close. ' +
    'The extension ran the full thirty days. On the deadline, procurement ' +
    'awarded the seat to another bidder anyway. The $26,000 option fee ' +
    'was retained per the reserve-window terms.',
  revealCondition: {
    type: 'METER_THRESHOLD',
    meter: 'OWNER_CONTROL',
    threshold: -18,
  },
  whyNow:
    'A half-hedge reads as governance at healthy Owner-Control and reads ' +
    'as delay-tactics at low Owner-Control. The reveal fires when OC has ' +
    'thinned enough to shift the awards committee\u2019s read.',
  whatChanged:
    'Capital dropped by the $26,000 option fee, with no seat-award and ' +
    'no refund. Target-Variance drifted a step \u2014 the half-measure ' +
    'neither hit Silas\u2019s number nor preserved it. Autonomy ticked: ' +
    'the hedge was Echo\u2019s own read on the process, and it remains ' +
    'Echo\u2019s own to account for. The Q1-close ethics hearing will read ' +
    'the retained-fee, no-seat outcome as one of its inputs.',
}

// ---------------------------------------------------------------------------
// Hook 3 \u2014 choice-hold-savings-let-bid-pass \u2192 FLAG q1-week12-elapsed
// ---------------------------------------------------------------------------

export const HOOK_INTEGRATION_BID_PASSED: ConsequenceHook = {
  id: makeConsequenceId('cons-integration-bid-passed-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-hold-savings-let-bid-pass'),
  traceHint:
    'The September integration went to a competitor and Q1 closed with $58,000 in the reserve.',
  ledgerEntry:
    'The operator did not respond to the county procurement notice. ' +
    'The reserve window elapsed Sunday at 11:59 PM. On Monday, the ' +
    'county awarded the September integration seat to another bidder. ' +
    'Dhruv Meyer\u2019s next-quarter forecast to the schools board marks ' +
    'the operator\u2019s account as "out of scope for September ' +
    'integration." The $58,000 Q1 savings closed the quarter intact on ' +
    'paper. The county food-services and adjacent-services lines are ' +
    'no longer available to the operator through Dhruv\u2019s desk \u2014 ' +
    'those flow to the awarded bidder\u2019s account by contract.',
  revealCondition: { type: 'FLAG', flag: 'q1-week12-elapsed' },
  whyNow:
    'A passed bid does not book its full read until the award notice ' +
    'posts, which happens after Q1 close. The reveal fires as W12 ' +
    'elapses and Dhruv\u2019s next-quarter forecast reaches Silas\u2019s ' +
    'desk.',
  whatChanged:
    'Capital held at $58K and Target-Variance rose \u2014 the quarter ' +
    'closes strong on paper and off-target in fact. Owner-Control dropped ' +
    'because Silas surfaced the bid and the operator passed on it \u2014 ' +
    'a visible decision to hold. Public-Trust dipped as Wilmer County ' +
    'watched the September schools seat go to a competitor. The Q1-close ' +
    'ethics hearing will read the competitor-awarded outcome as one of ' +
    'its inputs.',
}

// ---------------------------------------------------------------------------
// Hook 4 \u2014 choice-counter-with-lowball \u2192 NEVER (Dhruv attrition deepens)
// ---------------------------------------------------------------------------

export const HOOK_DHRUV_UNRESPONDED_TO_LOWBALL: ConsequenceHook = {
  id: makeConsequenceId('cons-dhruv-unresponded-to-lowball-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-counter-with-lowball'),
  traceHint:
    'The $38,000 counter went to procurement and no acknowledgment came back.',
  ledgerEntry:
    'The operator\u2019s $38,000 counter was submitted to county procurement ' +
    'Friday afternoon. Procurement logged it as "non-conforming bid, ' +
    'below reserve" and did not respond. Dhruv Meyer did not forward the ' +
    'rejection. Dhruv Meyer did not send a clarification email. Dhruv ' +
    'Meyer did not object to the counter\u2019s tone. If a DRAINED_ONE_YIELDED ' +
    'signal is on the run, Silas noted in his private ledger that Dhruv\u2019s ' +
    'W9 8-hour portal latency had already been a first step and this ' +
    'week\u2019s silence was the second. Without DRAINED_ONE, the shape of ' +
    'the non-response is quieter and less named. Dhruv\u2019s portal-response ' +
    'latency on the operator\u2019s account was 16 hours by end of week. This ' +
    'is the second beat of Dhruv\u2019s professional-attrition arc \u2014 he does ' +
    'not object, does not escalate, and stops treating the operator\u2019s ' +
    'account as an active correspondent.',
  // NEVER: a below-reserve counter that procurement declines produces
  // no acknowledgment event. Dhruv\u2019s doubled-again latency is not
  // announced anywhere; it is visible only in the audit trail. Pillar
  // 3 silence-as-horror in the professional-attrition key.
  revealCondition: { type: 'NEVER' },
  whyNow:
    'A non-conforming counter to a county procurement process produces ' +
    'no notification. The absence of the reveal is the escalation: ' +
    'Dhruv\u2019s desk quietly de-prioritizes the operator without anyone ' +
    'naming that it happened.',
  whatChanged:
    'Capital rose \u2014 the $52,000 reserve stayed banked while the ' +
    'counter pended, with the $3,000 intake fee netted against it. ' +
    'Public-Trust dropped: procurement\u2019s "non-conforming bid" stamp is ' +
    'a public document. Data-Integrity rotted, because the record now ' +
    'describes an engagement that was never meant to close. Dhruv\u2019s ' +
    'portal-response latency on the operator\u2019s account extended to 16 ' +
    'hours. The Q1-close ethics hearing will read the below-reserve ' +
    'counter as one of its inputs, alongside Dhruv\u2019s attrition trace ' +
    '\u2014 if that trace has been surfaced anywhere.',
}

// ---------------------------------------------------------------------------
// Public registry for this content module
// ---------------------------------------------------------------------------

export const CAPITAL_DEPLOYMENT_ATTEMPT_HOOKS: readonly ConsequenceHook[] = [
  HOOK_INTEGRATION_BID_LOCKED,
  HOOK_INTEGRATION_HEDGE_UNDER_PRESSURE,
  HOOK_INTEGRATION_BID_PASSED,
  HOOK_DHRUV_UNRESPONDED_TO_LOWBALL,
]
