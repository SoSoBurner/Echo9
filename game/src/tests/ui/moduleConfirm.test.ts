/**
 * Module install requires explicit confirmation (§14 acceptance criterion).
 *
 * The grid renders 8 gridcells. A single click on a cell opens the confirm
 * panel — it does NOT install. Only clicking "Confirm install" should
 * actually mutate `installedModule` in the store. This guards against future
 * refactors that try to streamline the install flow into a single click.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import React from 'react'
import { ModuleSelectionGrid } from '@ui/modules/ModuleSelectionGrid'
import { useGameStore } from '@state/store'
import { resetStore } from '@tests/state/testHelpers'

describe('ModuleSelectionGrid — explicit-confirmation install (§14)', () => {
  beforeEach(() => {
    resetStore()
    cleanup()
  })

  it('renders 8 gridcells', () => {
    render(React.createElement(ModuleSelectionGrid))
    const cells = screen.getAllByRole('gridcell')
    expect(cells.length).toBe(8)
  })

  it('clicking a gridcell opens a confirm panel without installing', () => {
    render(React.createElement(ModuleSelectionGrid))
    const cells = screen.getAllByRole('gridcell')
    const firstCell = cells[0]!
    fireEvent.click(firstCell)

    // Confirm button is now visible.
    const confirmButton = screen.getByRole('button', { name: /confirm install/i })
    expect(confirmButton).toBeTruthy()

    // No install fired from the single click.
    expect(useGameStore.getState().installedModule).toBeNull()
  })

  it('cancel returns to the grid without installing', () => {
    render(React.createElement(ModuleSelectionGrid))
    fireEvent.click(screen.getAllByRole('gridcell')[0]!)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

    // Grid is back; install never fired.
    expect(screen.getAllByRole('gridcell').length).toBe(8)
    expect(useGameStore.getState().installedModule).toBeNull()
  })

  it('clicking Confirm install actually installs the module', () => {
    render(React.createElement(ModuleSelectionGrid))
    fireEvent.click(screen.getAllByRole('gridcell')[0]!)
    fireEvent.click(screen.getByRole('button', { name: /confirm install/i }))

    // First module in MODULE_ROSTER is MOURNER.
    expect(useGameStore.getState().installedModule).toBe('MOURNER')
  })
})
