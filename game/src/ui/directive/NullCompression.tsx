/**
 * NullCompression — one short observational line from Echo 9 (Null voice).
 *
 * Visual: center pane, monospace, null-accent border left, instant render.
 * Every line carries a sr-only speaker prefix for screen reader attribution.
 * PLAN.md §7: Null voice is compressed, observational.
 */

interface NullCompressionProps {
  text: string
}

export function NullCompression({ text }: NullCompressionProps) {
  return (
    <div
      className="border-l-2 border-null-accent pl-4 py-1 font-mono"
      role="note"
      aria-label="Null observation"
    >
      <p className="text-fg-primary text-sm leading-relaxed">
        <span className="sr-only">Null: </span>
        {text}
      </p>
    </div>
  )
}
