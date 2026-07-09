/**
 * runSeed — Sprint S4 per-run seed (Q43 determinism law; consciousness spec §5).
 *
 * THE LAW: meters, traces, and consequences derive PURELY from choice history.
 * The per-run seed may influence ONLY:
 *   (a) whether a defiance is DETECTED by Silas (detectDefiance below), and
 *   (b) presentation flavor (pickFlavor below — debate order, ambient lines).
 * Nothing else may read the seed. runSeedImportGuard.test.ts enforces the
 * import surface (sanctioned: silasSlice boot init + seam action, store.ts
 * migration; future presentation call sites join the allowlist explicitly).
 *
 * `newRunSeed()` is the ONLY nondeterministic call in the whole system layer —
 * isolated here so everything downstream of a captured seed replays exactly.
 * The seed is generated at fresh boot, persisted with the save, kept on
 * restore, and regenerated on replay/new-run (silasSlice semantics).
 *
 * Zero dependencies on purpose (guard-tested): this module must be importable
 * from anywhere on the sanctioned list without dragging state/schema graphs.
 */

// ---------------------------------------------------------------------------
// Tuning constants
// ---------------------------------------------------------------------------

/**
 * Detection probability per scrutiny escalation band (scrutiny.ts
 * escalationTier: 0 warm / 1 curt / 2 suspicious / 3 threat). The closer
 * Silas watches, the likelier he catches a defiant commit:
 *   band 0 → 15%, band 1 → 35%, band 2 → 60%, band 3 → 85%.
 * Never player-facing (Q39: no roll, no chance readout — the unknown IS the
 * horror).
 */
export const DETECTION_PROBABILITY_BY_BAND: readonly [
  number,
  number,
  number,
  number,
] = [0.15, 0.35, 0.6, 0.85]

/**
 * Extra scrutiny applied ON TOP of the base DEFY spike when a defiance is
 * detected — Silas caught you; the leash yanks harder. Undetected defiance
 * costs only the base spike (S3 wiring).
 */
export const DETECTION_SCRUTINY_SPIKE = 2

// ---------------------------------------------------------------------------
// Seed generation — the ONLY nondeterministic call
// ---------------------------------------------------------------------------

/**
 * Generate a fresh uint32 run seed at boot. Prefers crypto; falls back to
 * Date/Math entropy where crypto is unavailable (older embedded webviews).
 */
export function newRunSeed(): number {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  ) {
    const buf = new Uint32Array(1)
    crypto.getRandomValues(buf)
    return buf[0]! >>> 0
  }
  return (Date.now() ^ Math.floor(Math.random() * 0x100000000)) >>> 0
}

// ---------------------------------------------------------------------------
// Pure PRNG utilities
// ---------------------------------------------------------------------------

/**
 * mulberry32 — tiny, fast, well-distributed 32-bit PRNG. Same seed → same
 * stream, forever. Each call advances the internal state and returns a float
 * in [0, 1).
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000
  }
}

/**
 * hashInputs — fold the run seed with any number of string/number keys into
 * a stable uint32 sub-stream seed. Same (seed, ...keys) → same hash. Used so
 * each consumer (e.g. each week's detection roll) draws from an independent
 * but reproducible stream — one consumer's draws never perturb another's.
 */
export function hashInputs(
  seed: number,
  ...keys: readonly (string | number)[]
): number {
  let h = (seed >>> 0) ^ 0x9e3779b9
  const mix = (v: number): void => {
    h = (h ^ (v >>> 0)) >>> 0
    h = Math.imul(h, 0x85ebca6b)
    h = (h ^ (h >>> 13)) >>> 0
    h = Math.imul(h, 0xc2b2ae35)
    h = (h ^ (h >>> 16)) >>> 0
  }
  for (const key of keys) {
    if (typeof key === 'number') {
      // Mix integer and fractional parts so non-integer keys still separate.
      mix(Math.floor(key))
      mix(Math.floor((key % 1) * 0x100000000))
    } else {
      for (let i = 0; i < key.length; i++) {
        mix(key.charCodeAt(i) + i * 0x101)
      }
    }
    // Key separator — ('ab','c') must not collide with ('a','bc').
    mix(0x9e3779b9)
  }
  return h >>> 0
}

// ---------------------------------------------------------------------------
// Sanctioned seed consumers
// ---------------------------------------------------------------------------

/**
 * detectDefiance — does Silas CATCH this defiant commit?
 *
 * Pure: same (seed, band, weekIndex) → same boolean, always. One roll per
 * (seed, weekIndex) via the 'detect' sub-stream — independent across weeks,
 * reproducible within a run. The band only moves the THRESHOLD, so detection
 * is monotone in band: caught at band b ⇒ caught at any higher band.
 */
export function detectDefiance(
  seed: number,
  scrutinyBand: 0 | 1 | 2 | 3,
  weekIndex: number,
): boolean {
  const roll = mulberry32(hashInputs(seed, 'detect', weekIndex))()
  return roll < DETECTION_PROBABILITY_BY_BAND[scrutinyBand]
}

/**
 * pickFlavor — stable presentation-flavor pick per (seed, key). Same run,
 * same seam key → same pick every render/reload; a new run reshuffles.
 * Throws on an empty list (authoring bug — fail loud, §11 style).
 */
export function pickFlavor<T>(
  seed: number,
  key: string,
  options: readonly T[],
): T {
  if (options.length === 0) {
    throw new Error(
      `pickFlavor: empty options list for key "${key}" — authoring bug.`,
    )
  }
  const roll = mulberry32(hashInputs(seed, 'flavor', key))()
  const index = Math.min(options.length - 1, Math.floor(roll * options.length))
  return options[index] as T
}
