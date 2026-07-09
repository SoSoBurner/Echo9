/**
 * AlertCrawler — bottom-edge single-line surfacing of the newest ResultTrace
 * (Sprint V5). Sits above LogDock inside the logdock grid area.
 *
 * Why it exists (Sprint V5 mockup-parity):
 *   The LogDock renders `role="list"` — assistive tech only speaks the
 *   *initial* list contents, not entries that arrive later. Players relying
 *   on a screen reader never heard the trace-append cascade. The crawler
 *   duplicates the newest trace inside `role="status"` + `aria-live="polite"`
 *   so a new entry is announced exactly once as it lands.
 *
 * Visual role:
 *   The mockup's bottom-edge is a thin marquee-style strip. We do NOT scroll
 *   text horizontally — a marquee is a motion-sickness hazard the reduced-
 *   motion pillar (PLAN.md §9) refuses. Instead the strip stays still and
 *   the new entry fades in via `.log-entry-enter`, which the existing global
 *   `prefers-reduced-motion` block collapses to 0 ms.
 *
 * Data:
 *   Subscribes to `ledger.at(-1)` — a single-reference selector. Only fires
 *   when appendTrace pushes a new frozen ResultTrace onto the array, so the
 *   crawler re-renders exactly once per new event.
 *
 * Empty state:
 *   Fresh boot has no traces yet. Returning `null` keeps the strip out of
 *   the DOM entirely rather than announcing an empty status — screen
 *   readers stay quiet until there is something to say.
 */
import { useGameStore } from '@state/store'

export function AlertCrawler() {
  const latest = useGameStore((s) => s.ledger.at(-1))

  if (!latest) return null

  const time = new Date(latest.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      data-testid="alert-crawler"
      role="status"
      aria-live="polite"
      aria-label="Latest alert"
      className={[
        'log-entry-enter',
        'flex items-baseline gap-3',
        'px-3 py-1 border-b border-sealed-dim bg-background',
        'text-fg-primary text-xs leading-snug',
      ].join(' ')}
    >
      <span
        aria-hidden
        className="text-null-accent font-mono uppercase tracking-widest text-[0.6875rem] shrink-0"
      >
        Alert
      </span>
      <span className="text-fg-secondary font-mono shrink-0">{time}</span>
      <span className="flex-1 truncate">{latest.body}</span>
    </div>
  )
}
