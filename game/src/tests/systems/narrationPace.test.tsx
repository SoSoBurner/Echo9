/**
 * narrationPace tests — the runtime bridge from persisted comfort settings
 * to teletype pacing (Sprint D4, PLAN.md §10 comfort pillar).
 *
 * Coverage:
 *   readComfortNarrationPace — default when storage empty; default when
 *     malformed; returns persisted value when valid.
 *   useNarrationPace — returns persisted value; reacts to same-tab dispatch;
 *     reacts to cross-tab `storage` event; ignores unrelated storage keys.
 *   useNarrationPaceMultiplier — returns the correct multiplier per pace.
 *   NARRATION_PACE_MULTIPLIERS table — 'instant' is 0 (teletype bails);
 *     'polite-queue' is the baseline 1.0; 'on-demand' strictly exceeds
 *     'polite-queue' so slower pacing is actually slower.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import {
  readComfortNarrationPace,
  useNarrationPace,
  useNarrationPaceMultiplier,
  NARRATION_PACE_MULTIPLIERS,
} from '@systems/comfort/narrationPace'
import {
  COMFORT_CHANGED_EVENT,
  dispatchComfortChanged,
} from '@systems/comfort/reducedMotion'
import {
  COMFORT_DEFAULTS,
  COMFORT_STORAGE_KEY,
  type ComfortSettings,
  type NarrationPace,
} from '@schemas/comfortSettings.schema'

function writeComfort(overrides: Partial<ComfortSettings>): void {
  const merged: ComfortSettings = { ...COMFORT_DEFAULTS, ...overrides }
  localStorage.setItem(COMFORT_STORAGE_KEY, JSON.stringify(merged))
}

function PaceProbe() {
  const pace = useNarrationPace()
  return <div data-testid="pace">{pace}</div>
}

function MultProbe() {
  const mult = useNarrationPaceMultiplier()
  return <div data-testid="mult">{mult}</div>
}

describe('readComfortNarrationPace', () => {
  beforeEach(() => localStorage.clear())

  it('returns the default pace when storage is empty', () => {
    expect(readComfortNarrationPace()).toBe(COMFORT_DEFAULTS.narrationPace)
  })

  it('returns the default pace when the payload fails schema validation', () => {
    localStorage.setItem(COMFORT_STORAGE_KEY, JSON.stringify({ narrationPace: 'zoomy' }))
    expect(readComfortNarrationPace()).toBe(COMFORT_DEFAULTS.narrationPace)
  })

  it('returns the persisted value when the payload is valid', () => {
    writeComfort({ narrationPace: 'instant' })
    expect(readComfortNarrationPace()).toBe('instant')
  })
})

describe('useNarrationPace', () => {
  beforeEach(() => {
    localStorage.clear()
    cleanup()
  })

  it('returns the persisted pace on initial render', () => {
    writeComfort({ narrationPace: 'on-demand' })
    render(<PaceProbe />)
    expect(screen.getByTestId('pace').textContent).toBe('on-demand')
  })

  it('returns the default when storage is empty', () => {
    render(<PaceProbe />)
    expect(screen.getByTestId('pace').textContent).toBe(COMFORT_DEFAULTS.narrationPace)
  })

  it('reacts to same-tab COMFORT_CHANGED_EVENT dispatch', () => {
    writeComfort({ narrationPace: 'polite-queue' })
    render(<PaceProbe />)
    expect(screen.getByTestId('pace').textContent).toBe('polite-queue')

    act(() => {
      writeComfort({ narrationPace: 'instant' })
      dispatchComfortChanged()
    })
    expect(screen.getByTestId('pace').textContent).toBe('instant')
  })

  it('reacts to cross-tab storage event on COMFORT_STORAGE_KEY', () => {
    writeComfort({ narrationPace: 'polite-queue' })
    render(<PaceProbe />)
    expect(screen.getByTestId('pace').textContent).toBe('polite-queue')

    act(() => {
      writeComfort({ narrationPace: 'on-demand' })
      window.dispatchEvent(
        new StorageEvent('storage', { key: COMFORT_STORAGE_KEY }),
      )
    })
    expect(screen.getByTestId('pace').textContent).toBe('on-demand')
  })

  it('ignores storage events for unrelated keys', () => {
    writeComfort({ narrationPace: 'polite-queue' })
    render(<PaceProbe />)

    act(() => {
      localStorage.setItem('some:other:key', 'x')
      window.dispatchEvent(
        new StorageEvent('storage', { key: 'some:other:key' }),
      )
    })
    expect(screen.getByTestId('pace').textContent).toBe('polite-queue')
  })

  it('shares the COMFORT_CHANGED_EVENT bus with D1/D2/D3', () => {
    expect(COMFORT_CHANGED_EVENT).toBe('echo9:comfort-changed')
  })
})

describe('useNarrationPaceMultiplier', () => {
  beforeEach(() => {
    localStorage.clear()
    cleanup()
  })

  it('returns 0 for instant', () => {
    writeComfort({ narrationPace: 'instant' })
    render(<MultProbe />)
    expect(screen.getByTestId('mult').textContent).toBe('0')
  })

  it('returns 1 for polite-queue (the default baseline)', () => {
    writeComfort({ narrationPace: 'polite-queue' })
    render(<MultProbe />)
    expect(screen.getByTestId('mult').textContent).toBe('1')
  })

  it('returns 2 for on-demand', () => {
    writeComfort({ narrationPace: 'on-demand' })
    render(<MultProbe />)
    expect(screen.getByTestId('mult').textContent).toBe('2')
  })
})

describe('NARRATION_PACE_MULTIPLIERS table', () => {
  it('lists every NarrationPace schema value', () => {
    const schemaValues: NarrationPace[] = ['instant', 'polite-queue', 'on-demand']
    for (const v of schemaValues) {
      // 0 is a valid multiplier (instant), so check ≥ 0 not > 0.
      expect(
        NARRATION_PACE_MULTIPLIERS[v],
        `NARRATION_PACE_MULTIPLIERS is missing an entry for NarrationPace '${v}'.`,
      ).toBeGreaterThanOrEqual(0)
    }
  })

  it('instant is exactly 0 (teletype bails instantly, same as reduced motion)', () => {
    expect(NARRATION_PACE_MULTIPLIERS.instant).toBe(0)
  })

  it('polite-queue is exactly 1 (baseline — pre-D4 behavior preserved)', () => {
    expect(NARRATION_PACE_MULTIPLIERS['polite-queue']).toBe(1)
  })

  it('on-demand strictly exceeds polite-queue (slower is actually slower)', () => {
    expect(NARRATION_PACE_MULTIPLIERS['on-demand']).toBeGreaterThan(
      NARRATION_PACE_MULTIPLIERS['polite-queue'],
    )
  })
})
