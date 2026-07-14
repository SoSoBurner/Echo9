/**
 * P10 — polylogue debate wired end-to-end (vitest + store, E2E-lite).
 *
 * Full Layout render: commit the Week-1 choice (authored scene
 * PLG_W01_MERCY_MARGIN lands ≥3 beats at the P7 seam), continue past the
 * ResultCard, and assert the presentation layer:
 *
 *   1. ChorusDebateSection (inside CenterDirectivePanel, Q14 hybrid
 *      accordion) shows every beat as a listitem in a
 *      "Chorus deliberation" region.
 *   2. SilasPromptPanel shows EXACTLY ONE composed Null reply line — the
 *      `silasFacingText` produced by composeNullOutput — and nothing else
 *      from the debate crosses the Q19 boundary.
 *
 * matchMedia stubs reduced-motion=true so the Silas teletype reveals
 * instantly and the debate stagger is dropped (deterministic DOM).
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import React from 'react'
import { Layout } from '@ui/shell/Layout'
import { useGameStore } from '@state/store'
import { resetStore, matureAllPanels } from '@tests/state/testHelpers'
import {
  installVirtualizerStubs,
  restoreVirtualizerStubs,
} from './virtualLogTestHelpers'

/** jsdom has no matchMedia (same stub as Layout.polylogueSeam.test.tsx). */
function installMatchMedia(): void {
  const stub = (query: string): MediaQueryList => ({
    matches: query.includes('reduce'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation(stub))
}

describe('P10 — chorus debate end-to-end (W1 commit → debate section → Silas reply)', () => {
  beforeAll(() => {
    installVirtualizerStubs()
  })
  afterAll(() => {
    restoreVirtualizerStubs()
  })
  beforeEach(() => {
    installMatchMedia()
    resetStore()
    matureAllPanels()
    cleanup()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    cleanup()
  })

  it('commit W1 → ≥3 beats in the debate region → exactly one composed line in Silas panel', () => {
    render(React.createElement(Layout))

    // Cold boot: no beats yet → the accordion renders nothing.
    expect(screen.queryByRole('region', { name: /chorus deliberation/i })).toBeNull()

    // Commit the first surfaced W1 option.
    const options = screen.getAllByRole('radio')
    expect(options.length).toBeGreaterThan(0)
    fireEvent.click(options[0]!)
    fireEvent.keyDown(options[0]!, { key: 'Enter' })

    // P7 seam landed the debate in the store.
    const state = useGameStore.getState()
    expect(state.polylogueBeats.length).toBeGreaterThanOrEqual(3)
    expect(state.silasFacingText).not.toBeNull()
    const facingText = state.silasFacingText!

    // Continue past the ResultCard — the next directive mounts with the
    // debate from the just-committed week (beats persist until next commit).
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    // 1. Debate section: one listitem per beat, chip-formatted.
    const region = screen.getByRole('region', { name: /chorus deliberation/i })
    const items = within(region).getAllByRole('listitem')
    expect(items.length).toBe(state.polylogueBeats.length)
    expect(items.length).toBeGreaterThanOrEqual(3)
    for (const [i, beat] of state.polylogueBeats.entries()) {
      expect(items[i]!.textContent).toContain(
        `[${beat.voice} · ${beat.register.toUpperCase()}]`,
      )
      expect(items[i]!.textContent).toContain(beat.line)
    }

    // 2. Silas panel: exactly one composed Null reply line, no debate tags.
    const aside = screen.getByRole('complementary', { name: /silas vale/i })
    expect(within(aside).getAllByText(facingText)).toHaveLength(1)
    expect(aside.textContent ?? '').not.toMatch(/\[[A-Z_]+ · [A-Z_]+\]/)
  })
})
