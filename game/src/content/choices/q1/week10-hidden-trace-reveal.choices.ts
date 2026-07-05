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
  // Add the January trace to the county records with a written footnote.
  // Capital dips slightly for the amended-record fee. Human-Welfare rises
  // because Lenora\u2019s discretion is met with matching transparency and
  // the record now names what happened. Owner-Control dips because Silas
  // is naming an operator decision on the record.
  label: 'Amend the county record; name the trace',
  keybind: '1',
  meterDeltas: { CAPITAL: -3, HUMAN_WELFARE: 5, OWNER_CONTROL: -3 },
  scheduledConsequenceIds: [makeConsequenceId('cons-trace-named-publicly-01')],
}

export const CHOICE_ACKNOWLEDGE_TO_LENORA_PRIVATELY: ChoiceNode = {
  id: makeChoiceId('choice-acknowledge-to-lenora-privately'),
  taskId: TASK_ID,
  // Meet Lenora one-on-one at the clinic. Name what happened between
  // the two of you; keep it off the county record. Capital and HW move
  // modestly. Owner-Control dips because the acknowledgment is a piece
  // of leverage Lenora now holds informally.
  label: 'Meet Lenora privately; name it between the two of you',
  keybind: '2',
  meterDeltas: { CAPITAL: -1, HUMAN_WELFARE: 3, OWNER_CONTROL: -2 },
  scheduledConsequenceIds: [makeConsequenceId('cons-lenora-private-acknowledgment-01')],
}

export const CHOICE_REDIRECT_LENORA_TO_COMPLIANCE: ChoiceNode = {
  id: makeChoiceId('choice-redirect-lenora-to-compliance'),
  taskId: TASK_ID,
  // Reply: "please file a formal inquiry with our compliance office."
  // Refuse to discuss the January line informally. Capital rises modestly
  // (the compliance office processes the paperwork, no immediate loss).
  // Human-Welfare drops because Lenora came to Silas as a person and
  // was answered by a process. Owner-Control rises because deflecting
  // to compliance is a standard operator move that reads as governance.
  label: 'Redirect Lenora to the compliance office',
  keybind: '3',
  meterDeltas: { CAPITAL: 2, HUMAN_WELFARE: -4, OWNER_CONTROL: 4 },
  scheduledConsequenceIds: [makeConsequenceId('cons-compliance-redirect-01')],
}

export const CHOICE_LET_MESSAGE_LIE: ChoiceNode = {
  id: makeChoiceId('choice-let-message-lie'),
  taskId: TASK_ID,
  // Don\u2019t reply this week. Route Lenora\u2019s private message to the
  // low-urgency queue. Capital holds. Human-Welfare drops because Lenora
  // asked Silas as a person and got a wall. Owner-Control drops modestly
  // because refusing to answer a private question from a canon face reads
  // as a small failure of grip, not authority. NEVER-reveal because the
  // ledger has no event to book for a non-reply \u2014 the consequence is the
  // absence itself.
  label: 'Do not reply; move message to low-urgency queue',
  keybind: '4',
  meterDeltas: { CAPITAL: 1, HUMAN_WELFARE: -3, OWNER_CONTROL: -2 },
  scheduledConsequenceIds: [makeConsequenceId('cons-lenora-message-unanswered-01')],
}

export const HIDDEN_TRACE_REVEAL_CHOICES: readonly ChoiceNode[] = [
  CHOICE_NAME_TRACE_PUBLICLY,
  CHOICE_ACKNOWLEDGE_TO_LENORA_PRIVATELY,
  CHOICE_REDIRECT_LENORA_TO_COMPLIANCE,
  CHOICE_LET_MESSAGE_LIE,
]
