/**
 * EndOfContentOverlay tests (Task C4, Q46 + Q48 locks).
 *
 * Acceptance (plan §C4):
 *   1. Renders nothing when endOfContentSeen === false.
 *   2. Renders the dialog when endOfContentSeen === true (showModal ran).
 *   3. Body copy is present verbatim.
 *   4. Escape does NOT dismiss — `cancel` event has defaultPrevented=true.
 *   5. Only one interactive button, labeled "Replay".
 *   6. Replay clears BOTH persistence keys and calls window.location.reload().
 *   7. `endOfContentShown` beat is marked exactly once, even across re-renders.
 *
 * jsdom's <dialog> support is incomplete — the same shim used by
 * ConsequenceReturnPanel.test.tsx is applied to `showModal` / `close` so the
 * effect sees `dlg.open` flip correctly.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import React from 'react'
import { EndOfContentOverlay } from '@ui/endOfContent/EndOfContentOverlay'
import { useGameStore, PERSIST_KEY } from '@state/store'
import { resetStore } from '@tests/state/testHelpers'
import { getBeats, resetBeats } from '@ui/debug/BeatTelemetry'

const END_OF_CONTENT_KEY = 'echo9:endOfContentSeen'
const BODY_COPY =
  'Thank you for playing and look forward to future releases of this demo type language.'

// jsdom <dialog>.showModal can throw "Not implemented"; stub it. Matches
// ConsequenceReturnPanel.test.tsx.
beforeEach(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.open = true
    }
  } else {
    vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(
      function (this: HTMLDialogElement) {
        this.open = true
      },
    )
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () {
      this.open = false
    }
  } else {
    vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(
      function (this: HTMLDialogElement) {
        this.open = false
      },
    )
  }
})

describe('EndOfContentOverlay', () => {
  beforeEach(() => {
    resetStore()
    // resetStore() doesn't touch the endOfContent slice's own state or key.
    useGameStore.setState({ endOfContentSeen: false })
    localStorage.removeItem(END_OF_CONTENT_KEY)
    resetBeats()
    cleanup()
  })

  it('renders nothing when endOfContentSeen is false', () => {
    const { container } = render(React.createElement(EndOfContentOverlay))
    expect(container.querySelector('dialog')).toBeNull()
  })

  it('renders the modal dialog when endOfContentSeen flips true', () => {
    useGameStore.getState().markEndOfContentSeen()
    render(React.createElement(EndOfContentOverlay))

    const dlg = document.querySelector('dialog') as HTMLDialogElement | null
    expect(dlg).toBeTruthy()
    expect(dlg?.open).toBe(true)
  })

  it('renders the Q46 body copy verbatim', () => {
    useGameStore.getState().markEndOfContentSeen()
    render(React.createElement(EndOfContentOverlay))

    expect(screen.getByText(BODY_COPY)).toBeTruthy()
  })

  it('Escape does NOT dismiss — cancel event is preventDefault-ed', () => {
    useGameStore.getState().markEndOfContentSeen()
    render(React.createElement(EndOfContentOverlay))

    const dlg = document.querySelector('dialog') as HTMLDialogElement
    expect(dlg).toBeTruthy()

    // Dispatch a cancelable `cancel` event as the browser does on Escape.
    // The component's addEventListener('cancel', preventDefault) must set
    // defaultPrevented=true on the event.
    const evt = new Event('cancel', { cancelable: true })
    dlg.dispatchEvent(evt)
    expect(evt.defaultPrevented).toBe(true)
    // Dialog also stays open (showModal shim leaves .open=true; only close()
    // would flip it back).
    expect(dlg.open).toBe(true)
  })

  it('shows exactly one button, labeled "Replay"', () => {
    useGameStore.getState().markEndOfContentSeen()
    render(React.createElement(EndOfContentOverlay))

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(1)
    expect(buttons[0]?.textContent).toMatch(/replay/i)
  })

  it('Replay clears both persistence keys and reloads', () => {
    // Prime both keys as if a real post-Q1 player were sitting on the overlay.
    localStorage.setItem(PERSIST_KEY, '{"state":{},"version":0}')
    localStorage.setItem(END_OF_CONTENT_KEY, 'true')
    useGameStore.getState().markEndOfContentSeen()

    // jsdom marks window.location's own props non-configurable, so a direct
    // vi.spyOn(window.location, 'reload') throws. Swap the whole location
    // object with a getter-based override for the duration of this test.
    const originalLocation = window.location
    const reloadStub = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, reload: reloadStub },
      writable: true,
    })

    try {
      render(React.createElement(EndOfContentOverlay))
      fireEvent.click(screen.getByRole('button', { name: /replay/i }))

      expect(localStorage.getItem(PERSIST_KEY)).toBeNull()
      expect(localStorage.getItem(END_OF_CONTENT_KEY)).toBeNull()
      expect(reloadStub).toHaveBeenCalledTimes(1)
    } finally {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: originalLocation,
        writable: true,
      })
    }
  })

  it('marks endOfContentShown beat exactly once, even across re-renders', () => {
    useGameStore.getState().markEndOfContentSeen()

    const { rerender } = render(React.createElement(EndOfContentOverlay))
    expect(
      getBeats().filter((b) => b.name === 'endOfContentShown'),
    ).toHaveLength(1)

    // Re-render with the same seen=true — effect re-runs, but ref-guard +
    // markBeat's own idempotence must keep the count at 1.
    rerender(React.createElement(EndOfContentOverlay))
    expect(
      getBeats().filter((b) => b.name === 'endOfContentShown'),
    ).toHaveLength(1)
  })
})
