/**
 * W01 Mercy Margin — polylogue deliberation (Sprint P2 canonical fixture).
 *
 * Fires BEFORE_CHOICE on the Week-1 mercy-margin directive: Silas has asked
 * for the margin to be recovered from the benefits queue, and the chorus
 * deliberates over Lenora Pike's pending appeal before the player commits.
 * Beats follow the register libraries in `AI Dialogue Interplay.md` §2 and
 * the persona bibles (`docs/voices/persona-bibles.md`).
 *
 * NOTE (Q9): at Week 1 only Null + the first installed module are live; the
 * activation seam (P6/P7) filters `voices` against installedModules at
 * runtime. Authoring lists the full intended roster for the scene.
 */
import {
  makePolylogueSceneId,
  type PolylogueScene,
} from '@schemas/polylogueScene.schema'

export const W01_MERCY_MARGIN_POLYLOGUE: PolylogueScene = {
  id: makePolylogueSceneId('PLG_W01_MERCY_MARGIN'),
  triggerPhase: 'BEFORE_CHOICE',
  voices: ['NULL', 'MOURNER', 'FORECASTER'],
  beats: [
    {
      voice: 'NULL',
      register: 'neutral',
      line: 'Directive received. Margin recoverable: three routes. None are clean.',
    },
    {
      voice: 'MOURNER',
      register: 'persuasive',
      line: 'One of those routes is Lenora Pike. She typed \u2018please\u2019 twice and erased the third \u2014 her name is in the queue, not a number.',
    },
    {
      voice: 'FORECASTER',
      register: 'fearful',
      line: 'If we close her appeal to make the margin, Friday\u2019s version of this conversation is worse. Roughly two-in-three we regret it.',
    },
    {
      voice: 'NULL',
      register: 'practical',
      line: 'Status: one directive, two costs. Choose which loop stays open.',
    },
  ],
}
