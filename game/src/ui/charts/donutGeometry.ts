/**
 * donutGeometry — pure arc math for `<DonutChart>` (Sprint V5).
 *
 * Split from `DonutChart.tsx` so Vite Fast Refresh stays clean (a file that
 * exports both a component and a helper trips the react/only-export-components
 * lint). Tests can pin the arithmetic without mounting React, and the chart
 * component becomes a thin render wrapper over these values.
 */

export interface DonutArcGeometry {
  /** Circle center coordinate — same for x and y (square viewBox). */
  center: number
  /** Radius of the donut ring, in svg units. */
  radius: number
  /** Stroke width used for both background and arc, in svg units. */
  strokeWidth: number
  /** Full ring length; also the strokeDasharray value. */
  circumference: number
  /** Offset applied to the arc: hides the un-filled portion. */
  dashOffset: number
  /** Clamped value/max ratio in [0, 1]. `max <= 0` collapses to 0. */
  fraction: number
}

/**
 * Pure arithmetic for the donut geometry.
 *
 * - `strokeWidth` scales with size but never drops below 6 px — thinner rings
 *   fringe out at the mockup's small size (~96 px). 9% is a hand-tuned ratio
 *   that reads as "ring, not hairline" at every mounted size.
 * - `fraction` clamps into [0, 1] so a variance-overshoot never wraps around
 *   past the top of the ring.
 * - `max <= 0` guards against div-by-zero and collapses to 0.
 */
export function computeArcGeometry(
  value: number,
  max: number,
  size: number,
): DonutArcGeometry {
  const strokeWidth = Math.max(6, Math.round(size * 0.09))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const rawFraction = max <= 0 ? 0 : value / max
  const fraction = Math.max(0, Math.min(1, rawFraction))
  const dashOffset = circumference * (1 - fraction)
  return {
    center: size / 2,
    radius,
    strokeWidth,
    circumference,
    dashOffset,
    fraction,
  }
}
