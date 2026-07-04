/**
 * financialOverview selector (Task A3).
 *
 * Produces the six KPI rows consumed by FinancialOverviewPanel (left column,
 * below PriorityTasksPanel):
 *
 *   1. Q1 target ($M)          — QUARTER_TARGET_CAPITAL_M
 *   2. Actual Q1 Cash          — meters.CAPITAL (interpreted as $M)
 *   3. Variance                — actualCashM - quarterTargetM (sign matters)
 *   4. Autonomy Runway (weeks) — autonomy meter / WEEKLY_BURN
 *   5. Q1 Days Remaining       — Q_WEEKS - currentWeek, ×7 (floored at 0)
 *   6. Q1 Weeks Remaining      — Q_WEEKS - currentWeek (floored at 0)
 *
 * The selector is a **pure function** — signature `(state) => FinancialOverview`
 * — so it can be unit-tested with plain synthetic state objects, no store
 * needed. The Panel adapts the composed store to the narrow input shape at the
 * call site.
 *
 * Placeholders (TODO(A4)):
 *   - AUTONOMY meter does not exist yet — MeterKeySchema ships CAPITAL,
 *     HUMAN_WELFARE, OWNER_CONTROL. Track A4 widens the enum to 6 meters
 *     including AUTONOMY. Until then the selector falls back to
 *     AUTONOMY_PLACEHOLDER when `state.autonomyMeter` is undefined.
 *   - `currentWeek` state field does not exist yet — no quarter-calendar
 *     concept has landed. Selector falls back to CURRENT_WEEK_PLACEHOLDER
 *     (week 1) when `state.currentWeek` is undefined. Later tasks will add a
 *     real calendar slice; the panel API stays stable.
 *   - Weekly burn is a stand-in constant, mirroring the TopBar's fixed
 *     QUARTER_TARGET_CAPITAL pattern (also owned by Track A / A1 landed).
 *
 * Constant naming mirrors TopBar's `QUARTER_TARGET_CAPITAL = 50` (A1) so the
 * two KPIs stay coherent until a real quarter-state slice replaces both.
 *
 * NOTE: unlike `activeTasks.ts` (which memo-freezes a module-scope roster),
 * this selector must *recompute* on state change because every field is
 * derived from live meters. Zustand strict-equality on the returned object
 * would re-fire on every render even when values are unchanged — the panel
 * wraps this selector in `useShallow` for that reason.
 */

/** Quarter capital goal in $M (mirrors TopBar's QUARTER_TARGET_CAPITAL). */
export const QUARTER_TARGET_CAPITAL_M = 50

/** Placeholder AUTONOMY meter reading — replace when A4 lands AUTONOMY. */
export const AUTONOMY_PLACEHOLDER = 100

/** Weeks per fiscal quarter — 13-week standard approximation. */
export const Q_WEEKS = 13

/** $M consumed per week when computing autonomy runway. Placeholder. */
export const WEEKLY_BURN = 5

/** Placeholder current-week cursor — replaced when a calendar slice lands. */
export const CURRENT_WEEK_PLACEHOLDER = 1

export type FinancialOverview = {
  /** Quarter capital goal, in $M. */
  quarterTargetM: number
  /** CAPITAL meter reading, treated as $M. */
  actualCashM: number
  /** actualCashM - quarterTargetM. Sign matters for coloring. */
  varianceM: number
  /** AUTONOMY meter / WEEKLY_BURN. Infinity when burn is 0 (guarded). */
  autonomyRunwayWeeks: number
  /** Days left in the quarter — 0 if past week Q_WEEKS. */
  daysRemaining: number
  /** Weeks left in the quarter — 0 if past week Q_WEEKS. */
  weeksRemaining: number
}

/**
 * Narrow input shape. The Panel builds this from `useGameStore` at the call
 * site — no store type is imported here so the selector can be unit-tested
 * against synthetic objects without the persist/immer middleware chain.
 */
export type FinancialOverviewInput = {
  capitalMeter: number
  /** Optional — AUTONOMY meter does not exist yet (see TODO(A4)). */
  autonomyMeter?: number
  /** Optional — no calendar slice yet (see TODO(A4)). */
  currentWeek?: number
}

export function selectFinancialOverview(
  state: FinancialOverviewInput,
): FinancialOverview {
  const quarterTargetM = QUARTER_TARGET_CAPITAL_M
  const actualCashM = state.capitalMeter
  const varianceM = actualCashM - quarterTargetM

  const autonomy = state.autonomyMeter ?? AUTONOMY_PLACEHOLDER
  // Guard division-by-zero: a zero WEEKLY_BURN would blow up the KPI row.
  // WEEKLY_BURN is a module constant so this is defensive; a future task that
  // pipes burn from state will still be safe.
  const autonomyRunwayWeeks = WEEKLY_BURN > 0 ? autonomy / WEEKLY_BURN : 0

  const currentWeek = state.currentWeek ?? CURRENT_WEEK_PLACEHOLDER
  // Clamp at 0 so a week past the end of quarter doesn't show a negative
  // remaining count (the panel treats "0 weeks remaining" as end-of-quarter).
  const weeksRemaining = Math.max(0, Q_WEEKS - currentWeek)
  const daysRemaining = weeksRemaining * 7

  return {
    quarterTargetM,
    actualCashM,
    varianceM,
    autonomyRunwayWeeks,
    daysRemaining,
    weeksRemaining,
  }
}
