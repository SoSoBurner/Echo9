/**
 * AlertCrawler tests (Sprint V5).
 *
 * The crawler exists so screen readers get the newest ledger entry announced
 * as it lands — LogDock's `role="list"` never announces late arrivals. These
 * tests pin the three behaviours that matter:
 *   1. Empty ledger → renders nothing (no "empty status" chatter).
 *   2. Non-empty ledger → renders newest entry with `role="status"` +
 *      `aria-live="polite"` so ATs speak it.
 *   3. Shows the LAST trace, not the first — matches ledgerSlice's push
 *      semantics.
 *
 * Store setup mirrors `FinancialOverviewPanel.test.tsx` — reset via
 * `useGameStore.setState`, then read back through the mounted component.
 */
import { makeStageOneAncestryId } from '@schemas/resultTrace.schema'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'
import { useGameStore } from '@state/store'
import { AlertCrawler } from '@ui/alerts/AlertCrawler'
import {
  makeTraceId,
  makeTaskId,
  makeChoiceId,
} from '@schemas/gameState.schema'
import type { ResultTrace } from '@schemas/resultTrace.schema'

function makeTrace(id: string, body: string, timestamp = 1700000000000): ResultTrace {
  return {
    id: makeTraceId(id),
    sourceTaskId: makeTaskId('q1-w1-east-wilmer'),
    sourceChoiceId: makeChoiceId('mercy-margin'),
    stageOneAncestryId: makeStageOneAncestryId('q1-w1-east-wilmer', 'mercy-margin'),
    timestamp,
    body,
  }
}

describe('<AlertCrawler>', () => {
  beforeEach(() => {
    useGameStore.setState({ ledger: [] })
  })
  afterEach(cleanup)

  it('renders nothing when the ledger is empty (silence, not empty chatter)', () => {
    render(React.createElement(AlertCrawler))
    expect(screen.queryByTestId('alert-crawler')).not.toBeInTheDocument()
  })

  it('surfaces the newest ledger entry inside a polite live region', () => {
    useGameStore.setState({
      ledger: [makeTrace('t-1', 'You named the Mourner. The chorus deepens.')],
    })
    render(React.createElement(AlertCrawler))
    const region = screen.getByRole('status', { name: 'Latest alert' })
    expect(region).toBeInTheDocument()
    expect(region.getAttribute('aria-live')).toBe('polite')
    expect(region.textContent).toContain('You named the Mourner')
  })

  it('shows the LAST trace when multiple are present (matches appendTrace push order)', () => {
    useGameStore.setState({
      ledger: [
        makeTrace('t-1', 'First entry.'),
        makeTrace('t-2', 'Middle entry.'),
        makeTrace('t-3', 'Latest entry.'),
      ],
    })
    render(React.createElement(AlertCrawler))
    const region = screen.getByTestId('alert-crawler')
    expect(region.textContent).toContain('Latest entry.')
    expect(region.textContent).not.toContain('First entry.')
    expect(region.textContent).not.toContain('Middle entry.')
  })
})
