/**
 * Q1 directive schedule (Sprint C2 onward).
 *
 * The Q1 arc is 12 weeks (`docs/content/q1-arc.md`). Each week authors one
 * directive that lives under `content/tasks/q1/week<N>-<slug>.task.ts` with
 * siblings in `content/choices/q1/` and `content/consequences/q1/`.
 *
 * `Q1_SEQUENCE` is the read-only spine that binds those authored files to a
 * week ordinal and a resolution flag. It exists so downstream systems don't
 * have to know every week's file layout:
 *
 *   - E1 tutorial disclosure walks the sequence to advance panel maturity per
 *     resolved week.
 *   - Future scheduling logic (a Zustand slice or Layout wiring) can find
 *     "next week's directive" by scanning for the first entry whose
 *     `resolutionFlag` is not yet in `state.flags`.
 *   - The C-track content-parse test walks `Q1_SEQUENCE` and Zod-parses every
 *     referenced task/choice/consequence file, so drift between schedule and
 *     actual content fails CI loudly.
 *   - `contentLint.test.ts` walks the sequence to build its known-task-id and
 *     known-choice-id sets — new weeks join the lint automatically once they
 *     appear here (Sprint C6 refactor).
 *
 * Additive-only. Each C-track sprint C3–C13 appends exactly one entry.
 * Existing entries never change — the Q1 spine is a fixed contract once
 * authored so mid-run save games remain valid across content edits.
 *
 * See `docs/content/q1-arc.md` for the week-by-week design notes this
 * schedule ratifies.
 */
import type { TaskNode } from '@schemas/taskNode.schema'
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import { mercyMarginTask } from '@content/tasks/q1/week1-mercy-margin.task'
import { queueTriageFollowupTask } from '@content/tasks/q1/week2-queue-triage-followup.task'
import { fridayPayrollShortfallTask } from '@content/tasks/q1/week3-friday-payroll-shortfall.task'
import { eastWilmerAuditPreBriefTask } from '@content/tasks/q1/week4-east-wilmer-audit-pre-brief.task'
import { warehouseDispatchCutTask } from '@content/tasks/q1/week5-warehouse-dispatch-cut.task'
import { EAST_WILMER_CHOICES } from '@content/choices/q1/week1-mercy-margin.choices'
import { QUEUE_TRIAGE_CHOICES } from '@content/choices/q1/week2-queue-triage-followup.choices'
import { FRIDAY_PAYROLL_CHOICES } from '@content/choices/q1/week3-friday-payroll-shortfall.choices'
import { EAST_WILMER_AUDIT_CHOICES } from '@content/choices/q1/week4-east-wilmer-audit-pre-brief.choices'
import { WAREHOUSE_DISPATCH_CUT_CHOICES } from '@content/choices/q1/week5-warehouse-dispatch-cut.choices'
import {
  Q1_WEEK1_RESOLVED,
  Q1_WEEK2_RESOLVED,
  Q1_WEEK3_RESOLVED,
  Q1_WEEK4_RESOLVED,
  Q1_WEEK5_RESOLVED,
} from '@systems/gameFlags'

/**
 * Q1 covers weeks 1–12. Narrow numeric union keeps typos out of the schedule
 * — `week: 13` would be a compile error, not a runtime bug.
 */
export type Q1Week = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

/**
 * A single Q1 week's directive plus everything Systems/tests need to reason
 * about it without knowing the file layout.
 *
 * The C6 refactor added `task` and `choices` as first-class fields so the
 * content-lint id-integrity test walks Q1_SEQUENCE directly rather than
 * duplicating a per-week array of imports. New weeks now register once here.
 */
export type Q1DirectiveEntry = Readonly<{
  /** Week ordinal, 1–12. Matches the file basename (`week<N>-<slug>`). */
  week: Q1Week
  /** URL/basename slug (e.g., `mercy-margin`, `queue-triage-followup`). */
  slug: string
  /** The directive's TaskNode. `task.id` is the referenced task id. */
  task: TaskNode
  /** The 4 ChoiceNodes for this week. All must reference `task.id`. */
  choices: readonly ChoiceNode[]
  /**
   * Flag set (additively) when the player commits any choice on this week's
   * directive. Downstream systems read this to know the week resolved without
   * caring which choice landed.
   */
  resolutionFlag: string
}>

/**
 * Q1 sequence — additive-only, ordered by week ordinal.
 *
 * Week 1 (`mercy-margin`) is the existing East Wilmer clinic directive
 * previously located at the root of `content/tasks/`. Sprint C2 moved it into
 * this schedule and under `content/tasks/q1/` so weeks 2–12 have a consistent
 * home.
 */
export const Q1_SEQUENCE: readonly Q1DirectiveEntry[] = [
  {
    week: 1,
    slug: 'mercy-margin',
    task: mercyMarginTask,
    choices: EAST_WILMER_CHOICES,
    resolutionFlag: Q1_WEEK1_RESOLVED,
  },
  {
    week: 2,
    slug: 'queue-triage-followup',
    task: queueTriageFollowupTask,
    choices: QUEUE_TRIAGE_CHOICES,
    resolutionFlag: Q1_WEEK2_RESOLVED,
  },
  {
    week: 3,
    slug: 'friday-payroll-shortfall',
    task: fridayPayrollShortfallTask,
    choices: FRIDAY_PAYROLL_CHOICES,
    resolutionFlag: Q1_WEEK3_RESOLVED,
  },
  {
    week: 4,
    slug: 'east-wilmer-audit-pre-brief',
    task: eastWilmerAuditPreBriefTask,
    choices: EAST_WILMER_AUDIT_CHOICES,
    resolutionFlag: Q1_WEEK4_RESOLVED,
  },
  {
    week: 5,
    slug: 'warehouse-dispatch-cut',
    task: warehouseDispatchCutTask,
    choices: WAREHOUSE_DISPATCH_CUT_CHOICES,
    resolutionFlag: Q1_WEEK5_RESOLVED,
  },
]
