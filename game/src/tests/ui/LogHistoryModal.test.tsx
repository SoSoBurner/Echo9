/**
 * LogHistoryModal tests (Task 13, PLAN.md §10).
 *
 * The history modal is embedded in LogDock — opened via the "View all (N)"
 * button or the L key. These tests render LogDock with seeded ledgers and
 * exercise the open/close lifecycle.
 *
 * Acceptance:
 *   - Open via the "View all" button → dialog.open === true.
 *   - Focus moves to the modal heading (tabIndex=-1, same pattern as
 *     ConsequenceReturnPanel + ResultCard).
 *   - Escape (native <dialog> cancel) closes the modal.
 *   - Backdrop click (e.target === dialog) closes the modal.
 *   - With ledger.length <= 100 → renders with plain .map().
 *   - With ledger.length > 100 → lazy-loads VirtualLog inside a Suspense
 *     boundary. We don't intercept the chunk; we assert that after the
 *     async load resolves, the rendered DOM contains list items.
 */
import {
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
  afterEach,
  vi,
} from 'vitest'
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import React from 'react'
import { LogDock } from '@ui/log/LogDock'
import { useGameStore } from '@state/store'
import { resetStore } from '@tests/state/testHelpers'
import type { ResultTrace } from '@schemas/resultTrace.schema'
import {
  makeTraces,
  installVirtualizerStubs,
  restoreVirtualizerStubs,
} from './virtualLogTestHelpers'

// jsdom stubs so the >100 case can render rows in VirtualLog. Shared
// with VirtualLog.test.tsx — these are no-ops in a real browser because
// the real layout overrides them.
beforeAll(installVirtualizerStubs)
afterAll(restoreVirtualizerStubs)

function seedLedger(traces: ResultTrace[]): void {
  useGameStore.setState({ ledger: traces })
}

// jsdom <dialog>.showModal can throw "Not implemented"; stub it.
beforeEach(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.open = true
    }
  } else {
    vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function (
      this: HTMLDialogElement,
    ) {
      this.open = true
    })
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () {
      this.open = false
    }
  } else {
    vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (
      this: HTMLDialogElement,
    ) {
      this.open = false
    })
  }
})

// Restore spies so layered mocks don't accumulate across tests or leak
// into sibling test files in the same Vitest worker.
afterEach(() => {
  vi.restoreAllMocks()
})

describe('LogHistoryModal (inside LogDock)', () => {
  beforeEach(() => {
    resetStore()
    cleanup()
  })

  it('opens when the "View all" button is clicked', () => {
    seedLedger(makeTraces(30))
    render(React.createElement(LogDock))

    fireEvent.click(screen.getByRole('button', { name: /view all/i }))

    const dlg = document.querySelector('dialog')
    expect(dlg).toBeTruthy()
    expect((dlg as HTMLDialogElement).open).toBe(true)
  })

  it('moves focus to the heading on open (tabIndex=-1)', () => {
    seedLedger(makeTraces(30))
    render(React.createElement(LogDock))

    fireEvent.click(screen.getByRole('button', { name: /view all/i }))

    const heading = screen.getByRole('heading', { name: /history/i })
    expect(heading.getAttribute('tabindex')).toBe('-1')
    expect(document.activeElement).toBe(heading)
  })

  it('Escape (cancel event) closes the modal', () => {
    seedLedger(makeTraces(30))
    render(React.createElement(LogDock))

    fireEvent.click(screen.getByRole('button', { name: /view all/i }))

    const dlg = document.querySelector('dialog') as HTMLDialogElement
    fireEvent(dlg, new Event('cancel', { cancelable: true }))
    expect(dlg.open).toBe(false)
  })

  it('backdrop click closes the modal', () => {
    seedLedger(makeTraces(30))
    render(React.createElement(LogDock))

    fireEvent.click(screen.getByRole('button', { name: /view all/i }))

    const dlg = document.querySelector('dialog') as HTMLDialogElement
    // e.target === dialog → backdrop click.
    fireEvent.click(dlg)
    expect(dlg.open).toBe(false)
  })

  it('explicit Close button closes the modal', () => {
    seedLedger(makeTraces(30))
    render(React.createElement(LogDock))

    fireEvent.click(screen.getByRole('button', { name: /view all/i }))

    fireEvent.click(screen.getByRole('button', { name: /^close$/i }))

    const dlg = document.querySelector('dialog') as HTMLDialogElement
    expect(dlg.open).toBe(false)
  })

  it('restores focus to the opener element on close (WCAG 2.4.3 / 3.2.1)', () => {
    seedLedger(makeTraces(30))
    render(React.createElement(LogDock))

    const opener = screen.getByRole('button', {
      name: /view all/i,
    }) as HTMLButtonElement
    // Simulate keyboard-only path: caller focused the button explicitly
    // before activating it (no mouse focus). This mirrors the L-key
    // entry point where focus may sit on an arbitrary HUD widget.
    opener.focus()
    expect(document.activeElement).toBe(opener)

    fireEvent.click(opener)
    // After open, focus moved to the heading.
    const heading = screen.getByRole('heading', { name: /history/i })
    expect(document.activeElement).toBe(heading)

    fireEvent.click(screen.getByRole('button', { name: /^close$/i }))

    // Close should land focus back on the opener, not on some other HUD widget.
    expect(document.activeElement).toBe(opener)
  })

  it('renders 50 entries with plain .map() (no virtualization)', () => {
    seedLedger(makeTraces(50))
    render(React.createElement(LogDock))

    fireEvent.click(screen.getByRole('button', { name: /view all/i }))

    // Inside the dialog: all 50 entries are present in the DOM.
    const dlg = document.querySelector('dialog') as HTMLDialogElement
    const entries = dlg.querySelectorAll('[data-trace-id]')
    expect(entries.length).toBe(50)
  })

  it('lazy-loads VirtualLog when ledger.length > 100', async () => {
    seedLedger(makeTraces(150))
    render(React.createElement(LogDock))

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /view all/i }))
    })

    // findByRole retries until the timeout — under full-suite worker
    // load the vitest dynamic-import + Suspense-commit chain can exceed
    // the 1000ms default, so we give it 5000ms to survive contention.
    // The virtualized path has aria-label "Full log history (virtualized)".
    const list = await screen.findByRole(
      'list',
      { name: /full log history/i },
      { timeout: 5000 },
    )

    const dlg = document.querySelector('dialog') as HTMLDialogElement
    expect(dlg).toBeTruthy()
    expect(list).toBeTruthy()
    const items = dlg.querySelectorAll('[role="listitem"]')
    // At least the overscan window should render some rows.
    expect(items.length).toBeGreaterThan(0)
    // All rendered items carry aria-setsize == 150.
    items.forEach((node) => {
      expect(node.getAttribute('aria-setsize')).toBe('150')
    })
  })
})
