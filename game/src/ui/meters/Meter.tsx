/**
 * Meter — single bar + label.
 *
 * Bar SNAPS — no transition on width. This is intentional per PLAN.md §9
 * animation discipline. The value change itself may have a 200ms opacity
 * flash, but the bar width renders instantly.
 */

interface MeterProps {
  name: string
  value: number
  max?: number
}

export function Meter({ name, value, max = 100 }: MeterProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))

  return (
    <div className="space-y-1" role="meter" aria-label={name} aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div className="flex justify-between items-baseline">
        <span className="text-fg-secondary text-xs uppercase tracking-widest">{name}</span>
        <span className="text-fg-primary text-xs font-mono">{value}</span>
      </div>
      <div className="h-1.5 bg-sealed-dim rounded-none overflow-hidden">
        {/* width snaps — no transition class */}
        <div
          className="h-full bg-null-accent"
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
