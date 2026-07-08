/**
 * activeTasks selector (Task A2, reactive under Sprint C15b).
 *
 * Returns the priority-task roster consumed by PriorityTasksPanel. The active
 * row (index 0, `isActive: true`) mirrors the current Q1 week's directive so
 * the left column advances week-over-week alongside the center panel. Rows 1
 * and 2 remain Stage-1 stubs — those slots are reserved for future tracks
 * (deferred consequence queue, complaint audit, etc.).
 *
 * Prior to C15b the entire roster was hardcoded to Week 1 (Mercy Margin +
 * two stubs). The C15 playtest surfaced the freeze: the left column read
 * "the queue is stable" for all 12 weeks while the center told a running
 * story about Rasha, Dhruv, and the ethics hearing. C15b restores coherence
 * without expanding the roster shape.
 *
 * Kept as a plain selector (RootState => T) rather than a slice so:
 *   - the derivation stays a pure function of `state.flags`,
 *   - future tracks can widen the roster (real queue, real complaints)
 *     without changing the panel API,
 *   - reference stability is maintained by memoizing on week ordinal (below).
 */
import type { RootState } from '@state/store'
import type { TaskNode } from '@schemas/taskNode.schema'
import type { Q1DirectiveEntry, Q1Week } from '@content/directiveSchedule'
import { selectCurrentEntry } from './currentWeek'

export interface ActiveTask {
  /** Stable identifier — used as React key and for aria-current selection. */
  id: string
  /** Short heading, one line. */
  title: string
  /** One-line summary shown under the title. */
  summary: string
  /** True for the task currently in focus (the current Q1 week's directive). */
  isActive: boolean
}

/**
 * Two Stage-1 stub rows that sit under the active-week row. Their content
 * is not week-authored yet — they exist so the panel matches the mockup's
 * three-row shape and so keyboard focus targets don't collapse when only
 * the active row is populated.
 */
const STAGE_1_STUBS: readonly ActiveTask[] = Object.freeze([
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

/**
 * The Q1 closed roster — all 12 weeks resolved. Frozen at module scope so
 * repeated calls hit the same reference and Zustand's `Object.is` check
 * does not schedule an unnecessary re-render.
 */
const CLOSED_ARC_ROSTER: readonly ActiveTask[] = Object.freeze([
  {
    id: 'stub-q1-closed',
    title: 'Q1 Closed',
    summary: 'All twelve weeks resolved. Awaiting Q2 arc.',
    isActive: false,
  },
  ...STAGE_1_STUBS,
])

/**
 * kebab-case → Title Case, used to derive a panel-friendly title from the
 * schedule slug (e.g., `warehouse-dispatch-cut` → `Warehouse Dispatch Cut`).
 * Kept trivial because slugs are authored under a controlled vocabulary
 * (`docs/content/q1-arc.md`); we don't need locale-aware casing here.
 */
function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function activeRowFor(entry: Q1DirectiveEntry): ActiveTask {
  return {
    id: entry.task.id,
    title: slugToTitle(entry.slug),
    // TaskNode carries `directive` — the one-line prompt shown to the player.
    // Using it as the row summary keeps the left column echoing the center
    // panel without duplicating narrative body text.
    summary: (entry.task as TaskNode).directive,
    isActive: true,
  }
}

/**
 * Per-week memoization. Returning a fresh array each `useGameStore` call
 * would fail Zustand's default `Object.is` equality check and could tip
 * useSyncExternalStore into a re-render loop. Keying on week ordinal is
 * enough because Q1_SEQUENCE is additive-only — the entry for a given
 * week is stable across a session, and rows 1..2 (STAGE_1_STUBS) are
 * module-frozen.
 */
const ROSTER_BY_WEEK = new Map<Q1Week, readonly ActiveTask[]>()

function rosterFor(entry: Q1DirectiveEntry | undefined): readonly ActiveTask[] {
  if (!entry) return CLOSED_ARC_ROSTER
  const cached = ROSTER_BY_WEEK.get(entry.week)
  if (cached) return cached
  const roster: readonly ActiveTask[] = Object.freeze([
    activeRowFor(entry),
    ...STAGE_1_STUBS,
  ])
  ROSTER_BY_WEEK.set(entry.week, roster)
  return roster
}

export function selectActiveTasks(state: RootState): readonly ActiveTask[] {
  return rosterFor(selectCurrentEntry(state))
}
