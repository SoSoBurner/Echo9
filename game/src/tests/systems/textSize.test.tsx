/**
 * textSize tests — the runtime bridge from persisted comfort settings to
 * DOM + React (Sprint D3, PLAN.md §10 comfort pillar).
 *
 * Coverage:
 *   readComfortTextSize — default when storage empty; default when malformed;
 *     returns persisted value when valid.
 *   applyComfortTextSizeToDom — sets `--text-scale` for non-M values; removes
 *     the property for 'M' (idempotent when already absent).
 *   bootstrapComfortTextSize — reads storage + applies to <html> in one call.
 *   useTextSize — returns persisted value; reacts to same-tab dispatch;
 *     reacts to cross-tab `storage` event; ignores storage events for other
 *     keys.
 *   TEXT_SIZE_SCALES table — every scale value strictly ascends S → M → L → XL
 *     so choosing "Large" always yields larger text than "Medium", etc.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import {
  readComfortTextSize,
  applyComfortTextSizeToDom,
  bootstrapComfortTextSize,
  useTextSize,
  TEXT_SIZE_SCALES,
  TEXT_SCALE_PROPERTY,
} from '@systems/comfort/textSize'
import {
  COMFORT_CHANGED_EVENT,
  dispatchComfortChanged,
} from '@systems/comfort/reducedMotion'
import {
  COMFORT_DEFAULTS,
  COMFORT_STORAGE_KEY,
  type ComfortSettings,
  type TextSize,
} from '@schemas/comfortSettings.schema'

function writeComfort(overrides: Partial<ComfortSettings>): void {
  const merged: ComfortSettings = { ...COMFORT_DEFAULTS, ...overrides }
  localStorage.setItem(COMFORT_STORAGE_KEY, JSON.stringify(merged))
}

/** Probe component: renders the current TextSize returned by the hook. */
function Probe() {
  const size = useTextSize()
  return <div data-testid="probe">{size}</div>
}

describe('readComfortTextSize', () => {
  beforeEach(() => localStorage.clear())

  it('returns the default text size when storage is empty', () => {
    expect(readComfortTextSize()).toBe(COMFORT_DEFAULTS.textSize)
  })

  it('returns the default text size when the payload fails schema validation', () => {
    localStorage.setItem(COMFORT_STORAGE_KEY, JSON.stringify({ textSize: 'XXXL' }))
    expect(readComfortTextSize()).toBe(COMFORT_DEFAULTS.textSize)
  })

  it('returns the persisted value when the payload is valid', () => {
    writeComfort({ textSize: 'XL' })
    expect(readComfortTextSize()).toBe('XL')
  })
})

describe('applyComfortTextSizeToDom', () => {
  beforeEach(() => {
    document.documentElement.style.removeProperty(TEXT_SCALE_PROPERTY)
  })

  it('sets --text-scale to the S multiplier for the S value', () => {
    applyComfortTextSizeToDom('S')
    expect(document.documentElement.style.getPropertyValue(TEXT_SCALE_PROPERTY)).toBe(
      String(TEXT_SIZE_SCALES.S),
    )
  })

  it('sets --text-scale to the XL multiplier for the XL value', () => {
    applyComfortTextSizeToDom('XL')
    expect(document.documentElement.style.getPropertyValue(TEXT_SCALE_PROPERTY)).toBe(
      String(TEXT_SIZE_SCALES.XL),
    )
  })

  it('removes --text-scale for the M value (idempotent when already absent)', () => {
    applyComfortTextSizeToDom('L')
    applyComfortTextSizeToDom('M')
    expect(document.documentElement.style.getPropertyValue(TEXT_SCALE_PROPERTY)).toBe('')
    applyComfortTextSizeToDom('M')
    expect(document.documentElement.style.getPropertyValue(TEXT_SCALE_PROPERTY)).toBe('')
  })
})

