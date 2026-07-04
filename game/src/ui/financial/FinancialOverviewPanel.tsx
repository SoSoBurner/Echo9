/**
 * FinancialOverviewPanel — left-column six-row KPI panel (Task A3, Stage 1).
 *
 * Rows (plan §A3):
 *   1. Q1 Target ($M)
 *   2. Actual Q1 Cash
 *   3. Variance          — sign-colored (green if >=0, red otherwise)
 *   4. Autonomy Runway (weeks)
 *   5. Q1 Days Remaining
 *   6. Q1 Weeks Remaining
 *
 * State wiring:
 *   The panel selects individual scalars from the store (narrow subscriptions),
 *   then composes the `FinancialOverviewInput` and calls the pure
 *   `selectFinancialOverview`. This avoids Zustand strict-equality re-render
 *   spam that a single `state => object` selector would trigger — each scalar
 *   pick has stable identity across renders and only fires when its own value
 *   changes.
 *
 * Placeholders (see selector for full rationale):
 *   - AUTONOMY meter does not exist yet (MeterKeySchema ships CAPITAL,
 *     HUMAN_WELFARE, OWNER_CONTROL). Selector falls back to the placeholder
 *     when autonomyMeter is undefined. Track A4 lands AUTONOMY; this file
 *     needs no change.
 *   - No quarter-calendar slice exists yet. Selector falls back to
 *     CURRENT_WEEK_PLACEHOLDER when currentWeek is undefined.
 *
 * Accessibility (PLAN.md §10):
 *   - Section is role="group" with aria-label "Financial Overview".
 *   - Rows are role="listitem" inside a role="list" child.
 *   - Variance value has a distinct aria-label describing its sign so screen
 *     readers announce "up" / "down" rather than just the number.
 */
import { useGameStore } from '@state/store'
import {
  selectFinancialOverview,
  type FinancialOverview,
} from '@state/selectors/financialOverview'

function formatM(value: number): string {
  const sign = value >= 0 ? '+' : '-'
  return `${sign}$${Math.abs(value).toFixed(1)}M`
}

function formatTargetM(value: number): string {
  // Target is unsigned in its display — the sign has no useful meaning on a
  // goal number, unlike a delta.
  return `$${value.toFixed(1)}M`
}

function formatWeeks(value: number): string {
  return `${value.toFixed(1)} wk`
}

function formatDays(value: number): string {
  return `${value} d`
}

interface RowProps {
  label: string
  value: string
  /** Overrides the default value color; used for the signed variance row. */
  valueClassName?: string
  /** Overrides the aria-label on the value span (used for signed variance). */
  valueAriaLabel?: string
}

function KpiRow({ label, value, valueClassName, valueAriaLabel }: RowProps) {
  return (
    <li
      role="listitem"
      className="flex items-center justify-between py-1"
    >
      <span className="text-fg-secondary text-[11px] uppercase tracking-widest font-mono">
        {label}
      </span>
      <span
        className={`text-sm font-mono ${valueClassName ?? 'text-fg-primary'}`}
        aria-label={valueAriaLabel}
      >
        {value}
      </span>
    </li>
  )
}

export function FinancialOverviewPanel() {
  // Narrow scalar subscriptions — each fires only when its own field changes.
  // AUTONOMY meter is not in the MeterKey enum yet, so it's undefined here;
  // the selector will substitute the placeholder.
  const capitalMeter = useGameStore((s) => s.meters.CAPITAL)

  const overview: FinancialOverview = selectFinancialOverview({
    capitalMeter,
    // autonomyMeter and currentWeek are intentionally omitted — the selector
    // falls back to its placeholders. Wiring them once real state exists is a
    // Track A4 concern; the panel API and layout stay identical.
  })

  const varianceClass =
    overview.varianceM >= 0 ? 'text-emerald-400' : 'text-red-400'
  const varianceAriaLabel =
    overview.varianceM >= 0
      ? `Variance up ${overview.varianceM.toFixed(1)} million dollars`
      : `Variance down ${Math.abs(overview.varianceM).toFixed(1)} million dollars`

  return (
    <section
      role="group"
      aria-label="Financial Overview"
      className="flex flex-col gap-2 px-4 py-4 border-b border-sealed-dim"
    >
      <p className="text-fg-secondary text-xs uppercase tracking-widest">
        Financial Overview
      </p>
      <ul
        role="list"
        aria-label="Financial Overview KPIs"
        className="flex flex-col list-none p-0 m-0"
      >
        <KpiRow
          label="Q1 Target"
          value={formatTargetM(overview.quarterTargetM)}
        />
        <KpiRow
          label="Actual Q1 Cash"
          value={formatTargetM(overview.actualCashM)}
        />
        <KpiRow
          label="Variance"
          value={formatM(overview.varianceM)}
          valueClassName={varianceClass}
          valueAriaLabel={varianceAriaLabel}
        />
        <KpiRow
          label="Autonomy Runway"
          value={formatWeeks(overview.autonomyRunwayWeeks)}
        />
        <KpiRow
          label="Q1 Days Remaining"
          value={formatDays(overview.daysRemaining)}
        />
        <KpiRow
          label="Q1 Weeks Remaining"
          value={formatWeeks(overview.weeksRemaining)}
        />
      </ul>
    </section>
  )
}
