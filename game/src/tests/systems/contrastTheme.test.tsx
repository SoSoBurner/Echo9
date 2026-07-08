/**
 * contrastTheme tests — the runtime bridge from persisted comfort settings to
 * DOM + React (Sprint D2, PLAN.md §10 comfort pillar).
 *
 * Coverage:
 *   readComfortContrast — default when storage empty; default when malformed;
 *     returns the persisted value when valid.
 *   applyComfortContrastToDom — sets `data-contrast="increased"` for the
 *     increased value; removes the attribute for standard; idempotent.
 *   bootstrapComfortContrast — reads storage + applies to <html> in one call.
 *   useContrast — returns 'increased' when OS matches; returns 'increased'
 *     when comfort is increased even if OS doesn't match; reacts to same-tab
 *     `echo9:comfort-changed` dispatch; reacts to cross-tab `storage` event.
 *
 * jsdom does not implement matchMedia; each test installs a stub controlling
 * whether `(prefers-contrast: more)` matches.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import {
  readComfortContrast,
  applyComfortContrastToDom,
  bootstrapComfortContrast,
  useContrast,
} from '@systems/comfort/contrastTheme'
import {
  COMFORT_CHANGED_EVENT,
  dispatchComfortChanged,
} from '@systems/comfort/reducedMotion'
import {
  COMFORT_DEFAULTS,
  COMFORT_STORAGE_KEY,
  type ComfortSettings,
} from '@schemas/comfortSettings.schema'

function installMatchMedia(prefersMore: boolean): void {
  const stub = (query: string): MediaQueryList => ({
    matches: prefersMore && query.includes('more'),
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

/** Probe component: renders 'increased' | 'standard' based on the hook. */
function Probe() {
  const contrast = useContrast()
  return <div data-testid="probe">{contrast}</div>
}

describe('readComfortContrast', () => {
  beforeEach(() => localStorage.clear())

  it('returns the default contrast when storage is empty', () => {
    expect(readComfortContrast()).toBe(COMFORT_DEFAULTS.contrast)
  })

  it('returns the default contrast when the payload fails schema validation', () => {
    localStorage.setItem(COMFORT_STORAGE_KEY, JSON.stringify({ contrast: 'weird' }))
    expect(readComfortContrast()).toBe(COMFORT_DEFAULTS.contrast)
  })

  it('returns the persisted value when the payload is valid', () => {
    writeComfort({ contrast: 'increased' })
    expect(readComfortContrast()).toBe('increased')
  })
})

describe('applyComfortContrastToDom', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-contrast')
  })

  it('sets data-contrast="increased" for the increased value', () => {
    applyComfortContrastToDom('increased')
    expect(document.documentElement.getAttribute('data-contrast')).toBe('increased')
  })

  it('removes data-contrast for the standard value (idempotent when already absent)', () => {
    applyComfortContrastToDom('increased')
    applyComfortContrastToDom('standard')
    expect(document.documentElement.getAttribute('data-contrast')).toBeNull()
    applyComfortContrastToDom('standard')
    expect(document.documentElement.getAttribute('data-contrast')).toBeNull()
  })
})

describe('bootstrapComfortContrast', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-contrast')
  })

  it('applies the persisted contrast to <html> in one call', () => {
    writeComfort({ contrast: 'increased' })
    bootstrapComfortContrast()
    expect(document.documentElement.getAttribute('data-contrast')).toBe('increased')
  })

  it('applies default (standard → attribute absent) when storage is empty', () => {
    bootstrapComfortContrast()
    expect(document.documentElement.getAttribute('data-contrast')).toBeNull()
  })
})

describe('useContrast', () => {
  beforeEach(() => {
    localStorage.clear()
    cleanup()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('is "increased" when the OS matches prefers-contrast: more', () => {
    installMatchMedia(true)
    render(<Probe />)
    expect(screen.getByTestId('probe').textContent).toBe('increased')
  })

  it('is "increased" when comfort contrast is increased even if OS does not match', () => {
    installMatchMedia(false)
    writeComfort({ contrast: 'increased' })
    render(<Probe />)
    expect(screen.getByTestId('probe').textContent).toBe('increased')
  })

  it('is "standard" when OS does not match and comfort contrast is standard', () => {
    installMatchMedia(false)
    writeComfort({ contrast: 'standard' })
    render(<Probe />)
    expect(screen.getByTestId('probe').textContent).toBe('standard')
  })

  it('reacts to same-tab COMFORT_CHANGED_EVENT dispatch', () => {
    installMatchMedia(false)
    writeComfort({ contrast: 'standard' })
    render(<Probe />)
    expect(screen.getByTestId('probe').textContent).toBe('standard')

    act(() => {
      writeComfort({ contrast: 'increased' })
      dispatchComfortChanged()
    })
    expect(screen.getByTestId('probe').textContent).toBe('increased')
  })

  it('reacts to cross-tab storage event on COMFORT_STORAGE_KEY', () => {
    installMatchMedia(false)
    writeComfort({ contrast: 'standard' })
    render(<Probe />)
    expect(screen.getByTestId('probe').textContent).toBe('standard')

    act(() => {
      writeComfort({ contrast: 'increased' })
      window.dispatchEvent(
        new StorageEvent('storage', { key: COMFORT_STORAGE_KEY }),
      )
    })
    expect(screen.getByTestId('probe').textContent).toBe('increased')
  })

  it('reuses the same event name D1 defined (single-source subscription bus)', () => {
    // Regression guard: if a future refactor splits the event name, both D1
    // and D2 hooks would need parallel dispatches to update in the same tab.
    // Keeping the single event name is the whole point of sharing it.
    expect(COMFORT_CHANGED_EVENT).toBe('echo9:comfort-changed')
  })
})
