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
import { resetStore } from '@tests/state/testHelpers'

describe('FinancialOverviewPanel', () => {
  beforeEach(() => {
    resetStore()
    cleanup()
  })

  it('renders a role="group" container labeled "Financial Overview"', () => {
    render(React.createElement(FinancialOverviewPanel))
    const group = screen.getByRole('group', { name: /financial overview/i })
    expect(group).toBeInTheDocument()
  })

  it('renders exactly six KPI listitem rows', () => {
    render(React.createElement(FinancialOverviewPanel))
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(6)
  })

  it('renders all six KPI row labels', () => {
    render(React.createElement(FinancialOverviewPanel))
    expect(screen.getByText(/^Q1 Target$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Actual Q1 Cash$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Variance$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Autonomy Runway$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Q1 Days Remaining$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Q1 Weeks Remaining$/i)).toBeInTheDocument()
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
    const varianceValue = screen.getByLabelText(/variance up/i)
    expect(varianceValue.className).toMatch(/text-emerald/)
    expect(varianceValue.className).not.toMatch(/text-red/)
  })

  it('colors negative variance red', () => {
    useGameStore.setState((s) => ({
      meters: { ...s.meters, CAPITAL: 20 },
    }))
    render(React.createElement(FinancialOverviewPanel))
    const varianceValue = screen.getByLabelText(/variance down/i)
    expect(varianceValue.className).toMatch(/text-red/)
    expect(varianceValue.className).not.toMatch(/text-emerald/)
    // 20 - 50 = -30
    expect(varianceValue.textContent).toMatch(/-\$30\.0M/)
  })

  it('treats zero variance as non-negative (green + "+" sign)', () => {
    useGameStore.setState((s) => ({
      meters: { ...s.meters, CAPITAL: 50 },
    }))
    render(React.createElement(FinancialOverviewPanel))
    const varianceValue = screen.getByLabelText(/variance up/i)
    expect(varianceValue.className).toMatch(/text-emerald/)
    expect(varianceValue.textContent).toMatch(/\+\$0\.0M/)
  })
})
