/**
 * narrationGradient — Sprint S5 pure engine (Q40 narration evolution).
 *
 * The player IS Echo 9. Each module install brings a new consciousness into
 * the singularity, and the narration register tracks that ramp
 * (spec §2, docs/superpowers/specs/2026-07-09-echo9-stage1-consciousness-design.md):
 *
 *   0 installs → 'machine'  — flat system log. "TASK COMPLETE. VARIANCE LOGGED."
 *   1 install  → 'waking'   — one crack of hesitant interiority in the log.
 *   ≥2 installs → 'person'  — first-person, unsettlingly human.
 *                              "I filed it. I keep thinking about her."
 *
 * Purity contract (matches choiceResolver / optionSurface):
 *   - No store access — the install count is passed in. Callers derive it
 *     from `Object.keys(installedModules).length` (modulesSlice shape).
 *   - Presentation-only — register selection never touches meters, hooks, or
 *     the ledger. The persisted trace body IS the machine baseline; higher
 *     registers are authored variants resolved at render time.
 *   - Unauthored variants are inert: selection falls DOWN the ladder
 *     (person → waking → machine) so an unauthored week renders exactly what
 *     it rendered before S5. `machine` is required; the ladder never falls up.
 */

export type NarrationBand = 'machine' | 'waking' | 'person'

/**
 * Authored register variants for one piece of result copy. The `machine`
 * string is the required baseline (existing plain-string content); `waking`
 * and `person` are optional authored escalations.
 */
export type NarrationVariantSet = {
  machine: string
  // `| undefined` keeps this assignable from Zod's `.optional()` output under
  // exactOptionalPropertyTypes (the build-only `tsc -b` gate).
  waking?: string | undefined
  person?: string | undefined
}

/**
 * Maps an install count to a narration band.
 * 0 (or any defensive negative) → machine; 1 → waking; ≥2 → person.
 */
export function narrationBand(installCount: number): NarrationBand {
  if (installCount >= 2) return 'person'
  if (installCount >= 1) return 'waking'
  return 'machine'
}

/**
 * Picks the copy for a band, falling down the ladder when a higher register
 * is unauthored: person → waking → machine. A machine-band call always
 * returns `machine`, even when higher registers exist — a fresh Echo 9 must
 * never speak like a person.
 */
export function selectNarration(
  variants: NarrationVariantSet,
  band: NarrationBand,
): string {
  if (band === 'person') {
    return variants.person ?? variants.waking ?? variants.machine
  }
  if (band === 'waking') {
    return variants.waking ?? variants.machine
  }
  return variants.machine
}
