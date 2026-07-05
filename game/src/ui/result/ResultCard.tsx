/**
 * ResultCard — shows a result trace after a choice is committed.
 *
 * Accessibility: moves focus to the heading (tabIndex=-1) on mount,
 * so keyboard users receive immediate feedback. PLAN.md §10.
 */
import { useEffect, useRef } from 'react'
import type { ResultTrace } from '@schemas/resultTrace.schema'
import { markBeat } from '@ui/debug/BeatTelemetry'

interface ResultCardProps {
  trace: ResultTrace
  /**
   * C15: called when the player acknowledges the result and wants to advance
   * to the next week. Absent = terminal state (no more content), so the
   * button is hidden.
   */
  onContinue?: () => void
}

export function ResultCard({ trace, onContinue }: ResultCardProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Move focus to heading on mount (tabIndex=-1 heading)
  useEffect(() => {
    markBeat('firstResultCard')
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

      {onContinue && (
        <button
          type="button"
          onClick={onContinue}
          className="border border-sealed-dim px-4 py-2 text-fg-primary text-sm font-mono uppercase tracking-widest hover:bg-sealed-dim/20 focus:outline-none focus:ring-2 focus:ring-fg-primary"
        >
          Continue →
        </button>
      )}
    </section>
  )
}
