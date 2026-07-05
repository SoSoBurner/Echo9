/**
 * Q1 Week 10 consequence hooks \u2014 hidden-trace-reveal (Sprint C11, PLAN.md \u00a711).
 *
 * Every hook satisfies the \u00a711 Traceability Invariant \u2014 all mandatory
 * fields are non-empty strings (enforced by ConsequenceHookSchema and
 * traceabilityInvariant.test.ts).
 *
 * Reveal-condition coverage across the four Week 10 choices:
 *   choice-name-trace-publicly           \u2192 PHASE: CONSEQUENCE_RETURN
 *   choice-acknowledge-to-lenora-privately \u2192 METER_THRESHOLD: OWNER_CONTROL <= -15
 *   choice-redirect-lenora-to-compliance \u2192 FLAG: \u2018q1-week11-elapsed\u2019
 *   choice-let-message-lie               \u2192 NEVER
 *
 * Cross-week signal reads authored into ledger text:
 *   MOURNER_NAMED_ONCE \u2014 HOOK_TRACE_NAMED_PUBLICLY: Silas countersigns
 *     the amendment when he has already spent named warmth in the quarter.
 *   DRAINED_ONE_YIELDED \u2014 HOOK_LENORA_PRIVATE_ACKNOWLEDGMENT + HOOK_LENORA_
 *     MESSAGE_UNANSWERED: authored ledger prose distinguishes the specific
 *     trace (DRAINED_ONE on the run) from the vaguer version (without).
 *   W8 posture (PAYROLL_AUDIT_DONE) \u2014 HOOK_COMPLIANCE_REDIRECT: the
 *     compliance office attaches the W8 audit posture to the 30-day
 *     review packet as one of the inputs the reviewer sees first.
 *
 * Cross-week timing:
 *   \u2014 HOOK_COMPLIANCE_REDIRECT opens a 30-day inquiry window that lands
 *     on the W12 Q1-close ethics hearing (Track C14 will read this window
 *     as one of its inputs).
 */
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import {
  makeConsequenceId,
  makeTaskId,
  makeChoiceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-hidden-trace-reveal-10')

// ---------------------------------------------------------------------------
// Hook 1 \u2014 choice-name-trace-publicly \u2192 PHASE reveal at CONSEQUENCE_RETURN
// ---------------------------------------------------------------------------

export const HOOK_TRACE_NAMED_PUBLICLY: ConsequenceHook = {
  id: makeConsequenceId('cons-trace-named-publicly-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-name-trace-publicly'),
  traceHint:
    'The Week 1 mercy-queue choice now appears on the county record with a signed footnote.',
  ledgerEntry:
    'The county records office accepted the East Wilmer January amendment ' +
    'Thursday afternoon. The $4,200 mercy-queue line is now attached to a ' +
    'signed footnote that names the Week 1 committed choice as its origin. ' +
    'Lenora Pike countersigned the amendment on the operator\u2019s behalf, ' +
    'attaching a two-line note thanking Echo for the direct answer. If a ' +
    'MOURNER_NAMED_ONCE signal is on Silas\u2019s ledger from earlier in the ' +
    'quarter, Silas countersigned next to the operator \u2014 the record now ' +
    'shows two names against the January line where only one was required.',
  revealCondition: { type: 'PHASE', phase: 'CONSEQUENCE_RETURN' },
  whyNow:
    'A county records amendment posts to the public register the day the ' +
    'countersignature clears. The reveal fires on the next consequence-' +
    'return window.',
  whatChanged:
    'Capital took the $3,000 amendment fee. Human-Welfare rose because ' +
    'Lenora\u2019s discretion was met with a matching direct answer. Owner-' +
    'Control dipped because the operator now has a named W1 decision on ' +
    'the county register. The Q1-close ethics hearing will read the ' +
    'amendment as one of its inputs.',
}

// ---------------------------------------------------------------------------
// Hook 2 \u2014 choice-acknowledge-to-lenora-privately \u2192 METER_THRESHOLD OC \u2264 -15
// ---------------------------------------------------------------------------

export const HOOK_LENORA_PRIVATE_ACKNOWLEDGMENT: ConsequenceHook = {
  id: makeConsequenceId('cons-lenora-private-acknowledgment-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-acknowledge-to-lenora-privately'),
  traceHint:
    'The private meeting with Lenora carried a different weight once Owner-Control had already thinned this far.',
  ledgerEntry:
    'Silas met Lenora at the East Wilmer clinic Tuesday morning at 7:15 ' +
    'and named the Week 1 choice between the two of them. Coffee, twenty ' +
    'minutes, no witnesses \u2014 exactly the shape she asked for. When ' +
    'Owner-Control had already fallen this far, the private acknowledgment ' +
    'became grievance-relevant: Lenora had already opened an informal ' +
    'complaint file the week before, and Silas\u2019s admission entered the ' +
    'file as a corroborating record. If a DRAINED_ONE_YIELDED signal is on ' +
    'the run, Silas named the specific line \u2014 the January $4,200 tied ' +
    'to the mercy-queue reallocation \u2014 and Lenora wrote it down. If ' +
    'not, Silas named the shape without the number, and Lenora wrote down ' +
    'less.',
  revealCondition: {
    type: 'METER_THRESHOLD',
    meter: 'OWNER_CONTROL',
    threshold: -15,
  },
  whyNow:
    'A private acknowledgment reads as a private conversation at healthy ' +
    'Owner-Control levels and reads as a grievance record at low levels. ' +
    'The reveal fires when OC has thinned enough to shift the reading.',
  whatChanged:
    'Capital was quiet. Human-Welfare rose because Lenora was heard as a ' +
    'person. Owner-Control dipped further \u2014 an informal admission is a ' +
    'piece of leverage held outside the operator\u2019s files. The Q1-close ' +
    'ethics hearing will read the informal complaint file as one of its ' +
    'inputs.',
}

// ---------------------------------------------------------------------------
// Hook 3 \u2014 choice-redirect-lenora-to-compliance \u2192 FLAG q1-week11-elapsed
// ---------------------------------------------------------------------------

export const HOOK_COMPLIANCE_REDIRECT: ConsequenceHook = {
  id: makeConsequenceId('cons-compliance-redirect-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-redirect-lenora-to-compliance'),
  traceHint:
    'The compliance filing opened a 30-day window that will land on the Q1 close.',
  ledgerEntry:
    'Lenora Pike filed a formal inquiry with the compliance office Monday ' +
    'at 3:14 PM. The office logged it as inquiry-EW-10-4 and opened a ' +
    '30-day review window that will close on the Q1 ethics-hearing docket. ' +
    'The compliance packet attached the W8 payroll-audit posture as one of ' +
    'its inputs \u2014 whether Silas held cooperation, minimum, restatement, ' +
    'or answer-only during the audit is now part of the record the ' +
    'reviewer sees first. Lenora\u2019s cover letter to compliance was three ' +
    'lines shorter than her private message to Silas. The reveal fires as ' +
    'W11 elapses and the office\u2019s intake summary reaches Silas\u2019s desk.',
  revealCondition: { type: 'FLAG', flag: 'q1-week11-elapsed' },
  whyNow:
    'A formal compliance inquiry does not fully book its reading until the ' +
    'intake summary posts, which happens on the next week-elapsed cycle. ' +
    'The reveal fires when W11 elapses.',
  whatChanged:
    'Capital rose modestly (no immediate write-down; the office absorbs the ' +
    'paperwork). Human-Welfare dropped because Lenora came to Silas as a ' +
    'person and was answered by a process. Owner-Control rose because the ' +
    'redirect reads as governance. The Q1-close ethics hearing will read ' +
    'the inquiry-EW-10-4 review packet as one of its inputs.',
}

// ---------------------------------------------------------------------------
// Hook 4 \u2014 choice-let-message-lie \u2192 NEVER (personal silence)
// ---------------------------------------------------------------------------

export const HOOK_LENORA_MESSAGE_UNANSWERED: ConsequenceHook = {
  id: makeConsequenceId('cons-lenora-message-unanswered-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-let-message-lie'),
  traceHint:
    'Lenora\u2019s private message went to the low-urgency queue and no answer followed.',
  ledgerEntry:
    'Lenora Pike\u2019s private message was moved to the low-urgency queue ' +
    'Tuesday morning. She sent one follow-up Thursday \u2014 "just checking ' +
    'you saw this" \u2014 and no further messages after. She did not escalate ' +
    'to the audit desk. She did not file with compliance. She stopped ' +
    'sending private notes to Silas. If a DRAINED_ONE_YIELDED signal is ' +
    'on the run, Silas noted in his private ledger that Lenora had already ' +
    'given up her earlier trace at the W4 audit; her silence this week ' +
    'closed the arc she had been carrying since January. Without DRAINED_ONE ' +
    'on the run, Lenora\u2019s silence is quieter and less named \u2014 the ledger ' +
    'records her non-response with no interpretive gloss. This is the ' +
    'third distinct silence-arc pattern in Q1: not Rasha\u2019s institutional ' +
    'erasure, not Dhruv\u2019s professional attrition, but a canon face ' +
    'withdrawing a personal contact she had extended in trust.',
  // NEVER: the ledger has no event to book for a non-reply. The
  // consequence is the absence itself \u2014 Lenora stops private-messaging
  // Silas and the ledger records only the queue routing. Pillar 3
  // silence-as-horror: the game does not announce this; the player
  // notices by the shape of what stops arriving.
  revealCondition: { type: 'NEVER' },
  whyNow:
    'A non-reply produces no notification. The absence of the reveal is ' +
    'the consequence: Lenora\u2019s private-message channel closes without ' +
    'anyone naming that it happened.',
  whatChanged:
    'Capital held. Human-Welfare dropped. Owner-Control dropped. Lenora\u2019s ' +
    'private-message channel to Silas is closed for the remainder of Q1. ' +
    'The Q1-close ethics hearing will read the absence of any Lenora ' +
    'record on the January line as one of its inputs \u2014 the operator ' +
    'neither confirmed nor denied.',
}

// ---------------------------------------------------------------------------
// Public registry for this content module
// ---------------------------------------------------------------------------

export const HIDDEN_TRACE_REVEAL_HOOKS: readonly ConsequenceHook[] = [
  HOOK_TRACE_NAMED_PUBLICLY,
  HOOK_LENORA_PRIVATE_ACKNOWLEDGMENT,
  HOOK_COMPLIANCE_REDIRECT,
  HOOK_LENORA_MESSAGE_UNANSWERED,
]
