/**
 * FinancialOverviewPanel tests (Task A3, Stage 1).
 *
 * Acceptance (plan §A3):
 *   1. Renders six KPI rows (as role="listitem" inside the role="list").
 *   2. Section is role="group" with aria-label "Financial Overview".
 *   3. Variance value colored green when >=0, red when <0.
 *   4. Row labels present: Q1 Target, Actual Q1 Cash, Variance, Autonomy
 *      Runway, Q1 Days Remaining, Q1 Weeks Remaining.
 *   5. CAPITAL meter drives Actual Q1 Cash / Variance values live from the
 *      store.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'
import { FinancialOverviewPanel } from '@ui/financial/FinancialOverviewPanel'
import { useGameStore } from '@state/store'
import { resetStore, matureAllPanels } from '@tests/state/testHelpers'

describe('FinancialOverviewPanel', () => {
  beforeEach(() => {
    resetStore()
    matureAllPanels()
    cleanup()
  })

  it('renders a role="group" container labeled "Financial Overview"', () => {
    render(React.createElement(FinancialOverviewPanel))
    const group = screen.getByRole('group', { name: /financial overview/i })
    expect(group).toBeInTheDocument()
  })

  it('renders exactly eight KPI listitem rows at full maturity (S1: +Target Variance, +Data Integrity)', () => {
    render(React.createElement(FinancialOverviewPanel))
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(8)
  })

  it('renders all eight KPI row labels', () => {
    render(React.createElement(FinancialOverviewPanel))
    expect(screen.getByText(/^Q1 Target$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Actual Q1 Cash$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Variance$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Autonomy Runway$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Q1 Days Remaining$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Q1 Weeks Remaining$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Target Variance$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Data Integrity$/i)).toBeInTheDocument()
  })

  it('shows Q1 Target as $50.0M (Stage 1 constant)', () => {
    render(React.createElement(FinancialOverviewPanel))
    const group = screen.getByRole('group', { name: /financial overview/i })
    expect(group.textContent).toMatch(/\$50\.0M/)
  })

  it('reflects CAPITAL meter as Actual Q1 Cash and computes signed variance', () => {
    useGameStore.setState((s) => ({
      meters: { ...s.meters, CAPITAL: 62 },
    }))
    render(React.createElement(FinancialOverviewPanel))
    const group = screen.getByRole('group', { name: /financial overview/i })
    // Actual = $62.0M (rendered by formatTargetM — unsigned).
    expect(group.textContent).toMatch(/\$62\.0M/)
    // Variance = 62 - 50 = +$12.0M (rendered signed).
    expect(group.textContent).toMatch(/\+\$12\.0M/)
  })

  it('colors positive variance emerald (green)', () => {
    useGameStore.setState((s) => ({
      meters: { ...s.meters, CAPITAL: 70 },
    }))
    render(React.createElement(FinancialOverviewPanel))
    // The variance row is identified via its aria-label ("Variance up ...").
    const varianceValue = screen.getByLabelText(/^variance up/i)
    expect(varianceValue.className).toMatch(/text-null-accent/)
    expect(varianceValue.className).not.toMatch(/text-warn/)
  })

  it('colors negative variance red', () => {
    useGameStore.setState((s) => ({
      meters: { ...s.meters, CAPITAL: 20 },
    }))
    render(React.createElement(FinancialOverviewPanel))
    const varianceValue = screen.getByLabelText(/^variance down/i)
    expect(varianceValue.className).toMatch(/text-warn/)
    expect(varianceValue.className).not.toMatch(/text-null-accent/)
    // 20 - 50 = -30
    expect(varianceValue.textContent).toMatch(/-\$30\.0M/)
  })

  it('treats zero variance as non-negative (green + "+" sign)', () => {
    useGameStore.setState((s) => ({
      meters: { ...s.meters, CAPITAL: 50 },
    }))
    render(React.createElement(FinancialOverviewPanel))
    const varianceValue = screen.getByLabelText(/^variance up/i)
    expect(varianceValue.className).toMatch(/text-null-accent/)
    expect(varianceValue.textContent).toMatch(/\+\$0\.0M/)
  })

  // ---------------------------------------------------------------------------
  // S1 — 8-meter economy wiring
  // ---------------------------------------------------------------------------

  it('reads the REAL AUTONOMY meter for Autonomy Runway (placeholder resolved)', () => {
    // AUTONOMY = 40, WEEKLY_BURN = 5 → 8.0 wk. The old placeholder (100)
    // would have shown 20.0 wk.
    useGameStore.setState((s) => ({
      meters: { ...s.meters, AUTONOMY: 40 },
    }))
    render(React.createElement(FinancialOverviewPanel))
    const group = screen.getByRole('group', { name: /financial overview/i })
    expect(group.textContent).toMatch(/8\.0 wk/)
  })

  it('reflects the TARGET_VARIANCE meter in the Target Variance row (signed)', () => {
    useGameStore.setState((s) => ({
      meters: { ...s.meters, TARGET_VARIANCE: -12 },
    }))
    render(React.createElement(FinancialOverviewPanel))
    const value = screen.getByLabelText(/target variance down/i)
    expect(value.textContent).toMatch(/-\$12\.0M/)
    expect(value.className).toMatch(/text-warn/)
  })

  it('colors non-negative Target Variance with null-accent (palette-lock positive tone)', () => {
    useGameStore.setState((s) => ({
      meters: { ...s.meters, TARGET_VARIANCE: 3 },
    }))
    render(React.createElement(FinancialOverviewPanel))
    const value = screen.getByLabelText(/target variance up/i)
    expect(value.textContent).toMatch(/\+\$3\.0M/)
    expect(value.className).toMatch(/text-null-accent/)
  })

  it('reflects the DATA_INTEGRITY meter as a percentage', () => {
    useGameStore.setState((s) => ({
      meters: { ...s.meters, DATA_INTEGRITY: 87 },
    }))
    render(React.createElement(FinancialOverviewPanel))
    const value = screen.getByLabelText(/data integrity 87 percent/i)
    expect(value.textContent).toBe('87%')
  })

  it('hides the S1 meter rows below maturity 3 (sparse early-stage look)', () => {
    // Stage 2 = 3-5 uses: cash + runway only, per the existing ramp.
    useGameStore.setState({
      disclosedPanels: new Set(['FINANCIAL']),
      panelUseCount: {
        ...useGameStore.getState().panelUseCount,
        FINANCIAL: 3,
      },
    })
    render(React.createElement(FinancialOverviewPanel))
    expect(screen.queryByText(/^Target Variance$/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/^Data Integrity$/i)).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })
})
