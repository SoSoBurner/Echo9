/**
 * DonutChart — pure SVG donut for Stage-1 progress meters (Sprint V5).
 *
 * Renders `value` as a fractional arc of `max` against a sealed-dim background
 * ring. No charting library — inline SVG keeps the bundle at Stage-1 discipline
 * and inherits palette tokens through CSS custom properties, so the increased-
 * contrast theme (D2) automatically brightens the arc without a component
 * change.
 *
 * Arc math:
 *   - `strokeDasharray = circumference` primes the ring as one continuous dash.
 *   - `strokeDashoffset = circumference * (1 - fraction)` reveals the completed
 *     portion. Fraction clamps into [0, 1] so a variance-overshoot doesn't
 *     wrap around past the top of the ring.
 *   - The whole arc is rotated -90° so a full ring starts at 12 o'clock (the
 *     mockup shows the donut clocking from the top).
 *
 * Color rule:
 *   - fraction >= 1 (goal met) → silas-accent (warm — the moment Silas notices)
 *   - fraction <  1            → null-accent (cool — steady progress)
 *   Both accents are ≥ 4.5:1 against #0A0B0D so the arc is readable at every
 *   contrast setting.
 *
 * Accessibility:
 *   - The wrapper carries `role="img"` and a synthesised aria-label describing
 *     the value + percent-of-target so screen readers announce the meaning
 *     once, not the SVG geometry per-shape.
 *   - The SVG itself carries `aria-hidden` because the label already speaks
 *     for it.
 *
 * `computeArcGeometry` lives in `./donutGeometry.ts` so this file exports
 * only a component (keeps Fast Refresh clean).
 */
import { computeArcGeometry } from './donutGeometry'

export interface DonutChartProps {
  /** Numerator — the raw meter reading. */
  value: number
  /** Denominator — full-ring target. */
  max: number
  /** Small caption rendered below the ring, e.g. "Q1 CASH". */
  label: string
  /** Pixel size of the square SVG. Defaults to 96 (mockup sizing). */
  size?: number
  /**
   * Formatter for the number rendered at the ring's center.
   * Defaults to a percent-of-target readout.
   */
  formatValue?: (value: number, max: number) => string
  /**
   * Screen-reader description. Defaults to
   * `"<label>: <formatted value>, <percent>% of target"`. Override when the
   * mount site wants a domain-specific phrasing (e.g. "82% of quarterly cash
   * target").
   */
  ariaLabel?: string
}

export function DonutChart({
  value,
  max,
  label,
  size = 96,
  formatValue,
  ariaLabel,
}: DonutChartProps) {
  const g = computeArcGeometry(value, max, size)
  const percent = Math.round(g.fraction * 100)
  const centerText = formatValue
    ? formatValue(value, max)
    : `${percent}%`
  const arcColor =
    g.fraction >= 1 ? 'var(--color-silas-accent)' : 'var(--color-null-accent)'
  const computedAria =
    ariaLabel ?? `${label}: ${centerText}, ${percent}% of target`

  return (
    <div
      role="img"
      aria-label={computedAria}
      className="flex flex-col items-center gap-1"
    >
      <svg
        aria-hidden
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background ring — sealed-dim; drawn first so the arc paints over it. */}
        <circle
          cx={g.center}
          cy={g.center}
          r={g.radius}
          fill="none"
          stroke="var(--color-sealed-dim)"
          strokeWidth={g.strokeWidth}
        />
        {/* Progress arc — rotated so start = 12 o'clock. Rounded caps soften
            the leading edge; at zero-fraction the offset equals the whole
            circumference so no cap is visible. */}
        <circle
          data-testid="donut-progress"
          cx={g.center}
          cy={g.center}
          r={g.radius}
          fill="none"
          stroke={arcColor}
          strokeWidth={g.strokeWidth}
          strokeDasharray={g.circumference}
          strokeDashoffset={g.dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${g.center} ${g.center})`}
        />
        <text
          x={g.center}
          y={g.center}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-fg-primary text-xs font-mono"
        >
          {centerText}
        </text>
      </svg>
      <span className="text-fg-secondary text-[10px] uppercase tracking-widest font-mono">
        {label}
      </span>
    </div>
  )
}
