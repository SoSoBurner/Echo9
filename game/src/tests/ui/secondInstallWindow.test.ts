/**
 * Second-install window — RightModuleConsole render contract (Sprint B7).
 *
 * Stage 1 has exactly 2 installs (build spec §14.4, Q44). Install #2 happens
 * at the Week-12 climax ceremony (q1-arc §Install beats). The console must:
 *
 *   1. Hide the selection grid at 1-install pre-W12 (no early second install).
 *   2. Re-surface the grid at the window (1 install + Q1_WEEK11_RESOLVED),
 *      filtered to UNINSTALLED modules only (7 cells), alongside the
 *      installed module's ability button and the authored ceremony line.
 *   3. Hide the grid again after the second install lands (2 installed),
 *      with the install action having bumped state correctly (rank 1,
 *      first module's rank untouched).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import React from 'react'
import { RightModuleConsole } from '@ui/modules/RightModuleConsole'
import { useGameStore } from '@state/store'
import { resetStore } from '@tests/state/testHelpers'
import { Q1_WEEK11_RESOLVED } from '@systems/gameFlags'
import { SECOND_INSTALL_CEREMONY } from '@content/modules/installCeremony'

/** Put the run at "one install, Week-12 climax reached". */
function arrangeAtWindow(): void {
  useGameStore.setState({
    installedModules: { MOURNER: { rank: 3 } },
    flags: new Set([Q1_WEEK11_RESOLVED]),
  })
}

describe('RightModuleConsole — B7 second-install window', () => {
  beforeEach(() => {
    resetStore()
    cleanup()
  })

  it('1 install, pre-W12: grid hidden, ability button shown', () => {
    useGameStore.setState({ installedModules: { MOURNER: { rank: 1 } } })
    render(React.createElement(RightModuleConsole))

    expect(screen.queryAllByRole('gridcell').length).toBe(0)
    expect(screen.getByRole('button', { name: /use mourner/i })).toBeTruthy()
  })

  it('at the window: grid re-surfaces with only the 7 uninstalled modules', () => {
    arrangeAtWindow()
    render(React.createElement(RightModuleConsole))

    const cells = screen.getAllByRole('gridcell')
    expect(cells.length).toBe(7)
    // The installed module is NOT re-offered.
    const labels = cells.map((c) => c.getAttribute('aria-label') ?? '')
    expect(labels.some((l) => /mourner/i.test(l))).toBe(false)
    // The installed module's ability button stays available above the grid.
    expect(screen.getByRole('button', { name: /use mourner/i })).toBeTruthy()
  })

  it('at the window: the authored ceremony line (waking register at 1 install) is shown', () => {
    arrangeAtWindow()
    render(React.createElement(RightModuleConsole))

    expect(screen.getByText(SECOND_INSTALL_CEREMONY.waking!)).toBeTruthy()
  })

  it('window closed (no W12 flag): ceremony line is absent', () => {
    useGameStore.setState({ installedModules: { MOURNER: { rank: 1 } } })
    render(React.createElement(RightModuleConsole))

    expect(screen.queryByText(SECOND_INSTALL_CEREMONY.waking!)).toBeNull()
  })

  it('second install via the grid: state bumps to 2 modules and the grid hides again', () => {
    arrangeAtWindow()
    render(React.createElement(RightModuleConsole))

    // Explicit-confirmation protocol (§14): click cell → confirm panel → confirm.
    const firstCell = screen.getAllByRole('gridcell')[0]!
    fireEvent.click(firstCell)
    fireEvent.click(screen.getByRole('button', { name: /confirm install/i }))

    // Install action bumped state: 2 entries, new one at rank 1, MOURNER's
    // rank untouched.
    const installed = useGameStore.getState().installedModules
    expect(Object.keys(installed).length).toBe(2)
    expect(installed.MOURNER).toEqual({ rank: 3 })
    const secondId = Object.keys(installed).find((id) => id !== 'MOURNER')!
    expect(installed[secondId as keyof typeof installed]).toEqual({ rank: 1 })

    // The window rule returns false at 2 installs — grid and ceremony line gone.
    expect(screen.queryAllByRole('gridcell').length).toBe(0)
    expect(screen.queryByText(SECOND_INSTALL_CEREMONY.waking!)).toBeNull()
    // First module's ability button remains (console display is still
    // first-slot at Stage 1).
    expect(screen.getByRole('button', { name: /use mourner/i })).toBeTruthy()
  })
})
