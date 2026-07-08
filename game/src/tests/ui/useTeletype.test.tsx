/**
 * useTeletype tests — D4 pace-multiplier integration.
 *
 * Pre-D4 the hook's reveal behavior was tested indirectly through
 * SilasPromptPanel. D4 adds a second bail path (pace === 'instant' via
 * multiplier 0) and a speed-scaling path (pace === 'on-demand' via multiplier
 * 2.0). These paths need direct coverage so a future refactor can't quietly
 * drop the pace gating.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import { useTeletype } from '@ui/silas/useTeletype'
import {
  COMFORT_DEFAULTS,
  COMFORT_STORAGE_KEY,
  type ComfortSettings,
} from '@schemas/comfortSettings.schema'

const SAMPLE_TEXT = 'Twelve characters plus.'

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

function writeComfort(overrides: Partial<ComfortSettings>): void {
  const merged: ComfortSettings = { ...COMFORT_DEFAULTS, ...overrides }
  localStorage.setItem(COMFORT_STORAGE_KEY, JSON.stringify(merged))
}

function Probe({ speed }: { speed: number }) {
  const { text, done } = useTeletype(SAMPLE_TEXT, speed)
  return (
    <>
      <span data-testid="text">{text}</span>
      <span data-testid="done">{String(done)}</span>
    </>
  )
}

describe('useTeletype × D4 narration pace', () => {
  beforeEach(() => {
    localStorage.clear()
    installMatchMedia(false)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
    cleanup()
  })

  it('with narrationPace="instant", reveals the full text on first render (no interval)', () => {
    writeComfort({ narrationPace: 'instant' })

    render(<Probe speed={20} />)

    // Full text present immediately — no timer advance required.
    expect(screen.getByTestId('text').textContent).toBe(SAMPLE_TEXT)
    expect(screen.getByTestId('done').textContent).toBe('true')
  })

  it('with narrationPace="polite-queue" (default multiplier 1.0), reveals character-by-character at base speed', () => {
    vi.useFakeTimers()
    writeComfort({ narrationPace: 'polite-queue' })

    render(<Probe speed={20} />)

    // Start empty.
    expect(screen.getByTestId('text').textContent).toBe('')

    // After 5 intervals × 20ms = 100ms, 5 chars revealed.
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(screen.getByTestId('text').textContent).toHaveLength(5)

    // Finish reveal.
    act(() => {
      vi.advanceTimersByTime(SAMPLE_TEXT.length * 20)
    })
    expect(screen.getByTestId('text').textContent).toBe(SAMPLE_TEXT)
  })

  it('with narrationPace="on-demand" (multiplier 2.0), reveals at half the base speed', () => {
    vi.useFakeTimers()
    writeComfort({ narrationPace: 'on-demand' })

    render(<Probe speed={20} />)

    expect(screen.getByTestId('text').textContent).toBe('')

    // Effective interval is 20 * 2 = 40ms. After 100ms only 2 chars visible
    // (polite-queue would have revealed 5).
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(screen.getByTestId('text').textContent).toHaveLength(2)
  })

  it('reduced-motion still bails even when narrationPace is on-demand (D1 gate wins)', () => {
    installMatchMedia(true)
    writeComfort({ narrationPace: 'on-demand' })

    render(<Probe speed={20} />)

    expect(screen.getByTestId('text').textContent).toBe(SAMPLE_TEXT)
    expect(screen.getByTestId('done').textContent).toBe('true')
  })
})
