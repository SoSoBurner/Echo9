/**
 * HumanMessage — quoted message from a named character (module voice tier).
 *
 * Visual: quoted block with speaker attribution.
 * sr-only speaker prefix included for screen reader attribution.
 * PLAN.md §7: Module voices use per-module persona.
 */

interface HumanMessageProps {
  speaker: string
  body: string
}

export function HumanMessage({ speaker, body }: HumanMessageProps) {
  return (
    <div
      className="border-l-2 border-sealed-dim pl-4 py-2 space-y-1"
      role="note"
      aria-label={`Message from ${speaker}`}
    >
      <p className="text-fg-secondary text-xs uppercase tracking-widest">
        <span className="sr-only">Message from </span>
        {speaker}
      </p>
      <p className="text-fg-primary text-sm leading-relaxed">
        <span className="sr-only">{speaker}: </span>
        &ldquo;{body}&rdquo;
      </p>
    </div>
  )
}