describe('bootstrapComfortTextSize', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.style.removeProperty(TEXT_SCALE_PROPERTY)
  })

  it('applies the persisted text size to <html> in one call', () => {
    writeComfort({ textSize: 'L' })
    bootstrapComfortTextSize()
    expect(document.documentElement.style.getPropertyValue(TEXT_SCALE_PROPERTY)).toBe(
      String(TEXT_SIZE_SCALES.L),
    )
  })

  it('applies default (M → property absent) when storage is empty', () => {
    bootstrapComfortTextSize()
    expect(document.documentElement.style.getPropertyValue(TEXT_SCALE_PROPERTY)).toBe('')
  })
})

describe('useTextSize', () => {
  beforeEach(() => {
    localStorage.clear()
    cleanup()
  })
  afterEach(() => {
    // Nothing to unstub — no matchMedia mocking needed for D3.
  })

  it('returns the persisted text size on initial render', () => {
    writeComfort({ textSize: 'L' })
    render(<Probe />)
    expect(screen.getByTestId('probe').textContent).toBe('L')
  })

  it('returns default when storage is empty', () => {
    render(<Probe />)
    expect(screen.getByTestId('probe').textContent).toBe(COMFORT_DEFAULTS.textSize)
  })

  it('reacts to same-tab COMFORT_CHANGED_EVENT dispatch', () => {
    writeComfort({ textSize: 'M' })
    render(<Probe />)
    expect(screen.getByTestId('probe').textContent).toBe('M')

    act(() => {
      writeComfort({ textSize: 'XL' })
      dispatchComfortChanged()
    })
    expect(screen.getByTestId('probe').textContent).toBe('XL')
  })

  it('reacts to cross-tab storage event on COMFORT_STORAGE_KEY', () => {
    writeComfort({ textSize: 'M' })
    render(<Probe />)
    expect(screen.getByTestId('probe').textContent).toBe('M')

    act(() => {
      writeComfort({ textSize: 'S' })
      window.dispatchEvent(
        new StorageEvent('storage', { key: COMFORT_STORAGE_KEY }),
      )
    })
    expect(screen.getByTestId('probe').textContent).toBe('S')
  })

  it('ignores storage events for unrelated keys', () => {
    writeComfort({ textSize: 'M' })
    render(<Probe />)
    expect(screen.getByTestId('probe').textContent).toBe('M')

    act(() => {
      // Write a different key and dispatch a storage event for it.
      // The hook must NOT recompute — otherwise a totally unrelated
      // localStorage write elsewhere in the app would force a re-render.
      localStorage.setItem('some:other:key', 'x')
      window.dispatchEvent(
        new StorageEvent('storage', { key: 'some:other:key' }),
      )
    })
    expect(screen.getByTestId('probe').textContent).toBe('M')
  })

  it('reuses the shared COMFORT_CHANGED_EVENT name (single-source subscription bus)', () => {
    // Regression guard: if a future refactor splits the event name, D1/D2/D3
    // hooks would all need parallel dispatches to update in the same tab.
    // Keeping the single event name is the whole point of sharing it.
    expect(COMFORT_CHANGED_EVENT).toBe('echo9:comfort-changed')
  })
})

describe('TEXT_SIZE_SCALES table', () => {
  it('lists every TextSize schema value', () => {
    const schemaValues: TextSize[] = ['S', 'M', 'L', 'XL']
    for (const v of schemaValues) {
      expect(
        TEXT_SIZE_SCALES[v],
        `TEXT_SIZE_SCALES is missing an entry for TextSize '${v}'. ` +
          `Add it to keep the DOM apply function and the schema in lockstep.`,
      ).toBeGreaterThan(0)
    }
  })

  it('M is exactly 1.0 (default no-scale contract)', () => {
    expect(TEXT_SIZE_SCALES.M).toBe(1)
  })

  it('scales strictly ascend S < M < L < XL', () => {
    // If any adjacent pair inverts, choosing "Large" would produce smaller
    // text than "Medium" — the exact opposite of what the label says.
    expect(TEXT_SIZE_SCALES.S).toBeLessThan(TEXT_SIZE_SCALES.M)
    expect(TEXT_SIZE_SCALES.M).toBeLessThan(TEXT_SIZE_SCALES.L)
    expect(TEXT_SIZE_SCALES.L).toBeLessThan(TEXT_SIZE_SCALES.XL)
  })
})
