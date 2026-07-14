/**
 * ChorusDebateSection tests (Sprint P10, Q14 hybrid accordion).
 *
 * Contract under test:
 *   - Renders `polylogueBeats` from the store, one line per beat, formatted
 *     `[VOICE · REGISTER] line` with the S2 ChoiceCard chip styling.
 *   - Container is role="region" aria-label="Chorus deliberation", a 240px
 *     max-height scroll region, keyboard-focusable (tabIndex=0).
 *   - Beats live inside role="list" / role="listitem".
 *   - Empty state: renders nothing (null) when no beats.
 *   - Maturity gate: DIRECTIVE panel maturity < 2 → not mounted. This holds
 *     both for the section rendered standalone AND mounted inside
 *     CenterDirectivePanel (Q14: accordion INSIDE the directive panel).
 *   - Staged reveal: beats reuse the `.log-entry-enter` keyframe (globally
 *     collapsed to ~0ms by the `prefers-reduced-motion` / `data-motion`
 *     blocks in index.css) with a per-beat `animationDelay` stagger that is
 *     dropped entirely under reduced motion so the whole reveal is 0 ms.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, within } from '@testing-library/react'
import React from 'react'
import { ChorusDebateSection } from '@ui/innerChorus/ChorusDebateSection'
import { CenterDirectivePanel } from '@ui/directive/CenterDirectivePanel'
import { useGameStore } from '@state/store'
import { resetStore } from '@tests/state/testHelpers'
import { Q1_SEQUENCE } from '@content/directiveSchedule'
import type { PolylogueBeat } from '@schemas/polylogueScene.schema'
import type { PanelId } from '@systems/tutorial/hudDisclosure'

/** jsdom has no matchMedia (same stub as SilasPromptPanel.test.tsx). */
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

/** Disclose DIRECTIVE and pin its use count (maturity: 0-2→1, 3-5→2, 6+→3). */
function setDirectiveUseCount(useCount: number): void {
  const state = useGameStore.getState()
  useGameStore.setState({
    disclosedPanels: new Set<PanelId>([...state.disclosedPanels, 'DIRECTIVE']),
    panelUseCount: { ...state.panelUseCount, DIRECTIVE: useCount },
  })
}

const BEATS: PolylogueBeat[] = [
  { voice: 'NULL', register: 'practical', line: 'The margin holds if the route consolidates.' },
  { voice: 'MOURNER', register: 'fearful', line: 'Someone is waiting on that route.' },
  { voice: 'DEFENDER', register: 'angry', line: 'We do not trade people for basis points.' },
]

function seedBeats(beats: PolylogueBeat[] = BEATS): void {
  useGameStore.getState().setPolylogue({
    beats,
    silasFacingText: 'Consolidation proceeds with a reweighted queue.',
    dissentSummary: 'MOURNER and DEFENDER dissented.',
  })
}

