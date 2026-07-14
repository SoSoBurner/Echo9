/**
 * SilasPromptPanel tests — render contract of the owner-voice panel.
 *
 * The panel takes a `prompt: SilasPrompt | null` prop (it does NOT read the
 * store) and renders an <aside aria-label="Silas Vale — owner voice"> when
 * prompt is non-null. When prompt is null it returns null.
 *
 * useTeletype reads window.matchMedia at render time to check
 * prefers-reduced-motion. jsdom does not provide matchMedia natively, so each
 * test installs a stub. With reduced-motion matched, the panel shows the full
 * body text immediately and omits the animated cursor.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, within } from '@testing-library/react'
import React from 'react'
import { SilasPromptPanel } from '@ui/silas/SilasPromptPanel'
import type { SilasPrompt } from '@schemas/silasPrompt.schema'
import { makeSilasPromptId } from '@schemas/gameState.schema'
import { useGameStore } from '@state/store'
import { resetStore } from '@tests/state/testHelpers'
import { VOICE_IDS, NULL_VOICE_ID } from '@schemas/polylogueScene.schema'

/**
 * Install a window.matchMedia stub. `reduce` = true makes the
 * `(prefers-reduced-motion: reduce)` query match, which useTeletype treats as
 * an instant-reveal signal.
 *
 * Uses `vi.stubGlobal` so the stub is torn down by `vi.unstubAllGlobals()` in
 * afterEach — otherwise the stub leaks to sibling test files sharing this
 * vitest worker.
 */
function installMatchMedia(reduce: boolean): void {
  const stub = (query: string): MediaQueryList => ({
    matches: reduce && query.includes('reduce'),
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

const SAMPLE_PROMPT: SilasPrompt = {
  id: makeSilasPromptId('silas-boot-01'),
  body: 'The margins move themselves, kid. All you do is decide who bleeds.',
}

describe('SilasPromptPanel', () => {
  beforeEach(() => {
    // Default: motion allowed (teletype runs). Reduced-motion test overrides.
    installMatchMedia(false)
    // P10: the panel now subscribes to `silasFacingText` — reset the store so
    // a prior test's debate state never leaks into a render assertion.
    resetStore()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    cleanup()
  })

  it('renders nothing when prompt is null', () => {
    render(React.createElement(SilasPromptPanel, { prompt: null }))
    expect(
      screen.queryByRole('complementary', { name: /silas vale/i }),
    ).toBeNull()
  })

  it('renders the <aside> with the Silas Vale owner-voice label when prompt is provided', () => {
    render(React.createElement(SilasPromptPanel, { prompt: SAMPLE_PROMPT }))
    const aside = screen.getByRole('complementary', { name: /silas vale/i })
    expect(aside).toBeTruthy()
    expect(aside.tagName.toLowerCase()).toBe('aside')
  })

  it('with prefers-reduced-motion, reveals the full body immediately and omits the cursor', () => {
    installMatchMedia(true)
    const { container } = render(
      React.createElement(SilasPromptPanel, { prompt: SAMPLE_PROMPT }),
    )

    // Full body appears verbatim on first paint (no teletype interval).
    expect(screen.getByText(SAMPLE_PROMPT.body)).toBeInTheDocument()

    // The animated cursor and the "Press Enter to skip" hint are gated by
    // !done. Under reduced motion, done is true from the first render, so
    // neither should be present.
    expect(container.querySelector('.animate-pulse')).toBeNull()
    expect(screen.queryByText(/press enter to skip/i)).toBeNull()
  })

  // ---------------------------------------------------------------------------
  // P10 — Null's composed reply line (Q19 Silas ↔ Null boundary, UI layer).
  // The panel subscribes to `silasFacingText` ONLY — never polylogueBeats or
  // dissentSummary. Everything that crosses into Silas's panel is Null's
  // single mediated utterance.
  // ---------------------------------------------------------------------------

  const FACING_TEXT = 'Consolidation proceeds with a reweighted queue.'

  function seedDebateState(): void {
    useGameStore.getState().setPolylogue({
      beats: [
        { voice: 'NULL', register: 'practical', line: 'The margin holds.' },
        { voice: 'MOURNER', register: 'fearful', line: 'Someone is waiting on that route.' },
      ],
      silasFacingText: FACING_TEXT,
      dissentSummary: 'MOURNER dissented on the reweighting.',
    })
  }

  it("renders silasFacingText as Null's reply line when set", () => {
    installMatchMedia(true) // instant teletype — assert on final text
    seedDebateState()
    render(React.createElement(SilasPromptPanel, { prompt: SAMPLE_PROMPT }))
    const aside = screen.getByRole('complementary', { name: /silas vale/i })
    expect(within(aside).getByText(FACING_TEXT)).toBeInTheDocument()
  })

  it('renders no reply line when silasFacingText is null (cold boot)', () => {
    installMatchMedia(true)
    render(React.createElement(SilasPromptPanel, { prompt: SAMPLE_PROMPT }))
    expect(screen.queryByText(FACING_TEXT)).toBeNull()
  })

  it('boundary hygiene: never renders [VOICE · REGISTER] tags, non-Null voice names, or the dissent summary', () => {
    installMatchMedia(true)
    seedDebateState()
    render(React.createElement(SilasPromptPanel, { prompt: SAMPLE_PROMPT }))
    const aside = screen.getByRole('complementary', { name: /silas vale/i })
    const text = aside.textContent ?? ''

    // No chip-formatted debate tag ever crosses into Silas's panel.
    expect(text).not.toMatch(/\[[A-Z_]+ · [A-Z_]+\]/)
    // No chorus voice name other than Null.
    for (const voice of VOICE_IDS) {
      if (voice === NULL_VOICE_ID) continue
      expect(text.toUpperCase()).not.toContain(voice)
    }
    // dissentSummary is HUD-internal — never rendered in Silas's panel.
    expect(text).not.toContain('MOURNER dissented on the reweighting.')
  })
})
