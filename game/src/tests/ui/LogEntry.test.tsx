/**
 * LogEntry tests (Task 13, PLAN.md §10).
 *
 * Acceptance:
 *   - Renders timestamp (HH:MM), short body excerpt, and the source ChoiceId.
 *   - `React.memo` with shallow `trace` prop comparison — same reference
 *     means no re-render. The shallow check is correct because ResultTrace
 *     is a frozen value object written exactly once in ledgerSlice.
 */
import { makeStageOneAncestryId } from '@schemas/resultTrace.schema'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import React, { useState } from 'react'
import { LogEntry } from '@ui/log/LogEntry'
import type { ResultTrace } from '@schemas/resultTrace.schema'
import { fxTaskId, fxChoiceId, fxTraceId } from '@tests/schemas/fixtures'

function makeTrace(overrides: Partial<ResultTrace> = {}): ResultTrace {
  return {
    id: fxTraceId(),
    sourceTaskId: fxTaskId(),
    sourceChoiceId: fxChoiceId('choice-east-wilmer-reduce-40'),
    stageOneAncestryId: makeStageOneAncestryId('task-fx', 'choice-east-wilmer-reduce-40'),
    // 2026-06-30T09:05:00Z → 09:05 in UTC-normalised display
    timestamp: new Date('2026-06-30T09:05:00Z').getTime(),
    body: 'East Wilmer maintenance reduced by 40%.',
    ...overrides,
  }
}

describe('LogEntry', () => {
  beforeEach(() => {
    cleanup()
  })

  it('renders the trace body text', () => {
    const trace = makeTrace()
    render(React.createElement(LogEntry, { trace }))
    expect(screen.getByText(/East Wilmer maintenance/i)).toBeTruthy()
  })

  it('renders a HH:MM timestamp', () => {
    const trace = makeTrace()
    render(React.createElement(LogEntry, { trace }))
    // toLocaleTimeString with hour/minute → matches /\d{1,2}:\d{2}/
    const matches = screen.getAllByText(/\d{1,2}:\d{2}/)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('renders the sourceChoiceId', () => {
    const trace = makeTrace({ sourceChoiceId: fxChoiceId('choice-distinct-id-001') })
    render(React.createElement(LogEntry, { trace }))
    expect(screen.getByText(/choice-distinct-id-001/)).toBeTruthy()
  })

  it('is memoized — same trace reference does not re-execute render body', () => {
    // Count reads of the `body` property on the trace prop. LogEntry's
    // render reads it; React.memo with shallow comparison should mean
    // that re-rendering the parent with the SAME trace reference skips
    // LogEntry's render body entirely.
    let bodyReads = 0
    const trace = makeTrace()
    const proxy = new Proxy(trace, {
      get(target, prop, receiver) {
        if (prop === 'body') bodyReads += 1
        return Reflect.get(target, prop, receiver)
      },
    }) as ResultTrace

    let bump: (() => void) | null = null
    function Wrapper() {
      const [, setN] = useState(0)
      bump = () => setN((n) => n + 1)
      return React.createElement(LogEntry, { trace: proxy })
    }

    render(React.createElement(Wrapper))
    expect(bodyReads).toBeGreaterThan(0) // initial render did read body
    const afterInitial = bodyReads
    act(() => {
      bump!()
      bump!()
    })
    // Same trace reference → memoized, render body skipped → no new reads.
    expect(bodyReads).toBe(afterInitial)
  })

  it('re-renders when the trace reference changes', () => {
    const trace1 = makeTrace({ body: 'first body' })
    const trace2 = makeTrace({ body: 'second body' })
    const { rerender } = render(React.createElement(LogEntry, { trace: trace1 }))
    expect(screen.getByText(/first body/)).toBeTruthy()
    rerender(React.createElement(LogEntry, { trace: trace2 }))
    expect(screen.getByText(/second body/)).toBeTruthy()
  })
})
