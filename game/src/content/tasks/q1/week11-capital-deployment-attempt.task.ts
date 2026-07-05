/**
 * Capital-deployment-attempt task \u2014 Q1 Week 11 directive (Sprint C12).
 *
 * Act III\u2019s capital moment. The Q1 savings have accumulated. Dhruv Meyer
 * forwards a competitive county integration seat-award bid. Silas asks
 * Echo to deploy the savings, hedge, hold, or lowball. Full-size Capital
 * swings return after W10\u2019s small-delta recognition beat.
 *
 * Dhruv Meyer character note reprise (\u00a77 + arc doc \u00a7Human faces):
 *   Public schools contract liaison, W9-W12 face, "honest and
 *   unimpressed." Death rule: no death arc in Q1 \u2014 professional
 *   attrition path if Human-Welfare stays below 30 across W9\u2013W11.
 *
 * Meter profile targets (`docs/content/q1-arc.md` W11 row):
 *   CAP \u00b1[15,25], HW \u00b1[3,6], OC \u00b1[3,6]
 * The largest Capital swings of Q1. Author intent: this week\u2019s choice
 * shape mirrors an actual financial decision \u2014 four postures on a real
 * $58K vs. $52K exchange, each with a distinct trade-off between owning
 * the seat and holding the reserve.
 *
 * Module signal reads (arc doc W11 row):
 *   SPARK_DEPLOYED (read) \u2014 encoded in HOOK_INTEGRATION_BID_LOCKED
 *   ledger text. If SPARK is on the run at rank \u2265 2, the deployment
 *   yields a variance branch \u2014 the county integration comes online
 *   with additional plays available (contract cross-sell, seat
 *   reallocation, market re-entry). Same authorial-encoding pattern
 *   as prior weeks; the schema does not gate.
 *
 * The "6-verb counterplay" note in the arc doc is realized in the
 * reveal prose, not the choice schema \u2014 if Capital sits above 80 at
 * deployment, the ledger names the full counterplay space that unlocks.
 * If below 80, only the base 2-verb execution posts.
 *
 * Cross-week ties:
 *   \u2014 W10\u2019s HOOK_COMPLIANCE_REDIRECT reveals at W11 elapsing
 *     (\u2018q1-week11-elapsed\u2019). Its ledger entry lands via its own
 *     hook, not via this directive\u2019s prompt \u2014 the compliance intake
 *     narrates on its own timeline.
 *   \u2014 HOOK_INTEGRATION_BID_PASSED reveals at Q1 close
 *     (\u2018q1-week12-elapsed\u2019) as one of the ethics-hearing inputs.
 *
 * Exports:
 *   capitalDeploymentAttemptTask         \u2014 the TaskNode for this beat.
 *   DHRUV_BID_MESSAGE                    \u2014 Dhruv\u2019s formal bid forward.
 *   CAPITAL_DEPLOYMENT_ATTEMPT_NULL_TEXT \u2014 the Null observation.
 */
import type { TaskNode } from '@schemas/taskNode.schema'
import {
  makeTaskId,
  makeSilasPromptId,
  makeChoiceId,
} from '@schemas/gameState.schema'

export const capitalDeploymentAttemptTask: TaskNode = {
  id: makeTaskId('task-capital-deployment-attempt-11'),
  phase: 'FIRST_DIRECTIVE',
  silasPromptId: makeSilasPromptId('silas-capital-deployment-attempt-01'),
  directive: 'Decide whether to deploy Q1 savings against Dhruv Meyer\u2019s September integration bid',
  choiceIds: [
    makeChoiceId('choice-deploy-full-lock-bid'),
    makeChoiceId('choice-deploy-half-hedge'),
    makeChoiceId('choice-hold-savings-let-bid-pass'),
    makeChoiceId('choice-counter-with-lowball'),
  ],
}

/**
 * Dhruv\u2019s formal bid forward. Different tone from his W9 discount
 * request \u2014 this one is a forwarded county-issued document, not a
 * negotiation. He is not asking Echo for anything; he is passing along
 * a competitive process and marking the deadline. Terse, procedural,
 * no editorial. His signature line contains the deadline.
 */
export const DHRUV_BID_MESSAGE = {
  speaker: 'Dhruv Meyer',
  role: 'Public Schools Contract Liaison',
  body:
    'Forwarding the county September integration seat-award notice. ' +
    'Reserve fee: $52,000. Award closes Q1-close (Sunday 11:59 PM). ' +
    'Competitive process; three bidders on record. ' +
    'Reply directly to procurement, not to me. \u2014 D.',
} as const

/**
 * The Null observation \u2014 the numeric shape of the deployment decision,
 * without the seat-holding weight. Sustains the Null-vs-Silas contrast:
 * Null reports the cash-flow arithmetic; Silas is asking whether to
 * spend the reserve.
 */
export const CAPITAL_DEPLOYMENT_ATTEMPT_NULL_TEXT =
  'Q1 accumulated savings: $58,000. County integration bid reserve fee: ' +
  '$52,000. Post-deployment reserve if deployed: $6,000. Bidder count: 3. ' +
  'Award close: 96 hours from posting.'