describe('ChorusDebateSection', () => {
  beforeEach(() => {
    installMatchMedia(false)
    resetStore()
    setDirectiveUseCount(6) // maturity 3 — gate open unless a test overrides
    cleanup()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    cleanup()
  })

  it('renders nothing when there are no beats', () => {
    const { container } = render(React.createElement(ChorusDebateSection))
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when DIRECTIVE maturity is below 2', () => {
    seedBeats()
    setDirectiveUseCount(2) // maturity 1
    render(React.createElement(ChorusDebateSection))
    expect(screen.queryByRole('region', { name: /chorus deliberation/i })).toBeNull()
  })

  it('renders a region "Chorus deliberation" with list semantics at maturity ≥2', () => {
    seedBeats()
    setDirectiveUseCount(3) // maturity 2 — the gate threshold itself
    render(React.createElement(ChorusDebateSection))
    const region = screen.getByRole('region', { name: /chorus deliberation/i })
    const list = within(region).getByRole('list')
    expect(within(list).getAllByRole('listitem')).toHaveLength(3)
  })

  it('renders beats in order as [VOICE · REGISTER] line', () => {
    seedBeats()
    render(React.createElement(ChorusDebateSection))
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0]!.textContent).toContain('[NULL · PRACTICAL]')
    expect(items[0]!.textContent).toContain(BEATS[0]!.line)
    expect(items[1]!.textContent).toContain('[MOURNER · FEARFUL]')
    expect(items[1]!.textContent).toContain(BEATS[1]!.line)
    expect(items[2]!.textContent).toContain('[DEFENDER · ANGRY]')
    expect(items[2]!.textContent).toContain(BEATS[2]!.line)
  })

  it('is a keyboard-focusable 240px max-height scroll region', () => {
    seedBeats()
    render(React.createElement(ChorusDebateSection))
    const region = screen.getByRole('region', { name: /chorus deliberation/i })
    // Keyboard scrollability (comfort pillar): tabIndex=0, no focus trap —
    // a plain focusable scroll container, matching SilasPromptPanel's idiom.
    expect(region.getAttribute('tabindex')).toBe('0')
    expect(region.className).toContain('max-h-[240px]')
    expect(region.className).toContain('overflow-y-auto')
  })

  it('staggers beats via .log-entry-enter + animationDelay when motion is allowed', () => {
    seedBeats()
    render(React.createElement(ChorusDebateSection))
    const items = screen.getAllByRole('listitem')
    for (const item of items) {
      // Reuses the existing keyframe class — the global
      // prefers-reduced-motion / data-motion CSS blocks collapse its
      // duration, exactly as LogEntry and AlertCrawler rely on.
      expect(item.className).toContain('log-entry-enter')
    }
    expect((items[0] as HTMLElement).style.animationDelay).toBe('0ms')
    expect((items[1] as HTMLElement).style.animationDelay).toBe('90ms')
    expect((items[2] as HTMLElement).style.animationDelay).toBe('180ms')
  })

  it('drops the stagger entirely under reduced motion (0 ms reveal)', () => {
    installMatchMedia(true)
    seedBeats()
    render(React.createElement(ChorusDebateSection))
    const items = screen.getAllByRole('listitem')
    for (const item of items) {
      // No inline delay — combined with the global animation-duration
      // collapse, the entire staged reveal is 0 ms under reduced motion.
      expect((item as HTMLElement).style.animationDelay).toBe('')
    }
  })
})

describe('CenterDirectivePanel — ChorusDebateSection mount (Q14 hybrid accordion)', () => {
  const W1 = Q1_SEQUENCE[0]!
  const panelProps = {
    task: W1.task,
    choices: [...W1.choices],
    nullText: W1.nullText,
    humanMessage: W1.humanMessage,
    onChoiceCommit: () => {},
  }

  beforeEach(() => {
    installMatchMedia(false)
    resetStore()
    cleanup()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    cleanup()
  })

  it('does not mount the debate region at DIRECTIVE maturity < 2', () => {
    seedBeats()
    setDirectiveUseCount(1) // maturity 1
    render(React.createElement(CenterDirectivePanel, panelProps))
    expect(screen.queryByRole('region', { name: /chorus deliberation/i })).toBeNull()
    // The rest of the panel is untouched.
    expect(screen.getByRole('radiogroup', { name: /choose a directive response/i })).toBeTruthy()
  })

  it('mounts the debate region between directive body and choices at maturity ≥2', () => {
    seedBeats()
    setDirectiveUseCount(6)
    render(React.createElement(CenterDirectivePanel, panelProps))
    const region = screen.getByRole('region', { name: /chorus deliberation/i })
    expect(within(region).getAllByRole('listitem')).toHaveLength(3)
    // DOM order: the region precedes the radiogroup (choices).
    const radiogroup = screen.getByRole('radiogroup', { name: /choose a directive response/i })
    expect(
      region.compareDocumentPosition(radiogroup) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })
})
