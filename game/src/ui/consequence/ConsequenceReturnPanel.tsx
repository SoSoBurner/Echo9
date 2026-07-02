/**
 * ConsequenceReturnPanel — modal that surfaces the 7 §11 fields of a fired
 * consequence (Task 12, PLAN.md §8, §10, §11).
 *
 * Renders the FIRST hook in `pendingFiredHooks`. "Acknowledge" calls
 * `ackFirstPending()` (which shifts the head), closes the panel, and lets the
 * player press C again to review the next one (if any). One ack at a time —
 * this preserves the deliberate "absorption" beat the spec calls for.
 *
 * Why native <dialog> (mirrors InspectionPanel):
 *   - Browser handles focus trap + top-layer + inert background for free.
 *   - On open: focus moves to the heading (tabIndex=-1) for screen-reader
 *     parity with ResultCard. PLAN.md §10.
 *
 * Differs from InspectionPanel:
 *   - Escape DOES close (the player can defer review). The toast persists
 *     and the C key re-opens. InspectionPanel forbids ESC because answering
 *     is mandatory mid-phase.
 *   - Backdrop click closes (matches CapitalPowerPanel's deferral pattern).
 *
 * Label format MUST match `materialize()` in consequenceEngine.ts so the
 * same value text appears whether the player reads the panel or the ledger
 * trace (§11 single-source-of-truth for echo content).
 */
import { useCallback, useEffect, useRef } from 'react'
import type {
  ConsequenceHook,
  RevealCondition,
} from '@schemas/consequenceHook.schema'
import { useGameStore } from '@state/store'

interface ConsequenceReturnPanelProps {
  /** Controlled open-state; Layout owns this via local useState. */
  open: boolean
  /** Caller closes its own state (Layout sets showPanel=false). */
  onClose: () => void
}

/**
 * Mirrors the private serializeCondition() in consequenceEngine.ts. Kept
 * inline because exporting the private helper would widen the engine's API
 * surface for a single UI consumer; if a third caller appears, hoist to a
 * shared @systems/serializeCondition.ts.
 */
function serializeCondition(condition: RevealCondition): string {
  switch (condition.type) {
    case 'PHASE':
      return `PHASE:${condition.phase}`
    case 'METER_THRESHOLD':
      return `METER_THRESHOLD:${condition.meter}:${condition.threshold}`
    case 'FLAG':
      return `FLAG:${condition.flag}`
    case 'NEVER':
      return 'NEVER'
  }
}

export function ConsequenceReturnPanel({
  open,
  onClose,
}: ConsequenceReturnPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  // Snapshot the opener so keyboard-only entry (C key) returns focus deterministically.
  const openerRef = useRef<HTMLElement | null>(null)
  const ackFirstPending = useGameStore((s) => s.ackFirstPending)
  // Reading the first pending hook directly here means the panel re-renders
  // when the queue head changes (e.g. ack pops, next hook becomes head).
  const hook: ConsequenceHook | undefined = useGameStore(
    (s) => s.pendingFiredHooks[0],
  )

  // Open/close the dialog imperatively based on the `open` prop. We focus
  // the heading synchronously after showModal() so screen readers (and the
  // focus-move acceptance test) see the move immediately. Mirrors
  // ResultCard's synchronous focus pattern (line 18).
  useEffect(() => {
    const dlg = dialogRef.current
    if (!dlg) return
    if (open && !dlg.open) {
      openerRef.current = document.activeElement as HTMLElement | null
      dlg.showModal()
      headingRef.current?.focus()
    } else if (!open && dlg.open) {
      dlg.close()
      openerRef.current?.focus()
      openerRef.current = null
    }
  }, [open])

  // Escape: native <dialog> fires `cancel`. Allow it (default behaviour),
  // but route through our onClose so the parent's `open` state stays in sync.
  useEffect(() => {
    const dlg = dialogRef.current
    if (!dlg) return
    const onCancel = (_e: Event) => {
      // Do NOT preventDefault — letting the dialog close is the desired
      // deferral behaviour. Notify the parent so its `open` state updates.
      onClose()
    }
    dlg.addEventListener('cancel', onCancel)
    return () => dlg.removeEventListener('cancel', onCancel)
  }, [onClose])

  const handleAcknowledge = useCallback(() => {
    ackFirstPending()
    onClose()
  }, [ackFirstPending, onClose])

  // Backdrop click — when the click target IS the dialog element (not an
  // inner child), the player clicked the backdrop area. Mirrors the established
  // pattern from CapitalPowerPanel.
  const handleDialogClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onClose()
      }
    },
    [onClose],
  )

  // Single <dialog> element always mounts (matches InspectionPanel pattern).
  // The body is conditionally rendered so the heading with id
  // `consequence-return-title` only exists while `hook` is present — but the
  // dialog itself never unmounts, so the close-effect can fire `dlg.close()`
  // on transitions, and we never have a broken aria-labelledby pointing at a
  // missing id. When the body is absent we drop `aria-labelledby` entirely
  // rather than pointing at a non-existent node (WCAG 2.2 AA).
  const showBody = open && Boolean(hook)

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={showBody ? 'consequence-return-title' : undefined}
      onClick={showBody ? handleDialogClick : undefined}
      className={[
        'p-0 m-auto bg-background text-fg-primary border border-silas-accent',
        'min-w-[480px] max-w-[640px]',
        '[&::backdrop]:bg-black/70',
      ].join(' ')}
    >
      {showBody && hook && (
        <div className="p-6 space-y-4">
          <header className="flex items-baseline justify-between">
            <h2
              id="consequence-return-title"
              ref={headingRef}
              tabIndex={-1}
              className="text-silas-accent text-xs font-mono uppercase tracking-widest focus:outline-none"
            >
              Consequence Returns
            </h2>
            <span className="text-fg-secondary text-xs font-mono">
              Echo
            </span>
          </header>

          <dl className="space-y-3 text-sm leading-relaxed">
            <Field label="WHY NOW:" value={hook.whyNow} />
            <Field label="WHAT CHANGED:" value={hook.whatChanged} />
            <Field label="TRACE:" value={hook.traceHint} />
            <Field label="LEDGER:" value={hook.ledgerEntry} />
            <Field label="SOURCE TASK:" value={hook.sourceTaskId} />
            <Field label="SOURCE CHOICE:" value={hook.sourceChoiceId} />
            <Field
              label="REVEAL:"
              value={serializeCondition(hook.revealCondition)}
            />
          </dl>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleAcknowledge}
              className={[
                'px-4 py-2 text-xs font-mono uppercase tracking-widest',
                'border border-null-accent text-null-accent',
                'hover:bg-null-accent hover:text-background',
                'focus:outline-none focus:ring-2 focus:ring-null-accent',
              ].join(' ')}
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}

/**
 * Single field row — label + value. Keeps the markup uniform so the test
 * `getByText(/LABEL:/i)` works for every field without per-row variation.
 */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-x-3">
      <dt className="text-silas-accent text-xs font-mono uppercase tracking-wider">
        {label}
      </dt>
      <dd className="text-fg-primary">{value}</dd>
    </div>
  )
}
