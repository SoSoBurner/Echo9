/**
 * ConsequenceReturnPanel tests (Task 12, PLAN.md §10, §11).
 *
 * Acceptance:
 *   - All 7 §11 fields render with named labels matching materialize() output:
 *       WHY NOW, WHAT CHANGED, TRACE, LEDGER, SOURCE TASK, SOURCE CHOICE, REVEAL.
 *   - On open, focus moves to the heading (tabIndex=-1).
 *   - Acknowledge button calls ackFirstPending and closes.
 *   - Escape closes (matches InspectionPanel's `cancel` native behaviour
 *     — except here ESC IS allowed since the player can defer review).
 *   - Backdrop click closes (matches CapitalPowerPanel — defer pattern).
 *
 * jsdom's <dialog> support is incomplete; we read `open` to verify state
 * rather than relying on focus-trap behaviour.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import React from 'react'
import { ConsequenceReturnPanel } from '@ui/consequence/ConsequenceReturnPanel'
import { useGameStore } from '@state/store'
import { resetStore } from '@tests/state/testHelpers'
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import {
  fxTaskId,
  fxChoiceId,
  fxConsequenceId,
} from '@tests/schemas/fixtures'

function makeHook(): ConsequenceHook {
  return {
    id: fxConsequenceId('cons-panel-001'),
    sourceTaskId: fxTaskId('task-mercy-margin'),
    sourceChoiceId: fxChoiceId('choice-reduce-40'),
    traceHint: 'East Wilmer HVAC failed during the August heat dome.',
    ledgerEntry: 'HVAC failed; two infants admitted; Lenora filed a report.',
    revealCondition: { type: 'PHASE', phase: 'CONSEQUENCE_RETURN' },
    whyNow: 'The 40% maintenance cut deferred the compressor service.',
    whatChanged: 'Pediatric ward ran on portable cooling for 9 days.',
  }
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

describe('ConsequenceReturnPanel', () => {
  beforeEach(() => {
    resetStore()
    cleanup()
  })

  it('renders nothing visible when not open', () => {
    useGameStore.getState().enqueueFired([makeHook()])
    render(
      React.createElement(ConsequenceReturnPanel, {
        open: false,
        onClose: () => {},
      }),
    )
    // Heading is not in the DOM when not open.
    expect(screen.queryByRole('heading', { name: /consequence/i })).toBeNull()
  })

  it('renders all 7 §11 fields with named labels matching the first pending hook', () => {
    const hook = makeHook()
    useGameStore.getState().enqueueFired([hook])
    render(
      React.createElement(ConsequenceReturnPanel, {
        open: true,
        onClose: () => {},
      }),
    )

    // Labels — exact match to materialize() output in consequenceEngine.ts.
    expect(screen.getByText(/WHY NOW:/i)).toBeTruthy()
    expect(screen.getByText(/WHAT CHANGED:/i)).toBeTruthy()
    expect(screen.getByText(/TRACE:/i)).toBeTruthy()
    expect(screen.getByText(/LEDGER:/i)).toBeTruthy()
    expect(screen.getByText(/SOURCE TASK:/i)).toBeTruthy()
    expect(screen.getByText(/SOURCE CHOICE:/i)).toBeTruthy()
    expect(screen.getByText(/REVEAL:/i)).toBeTruthy()

    // Values — the hook's text appears verbatim.
    expect(screen.getByText(new RegExp(hook.whyNow))).toBeTruthy()
    expect(screen.getByText(new RegExp(hook.whatChanged))).toBeTruthy()
    expect(screen.getByText(new RegExp(hook.traceHint))).toBeTruthy()
    expect(screen.getByText(new RegExp(hook.ledgerEntry))).toBeTruthy()
    expect(screen.getByText(new RegExp(hook.sourceTaskId))).toBeTruthy()
    expect(screen.getByText(new RegExp(hook.sourceChoiceId))).toBeTruthy()
    // REVEAL stringified as "PHASE:CONSEQUENCE_RETURN"
    expect(screen.getByText(/PHASE:CONSEQUENCE_RETURN/)).toBeTruthy()
  })

  it('moves focus to the heading on open (tabIndex=-1)', () => {
    useGameStore.getState().enqueueFired([makeHook()])
    render(
      React.createElement(ConsequenceReturnPanel, {
        open: true,
        onClose: () => {},
      }),
    )
    const heading = screen.getByRole('heading', { name: /consequence/i })
    expect(heading.getAttribute('tabindex')).toBe('-1')
    expect(document.activeElement).toBe(heading)
  })

  it('Acknowledge button acks the first pending hook and calls onClose', () => {
    const hookA = makeHook()
    const hookB: ConsequenceHook = {
      ...makeHook(),
      id: fxConsequenceId('cons-panel-002'),
      whyNow: 'B-why',
      whatChanged: 'B-what',
      traceHint: 'B-trace',
      ledgerEntry: 'B-ledger',
    }
    useGameStore.getState().enqueueFired([hookA, hookB])

    const onClose = vi.fn()
    render(
      React.createElement(ConsequenceReturnPanel, {
        open: true,
        onClose,
      }),
    )

    const ack = screen.getByRole('button', { name: /acknowledge/i })
    fireEvent.click(ack)

    expect(useGameStore.getState().pendingFiredHooks).toHaveLength(1)
    expect(useGameStore.getState().pendingFiredHooks[0]?.id).toBe(hookB.id)
    expect(onClose).toHaveBeenCalled()
  })

  it('Escape key closes the dialog (calls onClose)', () => {
    useGameStore.getState().enqueueFired([makeHook()])
    const onClose = vi.fn()
    render(
      React.createElement(ConsequenceReturnPanel, {
        open: true,
        onClose,
      }),
    )

    // Native <dialog> fires a `cancel` event on Escape.
    const dialog = document.querySelector('dialog')
    expect(dialog).toBeTruthy()
    fireEvent(dialog as Element, new Event('cancel', { cancelable: true }))
    expect(onClose).toHaveBeenCalled()
  })

  it('backdrop click closes the dialog (calls onClose)', () => {
    useGameStore.getState().enqueueFired([makeHook()])
    const onClose = vi.fn()
    render(
      React.createElement(ConsequenceReturnPanel, {
        open: true,
        onClose,
      }),
    )

    const dialog = document.querySelector('dialog') as HTMLDialogElement
    expect(dialog).toBeTruthy()
    // Click on the dialog element itself (not its inner content) simulates
    // a backdrop click — the panel inspects e.target === dialog.
    fireEvent.click(dialog)
    expect(onClose).toHaveBeenCalled()
  })
})
