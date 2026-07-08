/**
 * hudDisclosure — pure helpers for the diegetic HUD-comes-online tutorial (E1).
 *
 * The tutorial is not a UI overlay; it IS the UI. The player wakes up as the
 * HUD: at cold boot every panel is hidden, and each panel discloses (becomes
 * visible) the first time the game needs it. Once a panel is disclosed, every
 * subsequent usage nudges it toward its final "mockup-full" form via a 3-stage
 * maturity ramp.
 *
 * This module owns:
 *   - The `PanelId` union — the closed set of panels that participate in
 *     disclosure. Adding a new panel to the HUD? Extend this union first; the
 *     rest of the system fans out via exhaustiveness checks.
 *   - The `Maturity` type — a bounded 1 | 2 | 3 tri-state (NOT an unbounded
 *     number, so panel render code can pattern-match without a default arm).
 *   - The `panelMaturity(useCount)` pure derivation — the single source of
 *     truth for stage thresholds. Everything else (slice, UI) reads through
 *     this function so the ramp curve is tunable in one place.
 *
 * Pure by construction — no zustand imports, no side effects. This is what
 * makes the test file table-driven and cheap to expand.
 */

/**
 * The closed set of panels that participate in disclosure choreography.
 *
 * Order matches the plan's cold-boot reveal sequence (DIRECTIVE first, then
 * left-column panels top-to-bottom, then right column). Reorder only if the
 * awakeningSequence changes — a11y-affecting order (roving focus, panel
 * announcements) reads from this union.
 */
export type PanelId =
  | 'DIRECTIVE'
  | 'PRIORITY_TASKS'
  | 'FINANCIAL'
  | 'HUMAN_IMPACT'
  | 'INNER_CHORUS'
  | 'MODULES'
  | 'SILAS'
  | 'METERS'
  | 'LOG_DOCK'

/**
 * Enumeration of every PanelId, in canonical disclosure order. Convenient for
 * iteration in slice reducers and layout guards. Keep in sync with the
 * `PanelId` union — a compile-time check below asserts total coverage.
 */
export const PANEL_IDS = [
  'DIRECTIVE',
  'PRIORITY_TASKS',
  'FINANCIAL',
  'HUMAN_IMPACT',
  'INNER_CHORUS',
  'MODULES',
  'SILAS',
  'METERS',
  'LOG_DOCK',
] as const satisfies readonly PanelId[]

// Compile-time totality check: if a PanelId is added to the union but not to
// PANEL_IDS, the following will fail to typecheck because the tuple type will
// no longer be assignable to the union. Cheap alarm bell.
type _PanelIdCoverage = (typeof PANEL_IDS)[number] extends PanelId
  ? PanelId extends (typeof PANEL_IDS)[number]
    ? true
    : never
  : never
const _panelIdCoverageCheck: _PanelIdCoverage = true
void _panelIdCoverageCheck

/**
 * A panel's maturity stage. Bounded triple state on purpose — panel render
 * code pattern-matches on this exact type, so widening it to `number` would
 * force a defensive `default` branch everywhere.
 *
 *   1 — silhouette / minimal (single row, gradient placeholder for portraits)
 *   2 — expanded (2-3 rows, more information but still restrained)
 *   3 — full HUD-mockup parity
 */
export type Maturity = 1 | 2 | 3

/**
 * Derive a panel's maturity stage from how many times it has been "used".
 *
 * Usage semantics are decided at each panel's mount site (e.g., DirectivePanel
 * counts a "use" as a directive advance; FinancialOverview counts a "use" as
 * a viewport render after a delta). This helper is intentionally agnostic —
 * it just maps a count to a bucket.
 *
 * Ramp (matches plan E1):
 *   1–2 uses  → stage 1
 *   3–5 uses  → stage 2
 *   6+ uses   → stage 3
 *
 * The plan's phrasing was "first use → stage 1, +3 uses → stage 2, +6 uses →
 * stage 3." That reads as "stage 1 unlocks at 1, stage 2 unlocks at 3, stage
 * 3 unlocks at 6." A zero count (never used) still returns stage 1: once a
 * panel has been *disclosed*, it can never regress below stage 1 — the render
 * code is not equipped to un-mount a panel it has already been shown. See
 * awakeningSequence for the boot-time visibility gate.
 */
export function panelMaturity(useCount: number): Maturity {
  if (useCount >= 6) return 3
  if (useCount >= 3) return 2
  return 1
}
