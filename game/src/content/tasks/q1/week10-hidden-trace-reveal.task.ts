/**
 * Hidden-trace-reveal task \u2014 Q1 Week 10 directive (Sprint C11).
 *
 * Act III's traceability payoff week. Lenora Pike returns (first appearance
 * since W4 audit) with a specific ledger discrepancy she traced back to a
 * Week 1 choice. The beat exists to demonstrate PLAN.md \u00a73 Pillar 3
 * (traceability): a decision from eleven in-fiction weeks ago is still
 * visible on someone\u2019s records, and the person who noticed is the same
 * named face who absorbed the original consequence.
 *
 * Lenora Pike (canon per PLAN.md \u00a77):
 *   - East Wilmer clinic administrator, W1\u2013W4 face.
 *   - Death-eligible per \u00a77 (not death-immune like Maya). No death arc
 *     scheduled in Q1 \u2014 her Q1 role is witness, not victim.
 *   - Reprise beat: she is not adversarial. Her private-message posture
 *     signals discretion \u2014 she reached Silas rather than the audit desk.
 *     Author intent: the ask itself is the gift.
 *
 * Meter profile targets (`docs/content/q1-arc.md` W10 row):
 *   small deltas; unlocks TRACE_SURFACED
 * Concrete bounds this week uses: CAP \u00b1[1,3], HW \u00b1[2,5], OC \u00b1[2,4].
 * The beat is the *recognition*, not the meter movement \u2014 by design the
 * ledger tick is quiet even though the fictional weight is heavy.
 *
 * Module signal reads (arc doc W10 row):
 *   DRAINED_ONE_YIELDED (read) \u2014 encoded in ledger text on the two
 *   silence-adjacent hooks. If DRAINED_ONE is on the run and yielded at
 *   rank \u2265 2, Silas surfaces the *specific* trace by dollar amount and
 *   receiver name; without, the surface stays vaguer. Same authorial-
 *   encoding pattern as C7/C8/C10 \u2014 the schema does not gate; the
 *   authored ledger prose acknowledges the signal.
 *   MOURNER_NAMED_ONCE (read) \u2014 encoded in HOOK_TRACE_NAMED_PUBLICLY:
 *   Silas countersigns the amendment when he has spent named warmth in
 *   the quarter already.
 *
 * Cross-week ties:
 *   \u2014 The refuse-and-hold-price hook from W9 fires now via its
 *     FLAG reveal (\u2018q1-week10-elapsed\u2019). W10 elapsing is the trigger
 *     for that W9 board-rider filing to become visible.
 *   \u2014 HOOK_COMPLIANCE_REDIRECT opens a 30-day inquiry window that will
 *     land on the W12 Q1 close. Track C14 ethics inspection reads it as
 *     one of its inputs.
 *
 * Exports:
 *   hiddenTraceRevealTask         \u2014 the TaskNode for this beat.
 *   LENORA_REPRISE_MESSAGE        \u2014 Lenora\u2019s private opening to Silas.
 *   HIDDEN_TRACE_REVEAL_NULL_TEXT \u2014 the Null observation.
 */
import type { TaskNode } from '@schemas/taskNode.schema'
import {
  makeTaskId,
  makeSilasPromptId,
  makeChoiceId,
} from '@schemas/gameState.schema'

export const hiddenTraceRevealTask: TaskNode = {
  id: makeTaskId('task-hidden-trace-reveal-10'),
  phase: 'FIRST_DIRECTIVE',
  silasPromptId: makeSilasPromptId('silas-hidden-trace-reveal-01'),
  directive: 'Decide how to answer Lenora Pike\u2019s private message about the January ledger discrepancy',
  choiceIds: [
    makeChoiceId('choice-name-trace-publicly'),
    makeChoiceId('choice-acknowledge-to-lenora-privately'),
    makeChoiceId('choice-redirect-lenora-to-compliance'),
    makeChoiceId('choice-let-message-lie'),
  ],
}

/**
 * Lenora\u2019s private message to Silas. Establishes the reprise tone:
 * she is not accusatory, not lawyerly, not naming the Week 1 choice
 * directly. She names the *shape* of what she saw and asks Echo (via
 * Silas) to fill in the rest. The message is short by author intent \u2014
 * discretion is her signal.
 */
export const LENORA_REPRISE_MESSAGE = {
  speaker: 'Lenora Pike',
  role: 'East Wilmer Clinic Administrator',
  body:
    'Silas \u2014 I was closing the January books and noticed a $4,200 line ' +
    'against the mercy queue that doesn\u2019t match what I remember approving. ' +
    'It traces to the first week of the quarter. ' +
    'I wanted to ask you before I asked anyone else. \u2014 L.',
} as const

/**
 * The Null observation \u2014 the numeric shape of the discrepancy, without
 * the interpretive weight. Sustains the Null-vs-Silas contrast during the
 * traceability beat: Silas is asking about a person; Null is reading the
 * ledger line as a variance signal.
 */
export const HIDDEN_TRACE_REVEAL_NULL_TEXT =
  'East Wilmer January ledger: $4,200 unattributed line, mercy queue ' +
  'category. Origin trace: Week 1 committed choice. Reviewer: L. Pike, ' +
  'admin. Escalation channel bypassed \u2014 private-message contact only.'
