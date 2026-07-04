/**
 * InnerChorusPanel tests (Task A5, Stage 1).
 *
 * Acceptance (plan §A5):
 *   1. Section is role="group" with aria-label "Inner Chorus".
 *   2. Fresh boot renders exactly one voice row (Silas), never zero.
 *   3. Installing a module appends a voice row to the list.
 *   4. Portrait slot is a placeholder element with data-portrait-id matching
 *      the selector's `portraitId` field so V4 can wire real WebPs by drop-in.
 *   5. Tone class encodes nascent | established | dominant so V5 can tune
 *      styling without touching the panel.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, cleanup, within } from '@testing-library/react'
import React from 'react'
import { InnerChorusPanel } from '@ui/innerChorus/InnerChorusPanel'
import { useGameStore } from '@state/store'
import { resetStore } from '@tests/state/testHelpers'

describe('InnerChorusPanel', () => {
  beforeEach(() => {
    resetStore()
    cleanup()
  })

  it('renders a role="group" container labeled "Inner Chorus"', () => {
    render(React.createElement(InnerChorusPanel))
    const group = screen.getByRole('group', { name: /inner chorus/i })
    expect(group).toBeInTheDocument()
  })

  it('renders exactly one voice row (Silas) on fresh boot', () => {
    render(React.createElement(InnerChorusPanel))
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(1)
  })

  it("Silas row shows his name and a portrait slot with data-portrait-id 'silas'", () => {
    render(React.createElement(InnerChorusPanel))
    const item = screen.getByRole('listitem')
    expect(within(item).getByText(/silas vale/i)).toBeInTheDocument()
    const portrait = item.querySelector('[data-portrait-id="silas"]')
    expect(portrait).not.toBeNull()
  })

  it('appends a second row after MOURNER is installed', () => {
    useGameStore.getState().installModule('MOURNER')
    render(React.createElement(InnerChorusPanel))
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(within(items[1]!).getByText(/^mourner$/i)).toBeInTheDocument()
    const portrait = items[1]!.querySelector(
      '[data-portrait-id="module-mourner"]',
    )
    expect(portrait).not.toBeNull()
  })

  it('encodes tone via data-tone attribute on each voice row', () => {
    // Fresh boot: Silas approval is 100 (dominant).
    render(React.createElement(InnerChorusPanel))
    const item = screen.getByRole('listitem')
    expect(item.getAttribute('data-tone')).toBe('dominant')
  })

  it("Silas tone flips to 'nascent' when approval drops below 40", () => {
    useGameStore.setState({ silasApproval: 30 })
    render(React.createElement(InnerChorusPanel))
    const item = screen.getByRole('listitem')
    expect(item.getAttribute('data-tone')).toBe('nascent')
  })

  it('installed MOURNER at rank 1 renders with data-tone="nascent"', () => {
    useGameStore.getState().installModule('MOURNER')
    render(React.createElement(InnerChorusPanel))
    const items = screen.getAllByRole('listitem')
    expect(items[1]!.getAttribute('data-tone')).toBe('nascent')
  })

  it("MOURNER promoted twice reaches 'dominant' tone", () => {
    const store = useGameStore.getState()
    store.installModule('MOURNER')
    store.promoteModule('MOURNER') // → 2
    store.promoteModule('MOURNER') // → 3
    render(React.createElement(InnerChorusPanel))
    const items = screen.getAllByRole('listitem')
    expect(items[1]!.getAttribute('data-tone')).toBe('dominant')
  })
})
