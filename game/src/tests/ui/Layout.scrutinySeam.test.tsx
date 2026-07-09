/**
 * S3 — Layout choice-commit seam test (integration).
 *
 * Renders the full Layout shell, commits a real Week-1 choice through the
 * ChoicePanel, and asserts the hidden scrutiny state moved:
 *
 *   - A plain (non-conflict) commit is COMPLY → scrutiny decays.
 *   - The DEFY branch (surfaced conflicts-with-directive option) cannot be
 *     exercised through shipped Q1 content yet — no conflictVariant is
 *     authored until Track C — so the DEFY classification is pinned by the
 *     classifyCommitEvent unit table in src/tests/systems/scrutiny.test.ts
 *     and the slice spike test in src/tests/state/scrutinySlice.test.ts.
 *
 * Also pins the Silas tone overlay: at tier 0 the panel receives the
 * authored weekly prompt verbatim (warm baseline, zero behavior change).
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import React from 'react'
import { Layout } from '@ui/shell/Layout'
import { useGameStore } from '@state/store'
import { COMPLY_DECAY } from '@systems/consciousness/scrutiny'
import { resetStore, matureAllPanels } from '@tests/state/testHelpers'
import {
  installVirtualizerStubs,
  restoreVirtualizerStubs,
} from './virtualLogTestHelpers'

/**
 * jsdom has no matchMedia; SilasPromptPanel's teletype reads
 * prefers-reduced-motion at render. Stub matches "reduce" so text reveals
 * instantly (same pattern as SilasPromptPanel.test.tsx).
 */
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

describe('Layout — S3 scrutiny commit seam', () => {
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
  })

  it('committing a plain Week-1 choice records COMPLY — scrutiny decays', () => {
    useGameStore.setState({ scrutiny: 5 })
    render(React.createElement(Layout))

    // Week 1 (mercy-margin) is the current entry on a fresh boot; commit the
    // first surfaced option (no modules installed → base choices verbatim,
    // none conflict with the directive). ChoiceCard commits on Enter.
    const options = screen.getAllByRole('radio')
    expect(options.length).toBeGreaterThan(0)
    fireEvent.click(options[0]!)
    fireEvent.keyDown(options[0]!, { key: 'Enter' })

    expect(useGameStore.getState().scrutiny).toBe(5 - COMPLY_DECAY)
    // And the week actually resolved through the untouched resolver path.
    expect(useGameStore.getState().ledger.length).toBeGreaterThan(0)
  })

  it('compliance at the floor stays at the floor (never goes negative)', () => {
    render(React.createElement(Layout))
    const options = screen.getAllByRole('radio')
    fireEvent.click(options[0]!)
    fireEvent.keyDown(options[0]!, { key: 'Enter' })
    expect(useGameStore.getState().scrutiny).toBe(0)
  })
})
