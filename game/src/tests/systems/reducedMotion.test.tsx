/**
 * reducedMotion tests — the runtime bridge from persisted comfort settings to
 * DOM + React (Sprint D1, PLAN.md §10 comfort pillar).
 *
 * Coverage:
 *   readComfortMotion — default when storage empty; default when malformed;
 *     returns the persisted value when valid.
 *   applyComfortMotionToDom — sets `data-motion` for reduced/none; removes
 *     the attribute for full; idempotent.
 *   bootstrapComfortMotion — reads storage + applies to <html> in one call.
 *   useReducedMotion — true when OS matches; true when comfort is reduced/none
 *     even if OS doesn't match; reacts to same-tab `echo9:comfort-changed`
 *     dispatch; reacts to cross-tab `storage` event.
 *
 * jsdom does not implement matchMedia; each test installs a stub controlling
 * whether `(prefers-reduced-motion: reduce)` matches.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import {
  readComfortMotion,
  applyComfortMotionToDom,
  bootstrapComfortMotion,
  useReducedMotion,
  dispatchComfortChanged,
  COMFORT_CHANGED_EVENT,
} from '@systems/comfort/reducedMotion'
import {
  COMFORT_DEFAULTS,
  COMFORT_STORAGE_KEY,
  type ComfortSettings,
} from '@schemas/comfortSettings.schema'

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

/** Probe component: renders `reduced` | `full` based on the hook. */
function Probe() {
  const reduced = useReducedMotion()
  return <div data-testid="probe">{reduced ? 'reduced' : 'full'}</div>
}

describe('readComfortMotion', () => {
  beforeEach(() => localStorage.clear())

  it('returns the default motion when storage is empty', () => {
    expect(readComfortMotion()).toBe(COMFORT_DEFAULTS.motion)
  })

  it('returns the default motion when the payload fails schema validation', () => {
    localStorage.setItem(COMFORT_STORAGE_KEY, JSON.stringify({ motion: 'weird' }))
    expect(readComfortMotion()).toBe(COMFORT_DEFAULTS.motion)
  })

  it('returns the persisted value when the payload is valid', () => {
    writeComfort({ motion: 'reduced' })
    expect(readComfortMotion()).toBe('reduced')
  })
})

describe('applyComfortMotionToDom', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-motion')
  })

  it('sets data-motion="reduced" for the reduced value', () => {
    applyComfortMotionToDom('reduced')
    expect(document.documentElement.getAttribute('data-motion')).toBe('reduced')
  })

  it('sets data-motion="none" for the none value', () => {
    applyComfortMotionToDom('none')
    expect(document.documentElement.getAttribute('data-motion')).toBe('none')
  })

  it('removes data-motion for the full value (idempotent when already absent)', () => {
    applyComfortMotionToDom('reduced')
    applyComfortMotionToDom('full')
    expect(document.documentElement.getAttribute('data-motion')).toBeNull()
    applyComfortMotionToDom('full')
    expect(document.documentElement.getAttribute('data-motion')).toBeNull()
  })
})

describe('bootstrapComfortMotion', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-motion')
  })

  it('applies the persisted motion to <html> in one call', () => {
    writeComfort({ motion: 'none' })
    bootstrapComfortMotion()
    expect(document.documentElement.getAttribute('data-motion')).toBe('none')
  })

  it('applies default (full → attribute absent) when storage is empty', () => {
    bootstrapComfortMotion()
    expect(document.documentElement.getAttribute('data-motion')).toBeNull()
  })
})

describe('useReducedMotion', () => {
  beforeEach(() => {
    localStorage.clear()
    cleanup()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('is true when the OS matches prefers-reduced-motion', () => {
    installMatchMedia(true)
    render(<Probe />)
    expect(screen.getByTestId('probe').textContent).toBe('reduced')
  })

  it('is true when comfort motion is reduced even if OS does not match', () => {
    installMatchMedia(false)
    writeComfort({ motion: 'reduced' })
    render(<Probe />)
    expect(screen.getByTestId('probe').textContent).toBe('reduced')
  })

  it('is true when comfort motion is none even if OS does not match', () => {
    installMatchMedia(false)
    writeComfort({ motion: 'none' })
    render(<Probe />)
    expect(screen.getByTestId('probe').textContent).toBe('reduced')
  })

  it('is false when OS does not match and comfort motion is full', () => {
    installMatchMedia(false)
    writeComfort({ motion: 'full' })
    render(<Probe />)
    expect(screen.getByTestId('probe').textContent).toBe('full')
  })

  it('reacts to same-tab COMFORT_CHANGED_EVENT dispatch', () => {
    installMatchMedia(false)
    writeComfort({ motion: 'full' })
    render(<Probe />)
    expect(screen.getByTestId('probe').textContent).toBe('full')

    act(() => {
      writeComfort({ motion: 'reduced' })
      dispatchComfortChanged()
    })
    expect(screen.getByTestId('probe').textContent).toBe('reduced')
  })

  it('reacts to cross-tab storage event on COMFORT_STORAGE_KEY', () => {
    installMatchMedia(false)
    writeComfort({ motion: 'full' })
    render(<Probe />)
    expect(screen.getByTestId('probe').textContent).toBe('full')

    act(() => {
      writeComfort({ motion: 'reduced' })
      window.dispatchEvent(
        new StorageEvent('storage', { key: COMFORT_STORAGE_KEY }),
      )
    })
    expect(screen.getByTestId('probe').textContent).toBe('reduced')
  })

  it('exports the same event name it listens for', () => {
    expect(COMFORT_CHANGED_EVENT).toBe('echo9:comfort-changed')
  })
})
