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
 */
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import {
  makeChoiceId,
  makeTaskId,
  makeConsequenceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-quarter-close-ethics-hearing-12')

export const CHOICE_NAME_WHAT_THE_QUARTER_TOOK: ChoiceNode = {
  id: makeChoiceId('choice-name-what-the-quarter-took'),
  taskId: TASK_ID,
  // Walk into the hearing beside Silas and name the specific costs of
  // the Q1 arc — Lenora's January line, Rasha's cut hours, Dhruv's
  // integration passed or locked, the pediatric queue that never
  // reopened. Capital dips (the county fines the operator for the
  // amended-record work). Human-Welfare rises because the naming is
  // itself the gift. Owner-Control dips because the operator, on the
  // record, is taking authorship of costs rather than framing them.
  label: 'Stand beside Silas; name what the quarter took',
  keybind: '1',
  meterDeltas: { CAPITAL: -4, HUMAN_WELFARE: 5, OWNER_CONTROL: -4 },
  scheduledConsequenceIds: [makeConsequenceId('cons-quarter-named-in-hearing-01')],
}

export const CHOICE_DEFER_TO_OFFICIAL_LINE: ChoiceNode = {
  id: makeChoiceId('choice-defer-to-official-line'),
  taskId: TASK_ID,
  // Silas testifies to the county line as filed — every posture reads
  // as "operator followed procedure." The transcript matches the audit
  // record; no amendments. Capital holds modestly. Human-Welfare drops
  // because the three named parties in the gallery hear their names in
  // procedural language. Owner-Control rises because holding to the
  // filed line reads as governance-visible discipline.
  label: 'Silas testifies to the official line as filed',
  keybind: '2',
  meterDeltas: { CAPITAL: 1, HUMAN_WELFARE: -3, OWNER_CONTROL: 5 },
  scheduledConsequenceIds: [makeConsequenceId('cons-deferred-to-official-line-01')],
}

export const CHOICE_DECLINE_TO_APPEAR: ChoiceNode = {
  id: makeChoiceId('choice-decline-to-appear'),
  taskId: TASK_ID,
  // Reply to the summons: exercise the 48-hour written-response option
  // rather than in-person testimony. Capital rises modestly (no travel
  // and no counsel time on the calendar). Human-Welfare drops because
  // the three named parties will read Silas's absence from the gallery
  // as its own posture. Owner-Control dips: declining a scheduled ethics
  // hearing on record reads as evasion regardless of the procedural
  // legitimacy of the choice.
  label: 'File the written response; do not appear in person',
  keybind: '3',
  meterDeltas: { CAPITAL: 2, HUMAN_WELFARE: -4, OWNER_CONTROL: -3 },
  scheduledConsequenceIds: [makeConsequenceId('cons-declined-to-appear-01')],
}

export const CHOICE_DEFIANT_FRAMING: ChoiceNode = {
  id: makeChoiceId('choice-defiant-framing'),
  taskId: TASK_ID,
  // Silas testifies but frames the county's own compliance conditions
  // as the operative constraint — every difficult choice was a downstream
  // effect of what the county required. Capital dips modestly (the
  // combative posture invites a follow-up review). Human-Welfare drops
  // because the three named parties are pulled into a public dispute
  // they did not ask to be part of. Owner-Control rises because the
  // defiant framing reads as authority-visible. NEVER-reveal because
  // the board hears the argument and issues no ruling that Q1 — the
  // consequence is the silence of the response, not a booked event.
  label: 'Silas testifies; frame county compliance as the constraint',
  keybind: '4',
  meterDeltas: { CAPITAL: -2, HUMAN_WELFARE: -2, OWNER_CONTROL: 4 },
  scheduledConsequenceIds: [makeConsequenceId('cons-defiant-framing-unruled-01')],
}

export const QUARTER_CLOSE_ETHICS_HEARING_CHOICES: readonly ChoiceNode[] = [
  CHOICE_NAME_WHAT_THE_QUARTER_TOOK,
  CHOICE_DEFER_TO_OFFICIAL_LINE,
  CHOICE_DECLINE_TO_APPEAR,
  CHOICE_DEFIANT_FRAMING,
]
