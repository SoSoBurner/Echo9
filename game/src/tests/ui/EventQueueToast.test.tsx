/**
 * EventQueueToast tests (Task 12, PLAN.md §10).
 *
 * Acceptance:
 *   - role="status" is absent when the queue is empty (component returns null).
 *   - Singular copy "N echo pending" for count === 1.
 *   - Plural copy "N echoes pending" for count > 1.
 *   - Live drain: mounting once, then mutating the store, must re-render the
 *     toast (Zustand subscription). Wrapped in React 19 `act(async)` so the
 *     external store update flushes before assertion.
 *
 * Copy is split across a <span> for the count and inline text for the word,
 * so regex assertions use \s+ instead of a bare space.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import React from 'react'
import { EventQueueToast } from '@ui/consequence/EventQueueToast'
import { useGameStore } from '@state/store'
import { resetStore } from '@tests/state/testHelpers'
import { makePhaseHook } from '@tests/systems/fixtures/hookFixtures'

describe('EventQueueToast', () => {
  beforeEach(() => {
    resetStore()
    cleanup()
  })

  it('renders nothing when pendingFiredHooks is empty', () => {
    render(React.createElement(EventQueueToast))
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('renders singular "1 echo pending" for one queued hook', () => {
    useGameStore.setState({ pendingFiredHooks: [makePhaseHook('single-a')] })
    render(React.createElement(EventQueueToast))
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent(/1\s+echo\s+pending/i)
  })

  it('renders plural "3 echoes pending" for multiple queued hooks', () => {
    useGameStore.setState({
      pendingFiredHooks: [
        makePhaseHook('plural-a'),
        makePhaseHook('plural-b'),
        makePhaseHook('plural-c'),
      ],
    })
    render(React.createElement(EventQueueToast))
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent(/3\s+echoes\s+pending/i)
  })

  it('live-drains: 2 hooks → ack once shows "1 echo"; ack again removes the toast', async () => {
    useGameStore.setState({
      pendingFiredHooks: [makePhaseHook('drain-a'), makePhaseHook('drain-b')],
    })
    render(React.createElement(EventQueueToast))

    // Initial plural copy.
    expect(screen.getByRole('status')).toHaveTextContent(/2\s+echoes\s+pending/i)

    // First ack — head shifts, count becomes 1, copy flips to singular.
    await act(async () => {
      useGameStore.getState().ackFirstPending()
    })
    expect(screen.getByRole('status')).toHaveTextContent(/1\s+echo\s+pending/i)

    // Second ack — queue empties, component returns null.
    await act(async () => {
      useGameStore.getState().ackFirstPending()
    })
    expect(screen.queryByRole('status')).toBeNull()
  })
})
