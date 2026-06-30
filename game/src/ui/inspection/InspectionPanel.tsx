/**
 * InspectionPanel — modal dialog for the INSPECTION phase (PLAN.md §8 / §12).
 *
 * Renders Silas's question + a radiogroup of postures. The player MUST answer
 * to advance — ESC is intercepted (browser's default `cancel` event is
 * prevented). Clicking the backdrop does NOT close (no light-dismiss on a
 * choice that affects state).
 *
 * Why native `<dialog>`:
 *   - The browser handles focus trap, inert background, and the open-state
 *     bookkeeping. We override `oncancel` to keep ESC from skipping the
 *     question.
 *   - `showModal()` synchronously moves focus into the dialog and re-routes
 *     Tab so we don't need a custom focus-trap loop.
 *
 * STRATEGIC_ALTERNATIVE gating:
 *   - The UI marks the option disabled when SILAS_OVERRIDE_AVAILABLE is
 *     missing (PostureCard greys it + adds aria-disabled).
 *   - The engine re-checks regardless — UI gating is advisory.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { InspectionScene } from '@schemas/inspectionScene.schema'
import { SILAS_OVERRIDE_AVAILABLE } from '@systems/gameFlags'
import { PostureCard } from './PostureCard'

interface InspectionPanelProps {
  scene: InspectionScene
  /** Current set of game flags — used to gate STRATEGIC_ALTERNATIVE in the UI. */
  flags: ReadonlySet<string>
  /** Caller commits the chosen postureId; engine resolves + advances cursor. */
  onCommit: (postureId: string) => void
  /** 1-based index for display (e.g. "Question 2 of 2"). */
  questionNumber: number
  totalQuestions: number
}

export function InspectionPanel({
  scene,
  flags,
  onCommit,
  questionNumber,
  totalQuestions,
}: InspectionPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const cardRefs = useRef<Array<HTMLElement | null>>([])
  // Pick the first non-disabled posture as the initial selection so Enter
  // doesn't commit a disabled (gated) option.
  const firstEnabledIndex = scene.postures.findIndex(
    (p) =>
      p.category !== 'STRATEGIC_ALTERNATIVE' ||
      flags.has(SILAS_OVERRIDE_AVAILABLE),
  )
  const [selectedIndex, setSelectedIndex] = useState(
    firstEnabledIndex >= 0 ? firstEnabledIndex : 0,
  )

  // Open the dialog as a modal on mount. `showModal()` is the imperative
  // step that turns the dialog into a top-layer overlay with focus trap.
  // We also reset selection when the scene changes (cursor advances).
  useEffect(() => {
    const dlg = dialogRef.current
    if (!dlg) return
    if (!dlg.open) dlg.showModal()
    return () => {
      if (dlg.open) dlg.close()
    }
  }, [scene.id])

  // Intercept ESC — the player MUST answer. The dialog fires a `cancel`
  // event on ESC; preventing it stops the close.
  useEffect(() => {
    const dlg = dialogRef.current
    if (!dlg) return
    const onCancel = (e: Event) => {
      e.preventDefault()
    }
    dlg.addEventListener('cancel', onCancel)
    return () => dlg.removeEventListener('cancel', onCancel)
  }, [])

  // Reset selection on scene change.
  useEffect(() => {
    const idx = scene.postures.findIndex(
      (p) =>
        p.category !== 'STRATEGIC_ALTERNATIVE' ||
        flags.has(SILAS_OVERRIDE_AVAILABLE),
    )
    setSelectedIndex(idx >= 0 ? idx : 0)
  }, [scene.id, scene.postures, flags])

  function focusCard(index: number) {
    requestAnimationFrame(() => {
      cardRefs.current[index]?.focus()
    })
  }

  // Find next/prev ENABLED posture (so arrow nav skips the gated option).
  function isEnabled(index: number): boolean {
    const p = scene.postures[index]
    if (!p) return false
    return (
      p.category !== 'STRATEGIC_ALTERNATIVE' ||
      flags.has(SILAS_OVERRIDE_AVAILABLE)
    )
  }

  function step(dir: 1 | -1) {
    const n = scene.postures.length
    let next = selectedIndex
    for (let i = 0; i < n; i++) {
      next = (next + dir + n) % n
      if (isEnabled(next)) {
        setSelectedIndex(next)
        focusCard(next)
        return
      }
    }
  }

  // Inlined enabled-check (instead of calling `isEnabled`) so the
  // exhaustive-deps lint can see `flags` is actually used here.
  const commitSelected = useCallback(() => {
    const p = scene.postures[selectedIndex]
    if (!p) return
    const enabled =
      p.category !== 'STRATEGIC_ALTERNATIVE' ||
      flags.has(SILAS_OVERRIDE_AVAILABLE)
    if (!enabled) return
    onCommit(p.id)
  }, [scene.postures, selectedIndex, flags, onCommit])

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault()
        step(1)
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault()
        step(-1)
        break
      case 'Home': {
        e.preventDefault()
        // First enabled index (typically 0).
        for (let i = 0; i < scene.postures.length; i++) {
          if (isEnabled(i)) {
            setSelectedIndex(i)
            focusCard(i)
            break
          }
        }
        break
      }
      case 'End': {
        e.preventDefault()
        for (let i = scene.postures.length - 1; i >= 0; i--) {
          if (isEnabled(i)) {
            setSelectedIndex(i)
            focusCard(i)
            break
          }
        }
        break
      }
      default:
        break
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="inspection-title"
      aria-describedby="inspection-question"
      className={[
        'p-0 m-auto bg-background text-fg-primary border border-silas-accent',
        'min-w-[480px] max-w-[640px]',
        // backdrop styling — Tailwind's arbitrary [&::backdrop] selector.
        '[&::backdrop]:bg-black/70',
      ].join(' ')}
    >
      <div className="p-6 space-y-4">
        <header className="flex items-baseline justify-between">
          <h2
            id="inspection-title"
            className="text-silas-accent text-xs font-mono uppercase tracking-widest"
          >
            Silas — Inspection
          </h2>
          <span
            className="text-fg-secondary text-xs font-mono"
            aria-label={`Question ${questionNumber} of ${totalQuestions}`}
          >
            {questionNumber} / {totalQuestions}
          </span>
        </header>

        <p
          id="inspection-question"
          className="text-fg-primary text-sm leading-relaxed border-l-2 border-silas-accent pl-3"
        >
          {scene.silasQuestion}
        </p>

        <div
          role="radiogroup"
          aria-label="Choose a response to Silas"
          className="space-y-2"
          onKeyDown={handleKeyDown}
        >
          {scene.postures.map((posture, i) => (
            <PostureCard
              key={posture.id}
              ref={(el: HTMLElement | null) => { cardRefs.current[i] = el }}
              posture={posture}
              index={i}
              selected={i === selectedIndex}
              disabled={!isEnabled(i)}
              onSelect={() => setSelectedIndex(i)}
              onCommit={commitSelected}
            />
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={commitSelected}
            disabled={!isEnabled(selectedIndex)}
            className={[
              'px-4 py-2 text-xs font-mono uppercase tracking-widest',
              'border focus:outline-none focus:ring-2 focus:ring-null-accent',
              isEnabled(selectedIndex)
                ? 'border-null-accent text-null-accent hover:bg-null-accent hover:text-background'
                : 'border-sealed-dim text-fg-secondary cursor-not-allowed',
            ].join(' ')}
          >
            Answer
          </button>
        </div>
      </div>
    </dialog>
  )
}
