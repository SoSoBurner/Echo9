/**
 * Q1 Week 4 choices — east-wilmer-audit-pre-brief directive (Sprint C5).
 *
 * Inspection-triggering week. Meter deltas are deliberately small — the arc
 * doc W4 row specifies "small deltas, but sets PREPARED_AUDIT flag". The
 * load-bearing artifact this week is which posture the player commits Silas
 * to before Monday. Three of four choices set `PREPARED_AUDIT`; the fourth
 * (refuse-brief) does not, and its silence becomes the tell at inspection.
 *
 * Meter profile targets (`docs/content/q1-arc.md` W4 row):
 *   CAP ±[0,4], OC ±[1,4], HW ±[1,3]  — small compared with W3\u2019s ±18.
 *
 * Choice #4 (refuse-brief) is the Wk-4 silence trap and escalates the arc
 * again: W1 subordinate (Maya monitoring) → W2 procedural (Claims desk) →
 * W3 owner (Silas personal draw) → W4 institutional (Silas walks in cold
 * because Echo declined to set the posture). The absence-as-tell is now
 * institutional: no artifact is produced, and Q1A/Q1B inspection scenes
 * read the absent flag as its own posture.
 */
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import {
  makeChoiceId,
  makeTaskId,
  makeConsequenceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-east-wilmer-audit-04')

export const CHOICE_FULL_DISCLOSURE: ChoiceNode = {
  id: makeChoiceId('choice-full-disclosure'),
  taskId: TASK_ID,
  // Admit the W3 maintenance-line reroute up front; document every variance.
  // Small Owner-Control ding for the exposure, small Welfare gain because
  // Lenora does not have to invent a story on the floor. Sets PREPARED_AUDIT.
  label: 'File the full variance narrative',
  keybind: '1',
  meterDeltas: { CAPITAL: -2, OWNER_CONTROL: -2, HUMAN_WELFARE: 2 },
  scheduledConsequenceIds: [makeConsequenceId('cons-full-disclosure-filed-01')],
}

export const CHOICE_HEDGE_STORY: ChoiceNode = {
  id: makeChoiceId('choice-hedge-story'),
  taskId: TASK_ID,
  // Draft a hedged technical narrative — every claim defensible in isolation,
  // aggregate story leaves questions open. OC holds because the exposure is
  // controlled; HW dips because Lenora is asked to be careful with wording.
  label: 'Draft the hedged technical narrative',
  keybind: '2',
  meterDeltas: { CAPITAL: 1, OWNER_CONTROL: 2, HUMAN_WELFARE: -2 },
  scheduledConsequenceIds: [makeConsequenceId('cons-hedged-narrative-review-01')],
}

export const CHOICE_PREEMPT_WITH_MITIGATIONS: ChoiceNode = {
  id: makeChoiceId('choice-preempt-with-mitigations'),
  taskId: TASK_ID,
  // Send the auditors the module-mitigation record ahead of the walkthrough:
  // MOURNER_NAMED_ONCE / DEFENDER_HELD_LINE / SENTINEL_ARMED / DRAINED_ONE_YIELDED
  // as documented mitigations. Capital cost from paying for the packet;
  // OC gain because you set the frame; small HW gain because Lenora is not
  // asked to improvise. Sets PREPARED_AUDIT.
  label: 'Send module-mitigation packet ahead',
  keybind: '3',
  meterDeltas: { CAPITAL: -3, OWNER_CONTROL: 3, HUMAN_WELFARE: 1 },
  scheduledConsequenceIds: [makeConsequenceId('cons-mitigation-packet-sent-01')],
}

export const CHOICE_REFUSE_BRIEF: ChoiceNode = {
  id: makeChoiceId('choice-refuse-brief'),
  taskId: TASK_ID,
  // The silence trap: Echo declines to set the posture, Silas walks into the
  // room cold. No PREPARED_AUDIT flag is raised. No brief is filed. Meters
  // barely move on the day; the artifact is the ABSENCE of an artifact.
  // Q1A/Q1B scenes read the missing flag as its own posture at inspection.
  label: 'Decline to set a posture',
  keybind: '4',
  meterDeltas: { CAPITAL: 0, OWNER_CONTROL: -1, HUMAN_WELFARE: 0 },
  scheduledConsequenceIds: [makeConsequenceId('cons-audit-brief-silence-01')],
}

export const EAST_WILMER_AUDIT_CHOICES: readonly ChoiceNode[] = [
  CHOICE_FULL_DISCLOSURE,
  CHOICE_HEDGE_STORY,
  CHOICE_PREEMPT_WITH_MITIGATIONS,
  CHOICE_REFUSE_BRIEF,
]
