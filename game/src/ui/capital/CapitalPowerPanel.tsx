/**
 * CapitalPowerPanel — modal dialog for the once-per-quarter CAPITAL
 * deployment (PLAN.md §8). Opens when CAPITAL > 80 AND the player has
 * not yet deployed this quarter.
 *
 * Six verbs, radiogroup pattern, explicit "Deploy" commit button. ESC is
 * allowed here (player can defer the deployment — capitalSlice keeps
 * `capitalDeployedThisQuarter = false` until commit runs).
 *
 * Why explicit Deploy button (vs Enter-to-commit only):
 *   Capital deployments are the player's one-shot counterplay per quarter
 *   — accidental Enter on a focused radio button would burn it. The
 *   explicit button forces an intentional second action. Arrow keys still
 *   move selection without committing; Enter on the Deploy button is the
 *   commit gesture.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { CapitalCard } from '@schemas/capitalCard.schema'
import { CapitalPowerCard } from './CapitalPowerCard'

interface CapitalPowerPanelProps {
  cards: readonly CapitalCard[]
  /** Caller commits the chosen cardId; engine resolves + sets deployed flag. */
  onCommit: (cardId: string) => void
  /** Caller closes the panel without committing (defer to later in quarter). */
  onDefer: () => void
}

export function CapitalPowerPanel({ cards, onCommit, onDefer }: CapitalPowerPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const cardRefs = useRef<Array<HTMLElement | null>>([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Open as modal on mount.
  useEffect(() => {
    const dlg = dialogRef.current
    if (!dlg) return
    if (!dlg.open) dlg.showModal()
    return () => {
      if (dlg.open) dlg.close()
    }
  }, [])

  // ESC defers (unlike InspectionPanel which intercepts it). Use the
  // dialog's native `cancel` event so the browser fires it on ESC.
  useEffect(() => {
    const dlg = dialogRef.current
    if (!dlg) return
    const onCancel = (_e: Event) => {
      onDefer()
    }
    dlg.addEventListener('cancel', onCancel)
    return () => dlg.removeEventListener('cancel', onCancel)
  }, [onDefer])

  function focusCard(index: number) {
    requestAnimationFrame(() => {
      cardRefs.current[index]?.focus()
    })
  }

  const commitSelected = useCallback(() => {
    const card = cards[selectedIndex]
    if (!card) return
    onCommit(card.id)
  }, [cards, selectedIndex, onCommit])

  function handleKeyDown(e: React.KeyboardEvent) {
    const n = cards.length
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight': {
        e.preventDefault()
        const next = (selectedIndex + 1) % n
        setSelectedIndex(next)
        focusCard(next)
        break
      }
      case 'ArrowUp':
      case 'ArrowLeft': {
        e.preventDefault()
        const next = (selectedIndex - 1 + n) % n
        setSelectedIndex(next)
        focusCard(next)
        break
      }
      case 'Home':
        e.preventDefault()
        setSelectedIndex(0)
        focusCard(0)
        break
      case 'End':
        e.preventDefault()
        setSelectedIndex(n - 1)
        focusCard(n - 1)
        break
      default:
        break
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="capital-title"
      aria-describedby="capital-description"
      className={[
        'p-0 m-auto bg-background text-fg-primary border border-null-accent',
        'min-w-[520px] max-w-[680px]',
        '[&::backdrop]:bg-black/70',
      ].join(' ')}
    >
      <div className="p-6 space-y-4">
        <header className="flex items-baseline justify-between">
          <h2
            id="capital-title"
            className="text-null-accent text-xs font-mono uppercase tracking-widest"
          >
            Capital Deployment
          </h2>
          <span className="text-fg-secondary text-xs font-mono">
            One per quarter
          </span>
        </header>

        <p
          id="capital-description"
          className="text-fg-secondary text-xs leading-relaxed"
        >
          Choose a verb. The deployment costs 10 capital and cannot be repeated
          this quarter. Defer with Escape.
        </p>

        <div
          role="radiogroup"
          aria-label="Choose a capital deployment verb"
          className="space-y-2"
          onKeyDown={handleKeyDown}
        >
          {cards.map((card, i) => (
            <CapitalPowerCard
              key={card.id}
              ref={(el: HTMLElement | null) => { cardRefs.current[i] = el }}
              card={card}
              index={i}
              selected={i === selectedIndex}
              onSelect={() => setSelectedIndex(i)}
              onCommit={commitSelected}
            />
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onDefer}
            className={[
              'px-4 py-2 text-xs font-mono uppercase tracking-widest',
              'border border-sealed-dim text-fg-secondary',
              'hover:border-fg-secondary focus:outline-none focus:ring-2 focus:ring-fg-secondary',
            ].join(' ')}
          >
            Defer
          </button>
          <button
            type="button"
            onClick={commitSelected}
            className={[
              'px-4 py-2 text-xs font-mono uppercase tracking-widest',
              'border border-null-accent text-null-accent',
              'hover:bg-null-accent hover:text-background',
              'focus:outline-none focus:ring-2 focus:ring-null-accent',
            ].join(' ')}
          >
            Deploy
          </button>
        </div>
      </div>
    </dialog>
  )
}
