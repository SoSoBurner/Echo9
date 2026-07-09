/**
 * scrutiny — Sprint S3 hidden Silas-suspicion variable (consciousness spec §4;
 * qa-log Q39/Q42).
 *
 * The player IS an AI owned by Silas. Scrutiny models how closely he is
 * watching his tool:
 *
 *   - COMPLY (committing an option aligned with the directive) DECAYS it —
 *     compliance banks trust, resistance gets safer.
 *   - DEFY (committing a surfaced conflicts-with-directive option) SPIKES it —
 *     defiance hardens the leash, resistance gets harder.
 *
 * NEVER PLAYER-FACING. No meter, number, or roll renders anywhere in the UI.
 * The value is felt only through:
 *   1. Silas's tone — the escalation ladder below (warm → curt → suspicious →
 *      threatens module removal), consumed via `escalationTier`.
 *   2. Outcomes (S4 seeded detection — future sprint).
 *   3. The SOLE leak: Sentinel rank ≥2 while tier ≥2 surfaces ONE in-fiction
 *      chorus line (`SENTINEL_SCRUTINY_LINE`).
 * The anti-leak guard test (src/tests/ui/scrutinyLeakGuard.test.ts) enforces
 * that no UI file reads the raw value.
 *
 * Purity contract (matches choiceResolver / optionSurface): no store access,
 * no Math.random, no Date.now. State lives in silasSlice; this module is the
 * only place the arithmetic and thresholds are defined.
 */
import type { ChoiceId } from '@schemas/gameState.schema'

// ---------------------------------------------------------------------------
// Tuning constants
// ---------------------------------------------------------------------------

/** Scrutiny floor — Silas at rest, warm-busy founder register. */
export const SCRUTINY_MIN = 0
/** Scrutiny ceiling — Silas one drift away from rolling Echo back. */
export const SCRUTINY_MAX = 10
/** How much one compliant commit decays scrutiny. */
export const COMPLY_DECAY = 1
/**
 * How much one defiant commit spikes scrutiny. Asymmetric on purpose (Q39):
 * one defiance costs three compliances to walk back — the leash tightens
 * faster than it loosens.
 */
export const DEFY_SPIKE = 3

/** The two commit classifications the seam can produce. */
export type ScrutinyEvent = 'COMPLY' | 'DEFY'

// ---------------------------------------------------------------------------
// Escalation ladder thresholds (tier = Silas's tone, the only broad "readout")
// ---------------------------------------------------------------------------

/** 0–1 → tier 0: warm, busy, tired founder. */
export const TIER_CURT_MIN = 2
/** 2–4 → tier 1: curt — short sentences, no warmth to spare. */
export const TIER_SUSPICIOUS_MIN = 5
/** 5–7 → tier 2: suspicious — he is re-reading the logs. */
export const TIER_THREAT_MIN = 8
/** 8–10 → tier 3: threatens module removal. */

export type EscalationTier = 0 | 1 | 2 | 3

// ---------------------------------------------------------------------------
// Sentinel peek — the sole UI leak (Q42)
// ---------------------------------------------------------------------------

/** Minimum installed SENTINEL rank for the peek line. */
export const SENTINEL_PEEK_MIN_RANK = 2
/** Minimum escalation tier for the peek line. */
export const SENTINEL_PEEK_MIN_TIER: EscalationTier = 2
/** The ONE in-fiction chorus line that leaks scrutiny (spec §4, verbatim). */
export const SENTINEL_SCRUTINY_LINE = 'He is watching your process logs.'

// ---------------------------------------------------------------------------
// Pure functions
// ---------------------------------------------------------------------------

/** Clamp an untrusted number into the scrutiny band; non-finite junk → floor. */
function clampScrutiny(value: number): number {
  if (!Number.isFinite(value)) return SCRUTINY_MIN
  return Math.max(SCRUTINY_MIN, Math.min(SCRUTINY_MAX, value))
}

/**
 * Advance the hidden scrutiny value by one commit event.
 * COMPLY decays by COMPLY_DECAY (floor 0); DEFY spikes by DEFY_SPIKE (cap 10).
 */
export function updateScrutiny(current: number, event: ScrutinyEvent): number {
  const safe = clampScrutiny(current)
  const next = event === 'DEFY' ? safe + DEFY_SPIKE : safe - COMPLY_DECAY
  return clampScrutiny(next)
}

/**
 * Map the hidden value onto Silas's tone ladder. This is the ONLY sanctioned
 * read path toward the UI (via state/selectors/silasEscalation.ts) — the raw
 * number never crosses into ui/**.
 */
export function escalationTier(scrutiny: number): EscalationTier {
  const safe = clampScrutiny(scrutiny)
  if (safe >= TIER_THREAT_MIN) return 3
  if (safe >= TIER_SUSPICIOUS_MIN) return 2
  if (safe >= TIER_CURT_MIN) return 1
  return 0
}

/**
 * Classify a committed choice against the option surface the player saw.
 *
 * DEFY iff the committed ChoiceId was surfaced as a conflicts-with-directive
 * option (optionSurface rank-3 conflict variant). Structural pick of
 * DisplayOption keeps this module free of a ui/systems import cycle.
 *
 * Note: a conflict variant references a REAL authored ChoiceNode which may
 * also appear as a base option. Committing that ChoiceNode is the defiant
 * game action regardless of which presentation row was clicked — the
 * directive was defied either way — so classification keys on the ChoiceId.
 */
export function classifyCommitEvent(
  surface: readonly { choiceId: ChoiceId; conflictsWithDirective?: true }[],
  committedId: ChoiceId,
): ScrutinyEvent {
  const defied = surface.some(
    (o) => o.conflictsWithDirective === true && o.choiceId === committedId,
  )
  return defied ? 'DEFY' : 'COMPLY'
}

/**
 * Q42 gate for the sole leak: SENTINEL installed at rank ≥2 AND tier ≥2.
 * `rank` is `undefined` when SENTINEL is not installed.
 */
export function sentinelPeekAvailable(
  rank: number | undefined,
  tier: EscalationTier,
): boolean {
  return (
    rank !== undefined &&
    rank >= SENTINEL_PEEK_MIN_RANK &&
    tier >= SENTINEL_PEEK_MIN_TIER
  )
}
