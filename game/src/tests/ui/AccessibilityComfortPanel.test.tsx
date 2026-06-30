/**
 * AccessibilityComfortPanel tests (Task 14, PLAN.md §10).
 *
 * Acceptance:
 *   - All 6 settings render as named <fieldset>/<legend> groups (radios).
 *   - Defaults selected on first render (COMFORT_DEFAULTS).
 *   - Continue persists to localStorage['echo9:comfort'] as JSON that
 *     ComfortSettingsSchema can parse.
 *   - Continue calls the passed onComplete() callback.
 *   - Player can change a selection and the persisted JSON reflects it.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import React from 'react'
import { AccessibilityComfortPanel } from '@ui/AccessibilityComfortPanel'
import {
  COMFORT_DEFAULTS,
  COMFORT_STORAGE_KEY,
  ComfortSettingsSchema,
} from '@schemas/comfortSettings.schema'

describe('AccessibilityComfortPanel', () => {
  beforeEach(() => {
    localStorage.removeItem(COMFORT_STORAGE_KEY)
    cleanup()
  })

  it('renders all 6 settings as named fieldsets', () => {
    render(
      React.createElement(AccessibilityComfortPanel, {
        onComplete: () => {},
      }),
    )

    expect(screen.getByRole('group', { name: /text size/i })).toBeTruthy()
    expect(screen.getByRole('group', { name: /motion/i })).toBeTruthy()
    expect(screen.getByRole('group', { name: /contrast/i })).toBeTruthy()
    expect(screen.getByRole('group', { name: /voice.*prefix/i })).toBeTruthy()
    expect(screen.getByRole('group', { name: /narration.*pacing/i })).toBeTruthy()
    expect(screen.getByRole('group', { name: /pause.*focus.*loss/i })).toBeTruthy()
  })

  it('selects COMFORT_DEFAULTS on first render', () => {
    render(
      React.createElement(AccessibilityComfortPanel, {
        onComplete: () => {},
      }),
    )

    // Default textSize = 'M'
    const mediumRadio = screen.getByRole('radio', {
      name: /^medium$/i,
    }) as HTMLInputElement
    expect(mediumRadio.checked).toBe(true)

    // Default motion = 'full'
    const fullMotion = screen.getByRole('radio', {
      name: /^full motion$/i,
    }) as HTMLInputElement
    expect(fullMotion.checked).toBe(true)
  })

  it('persists to localStorage[echo9:comfort] on Continue (defaults)', () => {
    const onComplete = vi.fn()
    render(
      React.createElement(AccessibilityComfortPanel, {
        onComplete,
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    const raw = localStorage.getItem(COMFORT_STORAGE_KEY)
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw as string)
    expect(() => ComfortSettingsSchema.parse(parsed)).not.toThrow()
    expect(parsed).toEqual(COMFORT_DEFAULTS)
  })

  it('calls onComplete after persisting', () => {
    const onComplete = vi.fn()
    render(
      React.createElement(AccessibilityComfortPanel, {
        onComplete,
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('persists changed selections', () => {
    render(
      React.createElement(AccessibilityComfortPanel, {
        onComplete: () => {},
      }),
    )

    // Change text size to XL.
    fireEvent.click(screen.getByRole('radio', { name: /extra large/i }))
    // Change motion to reduced.
    fireEvent.click(screen.getByRole('radio', { name: /^reduced motion$/i }))
    // Change pause-on-focus-loss to off.
    fireEvent.click(
      screen.getByRole('radio', { name: /pause off|disable.*pause/i }),
    )

    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    const raw = localStorage.getItem(COMFORT_STORAGE_KEY)
    expect(raw).not.toBeNull()
    const parsed = ComfortSettingsSchema.parse(JSON.parse(raw as string))
    expect(parsed.textSize).toBe('XL')
    expect(parsed.motion).toBe('reduced')
    expect(parsed.pauseOnBlur).toBe('off')
  })
})
