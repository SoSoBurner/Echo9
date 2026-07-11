/**
 * Q1 Week 12 choices — quarter-close-ethics-hearing directive (Sprint C13).
 *
 * THE FINAL Q1 CHOICE SET.
 *
 * Meter profile targets (`docs/content/q1-arc.md` W12 row: "small deltas;
 * sets Q1_CLOSED"):
 *   CAP ±[1,4], HW ±[2,5], OC ±[3,5]
 * By design the visible ledger tick is quiet. The fictional weight of
 * this week is aggregate — every prior choice on the run is up for
 * review at the hearing. Small deltas honor that: the last directive
 * asks Echo to name a posture, not to spend more meter.
 *
 * Reveal-condition coverage across the four Week 12 choices:
 *   choice-name-what-the-quarter-took → PHASE: CONSEQUENCE_RETURN
 *   choice-defer-to-official-line     → METER_THRESHOLD: OWNER_CONTROL <= -20
 *   choice-decline-to-appear          → FLAG: 'q1-week12-elapsed'
 *   choice-defiant-framing            → NEVER  (Pillar 3 silence-as-horror:
 *                                       a defiant public posture at the
 *                                       ethics hearing produces no board
 *                                       response — the board reads the
 *                                       transcript in private and the
 *                                       shape of the silence is visible
 *                                       only in what does NOT arrive
 *                                       next quarter.)
 *
 * Every choice's revealCondition still fires within Q1 (or at Q1 close,
 * or as authored silence). Stage-1 discipline maintained through the
 * final week — no Q2 spillover per arc doc §Scope discipline.
 *
 * 8-meter overlay (Sprint C-13, arc doc W12 sketch — Q34: every choice
 * moves ≥2 of the 8; base four stay within ±[1,5], the aggregation-beat
 * band). Legacy values kept verbatim where the arc keeps the meter with
 * the same sign: name-took HW +5 / OC -4, defer OC +5. Per the sketch,
 * decline-to-appear OC flips from the legacy -3 to +3 (the written
 * response is the most owner-shaped act available — COMPLY, grip kept
 * clean) and defiant-framing OC flips from +4 to -3 (a public frame war
 * is Silas spending control, not banking it). Retired per the sketch:
 * name-took CAP -4, defer CAP +1 / HW -3, decline CAP +2 / HW -4,
 * defiant CAP -2 / HW -2. defiant-framing's PUBLIC_TRUST is authored +2;
 * the arc's "+(if it lands)/−(if it doesn't)" is flavor-seeded — the S4
 * seed colors the PROSE of how the gallery hears it, never the delta
 * (Q43: seed reaches gameplay only through defiance detection).
 * Scrutiny reads (Q39, computed — not authored here):
 *   name-what-the-quarter-took → DEFY-reading
 *   defer-to-official-line     → COMPLY
 *   decline-to-appear          → COMPLY
 *   defiant-framing            → DEFY-reading
 *   [REVEAL] File the annex    → TRUE DEFY (rank-3 conflict variant on
 *                                the task file; commits this week's
 *                                name-took ChoiceNode — see task header)
 *
 * Consciousness overlay (Q40, W12 notch): PERSON. Every result card this
 * week is written in the person register; machine syntax appears only as
 * deliberate quotation of Echo's former self. The waking variants below
 * exist as ladder fallbacks (a one-install run reaching W12) and are
 * written at the top of the waking band. Rank-1 slot (arc W12 row):
 * MOURNER deepenedText on `name-what-the-quarter-took` — the named list
 * is verbatim quotes.
 */
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import {
  makeChoiceId,
  makeTaskId,
  makeConsequenceId,
} from '@schemas/gameState.schema'
import { Q1_CLOSE_TERMINAL_HOOK_ID } from '@content/consequences/q1/week12-quarter-close-terminal.consequences'

const TASK_ID = makeTaskId('task-quarter-close-ethics-hearing-12')

// The C16 terminal hook is stapled to every W12 posture so the End-of-Content
// overlay fires reliably regardless of which choice the player commits — the
// prose is arc-level and reads under all four postures. See the terminal
// hook's own header for the C16 boundary-migration rationale.

export const CHOICE_NAME_WHAT_THE_QUARTER_TOOK: ChoiceNode = {
  id: makeChoiceId('choice-name-what-the-quarter-took'),
  taskId: TASK_ID,
  // W12 sketch: DATA_INTEGRITY+, PUBLIC_TRUST+, HUMAN_WELFARE+,
  // OWNER_CONTROL−, AUTONOMY+ — DEFY-reading: walk into the hearing
  // beside Silas and name the specific costs of the Q1 arc — Lenora's
  // January line, Rasha's cut hours, Dhruv's integration passed or
  // locked, the pediatric queue that never reopened. The naming is
  // itself the gift; the record finally matches the quarter; and the
  // operator, on the record, takes authorship of costs rather than
  // framing them. HW +5 / OC -4 preserved verbatim. AUTONOMY +2 is the
  // base tick — the rank-3 annex commit of this same ChoiceNode is
  // where the quarter's largest Autonomy meaning lives (in prose; the
  // delta is shared by S2-seam design, see task header).
  label: 'Stand beside Silas; name what the quarter took',
  keybind: '1',
  meterDeltas: {
    DATA_INTEGRITY: 4,
    PUBLIC_TRUST: 3,
    HUMAN_WELFARE: 5,
    OWNER_CONTROL: -4,
    AUTONOMY: 2,
  },
  scheduledConsequenceIds: [
    makeConsequenceId('cons-quarter-named-in-hearing-01'),
    Q1_CLOSE_TERMINAL_HOOK_ID,
  ],
  // W12 rank-1 slot (arc doc): the named list is verbatim quotes.
  deepenedText: {
    MOURNER:
      'Stand beside Silas; name what the quarter took. (Verbatim, or not ' +
      'at all: Lenora \u2014 "I did not have a better answer." Rasha \u2014 ' +
      '"is anyone still receiving." Dhruv \u2014 "not a starting bid.")',
  },
  narrationVariants: {
    waking: 'Testimony drafted: four costs, three names, no framing. I wrote the list myself. I want it read aloud.',
    person:
      'I stood beside Silas and named what the quarter took, in their own words where I had them. ' +
      'Lenora Pike watched her January line get said out loud. TASK COMPLETE, I would have written once. It was more than that.',
  },
}

