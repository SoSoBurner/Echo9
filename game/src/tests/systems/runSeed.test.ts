/**
 * S4 — per-run seed pure module tests (Q43 determinism law).
 *
 * The determinism law: meters/traces/consequences derive purely from choice
 * history. The per-run seed may influence ONLY (a) whether a defiance is
 * DETECTED by Silas and (b) presentation flavor. These tests pin:
 *
 *   1. newRunSeed produces a uint32 (the ONLY nondeterministic call, isolated
 *      in runSeed.ts).
 *   2. mulberry32 / hashInputs are pure and stable — same inputs, same output,
 *      100-iteration stability.
 *   3. detectDefiance: deterministic per (seed, band, week); per-week rolls
 *      are independent but reproducible; probability rises MONOTONICALLY with
 *      band (structural: one roll, four thresholds); statistical frequency
 *      tracks the exported constants.
 *   4. Different seeds diverge somewhere (not a constant function).
 *   5. pickFlavor: stable per (seed, key); in-bounds; varies across keys.
 */
import { describe, it, expect } from 'vitest'
import {
  newRunSeed,
  mulberry32,
  hashInputs,
  detectDefiance,
  pickFlavor,
  DETECTION_PROBABILITY_BY_BAND,
  DETECTION_SCRUTINY_SPIKE,
} from '@systems/consciousness/runSeed'

const BANDS = [0, 1, 2, 3] as const

describe('runSeed — constants', () => {
  it('detection probability rises strictly with scrutiny band', () => {
    expect(DETECTION_PROBABILITY_BY_BAND).toHaveLength(4)
    for (let i = 1; i < 4; i++) {
      expect(DETECTION_PROBABILITY_BY_BAND[i]!).toBeGreaterThan(
        DETECTION_PROBABILITY_BY_BAND[i - 1]!,
      )
    }
    for (const p of DETECTION_PROBABILITY_BY_BAND) {
      expect(p).toBeGreaterThan(0)
      expect(p).toBeLessThan(1)
    }
  })

  it('detection spike is a positive integer', () => {
    expect(DETECTION_SCRUTINY_SPIKE).toBeGreaterThan(0)
    expect(Number.isInteger(DETECTION_SCRUTINY_SPIKE)).toBe(true)
  })
})

describe('runSeed — newRunSeed', () => {
  it('returns a finite uint32', () => {
    for (let i = 0; i < 20; i++) {
      const seed = newRunSeed()
      expect(Number.isInteger(seed)).toBe(true)
      expect(seed).toBeGreaterThanOrEqual(0)
      expect(seed).toBeLessThan(2 ** 32)
    }
  })

  it('is not a constant (20 draws produce more than one value)', () => {
    const draws = new Set<number>()
    for (let i = 0; i < 20; i++) draws.add(newRunSeed())
    expect(draws.size).toBeGreaterThan(1)
  })
})

describe('runSeed — mulberry32 + hashInputs purity', () => {
  it('mulberry32 with the same seed replays the same stream', () => {
    const a = mulberry32(0xdecafbad)
    const b = mulberry32(0xdecafbad)
    for (let i = 0; i < 100; i++) {
      const va = a()
      expect(va).toBe(b())
      expect(va).toBeGreaterThanOrEqual(0)
      expect(va).toBeLessThan(1)
    }
  })

  it('hashInputs is stable per (seed, keys) — 100-iteration stability', () => {
    const first = hashInputs(42, 'detect', 7)
    for (let i = 0; i < 100; i++) {
      expect(hashInputs(42, 'detect', 7)).toBe(first)
    }
    expect(Number.isInteger(first)).toBe(true)
    expect(first).toBeGreaterThanOrEqual(0)
    expect(first).toBeLessThan(2 ** 32)
  })

  it('hashInputs separates sub-streams: different keys → different hashes', () => {
    const seen = new Set<number>()
    for (let week = 0; week < 50; week++) {
      seen.add(hashInputs(42, 'detect', week))
    }
    // 50 weeks should not collapse into a handful of buckets.
    expect(seen.size).toBeGreaterThan(45)
    expect(hashInputs(42, 'detect', 1)).not.toBe(hashInputs(42, 'flavor', 1))
    expect(hashInputs(42, 'detect', 1)).not.toBe(hashInputs(43, 'detect', 1))
  })
})

