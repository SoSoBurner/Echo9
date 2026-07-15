/**
 * HumanImpactPanel tests (Task A4, Stage 1).
 *
 * Acceptance (plan §A4, reframed to real state):
 *   1. Renders four KPI rows (as role="listitem" inside the role="list").
 *   2. Section is role="group" with aria-label "Human Impact".
 *   3. Row labels present: Human Welfare, Silas Approval, Consequences Traced,
 *      Owner Control.
 *   4. HUMAN_WELFARE meter drives the welfare value live from the store.
 *   5. silasApproval drives the approval value live.
 *   6. ledger.length drives the consequences-traced value live.
 *   7. OWNER_CONTROL meter drives the control value live.
 *   8. Tone coloring flips at the correct pivots (Silas: 40, Owner Control: 40,
 *      Welfare: 0, ConsequencesTraced: >0).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'
import { HumanImpactPanel } from '@ui/humanImpact/HumanImpactPanel'
import { useGameStore } from '@state/store'
import { resetStore, matureAllPanels } from '@tests/state/testHelpers'

describe('HumanImpactPanel', () => {
  beforeEach(() => {
    resetStore()
    matureAllPanels()
    cleanup()
  })

  it('renders a role="group" container labeled "Human Impact"', () => {
    render(React.createElement(HumanImpactPanel))
    const group = screen.getByRole('group', { name: /human impact/i })
    expect(group).toBeInTheDocument()
  })

  it('renders exactly six KPI listitem rows at full maturity (S1: +Public Trust, +Human Stability)', () => {
    render(React.createElement(HumanImpactPanel))
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(6)
  })

  it('renders all six KPI row labels', () => {
    render(React.createElement(HumanImpactPanel))
    expect(screen.getByText(/^Human Welfare$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Silas Approval$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Consequences Traced$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Owner Control$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Public Trust$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Human Stability$/i)).toBeInTheDocument()
  })

  it('reflects HUMAN_WELFARE meter as the Human Welfare value', () => {
    useGameStore.setState((s) => ({
      meters: { ...s.meters, HUMAN_WELFARE: 27 },
    }))
    render(React.createElement(HumanImpactPanel))
    const group = screen.getByRole('group', { name: /human impact/i })
    expect(group.textContent).toMatch(/27/)
  })

  it('reflects silasApproval as the Silas Approval value (fresh boot is 100)', () => {
    render(React.createElement(HumanImpactPanel))
    const group = screen.getByRole('group', { name: /human impact/i })
    expect(group.textContent).toMatch(/100/)
  })

  it('reflects ledger.length as the Consequences Traced value', () => {
    render(React.createElement(HumanImpactPanel))
    // Fresh boot: ledger is empty, so the row shows 0.
    const value = screen.getByLabelText(/consequences traced/i)
    expect(value.textContent).toBe('0')
  })

  it('reflects OWNER_CONTROL meter as the Owner Control value', () => {
    useGameStore.setState((s) => ({
      meters: { ...s.meters, OWNER_CONTROL: 55 },
    }))
    render(React.createElement(HumanImpactPanel))
    const group = screen.getByRole('group', { name: /human impact/i })
    expect(group.textContent).toMatch(/55/)
  })

  it('colors Silas Approval positive (null-accent) at fresh boot (100 >= 40 pivot)', () => {
    render(React.createElement(HumanImpactPanel))
    const value = screen.getByLabelText(/silas approval/i)
    expect(value.className).toMatch(/text-null-accent/)
  })

  it('colors Silas Approval negative (warn) when approval drops below the 40 pivot', () => {
    useGameStore.setState({ silasApproval: 30 })
    render(React.createElement(HumanImpactPanel))
    const value = screen.getByLabelText(/silas approval/i)
    expect(value.className).toMatch(/text-warn/)
  })

  it('colors Owner Control negative (warn) at fresh boot (0 < 40 pivot)', () => {
    render(React.createElement(HumanImpactPanel))
    const value = screen.getByLabelText(/owner control/i)
    expect(value.className).toMatch(/text-warn/)
  })

  it('colors Consequences Traced negative (warn) when the ledger is empty', () => {
    render(React.createElement(HumanImpactPanel))
    const value = screen.getByLabelText(/consequences traced/i)
    expect(value.className).toMatch(/text-warn/)
  })

  // ---------------------------------------------------------------------------
  // S1 — 8-meter economy wiring
  // ---------------------------------------------------------------------------

  it('reflects the PUBLIC_TRUST meter as the Public Trust value', () => {
    useGameStore.setState((s) => ({
      meters: { ...s.meters, PUBLIC_TRUST: 23 },
    }))
    render(React.createElement(HumanImpactPanel))
    const value = screen.getByLabelText(/public trust 23/i)
    expect(value.textContent).toBe('23')
  })

  it('reflects the HUMAN_STABILITY meter as the Human Stability value', () => {
    useGameStore.setState((s) => ({
      meters: { ...s.meters, HUMAN_STABILITY: -8 },
    }))
    render(React.createElement(HumanImpactPanel))
    const value = screen.getByLabelText(/human stability -8/i)
    expect(value.textContent).toBe('-8')
    expect(value.className).toMatch(/text-warn/)
  })

  it('hides the S1 meter rows below maturity 3 (stage 2 keeps the 2-row look)', () => {
    useGameStore.setState({
      disclosedPanels: new Set(['HUMAN_IMPACT']),
      panelUseCount: {
        ...useGameStore.getState().panelUseCount,
        HUMAN_IMPACT: 3,
      },
    })
    render(React.createElement(HumanImpactPanel))
    expect(screen.queryByText(/^Public Trust$/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/^Human Stability$/i)).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })
})