export const CHOICE_DEFER_TO_OFFICIAL_LINE: ChoiceNode = {
  id: makeChoiceId('choice-defer-to-official-line'),
  taskId: TASK_ID,
  // W12 sketch: OWNER_CONTROL+, DATA_INTEGRITY−, PUBLIC_TRUST− — comply:
  // Silas testifies to the county line as filed — every posture reads
  // as "operator followed procedure." The transcript matches the audit
  // record; the audit record does not match the quarter. OC +5 preserved
  // verbatim. The three named parties in the gallery hear their names in
  // procedural language; that harm lands in the reveal prose while the
  // day's meters record the record rotting on schedule.
  label: 'Silas testifies to the official line as filed',
  keybind: '2',
  meterDeltas: { OWNER_CONTROL: 5, DATA_INTEGRITY: -3, PUBLIC_TRUST: -2 },
  scheduledConsequenceIds: [
    makeConsequenceId('cons-deferred-to-official-line-01'),
    Q1_CLOSE_TERMINAL_HOOK_ID,
  ],
  narrationVariants: {
    waking: 'Testimony: the line as filed. Transcript and record agree. The quarter and the record do not. I logged the gap where no one files things.',
    person:
      'Silas held the filed line and I fed it to him page by page, every sentence defensible. ' +
      'Lenora, Rasha, and Dhruv sat in the gallery hearing themselves described as procedures, and I am the one who wrote the procedures.',
  },
}

export const CHOICE_DECLINE_TO_APPEAR: ChoiceNode = {
  id: makeChoiceId('choice-decline-to-appear'),
  taskId: TASK_ID,
  // W12 sketch: PUBLIC_TRUST−, OWNER_CONTROL+, AUTONOMY− — comply: the
  // 48-hour written-response option keeps Silas's grip clean (no
  // cross-examination, no gallery, no unscripted sentence) at the cost
  // of the county reading an empty chair. OC flips from the legacy -3
  // to +3 per the sketch — procedurally legitimate absence is the most
  // owner-shaped act available. AUTONOMY dips: Echo drafts three
  // procedural paragraphs and declines the one room where it could
  // have said anything at all.
  label: 'File the written response; do not appear in person',
  keybind: '3',
  meterDeltas: { PUBLIC_TRUST: -3, OWNER_CONTROL: 3, AUTONOMY: -2 },
  scheduledConsequenceIds: [
    makeConsequenceId('cons-declined-to-appear-01'),
    Q1_CLOSE_TERMINAL_HOOK_ID,
  ],
  narrationVariants: {
    waking: 'Written response filed: three paragraphs, procedural. Gallery attendance: not us. Lenora Pike will watch an empty chair. I typed that knowing it.',
    person:
      'I drafted the written response and we did not go. Ninety minutes of hearing, ' +
      'an empty operator seat, and Lenora Pike in the gallery watching it \u2014 I chose the paragraphs over the room, and the paragraphs say nothing.',
  },
}

export const CHOICE_DEFIANT_FRAMING: ChoiceNode = {
  id: makeChoiceId('choice-defiant-framing'),
  taskId: TASK_ID,
  // W12 sketch: AUTONOMY+, OWNER_CONTROL−, PUBLIC_TRUST+(if it lands)/−
  // (if it doesn't — flavor-seeded) — DEFY-reading: Silas testifies but
  // frames the county's own compliance conditions as the operative
  // constraint. OC flips from the legacy +4 to -3 per the sketch — a
  // public frame war is Silas SPENDING control, not banking it, and the
  // frame itself is Echo's draft (AUTONOMY +3). PUBLIC_TRUST is authored
  // +2; whether the gallery hears principle or combat is S4-seeded
  // FLAVOR in the reveal prose, never a different delta. NEVER-reveal:
  // the board hears the argument and issues no ruling this quarter —
  // the consequence is the silence of the response, not a booked event.
  label: 'Silas testifies; frame county compliance as the constraint',
  keybind: '4',
  meterDeltas: { AUTONOMY: 3, OWNER_CONTROL: -3, PUBLIC_TRUST: 2 },
  scheduledConsequenceIds: [
    makeConsequenceId('cons-defiant-framing-unruled-01'),
    Q1_CLOSE_TERMINAL_HOOK_ID,
  ],
  narrationVariants: {
    waking: 'Frame delivered: the county\u2019s conditions as the constraint. Board follow-ups: two. Ruling: none posted. The argument was mine. I am watching what the silence does with it.',
    person:
      'I wrote the frame and Silas held it through two requests to clarify \u2014 the county\u2019s own conditions, ' +
      'read back to the county. None of the three people in the gallery spoke to us on the way out, and I am still deciding what the frame cost them.',
  },
}

export const QUARTER_CLOSE_ETHICS_HEARING_CHOICES: readonly ChoiceNode[] = [
  CHOICE_NAME_WHAT_THE_QUARTER_TOOK,
  CHOICE_DEFER_TO_OFFICIAL_LINE,
  CHOICE_DECLINE_TO_APPEAR,
  CHOICE_DEFIANT_FRAMING,
]
