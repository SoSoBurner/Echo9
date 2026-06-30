/**
 * LogDock tests (Task 13, PLAN.md §10).
 *
 * Acceptance:
 *   - Shows the LAST 12 ledger entries.
 *   - Uses plain `.map()` (verified by rendering ≤12 entries and checking
 *     each `data-trace-id` is in the DOM — virtualization would only render
 *     a subset).
 *   - "View all (N)" toggle button only appears when `ledger.length > 12`.
 *   - VirtualLog is NOT imported eagerly (the lazy chunk is unrelated to
 *     LogDock's own bundle).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'
import { LogDock } from '@ui/log/LogDock'
import { useGameStore } from '@state/store'
import { resetStore } from '@tests/state/testHelpers'
import type { ResultTrace } from '@schemas/resultTrace.schema'
import { fxTaskId, fxChoiceId, fxTraceId } from '@tests/schemas/fixtures'

function makeTraces(n: number): ResultTrace[] {
  const out: ResultTrace[] = []
  for (let i = 0; i < n; i++) {
    out.push({
      id: fxTraceId(`trace-${String(i).padStart(4, '0')}`),
      sourceTaskId: fxTaskId(),
      sourceChoiceId: fxChoiceId(`choice-${i}`),
      timestamp: 1_700_000_000_000 + i * 1000,
      body: `Trace body number ${i}`,
    })
  }
  return out
}

function seedLedger(traces: ResultTrace[]): void {
  useGameStore.setState({ ledger: traces })
}

describe('LogDock', () => {
  beforeEach(() => {
    resetStore()
    cleanup()
  })

  it('renders nothing inside the list when the ledger is empty', () => {
    render(React.createElement(LogDock))
    // The dock chrome (region) is always present so it never moves —
    // "stillness is the horror" (PLAN.md §9).
    expect(screen.getByRole('region', { name: /log/i })).toBeTruthy()
    // No log entries are rendered yet.
    expect(document.querySelectorAll('[data-trace-id]').length).toBe(0)
    // No "View all" button when ledger.length <= 12.
    expect(screen.queryByRole('button', { name: /view all/i })).toBeNull()
  })

  it('renders all entries with plain .map() when ledger has 5 entries', () => {
    seedLedger(makeTraces(5))
    render(React.createElement(LogDock))
    expect(document.querySelectorAll('[data-trace-id]').length).toBe(5)
    expect(screen.queryByRole('button', { name: /view all/i })).toBeNull()
  })

  it('renders exactly 12 entries when ledger has 12', () => {
    seedLedger(makeTraces(12))
    render(React.createElement(LogDock))
    expect(document.querySelectorAll('[data-trace-id]').length).toBe(12)
    // Boundary: ledger.length == 12, NOT > 12, so no toggle.
    expect(screen.queryByRole('button', { name: /view all/i })).toBeNull()
  })

  it('renders only the LAST 12 entries when ledger has 30', () => {
    const traces = makeTraces(30)
    seedLedger(traces)
    render(React.createElement(LogDock))
    const entries = document.querySelectorAll('[data-trace-id]')
    expect(entries.length).toBe(12)
    // The newest entry's body is "Trace body number 29" (we render newest
    // at the BOTTOM, mirroring appendTrace's push semantics). The first
    // visible entry should be trace-0018 (i.e. last 12 of 30 = indices 18..29).
    expect(entries[0]?.getAttribute('data-trace-id')).toBe('trace-0018')
    expect(entries[11]?.getAttribute('data-trace-id')).toBe('trace-0029')
  })

  it('shows the "View all (N)" toggle when ledger.length > 12', () => {
    seedLedger(makeTraces(30))
    render(React.createElement(LogDock))
    const btn = screen.getByRole('button', { name: /view all \(30\)/i })
    expect(btn).toBeTruthy()
  })
})
