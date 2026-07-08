/**
 * hudDisclosure — tests for the pure disclosure helpers.
 *
 * These are the cheapest tests in the tutorial suite: table-driven,
 * side-effect-free, and pin every threshold on the maturity ramp. If the
 * plan's "1 / 3 / 6" thresholds are ever retuned (e.g., dropping stage 3 to
 * 5 uses), the ramp table below is the one place that must change.
 */
import { describe, it, expect } from 'vitest'
import {
  PANEL_IDS,
  panelMaturity,
  type Maturity,
  type PanelId,
} from '@systems/tutorial/hudDisclosure'

describe('panelMaturity', () => {
  it.each<[useCount: number, maturity: Maturity]>([
    // Zero uses still returns stage 1 — the panel is disclosed but not yet
    // exercised. It cannot regress below stage 1 once it is visible.
    [0, 1],
    [1, 1],
    [2, 1],
    // Stage 2 threshold: +3 uses.
    [3, 2],
    [4, 2],
    [5, 2],
    // Stage 3 threshold: +6 uses.
    [6, 3],
    [7, 3],
    [99, 3],
  ])('useCount %d → maturity %d', (count, expected) => {
    expect(panelMaturity(count)).toBe(expected)
  })

  it('is total across the maturity codomain (no undefined path)', () => {
    // Sanity: every count in a broad range maps to a Maturity that lives in
    // the {1,2,3} triple. Guards against a future refactor that introduces
    // an intermediate NaN or 0 return by accident.
    for (let n = 0; n < 20; n++) {
      const m = panelMaturity(n)
      expect([1, 2, 3]).toContain(m)
    }
  })
})

describe('PANEL_IDS', () => {
  it('lists every PanelId exactly once', () => {
    // The union PanelId has 9 members; PANEL_IDS must match that cardinality
    // and be duplicate-free, otherwise the layout iterator will double-render
    // a panel or silently skip one.
    expect(PANEL_IDS.length).toBe(9)
    expect(new Set<PanelId>(PANEL_IDS).size).toBe(PANEL_IDS.length)
  })

  it('places DIRECTIVE first (matches awakening sequence)', () => {
    // The awakening sequence discloses DIRECTIVE first; keeping it at index 0
    // in the canonical list means any code iterating PANEL_IDS in disclosure
    // order gets it "for free" without a special case.
    expect(PANEL_IDS[0]).toBe('DIRECTIVE')
  })
})
