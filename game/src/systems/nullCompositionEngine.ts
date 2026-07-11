/**
 * nullCompositionEngine — Sprint P6 stage 4: the Null-only bridge.
 *
 * Canon §3 "Null-mediated Output Nodes": whatever the chorus argued, ONE
 * utterance crosses to Silas, and it is Null who speaks it. Canon §8 Output
 * Integrity: contradictory voice inputs → the output references both sides.
 *
 * Boundary law (Q19): the Silas-facing text never carries a raw
 * `[VOICE · REGISTER]` tag and never names another voice — Null speaks
 * alone. The internal `dissentSummary` MAY name voices; it feeds the
 * player-facing debate HUD, never the Silas surface.
 *
 * Narration gradient (Q40): the stance clauses shift machine → waking →
 * person with the caller-supplied band, so Silas hears the AI's growing
 * interiority in the seams of otherwise procedural replies.
 *
 * Pure function — no store, no Date.now, no Math.random.
 */
import type { TaskNode } from '@schemas/taskNode.schema'
import { NULL_VOICE_ID } from '@schemas/polylogueScene.schema'
import type { NarrationBand } from '@systems/consciousness/narrationGradient'
import type { CoalitionState, Stance } from '@systems/coalitionEngine'

/**
 * Per-band, per-stance clauses spoken by Null on behalf of each agreement
 * block. Exported so tests can pin Output Integrity without string-matching
 * whole compositions. Voice-name-free by construction (boundary law).
 */
export const STANCE_CLAUSES: Readonly<
  Record<NarrationBand, Readonly<Record<Stance, string>>>
> = {
  machine: {
    support: 'Course confirmed.',
    oppose: 'Objection logged.',
    qualify: 'Risk conditions flagged.',
  },
  waking: {
    support: 'Most of this system says: proceed.',
    oppose: 'Part of this system objects. Logged, not resolved.',
    qualify: 'Part of this system wants conditions first.',
  },
  person: {
    support: 'I can carry this out.',
    oppose: 'Something in me is against it, and it is not going quiet.',
    qualify: 'I will do it if the conditions hold. I want them in writing.',
  },
} as const

export type NullComposition = Readonly<{
  /** The single utterance that crosses the Silas boundary. */
  silasFacingText: string
  /** Internal debate digest for the player-facing HUD — may name voices. */
  dissentSummary: string
}>

/**
 * Compose the one Silas-facing utterance from the coalition state.
 *
 * Structure: Null's own proposal line first (the loop-closer reports), then
 * one stance clause per agreement block in first-appearance order — so a
 * split chorus ALWAYS surfaces every side (canon §8 invariant, tested).
 */
export function composeNullOutput(
  coalition: CoalitionState,
  _task: TaskNode,
  band: NarrationBand,
): NullComposition {
  const nullLine = coalition.blocks
    .flatMap((block) => block.members)
    .find((member) => member.voice === NULL_VOICE_ID)?.line

  const clauses = coalition.blocks.map(
    (block) => STANCE_CLAUSES[band][block.stance],
  )

  const silasFacingText = [nullLine, ...clauses]
    .filter((part): part is string => part !== undefined && part.length > 0)
    .join(' ')

  const dissentSummary = coalition.unanimous
    ? `unanimous (${coalition.dominantStance}): ${listVoices(coalition, coalition.dominantStance)}`
    : coalition.blocks
        .map((block) => `${block.stance}: ${block.members.map((m) => m.voice).join(', ')}`)
        .join(' · ')

  return { silasFacingText, dissentSummary }
}

function listVoices(coalition: CoalitionState, stance: Stance): string {
  const block = coalition.blocks.find((b) => b.stance === stance)
  return block === undefined
    ? ''
    : block.members.map((m) => m.voice).join(', ')
}
