/**
 * coalitionEngine — Sprint P6 stage 3: cluster proposals into agreement
 * blocks.
 *
 * Canon (`AI Dialogue Interplay.md` §3, "Coalition/Conflict Nodes"): "When
 * multiple voices react simultaneously, the system identifies potential
 * coalitions (if their core threats align) or conflicts (if they disagree on
 * meaning/cost)." Canon specifies no algorithm, so per the P6 brief we use a
 * simple stance model: each register implies a stance toward the directive's
 * course, and blocks are same-stance groups.
 *
 * STANCE MAPPING (exported — the composition engine and tests share it):
 *   support — neutral (routine report), practical (a plan for the course),
 *             hopeful (a viable path is open), comforting (the cost already
 *             paid was worth it).
 *   oppose  — persuasive ("the chorus disagrees ... points the other way",
 *             register catalog), angry ("a boundary the voice exists to hold
 *             was crossed"), corrupted (the darker urge pushes off-course).
 *   qualify — fearful (yes, but the danger band is close), ashamed (our own
 *             counsel did harm — conditions before we repeat it), recovering
 *             (pulling back from the edge, restating the value).
 *
 * Determinism: blocks keep proposal order; the block list is ordered by first
 * appearance; dominant stance = largest block, ties to the earlier-appearing
 * stance. Pure function — no store, no Date.now, no Math.random.
 */
import type { RegisterId } from '@schemas/polylogueScene.schema'
import type { VoiceProposal } from '@systems/voiceDeliberationEngine'

/** A proposal's posture toward the directive's current course. */
export type Stance = 'support' | 'oppose' | 'qualify'

/** Register → stance (see doc block for the catalog-derived rationale). */
export const REGISTER_STANCE: Readonly<Record<RegisterId, Stance>> = {
  neutral: 'support',
  practical: 'support',
  hopeful: 'support',
  comforting: 'support',
  persuasive: 'oppose',
  angry: 'oppose',
  corrupted: 'oppose',
  fearful: 'qualify',
  ashamed: 'qualify',
  recovering: 'qualify',
}

/** One same-stance agreement block (canon §3 coalition). */
export type CoalitionBlock = Readonly<{
  stance: Stance
  members: readonly VoiceProposal[]
}>

export type CoalitionState = Readonly<{
  /** First-appearance order; members keep proposal (activation) order. */
  blocks: readonly CoalitionBlock[]
  /** True iff the whole chorus landed in a single block. */
  unanimous: boolean
  /** Largest block's stance; ties go to the earlier-appearing stance. */
  dominantStance: Stance
}>

/**
 * Cluster proposals into agreement blocks. Throws on an empty list — every
 * deliberation includes NULL (activation invariant), so an empty chorus is a
 * wiring bug and fails loud (§11 style, like pickFlavor).
 */
export function formCoalitions(
  proposals: readonly VoiceProposal[],
): CoalitionState {
  if (proposals.length === 0) {
    throw new Error(
      'formCoalitions: empty proposal list — a deliberation always includes NULL; wiring bug.',
    )
  }

  const order: Stance[] = []
  const membersByStance = new Map<Stance, VoiceProposal[]>()
  for (const proposal of proposals) {
    const stance = REGISTER_STANCE[proposal.register]
    const members = membersByStance.get(stance)
    if (members === undefined) {
      order.push(stance)
      membersByStance.set(stance, [proposal])
    } else {
      members.push(proposal)
    }
  }

  const blocks: CoalitionBlock[] = order.map((stance) => ({
    stance,
    members: membersByStance.get(stance) ?? [],
  }))

  // Largest block wins; Array.sort is stable, so ties keep first-appearance
  // order — deterministic by construction.
  const dominant = [...blocks].sort(
    (a, b) => b.members.length - a.members.length,
  )[0] as CoalitionBlock

  return {
    blocks,
    unanimous: blocks.length === 1,
    dominantStance: dominant.stance,
  }
}
