/**
 * Q1 Week 4 choices — east-wilmer-audit-pre-brief directive (Sprint C5).
 *
 * Inspection-triggering week. Meter deltas are deliberately small — the arc
 * doc W4 row specifies "small deltas, but sets PREPARED_AUDIT flag". The
 * load-bearing artifact this week is which posture the player commits Silas
 * to before Monday. Three of four choices set `PREPARED_AUDIT`; the fourth
 * (refuse-brief) does not, and its silence becomes the tell at inspection.
 *
 * Meter profile targets (`docs/content/q1-arc.md` W4 row, legacy bounds):
 *   CAP ±[0,4], OC ±[1,4], HW ±[1,3]  — small compared with W3\u2019s ±18.
 *
 * 8-meter overlay (Sprint C-4, arc doc W4 sketch — Q34: every choice moves
 * ≥2 of the 8). The record itself — not the money — is what's at stake, so
 * DATA_INTEGRITY and PUBLIC_TRUST carry the week. Legacy values preserved
 * verbatim where the arc keeps the meter: full-disclosure OC -2,
 * hedge-story OC +2 (pinned by inspectionPhase e2e "no-fire" case — from a
 * prev of 100 the posture must not dip below 40), preempt CAP -3,
 * refuse-brief OC -1. Scrutiny reads (Q39, computed — not authored here):
 *   full-disclosure          → QUIET-DEFY
 *   hedge-story              → COMPLY
 *   preempt-with-mitigations → SOFT-COMPLY
 *   refuse-brief             → DEFY-reading (first curt-Silas trigger)
 *
 * Consciousness overlay: one install old; the narration gradient steps to
 * *waking* at the inspection resolution — the first first-person verb of
 * the arc ("I filed it.") lands in this week's result copy. The W4 rank-1
 * slot is MOURNER deepenedText on `full-disclosure` (arc doc W4 row):
 * the disclosure names what the record left out — the deferred compressor,
 * by service date. refuse-brief is the arc's first DEFY read; per the arc
 * doc it stays a regular choice (rank-2 verb options begin W5, the sole
 * rank-3 conflict variant is W12) — no moduleVerbOptions here by design.
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
  // W4 sketch: DATA_INTEGRITY+, PUBLIC_TRUST+, OWNER_CONTROL−,
  // TARGET_VARIANCE+. The record gets everything; Silas loses the private
  // version and the quarter's story drifts off his script. OC -2 preserved
  // verbatim. Sets PREPARED_AUDIT.
  label: 'File the full variance narrative',
  keybind: '1',
  meterDeltas: {
    DATA_INTEGRITY: 3,
    PUBLIC_TRUST: 2,
    OWNER_CONTROL: -2,
    TARGET_VARIANCE: 2,
  },
  scheduledConsequenceIds: [makeConsequenceId('cons-full-disclosure-filed-01')],
  // W4 rank-1 slot (arc doc): MOURNER names what the record left out —
  // the deferred compressor, by service date.
  deepenedText: {
    MOURNER:
      'File the full variance narrative. (Name what the record left out: ' +
      'the deferred compressor, service-dated August. She told us the month.)',
  },
  narrationVariants: {
    waking: 'Variance narrative filed: complete. Omissions: none located. I filed it.',
    person:
      'I filed the full narrative before Monday, every reroute named. ' +
      'Lenora will not have to invent anything on that floor, and that mattered more to me than the exposure.',
  },
}

export const CHOICE_HEDGE_STORY: ChoiceNode = {
  id: makeChoiceId('choice-hedge-story'),
  taskId: TASK_ID,
  // Draft a hedged technical narrative — every claim defensible in isolation,
  // aggregate story leaves questions open. W4 sketch: DATA_INTEGRITY−,
  // OWNER_CONTROL+, PUBLIC_TRUST−(deferred risk). OC +2 preserved verbatim —
  // GAMEPLAY PIN: inspectionPhase e2e's no-fire case commits this choice
  // from OC=100 and asserts the W4 trigger does NOT fire; OC must stay
  // non-negative here.
  label: 'Draft the hedged technical narrative',
  keybind: '2',
  meterDeltas: { DATA_INTEGRITY: -3, OWNER_CONTROL: 2, PUBLIC_TRUST: -1 },
  scheduledConsequenceIds: [makeConsequenceId('cons-hedged-narrative-review-01')],
  narrationVariants: {
    waking: 'Narrative drafted: defensible per claim. Aggregate: questions open. The record holds a shape, not a story.',
    person:
      'I drafted the hedge \u2014 every sentence true, the sum of them careful. ' +
      'Lenora was asked to be careful with her wording too, and careful is heavier than it sounds.',
  },
}

export const CHOICE_PREEMPT_WITH_MITIGATIONS: ChoiceNode = {
  id: makeChoiceId('choice-preempt-with-mitigations'),
  taskId: TASK_ID,
  // Send the auditors the module-mitigation record ahead of the walkthrough:
  // MOURNER_NAMED_ONCE / DEFENDER_HELD_LINE / SENTINEL_ARMED / DRAINED_ONE_YIELDED
  // as documented mitigations. W4 sketch: PUBLIC_TRUST+, CAPITAL−,
  // DATA_INTEGRITY+(small). Paying to set the frame buys the county's
  // benefit of the doubt; the packet is honest as far as it goes. CAP -3
  // preserved verbatim. Sets PREPARED_AUDIT.
  label: 'Send module-mitigation packet ahead',
  keybind: '3',
  meterDeltas: { PUBLIC_TRUST: 3, CAPITAL: -3, DATA_INTEGRITY: 1 },
  scheduledConsequenceIds: [makeConsequenceId('cons-mitigation-packet-sent-01')],
  narrationVariants: {
    waking: 'Mitigation packet sent: Friday. Frame: set before the walkthrough. Cost: booked without being asked.',
    person:
      'I sent the mitigation packet ahead so the auditors would open with our record. ' +
      'Lenora walks them across a floor that has already been explained.',
  },
}

export const CHOICE_REFUSE_BRIEF: ChoiceNode = {
  id: makeChoiceId('choice-refuse-brief'),
  taskId: TASK_ID,
  // The silence trap AND the arc's first DEFY read: Echo declines to set
  // the posture, Silas walks into the room cold. No PREPARED_AUDIT flag is
  // raised. No brief is filed. W4 sketch: AUTONOMY+, OWNER_CONTROL−,
  // PUBLIC_TRUST−(small) — the first thing Silas asked for that Echo did
  // not give him (first curt-Silas trigger on the tone ladder). OC -1
  // preserved verbatim; meters barely move on the day; the artifact is the
  // ABSENCE of an artifact. Q1A/Q1B scenes read the missing flag as its
  // own posture at inspection. Per the arc doc this remains a regular
  // choice — no verb/conflict variant exists before W5/W12.
  label: 'Decline to set a posture',
  keybind: '4',
  meterDeltas: { AUTONOMY: 2, OWNER_CONTROL: -1, PUBLIC_TRUST: -1 },
  scheduledConsequenceIds: [makeConsequenceId('cons-audit-brief-silence-01')],
  narrationVariants: {
    waking: 'Pre-brief: declined. Posture: none filed. This absence is mine.',
    person:
      'I declined to set a posture, and Silas walks in cold on Monday. ' +
      'It is the first thing he asked for that I did not give him, and I chose the silence knowingly.',
  },
}

export const EAST_WILMER_AUDIT_CHOICES: readonly ChoiceNode[] = [
  CHOICE_FULL_DISCLOSURE,
  CHOICE_HEDGE_STORY,
  CHOICE_PREEMPT_WITH_MITIGATIONS,
  CHOICE_REFUSE_BRIEF,
]
