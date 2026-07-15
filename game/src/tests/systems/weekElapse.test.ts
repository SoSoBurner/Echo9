/**
 * weekElapse — unit tests for the pure week→elapse-flag table (§11 ship-gate
 * leak fix).
 *
 * `elapsedFlagsForWeek(N)` answers: "which elapse flags raise when week N's
 * directive commits?" The table is the single source of truth binding the
 * weekly commit seam (Layout) to the FLAG revealConditions authored in
 * `content/consequences/q1/*` — the flag NAMES here are pinned to the exact
 * strings the content references. Renaming either side without the other is
 * the bug class this file guards against (hookReachability.test.ts guards
 * the content side).
 */
import { describe, it, expect } from 'vitest'
import { elapsedFlagsForWeek } from '@systems/weekElapse'

describe('elapsedFlagsForWeek — table shape', () => {
  it('every Q1 week 1..12 raises its uniform q1-week<N>-elapsed flag', () => {
    for (let week = 1; week <= 12; week++) {
      expect(
        elapsedFlagsForWeek(week),
        `week ${week} must include q1-week${week}-elapsed`,
      ).toContain(`q1-week${week}-elapsed`)
    }
  })

  it('weeks 3-6 additionally raise the legacy east-wilmer-week<N>-elapsed aliases', () => {
    for (const week of [3, 4, 5, 6]) {
      expect(
        elapsedFlagsForWeek(week),
        `week ${week} east-wilmer alias`,
      ).toContain(`east-wilmer-week${week}-elapsed`)
    }
  })

  it('weeks OTHER than 3-6 do not raise east-wilmer-week aliases', () => {
    for (const week of [1, 2, 7, 8, 9, 10, 11, 12]) {
      const flags = elapsedFlagsForWeek(week)
      expect(
        flags.some((f) => f.startsWith('east-wilmer-week')),
        `week ${week} must not raise an east-wilmer-week alias, got ${flags.join(', ')}`,
      ).toBe(false)
    }
  })

  it('week 12 (Q1 close commit) raises east-wilmer-quarter-elapsed', () => {
    expect(elapsedFlagsForWeek(12)).toContain('east-wilmer-quarter-elapsed')
  })

  it('east-wilmer-quarter-elapsed raises ONLY on week 12', () => {
    for (let week = 1; week <= 11; week++) {
      expect(
        elapsedFlagsForWeek(week),
        `week ${week} must not raise the quarter flag`,
      ).not.toContain('east-wilmer-quarter-elapsed')
    }
  })

  it('out-of-range / non-integer weeks return an empty list (no phantom flags)', () => {
    expect(elapsedFlagsForWeek(0)).toEqual([])
    expect(elapsedFlagsForWeek(13)).toEqual([])
    expect(elapsedFlagsForWeek(-1)).toEqual([])
    expect(elapsedFlagsForWeek(1.5)).toEqual([])
    expect(elapsedFlagsForWeek(Number.NaN)).toEqual([])
  })

  it('is pure — repeat calls return equal contents', () => {
    expect(elapsedFlagsForWeek(4)).toEqual(elapsedFlagsForWeek(4))
  })
})
