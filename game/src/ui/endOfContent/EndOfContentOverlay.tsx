/**
 * EndOfContentOverlay — terminal Q1 modal (Task C4, Q46 + Q48 locks).
 *
 * Renders a native <dialog> when `endOfContentSeen === true`. The flag is
 * flipped by `ackFirstPending()` when the terminal Content-Boundary hook
 * empties the queue (see C3).
 *
 * Q46 design lock — finality:
 *   - Escape does NOT dismiss. The `cancel` event is preventDefault'd so the
 *     browser cannot close the dialog. This is the OPPOSITE of
 *     ConsequenceReturnPanel, where Escape defers review. Here there is
 *     nothing to defer — Q1 has ended, and the only legal action is Replay
 *     (which wipes state) or close the tab.
 *   - No backdrop close. There is only ONE interactive element — the
 *     Replay button — so no "click outside to dismiss" affordance exists.
 *
 * Replay flow:
 *   - Clears BOTH persistence keys (`echo9:autosave` main-blob AND
 *     `echo9:endOfContentSeen` own-key, per Q48 independent-persister lock).
 *   - Reloads the page. On next boot the store rehydrates from empty
 *     localStorage → fresh Q1 start.
 *
 * Beat telemetry: records `endOfContentShown` exactly once per session.
 * `markBeat()` itself is first-occurrence-only, but we still ref-guard the
 * call so we don't churn the internal `beats.some(...)` scan every render
 * while the modal is open.
 *
 * Focus: opens focus onto the heading (`tabIndex=-1`) — matches
 * ConsequenceReturnPanel's screen-reader parity pattern (§10). The Replay
 * button is the only tabbable child, so native dialog focus-trap keeps
 * keyboard users on it.
 *
 * NOT MOUNTED YET — C5 wires this into Layout. This file is standalone
 * pending Track A's Layout escalation.
 */
import { useEffect, useRef } from 'react'
import { useGameStore } from '@state/store'
import { markBeat } from '@ui/debug/BeatTelemetry'

/** Q46 lock — exact body copy. Do not paraphrase. */
const BODY_COPY =
  'Thank you for playing and look forward to future releases of this demo type language.'

const AUTOSAVE_KEY = 'echo9:autosave'
const END_OF_CONTENT_KEY = 'echo9:endOfContentSeen'

export function EndOfContentOverlay() {
  const seen = useGameStore((s) => s.endOfContentSeen)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const replayRef = useRef<HTMLButtonElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const beatMarked = useRef(false)

  // Open the dialog imperatively when the flag flips true. Focus the heading
  // synchronously after showModal() for screen-reader parity with
  // ConsequenceReturnPanel (§10).
  useEffect(() => {
    const dlg = dialogRef.current
    if (!dlg || !seen) return
    if (!dlg.open) {
      dlg.showModal()
      headingRef.current?.focus()
      if (!beatMarked.current) {
        markBeat('endOfContentShown')
        beatMarked.current = true
      }
    }
  }, [seen])

  // Q46 lock — suppress the native `cancel` event so Escape cannot dismiss.
  // Matches ConsequenceReturnPanel's addEventListener style so the two
  // components are visually diffable in review.
  useEffect(() => {
    const dlg = dialogRef.current
    if (!dlg) return
    const onCancel = (e: Event) => e.preventDefault()
    dlg.addEventListener('cancel', onCancel)
    return () => dlg.removeEventListener('cancel', onCancel)
  }, [])

  const handleReplay = () => {
    // Q48 lock — Replay wipes BOTH persistence keys. Wrap each in its own
    // try/catch so a quota-exceeded on one does not prevent the other from
    // being cleared. The subsequent reload is unconditional either way.
    try {
      localStorage.removeItem(AUTOSAVE_KEY)
    } catch {
      // localStorage unavailable (private mode, quota). Reload still runs.
    }
    try {
      localStorage.removeItem(END_OF_CONTENT_KEY)
    } catch {
      // Same fallback.
    }
    window.location.reload()
  }

  if (!seen) return null

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="end-of-content-title"
      className={[
        'p-0 m-auto bg-background text-fg-primary border border-silas-accent',
        'min-w-[480px] max-w-[640px]',
        '[&::backdrop]:bg-black/70',
      ].join(' ')}
    >
      <div className="p-6 space-y-4">
        <h2
          id="end-of-content-title"
          ref={headingRef}
          tabIndex={-1}
          className="text-silas-accent text-xs font-mono uppercase tracking-widest focus:outline-none"
        >
          Thank you for playing
        </h2>
        <p className="text-fg-primary text-sm leading-relaxed">{BODY_COPY}</p>
        <div className="flex justify-end pt-2">
          <button
            ref={replayRef}
            type="button"
            onClick={handleReplay}
            className={[
              'px-4 py-2 text-xs font-mono uppercase tracking-widest',
              'border border-null-accent text-null-accent',
              'hover:bg-null-accent hover:text-background',
              'focus:outline-none focus:ring-2 focus:ring-null-accent',
            ].join(' ')}
          >
            Replay
          </button>
        </div>
      </div>
    </dialog>
  )
}
