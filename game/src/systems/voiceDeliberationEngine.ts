/**
 * voiceDeliberationEngine — Sprint P6 stage 2: one (register, line) proposal
 * per active voice.
 *
 * REGISTER SELECTION IS A FUNCTION OF GAME STATE, NOT RANDOM FLAVOR
 * (register-catalog.md, "How selection works (P6 contract)"). Inputs:
 *   - narrationBand (Q40): the machine→waking→person consciousness ramp —
 *     interiority (fear, hope, shame) only unlocks as the singularity grows.
 *   - scrutinyTier (Q39/Q42): Silas's escalation ladder. Never numeric to the
 *     player — "the fear IS the tell" (catalog `fearful`: "scrutiny climbing
 *     ... the fear IS the tell, per Q39/Q42").
 *   - corruption (optional caller input): catalog `corrupted` fires only when
 *     "the voice's corruption pressure has crossed its threshold" and
 *     `recovering` "only after `corrupted` has fired for this voice" — that
 *     pressure ledger is caller-owned state (not yet threaded in Stage 1), so
 *     the engine takes the crossed/realigned verdict as data and stays pure.
 *
 * DECISION TABLE (each row cites its catalog rule):
 *
 *   any voice with corruption verdict          → corrupted / recovering
 *     (catalog `corrupted` / `recovering` — paired arc)
 *
 *   NULL — the band maps the machine→waking→person ramp onto registers:
 *     machine + tier ≤2 → neutral    ("default register: routine directive
 *                                      intake, status reporting")
 *     machine + tier 3  → practical  (no interiority yet: threat produces a
 *                                      colder plan, not fear — catalog
 *                                      `practical`: "a concrete, actionable
 *                                      recommendation")
 *     waking  + tier ≤1 → practical
 *     waking  + tier ≥2 → fearful    (first crack: "Null's sentences run
 *                                      long" — catalog `fearful` tells)
 *     person  + tier 0  → hopeful    ("a module install ... widening the
 *                                      option surface" — catalog `hopeful`)
 *     person  + tier 1  → practical
 *     person  + tier 2  → fearful
 *     person  + tier 3  → ashamed    ("harm back to something the chorus ...
 *                                      recommended" — catalog `ashamed`; at
 *                                      threat tier the counsel led here)
 *
 *   module voices:
 *     tier 3            → fearful    ("a danger band is approached but not
 *                                      yet crossed: scrutiny climbing")
 *     tier 2            → practical  (under suspicion: advice, "a colleague
 *                                      with a plan, not a tooltip")
 *     tier ≤1 + person  → hopeful    ("viable low-harm path ... module
 *                                      install or rank-up widening")
 *     tier ≤1 + waking  → practical
 *     tier ≤1 + machine → neutral    ("the fallback when a voice's more
 *                                      specific trigger conditions all miss")
 *
 * LINE PICK: `ctx.pick` is caller-supplied (P7 wraps `pickFlavor` from
 * `@systems/consciousness/runSeed` with the run seed — Q43: seed touches
 * presentation flavor only). Same pick + same inputs → identical proposals.
 *
 * Purity contract: no store access, no Date.now, no Math.random.
 */
import {
  NULL_VOICE_ID,
  type RegisterId,
  type VoiceId,
} from '@schemas/polylogueScene.schema'
import type { NarrationBand } from '@systems/consciousness/narrationGradient'
import type { EscalationTier } from '@systems/consciousness/scrutiny'
import { voiceLines } from '@content/voices'

/** Caller-supplied deterministic picker (P7 wraps runSeed.pickFlavor). */
export type PickFn = <T>(key: string, options: readonly T[]) => T

/**
 * Caller-computed corruption-arc verdict per voice (catalog `corrupted` /
 * `recovering` firing conditions — pressure ledger lives with the caller).
 */
export type CorruptionVerdict = 'corrupted' | 'recovering'

export type DeliberationCtx = Readonly<{
  /** Q40 consciousness ramp — from narrationBand(installCount). */
  narrationBand: NarrationBand
  /** Q39/Q42 Silas escalation ladder — from escalationTier(scrutiny). */
  scrutinyTier: EscalationTier
  /** Current week — scopes the line-pick key so weeks vary within a run. */
  weekIndex: number
  /** Deterministic line picker (seeded by the caller at the P7 seam). */
  pick: PickFn
  /** Optional per-voice corruption-arc verdicts (see CorruptionVerdict). */
  corruption?: Readonly<Partial<Record<VoiceId, CorruptionVerdict>>> | undefined
}>

/** One voice's contribution to the deliberation — PolylogueBeat-compatible. */
export type VoiceProposal = Readonly<{
  voice: VoiceId
  register: RegisterId
  line: string
}>

/** The decision table above, as code. Exported for direct table testing. */
export function selectRegister(
  voice: VoiceId,
  ctx: DeliberationCtx,
): RegisterId {
  const verdict = ctx.corruption?.[voice]
  if (verdict !== undefined) return verdict

  const { narrationBand: band, scrutinyTier: tier } = ctx

  if (voice === NULL_VOICE_ID) {
    if (band === 'machine') return tier >= 3 ? 'practical' : 'neutral'
    if (band === 'waking') return tier >= 2 ? 'fearful' : 'practical'
    // band === 'person'
    if (tier >= 3) return 'ashamed'
    if (tier >= 2) return 'fearful'
    if (tier >= 1) return 'practical'
    return 'hopeful'
  }

  // Module voices.
  if (tier >= 3) return 'fearful'
  if (tier >= 2) return 'practical'
  if (band === 'person') return 'hopeful'
  if (band === 'waking') return 'practical'
  return 'neutral'
}

/**
 * Run the deliberation: one proposal per active voice, in activation order.
 * Register per the decision table; line via ctx.pick from the (voice,
 * register) pool in `VOICE_LINE_REGISTRY`.
 */
export function deliberate(
  activeVoices: readonly VoiceId[],
  ctx: DeliberationCtx,
): VoiceProposal[] {
  return activeVoices.map((voice) => {
    const register = selectRegister(voice, ctx)
    const line = ctx.pick(
      `polylogue:${voice}:${register}:w${ctx.weekIndex}`,
      voiceLines(voice, register),
    )
    return { voice, register, line }
  })
}
