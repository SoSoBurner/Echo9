/**
 * TopBar variance + Silas approval tests (Task A1).
 *
 * Acceptance (plan §A1):
 *   1. Target Variance KPI renders — signed value formatted "$X.YM".
 *   2. Positive variance → green class ("text-emerald-*").
 *   3. Negative variance → red class ("text-red-*").
 *   4. Silas Approval KPI renders the store's silasApproval value + "%".
 *
 * Reads `phase`, `meters.CAPITAL`, and `silasApproval` from the store; the
 * variance is `capitalMeter - QUARTER_TARGET_CAPITAL` (target=50 in Stage 1).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import React from 'react'
import { TopBar } from '@ui/topbar/TopBar'
import { useGameStore } from '@state/store'
import { resetStore } from '@tests/state/testHelpers'

describe('TopBar — Target Variance + Silas Approval', () => {
  beforeEach(() => {
    resetStore()
    cleanup()
  })

  it('renders the Target Variance group and formats the value in $XM', () => {
    useGameStore.setState((s) => ({
      meters: { ...s.meters, CAPITAL: 53.2 },
    }))
    render(React.createElement(TopBar))

    const group = screen.getByRole('group', { name: /target variance/i })
    // 53.2 - 50 = +3.2
    expect(group.textContent).toMatch(/\+\$3\.2M/)
  })

  it('renders a positive variance in the emerald (green) class', () => {
    useGameStore.setState((s) => ({
      meters: { ...s.meters, CAPITAL: 60 },
    }))
    render(React.createElement(TopBar))

    const group = screen.getByRole('group', { name: /target variance/i })
    const value = group.querySelector('span:last-child')
    expect(value?.className).toMatch(/text-emerald/)
    expect(value?.className).not.toMatch(/text-red/)
  })

  it('renders a negative variance in the red class', () => {
    useGameStore.setState((s) => ({
      meters: { ...s.meters, CAPITAL: 40 },
    }))
    render(React.createElement(TopBar))

    const group = screen.getByRole('group', { name: /target variance/i })
    const value = group.querySelector('span:last-child')
    expect(value?.className).toMatch(/text-red/)
    expect(value?.className).not.toMatch(/text-emerald/)
    expect(group.textContent).toMatch(/-\$10\.0M/)
  })

  it('renders zero variance as +$0.0M (non-negative sign)', () => {
    useGameStore.setState((s) => ({
      meters: { ...s.meters, CAPITAL: 50 },
    }))
    render(React.createElement(TopBar))

    const group = screen.getByRole('group', { name: /target variance/i })
    expect(group.textContent).toMatch(/\+\$0\.0M/)
  })

  it('renders the Silas Approval group with percent from the store', () => {
    useGameStore.setState({ silasApproval: 87 })
    render(React.createElement(TopBar))

    const group = screen.getByRole('group', { name: /silas approval/i })
    expect(group.textContent).toMatch(/87%/)
  })

  it('reflects a live approval update', () => {
    render(React.createElement(TopBar))
    const initial = screen.getByRole('group', { name: /silas approval/i })
    expect(initial.textContent).toMatch(/100%/)

    act(() => {
      useGameStore.getState().setSilasApproval(42)
    })
    const after = screen.getByRole('group', { name: /silas approval/i })
    expect(after.textContent).toMatch(/42%/)
  })

  it('clamps setSilasApproval below 0 and above 100', () => {
    useGameStore.getState().setSilasApproval(-5)
    expect(useGameStore.getState().silasApproval).toBe(0)
    useGameStore.getState().setSilasApproval(250)
    expect(useGameStore.getState().silasApproval).toBe(100)
  })
})
