/**
 * LogDock — bottom-strip ledger view (Task 13, PLAN.md §10).
 *
 * Renders the last 12 ResultTrace entries from `ledgerSlice.ledger` with
 * a plain `.map()` — virtualization is reserved for the full-history
 * modal once `ledger.length > 100`. The dock chrome (region wrapper,
 * heading, "View all" button) NEVER moves; only the entry itself slides
 * in via the `.log-entry-enter` keyframe in src/index.css. PLAN.md §9:
 * "Stillness is the horror."
 *
 * The full-history modal is embedded here rather than as a sibling
 * component because (a) it shares ownership of the open/close state with
 * the L-key keyboard binding wired from Layout, and (b) keeping the
 * lazy `VirtualLog` import inside this single file means the dynamic
 * chunk boundary is local — no second indirection.
 *
 * Bundle gating: VirtualLog is `lazy(...)`-imported. It only loads when
 * the player opens the history modal AND has >100 ledger entries. For
 * the common case (a fresh session) the TanStack Virtual code never hits
 * the wire.
 *
 * Public surface: `<LogDock />` (no props). The L-key toggle is exposed
 * via an imperative `useImperativeHandle`-free callback registration so
 * Layout's `useKeyboardNav.onLogToggle` can flip the modal without
 * re-rendering this component. We use a forwarded handle prop instead of
 * lifting state up to keep LogDock self-contained — the dock owns its own
 * modal, the keyboard map merely asks it to toggle.
 */
import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useGameStore } from '@state/store'
import { LogEntry } from './LogEntry'

const VirtualLog = lazy(() =>
  import('./VirtualLog').then((m) => ({ default: m.VirtualLog })),
)

/** Dock window — last N entries shown in the always-visible strip. */
const DOCK_WINDOW = 12

/** Above this, the history modal flips to TanStack Virtual. */
const VIRTUALIZE_THRESHOLD = 100

interface LogDockProps {
  /**
   * Optional ref the parent uses to imperatively toggle the modal (e.g.
   * the L key in Layout). If omitted, the only way to open is the
   * "View all" button.
   */
  registerToggle?: (toggle: () => void) => void
}

export function LogDock({ registerToggle }: LogDockProps) {
  const ledger = useGameStore((s) => s.ledger)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  // Take the LAST `DOCK_WINDOW` entries (newest at the bottom). This
  // matches `appendTrace`'s push semantics so the visible order is
  // chronological — the freshest event sits adjacent to the dock chrome.
  const visible = ledger.slice(-DOCK_WINDOW)
  const hasOverflow = ledger.length > DOCK_WINDOW

  const openHistory = useCallback(() => setIsHistoryOpen(true), [])
  const closeHistory = useCallback(() => setIsHistoryOpen(false), [])
  const toggleHistory = useCallback(() => setIsHistoryOpen((v) => !v), [])

  // Hand the parent a stable toggle function. Re-runs only when the
  // parent's callback identity changes (it should be useCallback'd).
  useEffect(() => {
    registerToggle?.(toggleHistory)
  }, [registerToggle, toggleHistory])

  return (
    <section
      aria-label="Log dock"
      className="flex flex-col gap-1 h-full"
    >
      <header className="flex items-baseline justify-between px-1 pb-1">
        <h2 className="text-fg-secondary text-xs uppercase tracking-widest font-mono">
          Log
        </h2>
        {hasOverflow && (
          <button
            type="button"
            onClick={openHistory}
            className={[
              'text-fg-secondary hover:text-fg-primary',
              'text-xs font-mono uppercase tracking-wider',
              'border border-sealed-dim hover:border-fg-secondary',
              'px-2 py-0.5',
              'focus:outline-none focus:ring-2 focus:ring-null-accent',
            ].join(' ')}
          >
            View all ({ledger.length})
          </button>
        )}
      </header>

      {/*
        Entry list — plain .map() is correct here. The window is capped at
        12 so virtualization would be pure overhead. role="list" keeps the
        listitem children well-formed for AT.
      */}
      <div
        role="list"
        aria-label="Recent log entries"
        className="flex flex-col gap-0.5 overflow-hidden"
      >
        {visible.map((trace) => (
          <LogEntry key={trace.id} trace={trace} />
        ))}
      </div>

      <LogHistoryModal
        open={isHistoryOpen}
        onClose={closeHistory}
        ledger={ledger}
      />
    </section>
  )
}

// ---------------------------------------------------------------------------
// LogHistoryModal — internal to LogDock.
// ---------------------------------------------------------------------------

interface LogHistoryModalProps {
  open: boolean
  onClose: () => void
  ledger: ReadonlyArray<import('@schemas/resultTrace.schema').ResultTrace>
}

function LogHistoryModal({ open, onClose, ledger }: LogHistoryModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  // Snapshot the opener so L-key (no prior mouse focus) returns focus deterministically.
  const openerRef = useRef<HTMLElement | null>(null)

  // Open/close imperatively from the `open` prop. Focus moves to the
  // heading synchronously after showModal() so screen readers receive the
  // landmark change immediately — mirrors ConsequenceReturnPanel.
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

  // Escape (native <dialog> cancel) — let the default close happen and
  // route through onClose so the parent's state stays in sync.
  useEffect(() => {
    const dlg = dialogRef.current
    if (!dlg) return
    const onCancel = (_e: Event) => {
      onClose()
    }
    dlg.addEventListener('cancel', onCancel)
    return () => dlg.removeEventListener('cancel', onCancel)
  }, [onClose])

  // Backdrop click — same pattern as ConsequenceReturnPanel.
  const handleDialogClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onClose()
      }
    },
    [onClose],
  )

  const shouldVirtualize = ledger.length > VIRTUALIZE_THRESHOLD

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={open ? 'log-history-title' : undefined}
      onClick={open ? handleDialogClick : undefined}
      className={[
        'p-0 m-auto bg-background text-fg-primary border border-sealed-dim',
        'min-w-[560px] max-w-[820px] max-h-[80vh]',
        '[&::backdrop]:bg-black/70',
      ].join(' ')}
    >
      {open && (
        <div className="p-6 space-y-4 flex flex-col max-h-[80vh]">
          <header className="flex items-baseline justify-between shrink-0">
            <h2
              id="log-history-title"
              ref={headingRef}
              tabIndex={-1}
              className="text-fg-primary text-xs font-mono uppercase tracking-widest focus:outline-none"
            >
              Log History ({ledger.length})
            </h2>
            <button
              type="button"
              onClick={onClose}
              className={[
                'text-fg-secondary hover:text-fg-primary',
                'text-xs font-mono uppercase tracking-wider',
                'border border-sealed-dim hover:border-fg-secondary',
                'px-3 py-1',
                'focus:outline-none focus:ring-2 focus:ring-null-accent',
              ].join(' ')}
            >
              Close
            </button>
          </header>

          <div className="flex-1 overflow-hidden min-h-[200px]">
            {shouldVirtualize ? (
              <Suspense
                fallback={
                  <div
                    role="status"
                    aria-live="polite"
                    className="text-fg-secondary text-xs font-mono p-4"
                  >
                    Loading history…
                  </div>
                }
              >
                <VirtualLog traces={ledger} />
              </Suspense>
            ) : (
              <div
                role="list"
                aria-label="Full log history"
                className="flex flex-col gap-0.5 overflow-y-auto h-full"
              >
                {ledger.map((trace) => (
                  <LogEntry key={trace.id} trace={trace} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </dialog>
  )
}
