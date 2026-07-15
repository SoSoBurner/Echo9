/**
 * EventQueueToast — passive notification that consequences are pending review
 * (Task 12, PLAN.md §8, §10).
 *
 * Behaviour:
 *   - Renders only when `pendingFiredHooks.length > 0`.
 *   - `role="status"` + `aria-live="polite"` (the §10 contract for non-
 *     interrupting announcements). NEVER assertive — that would push past
 *     the narrative live region (#sr-narrative) the player is reading.
 *   - Never focuses itself: the toast announces, it does NOT take focus.
 *     The C key (handled in Layout) is what moves focus into the panel.
 *
 * Positioning: fixed top-right, offset BELOW the TopBar (V6: the old top-2
 * offset floated the toast over the Target Variance / Silas Approval
 * readouts, hiding them whenever an echo was pending). The panel itself
 * opens at the screen center via native <dialog>, so the toast → panel
 * transition does not visually jump.
 *
 * Copy: "1 echo pending — press C to review" (singular) vs
 *       "N echoes pending — press C to review" (plural). "Echo" matches the
 * §11 traceability vocabulary ("delayed consequence returns").
 */
import { useGameStore } from '@state/store'

export function EventQueueToast() {
  const count = useGameStore((s) => s.pendingFiredHooks.length)

  if (count === 0) return null

  const word = count === 1 ? 'echo' : 'echoes'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={[
        'fixed top-14 right-4 z-50',
        'px-3 py-2',
        'bg-background border border-silas-accent',
        'text-fg-primary text-xs font-mono uppercase tracking-widest',
        'shadow-md',
      ].join(' ')}
    >
      <span className="text-silas-accent">{count}</span>{' '}
      {word} pending — <span className="text-null-accent">press C</span> to review
    </div>
  )
}
