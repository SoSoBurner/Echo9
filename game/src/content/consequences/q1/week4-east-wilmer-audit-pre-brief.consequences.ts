/**
 * Q1 Week 4 consequence hooks — east-wilmer-audit-pre-brief (Sprint C5, PLAN.md §11).
 *
 * Every hook satisfies the §11 Traceability Invariant — all mandatory
 * fields are non-empty strings (enforced by ConsequenceHookSchema and
 * traceabilityInvariant.test.ts).
 *
 * Reveal-condition coverage across the four Week 4 choices:
 *   choice-full-disclosure           → FLAG: 'q1-week4-elapsed' (same-session week-elapse return)
 *   choice-hedge-story               → METER_THRESHOLD: OWNER_CONTROL <= -12
 *   choice-preempt-with-mitigations  → FLAG: 'east-wilmer-week5-elapsed'
 *   choice-refuse-brief              → NEVER  (silence-as-horror, Pillar 3)
 *
 * The Week 4 silence trap escalates the arc one final step in Q1's first
 * quartile: W1 subordinate → W2 procedural → W3 owner → W4 institutional.
 * When Echo declines the pre-brief, no artifact is produced at any level.
 * The player never sees a reveal event because the absence of a posture IS
 * the record. Q1A/Q1B inspection scenes read the missing PREPARED_AUDIT
 * flag as its own posture at resolution.
 */
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import {
  makeConsequenceId,
  makeTaskId,
  makeChoiceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-east-wilmer-audit-04')

// ---------------------------------------------------------------------------
// Hook 1 — choice-full-disclosure → FLAG reveal on Week 4's own elapse (§11
// week-elapse return; was the unreachable PHASE:'CONSEQUENCE_RETURN')
// ---------------------------------------------------------------------------

export const HOOK_FULL_DISCLOSURE_FILED: ConsequenceHook = {
  id: makeConsequenceId('cons-full-disclosure-filed-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-full-disclosure'),
  traceHint: 'Full variance narrative filed with the county Monday morning.',
  ledgerEntry:
    'Silas filed a 6-page variance narrative naming the W3 maintenance-line ' +
    'reroute, the W2 shift-lead reallocation, and every payables-timing note. ' +
    'Auditors accepted the packet at the loading dock and spent the morning ' +
    'on the floor with Lenora Pike. The written record now exists.',
  // SAME-SESSION week-elapse return (deviation from the default next-week
  // key, per whyNow: "posts on submission ... the same day. The exposure and
  // its acknowledgment surface together."). Week 4's own commit raises
  // q1-week4-elapsed, so the reveal fires in the commit that filed it —
  // same-session precedent as the W12 written-response hook.
  revealCondition: { type: 'FLAG', flag: 'q1-week4-elapsed' },
  whyNow:
    'A filed narrative posts on submission and is entered into the audit ' +
    'record the same day. The exposure and its acknowledgment surface together.',
  whatChanged:
    'East Wilmer audit posture inherits an on-record admission. Owner-Control ' +
    'takes a small hit for the disclosure but Q1A COMPLIANT reads honest. ' +
    'Lenora does not have to defend a story on the floor.',
}

// ---------------------------------------------------------------------------
// Hook 2 — choice-hedge-story → METER_THRESHOLD when OC bottoms out
// ---------------------------------------------------------------------------

export const HOOK_HEDGED_NARRATIVE_REVIEW: ConsequenceHook = {
  id: makeConsequenceId('cons-hedged-narrative-review-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-hedge-story'),
  traceHint:
    'County auditors requested the working papers behind the hedged narrative.',
  ledgerEntry:
    'Auditors read the hedged narrative Monday afternoon and asked for the ' +
    'working papers behind the variance framing. Lenora Pike was named as ' +
    'preparer on three sub-schedules she did not draft. Follow-up walkthrough ' +
    'scheduled for the second week of Q2.',
  revealCondition: { type: 'METER_THRESHOLD', meter: 'OWNER_CONTROL', threshold: -12 },
  whyNow:
    'A hedged narrative reads clean at first pass. When Owner-Control drops ' +
    'far enough for auditors to dig, the working papers get requested.',
  whatChanged:
    'Q2 opens with an East Wilmer follow-up already on the calendar. Lenora ' +
    'is on record as preparer of documents she did not prepare. Silas has not ' +
    'corrected the attribution.',
}

// ---------------------------------------------------------------------------
// Hook 3 — choice-preempt-with-mitigations → FLAG reveal at W5 progression
// ---------------------------------------------------------------------------

export const HOOK_MITIGATION_PACKET_SENT: ConsequenceHook = {
  id: makeConsequenceId('cons-mitigation-packet-sent-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-preempt-with-mitigations'),
  traceHint:
    'Auditors cited the mitigation packet in the Q1 opening comment letter.',
  ledgerEntry:
    'The mitigation packet — mourner-named audit trail, defender line-hold ' +
    'record, sentinel escalation logs, drained-one yield report — arrived at ' +
    'the county Friday afternoon. Monday walkthrough opened by referencing ' +
    'the packet as the working record. The opening comment letter named the ' +
    'packet as evidence of "operator engagement."',
  revealCondition: { type: 'FLAG', flag: 'east-wilmer-week5-elapsed' },
  whyNow:
    'A pre-submitted mitigation packet lands in the auditor\u2019s workpapers ' +
    'the week after the walkthrough; the comment letter surfaces the following ' +
    'week as the audit rolls into Q2 planning.',
  whatChanged:
    'East Wilmer audit posture inherits an "operator engagement" framing. ' +
    'PUBLIC_TRUST posts a gain because the frame was set before the county ' +
    'walked the floor. Silas was not asked to improvise in the room.',
}

// ---------------------------------------------------------------------------
// Hook 4 — choice-refuse-brief → NEVER (silence-as-horror, Pillar 3)
// ---------------------------------------------------------------------------

export const HOOK_AUDIT_BRIEF_SILENCE: ConsequenceHook = {
  id: makeConsequenceId('cons-audit-brief-silence-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-refuse-brief'),
  traceHint:
    'No pre-brief was filed. No PREPARED_AUDIT flag was raised.',
  ledgerEntry:
    'Silas walked into the East Wilmer front room Monday without a written ' +
    'posture. Lenora Pike met the auditors at the loading dock as planned. ' +
    'The morning notes from the county reviewer read "Owner arrived without ' +
    'prepared materials; walkthrough conducted on live records." No file ' +
    'was opened. No draft was refused because none existed.',
  // NEVER: the absence of a posture becomes the posture. Q1A/Q1B scenes read
  // the missing PREPARED_AUDIT flag as an institutional silence — no artifact
  // was produced, and the game records the void as the record.
  revealCondition: { type: 'NEVER' },
  whyNow:
    'A brief that was never filed cannot surface as a reveal event. The audit ' +
    'record simply lists no submission where a submission would have been.',
  whatChanged:
    'East Wilmer audit posture inherits an unset PREPARED_AUDIT. Q1A/Q1B ' +
    'inspection scenes read the missing flag at resolution. The county file ' +
    'carries a "no prepared materials" note that does not clear.',
}

// ---------------------------------------------------------------------------
// Public registry for this content module
// ---------------------------------------------------------------------------

export const EAST_WILMER_AUDIT_HOOKS: readonly ConsequenceHook[] = [
  HOOK_FULL_DISCLOSURE_FILED,
  HOOK_HEDGED_NARRATIVE_REVIEW,
  HOOK_MITIGATION_PACKET_SENT,
  HOOK_AUDIT_BRIEF_SILENCE,
]
