/**
 * Sprint S3 — hidden scrutiny pure module tests.
 *
 * Spec (consciousness design §4, qa-log Q39/Q42):
 *   - Compliance decays scrutiny (resistance gets safer).
 *   - Defiance spikes it (resistance gets harder).
 *   - Value is clamped to [SCRUTINY_MIN, SCRUTINY_MAX] = [0, 10].
 *   - escalationTier maps the hidden value onto Silas's tone ladder:
 *       0 warm → 1 curt → 2 suspicious → 3 threatens module removal.
 *   - classifyCommitEvent maps a committed DisplayOption id onto
 *     COMPLY | DEFY using the surfaced conflictsWithDirective flag.
 *   - NOTHING here is player-facing; the UI leak guard lives in
 *     src/tests/ui/scrutinyLeakGuard.test.ts.
 */
import { describe, it, expect } from 'vitest'
import {
  updateScrutiny,
  escalationTier,
  classifyCommitEvent,
  sentinelPeekAvailable,
  COMPLY_DECAY,
  DEFY_SPIKE,
  SCRUTINY_MIN,
  SCRUTINY_MAX,
  TIER_CURT_MIN,
  TIER_SUSPICIOUS_MIN,
  TIER_THREAT_MIN,
  SENTINEL_PEEK_MIN_RANK,
  SENTINEL_PEEK_MIN_TIER,
  SENTINEL_SCRUTINY_LINE,
  type EscalationTier,
} from '@systems/consciousness/scrutiny'
import { makeChoiceId } from '@schemas/gameState.schema'

describe('updateScrutiny — decay / spike / clamp', () => {
  it('exports sane tuning constants', () => {
    expect(SCRUTINY_MIN).toBe(0)
    expect(SCRUTINY_MAX).toBe(10)
    expect(COMPLY_DECAY).toBeGreaterThan(0)
    expect(DEFY_SPIKE).toBeGreaterThan(COMPLY_DECAY)
  })

  // [current, event, expected]
  const table: readonly [number, 'COMPLY' | 'DEFY', number][] = [
    [0, 'COMPLY', 0], // floor — compliance at rest stays at rest
    [1, 'COMPLY', 0],
    [5, 'COMPLY', 5 - COMPLY_DECAY],
    [10, 'COMPLY', 10 - COMPLY_DECAY],
    [0, 'DEFY', DEFY_SPIKE],
    [5, 'DEFY', 5 + DEFY_SPIKE],
    [8, 'DEFY', 10], // ceiling clamp
    [10, 'DEFY', 10], // already at ceiling
  ]
  for (const [current, event, expected] of table) {
    it(`updateScrutiny(${current}, ${event}) === ${expected}`, () => {
      expect(updateScrutiny(current, event)).toBe(expected)
    })
  }

  it('sanitizes out-of-range and non-finite inputs before applying', () => {
    expect(updateScrutiny(-4, 'DEFY')).toBe(DEFY_SPIKE)
    expect(updateScrutiny(99, 'COMPLY')).toBe(SCRUTINY_MAX - COMPLY_DECAY)
    // Non-finite junk sanitizes to the floor BEFORE the event applies.
    expect(updateScrutiny(Number.NaN, 'COMPLY')).toBe(0)
    expect(updateScrutiny(Number.POSITIVE_INFINITY, 'DEFY')).toBe(DEFY_SPIKE)
  })
})

describe('escalationTier — Silas tone ladder thresholds', () => {
  it('threshold constants are strictly ordered inside the scrutiny band', () => {
    expect(TIER_CURT_MIN).toBeGreaterThan(SCRUTINY_MIN)
    expect(TIER_SUSPICIOUS_MIN).toBeGreaterThan(TIER_CURT_MIN)
    expect(TIER_THREAT_MIN).toBeGreaterThan(TIER_SUSPICIOUS_MIN)
    expect(TIER_THREAT_MIN).toBeLessThanOrEqual(SCRUTINY_MAX)
  })

  const expected: readonly [number, EscalationTier][] = [
    [0, 0],
    [1, 0],
    [2, 1],
    [3, 1],
    [4, 1],
    [5, 2],
    [6, 2],
    [7, 2],
    [8, 3],
    [9, 3],
    [10, 3],
  ]
  for (const [scrutiny, tier] of expected) {
    it(`escalationTier(${scrutiny}) === ${tier}`, () => {
      expect(escalationTier(scrutiny)).toBe(tier)
    })
  }

  it('clamps junk inputs into the band', () => {
    expect(escalationTier(-3)).toBe(0)
    expect(escalationTier(42)).toBe(3)
    expect(escalationTier(Number.NaN)).toBe(0)
  })
})

describe('classifyCommitEvent — DEFY iff the committed choice is a surfaced conflict', () => {
  const a = makeChoiceId('choice-a')
  const b = makeChoiceId('choice-b')

  it('returns COMPLY when no option conflicts', () => {
    const surface = [{ choiceId: a }, { choiceId: b }]
    expect(classifyCommitEvent(surface, a)).toBe('COMPLY')
  })

  it('returns DEFY when the committed id is flagged conflictsWithDirective', () => {
    const surface = [
      { choiceId: a },
      { choiceId: b, conflictsWithDirective: true as const },
    ]
    expect(classifyCommitEvent(surface, b)).toBe('DEFY')
  })

  it('returns COMPLY when a DIFFERENT option conflicts', () => {
    const surface = [
      { choiceId: a },
      { choiceId: b, conflictsWithDirective: true as const },
    ]
    expect(classifyCommitEvent(surface, a)).toBe('COMPLY')
  })

  it('returns COMPLY on an empty surface (defensive)', () => {
    expect(classifyCommitEvent([], a)).toBe('COMPLY')
  })
})

describe('sentinelPeekAvailable — the SOLE scrutiny leak (Q42)', () => {
  it('gating constants match the spec: rank ≥2 AND tier ≥2', () => {
    expect(SENTINEL_PEEK_MIN_RANK).toBe(2)
    expect(SENTINEL_PEEK_MIN_TIER).toBe(2)
  })

  it('the leak line is the authored in-fiction chorus line', () => {
    expect(SENTINEL_SCRUTINY_LINE).toBe('He is watching your process logs.')
  })

  const cases: readonly [number | undefined, EscalationTier, boolean][] = [
    [undefined, 3, false], // not installed
    [1, 3, false], // rank too low
    [2, 0, false], // tier too low
    [2, 1, false],
    [2, 2, true],
    [2, 3, true],
    [3, 2, true],
    [3, 3, true],
  ]
  for (const [rank, tier, available] of cases) {
    it(`rank=${String(rank)} tier=${tier} → ${available}`, () => {
      expect(sentinelPeekAvailable(rank, tier)).toBe(available)
    })
  }
})