describe('runSeed — detectDefiance determinism (Q43)', () => {
  it('same seed + band + week → same detection, 100 iterations', () => {
    for (const band of BANDS) {
      const first = detectDefiance(0xabc123, band, 5)
      for (let i = 0; i < 100; i++) {
        expect(detectDefiance(0xabc123, band, 5)).toBe(first)
      }
    }
  })

  it('different seeds diverge somewhere across 100 weeks', () => {
    let diverged = false
    for (let week = 0; week < 100 && !diverged; week++) {
      if (detectDefiance(1, 1, week) !== detectDefiance(2, 1, week)) {
        diverged = true
      }
    }
    expect(diverged).toBe(true)
  })

  it('per-seed, per-week: detection is monotone in band (detected at band b ⇒ detected at b+1)', () => {
    for (let week = 0; week < 200; week++) {
      for (let b = 0; b < 3; b++) {
        if (detectDefiance(777, b as 0 | 1 | 2, week)) {
          expect(detectDefiance(777, (b + 1) as 1 | 2 | 3, week)).toBe(true)
        }
      }
    }
  })

  it('statistical: detection frequency over 2000 weeks tracks the band constants (higher band ⇒ ≥ detections)', () => {
    const N = 2000
    const counts = [0, 0, 0, 0]
    for (let week = 0; week < N; week++) {
      for (const band of BANDS) {
        if (detectDefiance(0x5eed, band, week)) counts[band] = counts[band]! + 1
      }
    }
    // Ordering: strictly non-decreasing (monotone thresholds guarantee ≥;
    // with N=2000 the gaps are far wider than any plausible tie).
    expect(counts[0]!).toBeLessThanOrEqual(counts[1]!)
    expect(counts[1]!).toBeLessThanOrEqual(counts[2]!)
    expect(counts[2]!).toBeLessThanOrEqual(counts[3]!)
    // Frequency within ±0.06 of the exported constants (>5σ at N=2000 —
    // deterministic given the fixed seed, so no flake risk).
    for (const band of BANDS) {
      const freq = counts[band]! / N
      expect(Math.abs(freq - DETECTION_PROBABILITY_BY_BAND[band]!)).toBeLessThan(0.06)
    }
  })
})

describe('runSeed — pickFlavor', () => {
  const options = ['a', 'b', 'c', 'd', 'e'] as const

  it('is stable per (seed, key) — 100-iteration stability', () => {
    const first = pickFlavor(99, 'ambient:week3', options)
    for (let i = 0; i < 100; i++) {
      expect(pickFlavor(99, 'ambient:week3', options)).toBe(first)
    }
  })

  it('always returns a member of the options list', () => {
    for (let i = 0; i < 200; i++) {
      const picked = pickFlavor(i, `k${i}`, options)
      expect(options).toContain(picked)
    }
  })

  it('varies across keys and seeds (not a constant pick)', () => {
    const byKey = new Set<string>()
    for (let i = 0; i < 50; i++) byKey.add(pickFlavor(7, `key-${i}`, options))
    expect(byKey.size).toBeGreaterThan(1)
    const bySeed = new Set<string>()
    for (let i = 0; i < 50; i++) bySeed.add(pickFlavor(i, 'fixed', options))
    expect(bySeed.size).toBeGreaterThan(1)
  })

  it('a single-option list always returns that option', () => {
    expect(pickFlavor(123, 'solo', ['only'] as const)).toBe('only')
  })

  it('throws on an empty options list (authoring bug, fail loud)', () => {
    expect(() => pickFlavor(1, 'empty', [] as const)).toThrow()
  })
})
