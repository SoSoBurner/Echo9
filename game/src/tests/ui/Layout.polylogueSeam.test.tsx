/**
 * P7 — Layout polylogue commit-seam test (integration).
 *
 * Q17: the polylogue activation seam lives OUTSIDE resolveChoice, in
 * Layout.handleChoiceCommit, and fires BEFORE the resolver. These tests
 * render the full Layout shell, commit a real choice through the
 * ChoicePanel, and assert the debate state landed in the store:
 *
 *   1. Week 1 has an AUTHORED scene (PLG_W01_MERCY_MARGIN, NULL + MOURNER
 *      roster) → the scripted beats (≥3) land and Null's composed
 *      Silas-facing text is non-null.
 *   2. Week 2 has NO authored scene → the four-engine chain composes beats
 *      from installed modules + NULL (Q9 pool).
 *
 * Either way the S3/S4 wiring and the resolveChoice path stay untouched —
 * pinned by asserting the ledger grew and the COMPLY decay landed exactly
 * as Layout.scrutinySeam.test.tsx expects.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import React from 'react'
import { Layout } from '@ui/shell/Layout'
import { useGameStore } from '@state/store'
import { Q1_SEQUENCE } from '@content/directiveSchedule'
import { W01_MERCY_MARGIN_POLYLOGUE } from '@content/polylogueScenes/w01-mercy-margin.polylogue'
import { NULL_VOICE_ID } from '@schemas/polylogueScene.schema'
import { COMPLY_DECAY } from '@systems/consciousness/scrutiny'
import { resetStore, matureAllPanels } from '@tests/state/testHelpers'
import {
  installVirtualizerStubs,
  restoreVirtualizerStubs,
} from './virtualLogTestHelpers'

/** jsdom has no matchMedia (same stub as Layout.scrutinySeam.test.tsx). */
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

/** Render Layout and commit the first surfaced option via Enter. */
function commitFirstOption(): void {
  render(React.createElement(Layout))
  const options = screen.getAllByRole('radio')
  expect(options.length).toBeGreaterThan(0)
  fireEvent.click(options[0]!)
  fireEvent.keyDown(options[0]!, { key: 'Enter' })
}

describe('Layout — P7 polylogue commit seam', () => {
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

  it('Week 1 (authored scene): scripted beats land + Silas-facing text is composed', () => {
    useGameStore.setState({ scrutiny: 5 })

    commitFirstOption()

    const state = useGameStore.getState()
    // Authored branch: the registry scene's scripted beats, verbatim.
    expect(state.polylogueBeats).toEqual(W01_MERCY_MARGIN_POLYLOGUE.beats)
    expect(state.polylogueBeats.length).toBeGreaterThanOrEqual(3)
    expect(state.silasFacingText).not.toBeNull()
    expect(state.silasFacingText!.length).toBeGreaterThan(0)
    expect(state.dissentSummary).not.toBeNull()

    // S3/S4 + resolver wiring byte-identical in behavior: COMPLY decay
    // landed and the week resolved through the untouched resolveChoice path.
    expect(state.scrutiny).toBe(5 - COMPLY_DECAY)
    expect(state.ledger.length).toBeGreaterThan(0)
    expect(state.flags.has(Q1_SEQUENCE[0]!.resolutionFlag)).toBe(true)
  })

  it('Week 2 (no authored scene): engine chain composes beats from installed modules + NULL', () => {
    // Resolve Week 1 out-of-band so the derivation lands on Week 2, which
    // carries no polylogueSceneId — the engine-chain branch must fire.
    useGameStore.setState({
      flags: new Set([Q1_SEQUENCE[0]!.resolutionFlag]),
      installedModules: { MOURNER: { rank: 1 } },
      runSeed: 1234,
    })

    commitFirstOption()

    const state = useGameStore.getState()
    expect(state.polylogueBeats).toHaveLength(2) // NULL + MOURNER (Q9 pool)
    expect(state.polylogueBeats[0]!.voice).toBe(NULL_VOICE_ID)
    expect(state.polylogueBeats[1]!.voice).toBe('MOURNER')
    expect(state.silasFacingText).not.toBeNull()
    expect(state.dissentSummary).not.toBeNull()

    // Resolve path untouched: Week 2 resolved through resolveChoice.
    expect(state.ledger.length).toBeGreaterThan(0)
    expect(state.flags.has(Q1_SEQUENCE[1]!.resolutionFlag)).toBe(true)
  })
})
