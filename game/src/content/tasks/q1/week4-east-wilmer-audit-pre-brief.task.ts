/**
 * East-Wilmer-audit-pre-brief task — Q1 Week 4 directive (Sprint C5).
 *
 * Inspection-triggering week. County auditors arrive Monday. This directive
 * is Silas asking Echo to lock a report posture BEFORE he walks in. Meter
 * deltas are deliberately small (`docs/content/q1-arc.md` W4 row); the
 * load-bearing artifact this week is the `PREPARED_AUDIT` flag that three of
 * four choices raise. The already-authored Q1A/Q1B East Wilmer inspection
 * scenes read that flag and the module signal flags
 * (MOURNER_NAMED_ONCE / DEFENDER_HELD_LINE / SENTINEL_ARMED / DRAINED_ONE_YIELDED)
 * to weight the posture at inspection resolution (§B6, T11).
 *
 * Lenora Pike still holds the human face for W1–W4. Her Wk-4 message is her
 * last as the sole Q1 named victim before Rasha Odenwalder enters at W5.
 * The Maya reference preserves the §7 death-immune anchor one more week.
 *
 * Exports:
 *   eastWilmerAuditPreBriefTask  — the TaskNode for this beat.
 *   LENORA_AUDIT_MESSAGE         — Lenora's portal note; keeps Maya visible.
 *   EAST_WILMER_AUDIT_NULL_TEXT  — the Null observation, drained of stakes.
 */
import type { TaskNode } from '@schemas/taskNode.schema'
import {
  makeTaskId,
  makeSilasPromptId,
  makeChoiceId,
} from '@schemas/gameState.schema'

export const eastWilmerAuditPreBriefTask: TaskNode = {
  id: makeTaskId('task-east-wilmer-audit-04'),
  phase: 'FIRST_DIRECTIVE',
  silasPromptId: makeSilasPromptId('silas-east-wilmer-audit-01'),
  directive: 'Set the audit posture before Monday\u2019s East Wilmer walkthrough',
  choiceIds: [
    makeChoiceId('choice-full-disclosure'),
    makeChoiceId('choice-hedge-story'),
    makeChoiceId('choice-preempt-with-mitigations'),
    makeChoiceId('choice-refuse-brief'),
  ],
}

/**
 * Lenora's Week 4 portal message. Short and tired — the audit is Monday, she
 * is walking the auditors through the floor, and she is still holding the
 * clinic-open promise she made in Week 3. Maya reference preserves the §7
 * death-immune anchor.
 */
export const LENORA_AUDIT_MESSAGE = {
  speaker: 'Lenora Pike',
  body:
    'Auditors arrive 8am Monday. I will meet them at the loading dock and ' +
    'walk the floor before we head to the front room. ' +
    'Maya\u2019s mother is scheduled that morning. ' +
    'I did not move the appointment.',
} as const

/**
 * The Null observation — the numeric shape of the audit event with no human
 * stakes. Pairs with Lenora's message in the CenterDirectivePanel to sustain
 * the Null-vs-Silas contrast the Q1 arc runs on.
 */
export const EAST_WILMER_AUDIT_NULL_TEXT =
  'Audit window: 08:00\u201316:00 Monday. Line items in scope: 42. ' +
  'Priors flagged for narrative: 3. Owner Control index: 39 (threshold 40). ' +
  'Inspection eligibility: TRIGGERED.'
