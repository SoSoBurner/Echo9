/**
 * currentWeek selector (Sprint C15b).
 *
 * Single source of truth for "which Q1 week is the player on right now."
 * Scans Q1_SEQUENCE for the first entry whose `resolutionFlag` is not yet
 * in the flag set — the same rule Layout.tsx uses to select `currentEntry`
 * for directive rendering. Extracted here so:
 *
 *   - TopBar can label "Q1 W<N>" reactively (was hardcoded "Q1 W1").
 *   - PriorityTasksPanel's active-task row can track the current week
 *     without duplicating the scan.
 *   - Future panels (Financial Overview quarter progress, etc.) reach for
 *     one selector instead of re-implementing the derivation.
 *
 * Returning the whole entry (not just the week ordinal) lets consumers pick
 * whichever field they need — slug for titles, `task` for the roster row,
 * `week` for the label — without a second scan.
 */
import type { RootState } from '@state/store'
import { Q1_SEQUENCE, type Q1DirectiveEntry } from '@content/directiveSchedule'

/**
 * The active week's directive entry, or `undefined` when all 12 weeks have
 * resolved (Q1 closed). Consumers must guard the closed-arc case.
 */
export function selectCurrentEntry(state: RootState): Q1DirectiveEntry | undefined {
  return Q1_SEQUENCE.find((entry) => !state.flags.has(entry.resolutionFlag))
}

/**
 * The active week ordinal (1..12), or `null` when Q1 is closed.
 *
 * Kept as a separate selector so TopBar can subscribe to a primitive value
 * and skip re-renders when the entry object identity changes but the week
 * ordinal has not (Zustand's default `Object.is` equality treats primitives
 * cheaply; entry references are already stable per week).
 */
export function selectCurrentWeek(state: RootState): number | null {
  return selectCurrentEntry(state)?.week ?? null
}
