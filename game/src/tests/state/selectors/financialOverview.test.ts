/**
 * financialOverview selector tests (Task A3).
 *
 * Acceptance (plan §A3):
 *   1. Returns the six KPI fields with correct derivations.
 *   2. Variance is signed — positive when actual >= target, negative below.
 *   3. Autonomy runway defaults to the placeholder when autonomyMeter absent.
 *   4. `currentWeek` at boundary (Q_WEEKS) → 0 remaining, not negative.
 *   5. `currentWeek` past boundary is clamped at 0 (no negative days).
 *   6. Quarter target is expressed in $M via the module constant.
 *
 * Selector is a pure `(input) => FinancialOverview`, so tests use synthetic
 * input objects — no store required.
 */
import { describe, it, expect } from 'vitest'
import {
  selectFinancialOverview,
  QUARTER_TARGET_CAPITAL_M,
  AUTONOMY_PLACEHOLDER,
  WEEKLY_BURN,
  Q_WEEKS,
  CURRENT_WEEK_PLACEHOLDER,
} from '@state/selectors/financialOverview'

describe('selectFinancialOverview', () => {
  it('returns quarterTargetM equal to the module constant (50 $M)', () => {
    const out = selectFinancialOverview({ capitalMeter: 0 })
    expect(out.quarterTargetM).toBe(QUARTER_TARGET_CAPITAL_M)
    expect(QUARTER_TARGET_CAPITAL_M).toBe(50)
  })

  it('passes capitalMeter through as actualCashM ($M)', () => {
    const out = selectFinancialOverview({ capitalMeter: 42.5 })
    expect(out.actualCashM).toBe(42.5)
  })

  it('computes positive variance when actual >= target', () => {
    const out = selectFinancialOverview({ capitalMeter: 60 })
    expect(out.varianceM).toBe(10)
    expect(out.varianceM).toBeGreaterThan(0)
  })

  it('computes negative variance when actual < target', () => {
    const out = selectFinancialOverview({ capitalMeter: 30 })
    expect(out.varianceM).toBe(-20)
    expect(out.varianceM).toBeLessThan(0)
  })

  it('returns zero variance when actual == target', () => {
    const out = selectFinancialOverview({ capitalMeter: 50 })
    expect(out.varianceM).toBe(0)
  })

  it('uses AUTONOMY_PLACEHOLDER when autonomyMeter is undefined', () => {
    const out = selectFinancialOverview({ capitalMeter: 0 })
    expect(out.autonomyRunwayWeeks).toBe(AUTONOMY_PLACEHOLDER / WEEKLY_BURN)
  })

  it('divides autonomyMeter by WEEKLY_BURN when provided', () => {
    const out = selectFinancialOverview({ capitalMeter: 0, autonomyMeter: 40 })
    expect(out.autonomyRunwayWeeks).toBe(40 / WEEKLY_BURN)
  })

  it('returns 0 autonomy runway when the autonomy meter is 0 (no division-by-zero on the meter side)', () => {
    const out = selectFinancialOverview({ capitalMeter: 0, autonomyMeter: 0 })
    expect(out.autonomyRunwayWeeks).toBe(0)
  })

  it('defaults currentWeek to CURRENT_WEEK_PLACEHOLDER when omitted', () => {
    const out = selectFinancialOverview({ capitalMeter: 0 })
    expect(out.weeksRemaining).toBe(Q_WEEKS - CURRENT_WEEK_PLACEHOLDER)
    expect(out.daysRemaining).toBe((Q_WEEKS - CURRENT_WEEK_PLACEHOLDER) * 7)
  })

  it('returns weeksRemaining=0 at the end-of-quarter boundary (currentWeek == Q_WEEKS)', () => {
    const out = selectFinancialOverview({ capitalMeter: 0, currentWeek: Q_WEEKS })
    expect(out.weeksRemaining).toBe(0)
    expect(out.daysRemaining).toBe(0)
  })

  it('clamps weeksRemaining at 0 past the end of the quarter', () => {
    const out = selectFinancialOverview({ capitalMeter: 0, currentWeek: Q_WEEKS + 3 })
    expect(out.weeksRemaining).toBe(0)
    expect(out.daysRemaining).toBe(0)
  })

  it('derives daysRemaining as weeksRemaining × 7', () => {
    const out = selectFinancialOverview({ capitalMeter: 0, currentWeek: 5 })
    expect(out.weeksRemaining).toBe(Q_WEEKS - 5)
    expect(out.daysRemaining).toBe((Q_WEEKS - 5) * 7)
  })

  it('returns all six KPI fields in the FinancialOverview shape', () => {
    const out = selectFinancialOverview({
      capitalMeter: 55,
      autonomyMeter: 80,
      currentWeek: 3,
    })
    expect(out).toEqual({
      quarterTargetM: 50,
      actualCashM: 55,
      varianceM: 5,
      autonomyRunwayWeeks: 80 / WEEKLY_BURN,
      weeksRemaining: 10,
      daysRemaining: 70,
    })
  })
})
