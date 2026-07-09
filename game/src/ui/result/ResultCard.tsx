/**
 * ResultCard — shows a result trace after a choice is committed.
 *
 * Accessibility: moves focus to the heading (tabIndex=-1) on mount,
 * so keyboard users receive immediate feedback. PLAN.md §10.
 *
 * S5 (Q40 narration gradient): the body copy evolves with the consciousness
 * ramp. `trace.body` is the persisted machine baseline; when the source
 * choice authored `narrationVariants`, the install count picks the register
 * (0 machine / 1 waking / ≥2 person) via narrationGradient. Reading
 * installedModules from the store follows the panel pattern
 * (FinancialOverviewPanel); the trace itself stays prop-driven.
 */
import { useEffect, useRef } from 'react'
import type { ResultTrace } from '@schemas/resultTrace.schema'
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import { Q1_SEQUENCE } from '@content/directiveSchedule'
import {
  narrationBand,
  selectNarration,
} from '@systems/consciousness/narrationGradient'
import { useGameStore } from '@state/store'
import { markBeat } from '@ui/debug/BeatTelemetry'

// ChoiceId → ChoiceNode across the whole Q1 spine, so a trace's back-pointer
// resolves to its authored narrationVariants at render time. Built once at
// module scope — Q1_SEQUENCE is a frozen content contract (additive-only).
const CHOICE_BY_ID: ReadonlyMap<string, ChoiceNode> = new Map(
  Q1_SEQUENCE.flatMap((entry) =>
    entry.choices.map((choice): [string, ChoiceNode] => [choice.id, choice]),
  ),
)

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

  // S5: install count → narration band. Primitive selector, so the
  // subscription is cheap and re-renders only when a module lands.
  const installCount = useGameStore(
    (s) => Object.keys(s.installedModules).length,
  )
  const variants = CHOICE_BY_ID.get(trace.sourceChoiceId)?.narrationVariants
  // Spread keeps exactOptionalPropertyTypes happy: absent registers stay
  // absent rather than becoming explicit `undefined` properties.
  const body = selectNarration(
    { machine: trace.body, ...variants },
    narrationBand(installCount),
  )

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
        {/* Trace body — register-selected (S5 narration gradient) */}
        <p className="text-fg-primary text-sm leading-relaxed">
          {body}
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
