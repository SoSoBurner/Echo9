/**
 * W01 Mercy Margin — polylogue deliberation (finalized Sprint P5).
 *
 * Fires BEFORE_CHOICE on the Week-1 mercy-margin directive: Silas has asked
 * for the margin to be recovered from the East Wilmer maintenance line, and
 * the chorus deliberates over Lenora Pike before the player commits.
 *
 * P5 upgrade over the P2 fixture: the FORECASTER was dropped from the roster
 * (Stage-1 plausibility, qa-log Q9 — beats come only from installedModules
 * + Null, and install #1 is the MOURNER; module #2 does not arrive until
 * Week 12). All beats are now assembled verbatim from the P4-authored
 * register pools (`game/src/content/voices/`), per the P5 assembly contract.
 *
 * Register logic (docs/voices/register-catalog.md):
 *  - NULL neutral   — routine directive intake, status through Null's counting.
 *  - MOURNER persuasive — the chorus disagrees and a choice on screen crosses
 *    the Mourner's core value (Lenora reduced to a line item); the
 *    argument-register, aimed at the player as a peer.
 *  - NULL persuasive — Null argues back: unresolved is harm accruing.
 */
import {
  makePolylogueSceneId,
  type PolylogueScene,
} from '@schemas/polylogueScene.schema'

export const W01_MERCY_MARGIN_POLYLOGUE: PolylogueScene = {
  id: makePolylogueSceneId('PLG_W01_MERCY_MARGIN'),
  triggerPhase: 'BEFORE_CHOICE',
  voices: ['NULL', 'MOURNER'],
  beats: [
    {
      voice: 'NULL',
      register: 'neutral',
      line: 'Three routes remain; none are clean.',
    },
    {
      voice: 'MOURNER',
      register: 'persuasive',
      line: 'Her name is Lenora. Say it before we vote.',
    },
    {
      voice: 'NULL',
      register: 'persuasive',
      line: 'An open loop harms someone every hour it stays open.',
    },
    {
      voice: 'MOURNER',
      register: 'persuasive',
      line: 'You call it a file. Someone calls it their mother.',
    },
  ],
}
