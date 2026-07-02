/**
 * focusRestoration.test.tsx — WCAG 2.4.3 focus-order pinning for
 * ConsequenceReturnPanel (Task 5).
 *
 * On close, focus MUST return to whatever element had focus before the panel
 * opened. Mirrors the opener-ref pattern already proven in LogDock's
 * LogHistoryModal (`src/ui/log/LogDock.tsx:143,152,157-158`).
 *
 * Two close paths exercise the same restore branch:
 *   1. Acknowledge button — the "read and dismiss" flow.
 *   2. Escape (native <dialog> `cancel` event) — the deferral flow.
 *
 * Layout mounts multiple <dialog> elements (LogDock's history modal is one),
 * so tests find the panel dialog by its aria-labelledby id rather than by
 * the generic `dialog` selector — otherwise `querySelector('dialog')`
 * returns the LogDock modal in DOM order and the cancel event goes to the
 * wrong listener.
 */
import { describe, it, expect, beforeEach, beforeAll, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react'
import React from 'react'
import { Layout } from '@ui/shell/Layout'
import { useGameStore } from '@state/store'
import { resetStore } from '@tests/state/testHelpers'
import { makePhaseHook } from '@tests/systems/fixtures/hookFixtures'

// jsdom does not implement HTMLDialogElement.showModal/close — stub them
// the same way LogHistoryModal.test.tsx does. Also stub window.matchMedia
// because Layout mounts SilasPromptPanel, which reads a prefers-reduced-
// motion media query at first render (shim mirrors SilasPromptPanel.test).
beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.open = true
    }
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () {
      this.open = false
    }
  }
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })),
  )
})

/**
 * Layout mounts LogDock's history modal AND ConsequenceReturnPanel; both
 * render a bare <dialog>. Find the panel's dialog by its aria-labelledby id
 * so cancel events go to the right listener.
 */
function findConsequenceDialog(): HTMLDialogElement {
  const dlg = Array.from(document.querySelectorAll('dialog')).find(
    (d) => d.getAttribute('aria-labelledby') === 'consequence-return-title',
  )
  if (!dlg) throw new Error('ConsequenceReturnPanel dialog not found')
  return dlg as HTMLDialogElement
}

function findOpener(): HTMLButtonElement {
  const buttons = Array.from(document.querySelectorAll('button'))
  const btn = buttons.find((b) => !b.disabled)
  if (!btn) throw new Error('Layout produced no focusable buttons — seed setup drifted')
  return btn as HTMLButtonElement
}

describe('ConsequenceReturnPanel — focus restoration on close (WCAG 2.4.3)', () => {
  beforeEach(() => {
    resetStore()
    cleanup()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('Acknowledge → focus returns to the element focused before C-key', async () => {
    // Seed one pending hook so the C-key path is unlocked.
    useGameStore.setState({ pendingFiredHooks: [makePhaseHook('focus-restore-01')] })
    // Advance phase past BOOT so Layout renders the shell body.
    useGameStore.getState().setPhase('FIRST_DIRECTIVE')

    render(React.createElement(Layout))

    // Simulate a keyboard-only player parked on some HUD widget when they hit C.
    const opener = findOpener()
    opener.focus()
    expect(document.activeElement).toBe(opener)

    // Press C at window level (useKeyboardNav listens on window).
    await act(async () => {
      fireEvent.keyDown(window, { key: 'c', code: 'KeyC' })
    })

    // Focus moved to the panel heading.
    const heading = screen.getByRole('heading', { name: /consequence returns/i })
    expect(document.activeElement).toBe(heading)

    // Close via the Acknowledge button (React synthetic onClick → parent
    // setState). The opener-ref restore branch runs on the resulting
    // panel re-render with open=false.
    const ack = screen.getByRole('button', { name: /acknowledge/i })
    await act(async () => {
      fireEvent.click(ack)
    })

    // Focus MUST be back on the original opener, not on the (now unmounted)
    // heading and not on <body>.
    expect(document.activeElement).toBe(opener)
  })

  it('Escape (cancel event) → focus returns to the element focused before C-key', async () => {
    useGameStore.setState({ pendingFiredHooks: [makePhaseHook('focus-restore-02')] })
    useGameStore.getState().setPhase('FIRST_DIRECTIVE')

    render(React.createElement(Layout))

    const opener = findOpener()
    opener.focus()

    await act(async () => {
      fireEvent.keyDown(window, { key: 'c', code: 'KeyC' })
    })

    const heading = screen.getByRole('heading', { name: /consequence returns/i })
    expect(document.activeElement).toBe(heading)

    // Native <dialog> cancel event — this is the ESC-key equivalent since
    // the browser (and jsdom) fires `cancel` on ESC. The panel's listener
    // calls onClose → parent setState → panel re-render → close-branch
    // effect → openerRef.current.focus().
    const dlg = findConsequenceDialog()
    await act(async () => {
      dlg.dispatchEvent(new Event('cancel', { cancelable: true, bubbles: true }))
    })

    expect(document.activeElement).toBe(opener)
  })
})
