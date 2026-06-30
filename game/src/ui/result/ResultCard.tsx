/**
 * ResultCard — shows a result trace after a choice is committed.
 *
 * Accessibility: moves focus to the heading (tabIndex=-1) on mount,
 * so keyboard users receive immediate feedback. PLAN.md §10.
 */
import { useEffect, useRef } from 'react'
import type { ResultTrace } from '@schemas/resultTrace.schema'

interface ResultCardProps {
  trace: ResultTrace
}

export function ResultCard({ trace }: ResultCardProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Move focus to heading on mount (tabIndex=-1 heading)
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  const date = new Date(trace.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <section
      className="space-y-4"
      aria-label="Directive result"
    >
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-fg-primary text-base font-mono uppercase tracking-widest focus:outline-none"
      >
        Result
      </h2>

      <div className="border border-sealed-dim px-4 py-4 space-y-3">
        {/* Trace body */}
        <p className="text-fg-primary text-sm leading-relaxed">
          {trace.body}
        </p>

        {/* Trace metadata */}
        <div className="flex gap-4 text-fg-secondary text-xs font-mono">
          <span>Task: {trace.sourceTaskId}</span>
          <span>Choice: {trace.sourceChoiceId}</span>
          <span>{date}</span>
        </div>
      </div>
    </section>
  )
}
