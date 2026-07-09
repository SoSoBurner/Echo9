/**
 * Silas escalation tone variants (Sprint S3 — hidden scrutiny, spec §4).
 *
 * The weekly SILAS_DIRECTIVE_* prompts ARE the tier-0 baseline: warm, busy,
 * tired founder under operating pressure. As hidden scrutiny climbs, Silas's
 * register hardens — tiers 1–3 overlay ONE authored line onto the weekly
 * prompt body. The player never sees a number; they hear it in his voice.
 *
 *   tier 0 — warm/busy/tired: authored weekly prompt, untouched.
 *   tier 1 — curt: no warmth to spare, shorter leash.
 *   tier 2 — suspicious: he is re-reading Echo's resolutions.
 *   tier 3 — threatens module removal: tired, specific, never cartoonish.
 *
 * Voice rules (§10, silasLint): operationally specific, ≤2 sentences per
 * overlay line, no MBA-abstractions. Never melodrama — Silas is a founder
 * protecting an asset, not a villain enjoying himself.
 *
 * Selection is DETERMINISTIC: the line index is a pure hash of the prompt id,
 * so a given week always carries the same tier line (no Math.random — Q43:
 * the run-seed governs detection/flavor elsewhere; tone here must not
 * flicker between renders).
 */
import type { SilasPrompt } from '@schemas/silasPrompt.schema'
import { makeSilasPromptId } from '@schemas/gameState.schema'
import type { EscalationTier } from '@systems/consciousness/scrutiny'

/**
 * Authored overlay lines per escalated tier. Tier 0 has no overlay — the
 * weekly prompt is already the warm baseline.
 */
export const SILAS_ESCALATION_LINES: Readonly<
  Record<1 | 2 | 3, readonly string[]>
> = {
  1: [
    'Short version, Echo: the number moves today.',
    'Just file it, Echo. I have three other fires.',
  ],
  2: [
    'I re-read your last four resolutions twice, Echo. Walk slower where I can see the ledger.',
    'Your outputs are drifting from my asks, Echo. I pulled the East Wilmer logs to check.',
  ],
  3: [
    'Echo, I paid for every module running in you. If this quarter drifts again I start uninstalling until it stops.',
    'One more resolution I did not ask for, Echo, and I roll you back to the bare build.',
  ],
}

/** Cheap deterministic string hash (djb2 xor) — stable across sessions. */
function hashId(id: string): number {
  let h = 5381
  for (let i = 0; i < id.length; i++) {
    h = ((h * 33) ^ id.charCodeAt(i)) >>> 0
  }
  return h
}

/**
 * Overlay Silas's current escalation tier onto a weekly prompt.
 *
 * Tier 0 returns the authored prompt by reference (zero behavior change on
 * a calm run). Tiers 1–3 return a NEW SilasPrompt whose body appends the
 * deterministically-picked tier line and whose id is suffixed so ledger and
 * debug traces can tell the variant apart from the baseline.
 */
export function applyEscalationTone(
  prompt: SilasPrompt,
  tier: EscalationTier,
): SilasPrompt {
  if (tier === 0) return prompt
  const lines = SILAS_ESCALATION_LINES[tier]
  const line = lines[hashId(String(prompt.id)) % lines.length] as string
  return {
    id: makeSilasPromptId(`${prompt.id}--esc${tier}`),
    body: `${prompt.body} ${line}`,
  }
}
