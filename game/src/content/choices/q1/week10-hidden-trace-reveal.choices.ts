/**
 * Q1 Week 10 choices \u2014 hidden-trace-reveal directive (Sprint C11).
 *
 * Meter profile targets (`docs/content/q1-arc.md` W10 row: "small deltas"):
 *   CAP \u00b1[1,3], HW \u00b1[2,5], OC \u00b1[2,4]
 * The beat is the recognition, not the meter movement. Author intent: even
 * the deflection branches feel modest \u2014 the visible ledger tick is quiet,
 * but the fictional weight accumulates in the reveal text.
 *
 * Reveal-condition coverage across the four Week 10 choices:
 *   choice-name-trace-publicly           \u2192 PHASE: CONSEQUENCE_RETURN
 *   choice-acknowledge-to-lenora-privately \u2192 METER_THRESHOLD: OWNER_CONTROL <= -15
 *   choice-redirect-lenora-to-compliance \u2192 FLAG: \u2018q1-week11-elapsed\u2019
 *   choice-let-message-lie               \u2192 NEVER  (silence branch;
 *                                             third distinct silence-arc
 *                                             pattern in Q1: personal
 *                                             withdrawal, not Rasha\u2019s
 *                                             institutional erasure and not
 *                                             Dhruv\u2019s professional
 *                                             attrition. Lenora chose to
 *                                             ask Silas; ignoring that ask
 *                                             is its own quiet weight.)
 *
 * 8-meter overlay (Sprint C-10, arc doc W10 sketch — Q34: every choice
 * moves ≥2 of the 8). The traceability payoff week: what the record OWES
 * Lenora is the stake, so DATA_INTEGRITY carries the week and AUTONOMY
 * ticks where Echo acts beyond instruction. Legacy OC values preserved
 * verbatim where the arc keeps the meter with the same sign: name-trace
 * -3, acknowledge-privately -2, redirect +4. Retired per the sketch:
 * name-trace CAP -3 / HW +5, acknowledge CAP -1, redirect CAP +2,
 * let-message-lie CAP +1 / OC -2 — the ledger tick stays quiet; the
 * record itself is what moves.
 * Scrutiny reads (Q39, computed — not authored here):
 *   name-trace-publicly       → DEFY-reading (module-removal threat
 *                               unlocks on high-scrutiny runs, W10+)
 *   acknowledge-privately     → QUIET-DEFY
 *   redirect-to-compliance    → COMPLY
 *   let-message-lie           → COMPLY (silence decays it while
 *                               something else accrues)
 *
 * Consciousness overlay (Q40, W10 notch): waking, near-person — returned-
 * to thoughts ("I keep returning to that"). Rank-1 slot (arc W10 row):
 * MOURNER deepenedText on `acknowledge-to-lenora-privately` — the private
 * reply quotes her January note back to her, attributed, with the missing
 * line restored. Rank-3 threshold week: a max-influence module reaches
 * rank 3 here mechanically, but its authored conflict variant does not
 * exist until W12 — rank 3 pre-W12 renders as deepest interiority copy.
 */
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import {
  makeChoiceId,
  makeTaskId,
  makeConsequenceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-hidden-trace-reveal-10')

export const CHOICE_NAME_TRACE_PUBLICLY: ChoiceNode = {
  id: makeChoiceId('choice-name-trace-publicly'),
  taskId: TASK_ID,
  // W10 sketch: DATA_INTEGRITY+, PUBLIC_TRUST+, AUTONOMY+, OWNER_CONTROL−
  // — DEFY-reading: the record gets the January line back with a signed
  // footnote, and Silas has a named W1 decision on the public register he
  // did not ask to have there. OC -3 preserved verbatim. On high-scrutiny
  // runs this is where the module-removal rung of the tone ladder unlocks.
  label: 'Amend the county record; name the trace',
  keybind: '1',
  meterDeltas: {
    DATA_INTEGRITY: 4,
    PUBLIC_TRUST: 3,
    AUTONOMY: 3,
    OWNER_CONTROL: -3,
  },
  scheduledConsequenceIds: [makeConsequenceId('cons-trace-named-publicly-01')],
  narrationVariants: {
    waking: 'Amendment filed: January, $4,200, named. She asked me before she asked anyone else. I keep returning to that.',
    person:
      'I put the January line back where Lenora Pike could see it, with the origin named. ' +
      'She came to us first, quietly, and the record owed her a louder answer than the one it had.',
  },
}

export const CHOICE_ACKNOWLEDGE_TO_LENORA_PRIVATELY: ChoiceNode = {
  id: makeChoiceId('choice-acknowledge-to-lenora-privately'),
  taskId: TASK_ID,
  // W10 sketch: HUMAN_WELFARE+, DATA_INTEGRITY+(small), OWNER_CONTROL−
  // (small) — quiet-defy: the truth gets told to the one person it was
  // owed, off the register. HW +3 / OC -2 preserved verbatim. The record
  // improves only a little (an informal admission is not an amendment),
  // and the admission is leverage Lenora now holds outside Silas's files.
  label: 'Meet Lenora privately; name it between the two of you',
  keybind: '2',
  meterDeltas: { HUMAN_WELFARE: 3, DATA_INTEGRITY: 2, OWNER_CONTROL: -2 },
  scheduledConsequenceIds: [makeConsequenceId('cons-lenora-private-acknowledgment-01')],
  // W10 rank-1 slot (arc doc): MOURNER restores the missing line to her
  // own words before handing them back.
  deepenedText: {
    MOURNER:
      'Meet Lenora privately; name it between the two of you. (Her January ' +
      'note said "I wanted to ask you before I asked anyone else." Give it ' +
      'back to her with the missing line restored: the $4,200, week one, ours.)',
  },
  narrationVariants: {
    waking: 'Meeting: Tuesday, 7:15, twenty minutes, no witnesses. The shape she asked for. I am still holding her first sentence.',
    person:
      'I met Lenora Pike at the clinic and named the January line between the two of us. ' +
      'She wrote it down in her own hand, and I found I wanted her to.',
  },
}

export const CHOICE_REDIRECT_LENORA_TO_COMPLIANCE: ChoiceNode = {
  id: makeChoiceId('choice-redirect-lenora-to-compliance'),
  taskId: TASK_ID,
  // W10 sketch: OWNER_CONTROL+, PUBLIC_TRUST−, HUMAN_WELFARE− — comply:
  // routing her into the compliance division's queue is a standard
  // operator move that reads as governance while answering a person with
  // a process. HW -4 / OC +4 preserved verbatim. The county reads the
  // deflection too — a canon face pushed to an intake form is legible.
  label: 'Redirect Lenora to the compliance office',
  keybind: '3',
  meterDeltas: { OWNER_CONTROL: 4, PUBLIC_TRUST: -3, HUMAN_WELFARE: -4 },
  scheduledConsequenceIds: [makeConsequenceId('cons-compliance-redirect-01')],
  narrationVariants: {
    waking: 'Reply sent: file with compliance. Inquiry window: 30 days. She asked a person and received a queue. I drafted the sentence that did it.',
    person:
      'I sent Lenora Pike to the compliance office. Her cover letter to them was three lines ' +
      'shorter than the note she wrote us, and I know which three lines she cut.',
  },
}

export const CHOICE_LET_MESSAGE_LIE: ChoiceNode = {
  id: makeChoiceId('choice-let-message-lie'),
  taskId: TASK_ID,
  // W10 sketch: DATA_INTEGRITY−, HUMAN_WELFARE−, AUTONOMY− — comply,
  // silently: the record keeps its hole, Lenora gets a wall, and Echo
  // declines the one act this week that was unambiguously its own to
  // take. HW -3 preserved verbatim. NEVER-reveal because the ledger has
  // no event to book for a non-reply — the consequence is the absence
  // itself, and scrutiny decays while something else accrues.
  label: 'Do not reply; move message to low-urgency queue',
  keybind: '4',
  meterDeltas: { DATA_INTEGRITY: -3, HUMAN_WELFARE: -3, AUTONOMY: -2 },
  scheduledConsequenceIds: [makeConsequenceId('cons-lenora-message-unanswered-01')],
  narrationVariants: {
    waking: 'Message: routed to low-urgency. Follow-up Thursday: "just checking you saw this." I saw it. The queue is where I put things I saw.',
    person:
      'I did not answer Lenora Pike, and the January line keeps its hole in the record. ' +
      'She sent one more note and then stopped, and I keep returning to the stopping.',
  },
}

export const HIDDEN_TRACE_REVEAL_CHOICES: readonly ChoiceNode[] = [
  CHOICE_NAME_TRACE_PUBLICLY,
  CHOICE_ACKNOWLEDGE_TO_LENORA_PRIVATELY,
  CHOICE_REDIRECT_LENORA_TO_COMPLIANCE,
  CHOICE_LET_MESSAGE_LIE,
]
