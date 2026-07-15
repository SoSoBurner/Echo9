/**
 * LogEntry — a single row in the LogDock (Task 13, PLAN.md §10).
 *
 * Renders one ResultTrace:
 *   - HH:MM timestamp (from trace.timestamp, locale-formatted)
 *   - body excerpt
 *   - sourceChoiceId (for ledger traceability, §11 invariant)
 *
 * Memoization: wrapped in `React.memo` with the default shallow prop
 * comparison. ResultTrace is a frozen value object written exactly once
 * via `ledgerSlice.appendTrace`, so the trace reference is the stable
 * identity — shallow on `{trace}` is sufficient. We do NOT use a custom
 * arePropsEqual because that would lose the immer/Zustand identity check
 * that's already correct here.
 *
 * Animation: new entries use a tiny CSS slide-in (`.log-entry-enter` in
 * src/index.css). Per PLAN.md §9, only the entry slides — the dock
 * chrome NEVER moves. The keyframe respects `prefers-reduced-motion` by
 * collapsing duration to 0 (handled in index.css via the existing global
 * `@media (prefers-reduced-motion: reduce)` block).
 */
import { memo } from 'react'
import type { ResultTrace } from '@schemas/resultTrace.schema'

interface LogEntryProps {
  trace: ResultTrace
  /**
   * When true (the LogDock + non-virtualized history cases) the entry
   * renders its own `role="listitem"`. VirtualLog passes `false` because
   * the absolutely-positioned wrapper IS the listitem there — nesting a
   * second listitem would break the ARIA list structure.
   */
  asListItem?: boolean
}

function LogEntryImpl({ trace, asListItem = true }: LogEntryProps) {
  const time = new Date(trace.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      data-trace-id={trace.id}
      data-source-task-id={trace.sourceTaskId}
      data-source-choice-id={trace.sourceChoiceId}
      role={asListItem ? 'listitem' : undefined}
      className={[
        'log-entry-enter',
        'flex items-baseline gap-3',
        'px-3 py-1 border-l-2 border-sealed-dim',
        'text-fg-primary text-xs leading-snug',
      ].join(' ')}
    >
      <span className="text-fg-secondary font-mono tabular-nums shrink-0">{time}</span>
      <span className="flex-1 truncate">{trace.body}</span>
    </div>
  )
}

export const LogEntry = memo(LogEntryImpl)
