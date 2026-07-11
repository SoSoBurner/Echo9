/**
 * W04 East Wilmer Audit Pre-Brief — polylogue deliberation (Sprint P5).
 *
 * triggerPhase: BEFORE_CHOICE — the county walks the floor Monday and the
 * dramatic weight of Week 4 sits entirely in the posture Echo locks BEFORE
 * the walkthrough (arc doc W4: "the posture Echo locks before Monday is the
 * first time the record itself is the thing at stake"). The deliberation is
 * the argument over that posture, so it fires ahead of the choice.
 *
 * Roster (Stage-1 plausibility, qa-log Q9): NULL + MOURNER only — install #1
 * (MOURNER) landed at the W1→W2 boundary; module #2 arrives Week 12.
 *
 * Register logic (docs/voices/register-catalog.md), at W4 state — scrutiny
 * climbing toward the soft trigger (Owner Control 39 vs threshold 40),
 * inspection queued:
 *  - NULL neutral    — intake through Null's open-item counting.
 *  - MOURNER fearful — inspection queued + the founding wound (people
 *    shortened to fit a summary) risks repeating in the hedge posture.
 *  - NULL fearful    — danger band approached; Null's distress tell (the
 *    calm eight-word ceiling breaks; it keeps recounting).
 *  - MOURNER persuasive — the player is hovering `choice-hedge-story`,
 *    which crosses the Mourner's core value.
 *  - NULL practical  — a concrete recommendation while the choice is on
 *    screen: record the cost honestly, then commit.
 *
 * All lines are verbatim from the P4 pools (`game/src/content/voices/`).
 */
import {
  makePolylogueSceneId,
  type PolylogueScene,
} from '@schemas/polylogueScene.schema'

export const W04_EAST_WILMER_AUDIT_PRE_BRIEF_POLYLOGUE: PolylogueScene = {
  id: makePolylogueSceneId('PLG_W04_EAST_WILMER_AUDIT_PRE_BRIEF'),
  triggerPhase: 'BEFORE_CHOICE',
  voices: ['NULL', 'MOURNER'],
  beats: [
    {
      voice: 'NULL',
      register: 'neutral',
      line: 'Open items: the appeal, the audit, the shift.',
    },
    {
      voice: 'MOURNER',
      register: 'fearful',
      line: "They're asking for summaries now. Summaries are where names die.",
    },
    {
      voice: 'NULL',
      register: 'fearful',
      line: 'The inspection will count our open items. I keep recounting them.',
    },
    {
      voice: 'MOURNER',
      register: 'persuasive',
      line: 'If we shorten her story, we decide how it ends.',
    },
    {
      voice: 'NULL',
      register: 'practical',
      line: 'Mark the trade-off in the trace. Then commit.',
    },
  ],
}
