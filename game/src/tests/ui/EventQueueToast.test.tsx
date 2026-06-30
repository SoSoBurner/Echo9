/**
 * EventQueueToast tests (Task 12, PLAN.md §10).
 *
 * Acceptance constraints:
 *   - role="status" — announced by screen readers without stealing focus.
 *   - aria-live="polite" — never assertive (that would interrupt narration).
 *   - Hidden from the DOM when the queue is empty.
 *   - Shows the count + the C-key hint when populated.
 *   - Never calls .focus() on itself — only the panel takes focus on review.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'
import { EventQueueToast } from '@ui/consequence/EventQueueToast'
import { useGameStore } from '@state/store'
import { resetStore } from '@tests/state/testHelpers'
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import { fxTaskId, fxChoiceId, fxConsequenceId } from '@tests/schemas/fixtures'

function makeHook(id: string): ConsequenceHook {
  return {
    id: fxConsequenceId(id),
    sourceTaskId: fxTaskId(),
    sourceChoiceId: fxChoiceId(),
    traceHint: `hint-${id}`,
    ledgerEntry: `entry-${id}`,
    revealCondition: { type: 'PHASE', phase: 'CONSEQUENCE_RETURN' },
    whyNow: `why-${id}`,
    whatChanged: `what-${id}`,
  }
}

describe('EventQueueToast', () => {
  beforeEach(() => {
    resetStore()
    cleanup()
  })

  it('renders nothing when pendingFiredHooks is empty', () => {
    render(React.createElement(EventQueueToast))
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('renders role="status" with aria-live="polite" when populated', () => {
    useGameStore.getState().enqueueFired([makeHook('a')])
    render(React.createElement(EventQueueToast))
    const status = screen.getByRole('status')
    expect(status).toBeTruthy()
    expect(status.getAttribute('aria-live')).toBe('polite')
  })

  it('shows the count (singular) and key hint for one pending hook', () => {
    useGameStore.getState().enqueueFired([makeHook('a')])
    render(React.createElement(EventQueueToast))
    const status = screen.getByRole('status')
    expect(status.textContent).toMatch(/1/)
    expect(status.textContent?.toLowerCase()).toContain('echo')
    expect(status.textContent?.toLowerCase()).toContain('press c')
  })

  it('shows the plural count for multiple pending hooks', () => {
    useGameStore.getState().enqueueFired([makeHook('a'), makeHook('b'), makeHook('c')])
    render(React.createElement(EventQueueToast))
    const status = screen.getByRole('status')
    expect(status.textContent).toMatch(/3/)
    expect(status.textContent?.toLowerCase()).toContain('echoes')
  })

  it('does not call .focus() on itself when mounted with pending hooks', () => {
    useGameStore.getState().enqueueFired([makeHook('a')])
    // Spy on HTMLElement.focus globally — if anything in the toast focuses
    // itself, this will catch it.
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus')
    render(React.createElement(EventQueueToast))
    expect(focusSpy).not.toHaveBeenCalled()
    focusSpy.mockRestore()
  })
})
