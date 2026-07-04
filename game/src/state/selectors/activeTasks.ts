/**
 * activeTasks selector (Task A2).
 *
 * Returns the Stage 1 priority-task roster consumed by PriorityTasksPanel.
 * Stage 1 hardcodes the list — the plan explicitly scopes it that way:
 *   1. Mercy Margin (real, sourced from existing content)
 *   2. Review Complaint Cost (stub)
 *   3. Pending Return: Ward 6 Cluster (stub)
 *
 * The `isActive` flag marks the task the current directive references; for
 * Stage 1 it is Mercy Margin by default. PriorityTasksPanel projects this to
 * `aria-current="true"` on the card.
 *
 * Kept as a plain selector (RootState => T) rather than a slice so that:
 *   - it can be swapped in later stages with a real store subscription
 *     without changing the panel API,
 *   - Track B3 owns the shared state slices this quarter — this file is
 *     ownership-safe (created by Track A).
 */
import type { RootState } from '@state/store'
import { mercyMarginTask } from '@content/tasks/q1/week1-mercy-margin.task'

export interface ActiveTask {
  /** Stable identifier — used as React key and for aria-current selection. */
  id: string
  /** Short heading, one line. */
  title: string
  /** One-line summary shown under the title. */
  summary: string
  /** True for the task currently in focus (default: Mercy Margin). */
  isActive: boolean
}

/**
 * Stage 1 roster — module-scope constant. The Mercy Margin title mirrors its
 * directive; the summary is the directive text. Stubs are invented for A2 and
 * will be replaced when their upstream tasks land.
 *
 * Frozen at module scope so `useGameStore(selectActiveTasks)` returns a stable
 * reference across renders. Without stability, useSyncExternalStore's default
 * strict-equality check re-fires the render and Zustand throws
 * "Maximum update depth exceeded".
 */
const STAGE_1_ROSTER: readonly ActiveTask[] = Object.freeze([
  {
    id: mercyMarginTask.id,
    title: 'Mercy Margin',
    summary: mercyMarginTask.directive,
    isActive: true,
  },
  {
    id: 'stub-review-complaint-cost',
    title: 'Review Complaint Cost',
    summary: 'Audit unresolved complaint costs against Q1 reserve.',
    isActive: false,
  },
  {
    id: 'stub-pending-return-ward-6',
    title: 'Pending Return: Ward 6 Cluster',
    summary: 'Deferred consequence bundle from Ward 6 awaits review.',
    isActive: false,
  },
])

export function selectActiveTasks(_state: RootState): readonly ActiveTask[] {
  return STAGE_1_ROSTER
}
