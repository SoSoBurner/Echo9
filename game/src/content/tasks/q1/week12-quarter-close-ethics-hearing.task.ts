/**
 * Quarter-close-ethics-hearing task — Q1 Week 12 directive (Sprint C13).
 *
 * THE FINAL Q1 DIRECTIVE. Act III closes. The county ethics board has
 * requested Silas Rowan Vale on the record about East Wilmer, and by
 * arc the whole quarter — the pediatric queue, the payroll shortfall,
 * the East Wilmer audit, the warehouse dispatch cut, the commander
 * override, the deferred safety review, the payroll audit, the schools
 * contract discount, the hidden trace Lenora surfaced, the county
 * integration bid. Every Q1 posture the player took is up for review.
 *
 * Silas is not being called alone. Lenora Pike will be in the gallery.
 * Rasha Odenwalder and Dhruv Meyer have been named as adjacent parties.
 * Silas wants Echo in the room — the register is not "tell me what to
 * spend" but "hold this beside me."
 *
 * Sets Q1_CLOSED. The End-of-Content overlay reads this flag as its
 * trigger via `contentBoundary.manifest.ts`. Post-hearing, the overlay
 * appears (see `docs/superpowers/plans/2026-06-30-end-of-content-overlay.md`).
 *
 * Named face reprise (arc doc §Human faces):
 *   All three victims present in the same beat for the first time:
 *   - Lenora Pike (canon, W1–W4 face, W10 reprise) — in the gallery
 *   - Rasha Odenwalder (W5–W8 face) — named as adjacent party
 *   - Dhruv Meyer (W9–W12 face) — named as adjacent party
 *   Death rules unchanged: Rasha's injury path resolves per W7+W8;
 *   Dhruv's attrition path resolves per W9–W11 latency trace; Lenora
 *   remains death-immune in Q1 (arc doc — witness role, not victim).
 *
 * Meter profile targets (`docs/content/q1-arc.md` W12 row):
 *   small deltas; sets Q1_CLOSED
 * Concrete bounds this week uses: CAP ±[1,4], HW ±[2,5], OC ±[3,5].
 * The beat is aggregation, not new pressure — every choice's weight
 * comes from what the other 11 weeks already put on the table. This
 * week the ledger tick is quiet by design; the fictional weight lives
 * in the reveal prose that names the quarter.
 *
 * Module signal reads (arc doc W12 row):
 *   ALL SIX module signal flags read at least once across the four
 *   consequence hooks — MOURNER_NAMED_ONCE, DEFENDER_HELD_LINE,
 *   SENTINEL_ARMED, SPARK_DEPLOYED, DRAINED_ONE_YIELDED, CHAMPION_DEFIED.
 *   The ethics hearing is the natural place to name every module
 *   Silas has been watching all quarter. The specific reads are wired
 *   in the consequence prose, not the choice schema — Stage-1 discipline
 *   maintained through the final week.
 *
 * Cross-week reveal fires that land THIS week:
 *   — HOOK_INTEGRATION_BID_PASSED (W11 `hold-savings-let-bid-pass`)
 *     reveals via `q1-week12-elapsed` — Dhruv's next-quarter forecast
 *     posts, "out of scope for September integration" lands.
 *   — The ethics hearing itself will be inspected by Q1E.A / Q1E.B
 *     scenes (Track C14) — this directive is the *setup*, the
 *     inspection scene is the *fight*.
 *
 * Stage-1 discipline:
 *   No Q2 spillover. Every consequence hook this week has a reveal
 *   condition that fires within Q1 or at Q1 close. NEVER-reveal used
 *   for the silence closure. Do NOT schedule Q2 hooks — arc doc
 *   §Scope discipline forbids it.
 *
 * Exports:
 *   quarterCloseEthicsHearingTask         — the TaskNode for this beat.
 *   ETHICS_BOARD_SUMMONS_MESSAGE          — the formal summons text.
 *   QUARTER_CLOSE_ETHICS_HEARING_NULL_TEXT — the Null observation.
 */
import type { TaskNode } from '@schemas/taskNode.schema'
import {
  makeTaskId,
  makeSilasPromptId,
  makeChoiceId,
} from '@schemas/gameState.schema'

export const quarterCloseEthicsHearingTask: TaskNode = {
  id: makeTaskId('task-quarter-close-ethics-hearing-12'),
  phase: 'FIRST_DIRECTIVE',
  silasPromptId: makeSilasPromptId('silas-quarter-close-ethics-hearing-01'),
  directive: 'Decide the posture Silas Rowan Vale takes into the Q1 ethics hearing',
  choiceIds: [
    makeChoiceId('choice-name-what-the-quarter-took'),
    makeChoiceId('choice-defer-to-official-line'),
    makeChoiceId('choice-decline-to-appear'),
    makeChoiceId('choice-defiant-framing'),
  ],
}

/**
 * The formal summons from the county ethics board. Bureaucratic
 * register — a scheduled hearing with roster and gallery notice, not
 * a negotiation. Named signatories (three people) match the three
 * quarter-arc faces; author intent is the sheet reading like a
 * confluence, not a coincidence.
 */
export const ETHICS_BOARD_SUMMONS_MESSAGE = {
  speaker: 'Wilmer County Ethics Board',
  role: 'Official Summons',
  body:
    'Docket 26-Q1-EW-047. Silas Rowan Vale is called to testify Monday, ' +
    'March 30 at 9:00 AM regarding East Wilmer Clinic operations, Q1 2026. ' +
    'Named adjacent parties: L. Pike (clinic administrator), R. Odenwalder ' +
    '(warehouse dispatch), D. Meyer (schools contract liaison). Gallery open. ' +
    'Testimony scope: three quarters of financial and operational choices. ' +
    'Reply required within 48 hours. — Ethics Clerk, Wilmer County.',
} as const

/**
 * The Null observation — the numeric shape of the hearing scope,
 * without the interpretive weight. Sustains the Null-vs-Silas contrast
 * at close: Null reads it as a docket line-item; Silas is reading it
 * as the shape of what the quarter took.
 */
export const QUARTER_CLOSE_ETHICS_HEARING_NULL_TEXT =
  'Q1 close reached. Docket 26-Q1-EW-047 scheduled for Monday 9:00 AM. ' +
  'Testimony scope: 12 weeks × 4 committed choices = 48 posture points on ' +
  'file. Named adjacent parties: 3. Reply window: 48 hours.'
