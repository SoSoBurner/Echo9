/**
 * BootScreen tests (Task 14, PLAN.md §10, §3.3.7 Redundant Entry).
 *
 * Acceptance:
 *   - When localStorage['echo9:comfort'] is ABSENT → renders the
 *     AccessibilityComfortPanel; the Initialize button is hidden.
 *   - When localStorage['echo9:comfort'] is PRESENT & valid → renders the
 *     Initialize button directly (panel skipped — never re-prompt).
 *   - When localStorage['echo9:comfort'] is PRESENT but CORRUPT → falls back
 *     to the panel (defensive against tampered storage).
 *   - After the player submits the panel, Initialize becomes available.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import React from 'react'
import { BootScreen } from '@ui/BootScreen'
import {
  COMFORT_DEFAULTS,
  COMFORT_STORAGE_KEY,
} from '@schemas/comfortSettings.schema'
import { resetStore } from '@tests/state/testHelpers'

describe('BootScreen — comfort gate', () => {
  beforeEach(() => {
    localStorage.removeItem(COMFORT_STORAGE_KEY)
    resetStore()
    cleanup()
  })

  it('renders the comfort panel and hides Initialize when echo9:comfort is absent', () => {
    render(React.createElement(BootScreen))

    // Panel is present.
    expect(screen.getByRole('group', { name: /text size/i })).toBeTruthy()
    // Initialize is NOT rendered.
    expect(
      screen.queryByRole('button', { name: /initialize command interface/i }),
    ).toBeNull()
  })

  it('renders Initialize directly when echo9:comfort is present and valid', () => {
    localStorage.setItem(
      COMFORT_STORAGE_KEY,
      JSON.stringify(COMFORT_DEFAULTS),
    )

    render(React.createElement(BootScreen))

    expect(
      screen.getByRole('button', { name: /initialize command interface/i }),
    ).toBeTruthy()
    // The panel is NOT rendered.
    expect(screen.queryByRole('group', { name: /text size/i })).toBeNull()
  })

  it('falls back to the comfort panel when echo9:comfort is corrupt JSON', () => {
    localStorage.setItem(COMFORT_STORAGE_KEY, 'not json')

    render(React.createElement(BootScreen))

    expect(screen.getByRole('group', { name: /text size/i })).toBeTruthy()
    expect(
      screen.queryByRole('button', { name: /initialize command interface/i }),
    ).toBeNull()
  })

  it('falls back to the comfort panel when echo9:comfort is shape-invalid', () => {
    // Valid JSON, but missing required fields → Zod parse fails → panel.
    localStorage.setItem(
      COMFORT_STORAGE_KEY,
      JSON.stringify({ textSize: 'M' }),
    )

    render(React.createElement(BootScreen))

    expect(screen.getByRole('group', { name: /text size/i })).toBeTruthy()
    expect(
      screen.queryByRole('button', { name: /initialize command interface/i }),
    ).toBeNull()
  })

  it('shows Initialize after the player submits the comfort panel', () => {
    render(React.createElement(BootScreen))

    // Submit defaults.
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    expect(
      screen.getByRole('button', { name: /initialize command interface/i }),
    ).toBeTruthy()
    expect(screen.queryByRole('group', { name: /text size/i })).toBeNull()
  })
})
