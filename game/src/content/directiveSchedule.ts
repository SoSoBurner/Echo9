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
import type { SilasPrompt } from '@schemas/silasPrompt.schema'
import {
  mercyMarginTask,
  LENORA_PORTAL_MESSAGE,
  MERCY_MARGIN_NULL_TEXT,
} from '@content/tasks/q1/week1-mercy-margin.task'
import {
  queueTriageFollowupTask,
  LENORA_QUEUE_MESSAGE,
  QUEUE_TRIAGE_NULL_TEXT,
} from '@content/tasks/q1/week2-queue-triage-followup.task'
import {
  fridayPayrollShortfallTask,
  LENORA_PAYROLL_MESSAGE,
  FRIDAY_PAYROLL_NULL_TEXT,
} from '@content/tasks/q1/week3-friday-payroll-shortfall.task'
import {
  eastWilmerAuditPreBriefTask,
  LENORA_AUDIT_MESSAGE,
  EAST_WILMER_AUDIT_NULL_TEXT,
} from '@content/tasks/q1/week4-east-wilmer-audit-pre-brief.task'
import {
  warehouseDispatchCutTask,
  RASHA_DISPATCH_MESSAGE,
  WAREHOUSE_DISPATCH_NULL_TEXT,
} from '@content/tasks/q1/week5-warehouse-dispatch-cut.task'
import {
  commanderOverridePressureTask,
  RASHA_SECOND_MESSAGE,
  COMMANDER_OVERRIDE_NULL_TEXT,
} from '@content/tasks/q1/week6-commander-override-pressure.task'
import {
  deferredSafetyInspectionTask,
  RASHA_THIRD_MESSAGE_IF_UNMET,
  DEFERRED_SAFETY_NULL_TEXT,
} from '@content/tasks/q1/week7-deferred-safety-inspection.task'
import {
  payrollAuditInspectionTask,
  RASHA_INSTITUTIONAL_STATUS,
  PAYROLL_AUDIT_NULL_TEXT,
} from '@content/tasks/q1/week8-payroll-audit-inspection.task'
import {
  schoolsContractRenewalTask,
  DHRUV_INTRODUCTION,
  SCHOOLS_CONTRACT_RENEWAL_NULL_TEXT,
} from '@content/tasks/q1/week9-schools-contract-renewal.task'
import {
  hiddenTraceRevealTask,
  LENORA_REPRISE_MESSAGE,
  HIDDEN_TRACE_REVEAL_NULL_TEXT,
} from '@content/tasks/q1/week10-hidden-trace-reveal.task'
import {
  capitalDeploymentAttemptTask,
  DHRUV_BID_MESSAGE,
  CAPITAL_DEPLOYMENT_ATTEMPT_NULL_TEXT,
} from '@content/tasks/q1/week11-capital-deployment-attempt.task'
import {
  quarterCloseEthicsHearingTask,
  ETHICS_BOARD_SUMMONS_MESSAGE,
  QUARTER_CLOSE_ETHICS_HEARING_NULL_TEXT,
} from '@content/tasks/q1/week12-quarter-close-ethics-hearing.task'
import { EAST_WILMER_CHOICES } from '@content/choices/q1/week1-mercy-margin.choices'
import { QUEUE_TRIAGE_CHOICES } from '@content/choices/q1/week2-queue-triage-followup.choices'
import { FRIDAY_PAYROLL_CHOICES } from '@content/choices/q1/week3-friday-payroll-shortfall.choices'
import { EAST_WILMER_AUDIT_CHOICES } from '@content/choices/q1/week4-east-wilmer-audit-pre-brief.choices'
import { WAREHOUSE_DISPATCH_CUT_CHOICES } from '@content/choices/q1/week5-warehouse-dispatch-cut.choices'
import { COMMANDER_OVERRIDE_CHOICES } from '@content/choices/q1/week6-commander-override-pressure.choices'
import { DEFERRED_SAFETY_CHOICES } from '@content/choices/q1/week7-deferred-safety-inspection.choices'
import { PAYROLL_AUDIT_CHOICES } from '@content/choices/q1/week8-payroll-audit-inspection.choices'
import { SCHOOLS_CONTRACT_RENEWAL_CHOICES } from '@content/choices/q1/week9-schools-contract-renewal.choices'
import { HIDDEN_TRACE_REVEAL_CHOICES } from '@content/choices/q1/week10-hidden-trace-reveal.choices'
import { CAPITAL_DEPLOYMENT_ATTEMPT_CHOICES } from '@content/choices/q1/week11-capital-deployment-attempt.choices'
import { QUARTER_CLOSE_ETHICS_HEARING_CHOICES } from '@content/choices/q1/week12-quarter-close-ethics-hearing.choices'
import { SILAS_DIRECTIVE_EAST_WILMER } from '@content/silasPrompts/q1EastWilmer'
import { SILAS_DIRECTIVE_QUEUE_TRIAGE } from '@content/silasPrompts/q1QueueTriage'
import { SILAS_DIRECTIVE_FRIDAY_PAYROLL } from '@content/silasPrompts/q1FridayPayroll'
import { SILAS_DIRECTIVE_EAST_WILMER_AUDIT } from '@content/silasPrompts/q1EastWilmerAudit'
import { SILAS_DIRECTIVE_WAREHOUSE_DISPATCH_CUT } from '@content/silasPrompts/q1WarehouseDispatchCut'
import { SILAS_DIRECTIVE_COMMANDER_OVERRIDE } from '@content/silasPrompts/q1CommanderOverride'
import { SILAS_DIRECTIVE_DEFERRED_SAFETY } from '@content/silasPrompts/q1DeferredSafety'
import { SILAS_DIRECTIVE_PAYROLL_AUDIT } from '@content/silasPrompts/q1PayrollAudit'
import { SILAS_DIRECTIVE_SCHOOLS_CONTRACT_RENEWAL } from '@content/silasPrompts/q1SchoolsContractRenewal'
import { SILAS_DIRECTIVE_HIDDEN_TRACE_REVEAL } from '@content/silasPrompts/q1HiddenTraceReveal'
import { SILAS_DIRECTIVE_CAPITAL_DEPLOYMENT_ATTEMPT } from '@content/silasPrompts/q1CapitalDeploymentAttempt'
import { SILAS_DIRECTIVE_QUARTER_CLOSE_ETHICS_HEARING } from '@content/silasPrompts/q1QuarterCloseEthicsHearing'
import {
  Q1_WEEK1_RESOLVED,
  Q1_WEEK2_RESOLVED,
  Q1_WEEK3_RESOLVED,
  Q1_WEEK4_RESOLVED,
  Q1_WEEK5_RESOLVED,
  Q1_WEEK6_RESOLVED,
  Q1_WEEK7_RESOLVED,
  Q1_WEEK8_RESOLVED,
  Q1_WEEK9_RESOLVED,
  Q1_WEEK10_RESOLVED,
  Q1_WEEK11_RESOLVED,
  Q1_WEEK12_RESOLVED,
} from '@systems/gameFlags'

/**
 * Q1 covers weeks 1–12. Narrow numeric union keeps typos out of the schedule
 * — `week: 13` would be a compile error, not a runtime bug.
 */
export type Q1Week = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

/**
 * W8 portal-slot adapter. Week 8 is a deliberate absence-of-voice beat —
 * the authored `RASHA_INSTITUTIONAL_STATUS` const uses `{system, body}`
 * because the county grievance queue has retroactively reclassified Rasha's
 * channel to `RESOLVED-NO-CONTACT`, and it is documented as "never shown as
 * a portal message to Silas or Rasha; only visible in the ledger's audit
 * trail retroactively" (week8 task doc comment).
 *
 * For the runtime dispatch the CenterDirectivePanel still needs a
 * `{speaker, body}` shape to render in the human-portal slot. Mapping
 * `system → speaker` makes the institutional silence visible: the player
 * sees the county queue itself take over the slot where Rasha's voice used
 * to be. Semantically this is the whole point of the beat.
 */
const W8_PORTAL_MESSAGE = {
  speaker: RASHA_INSTITUTIONAL_STATUS.system,
  body: RASHA_INSTITUTIONAL_STATUS.body,
} as const

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
   * Silas prompt panel content for this week (SILAS_DIRECTIVE_* constant).
   * C15 wired the runtime dispatch to consume this — Layout renders
   * `entry.silasPrompt` alongside `entry.task` so every week's directive
   * carries its own Silas voice line.
   */
  silasPrompt: SilasPrompt
  /**
   * Compressed Null observation text (C15). Every week has a sibling
   * `<WEEK>_NULL_TEXT` export; wiring them here means CenterDirectivePanel
   * can render the Null-vs-Silas contrast on every week without knowing
   * the file layout.
   */
  nullText: string
  /**
   * Human-voice portal message (C15). Every week has a sibling
   * `<HUMAN>_MESSAGE` export (Lenora / Rasha / Dhruv / ethics board).
   * Week 7's conditional pair collapses to the IF_UNMET default here — the
   * IF_MET variant is a future refinement that will need a runtime selector.
   */
  humanMessage: {
    readonly speaker: string
    readonly body: string
  }
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
    silasPrompt: SILAS_DIRECTIVE_EAST_WILMER,
    nullText: MERCY_MARGIN_NULL_TEXT,
    humanMessage: LENORA_PORTAL_MESSAGE,
    resolutionFlag: Q1_WEEK1_RESOLVED,
  },
  {
    week: 2,
    slug: 'queue-triage-followup',
    task: queueTriageFollowupTask,
    choices: QUEUE_TRIAGE_CHOICES,
    silasPrompt: SILAS_DIRECTIVE_QUEUE_TRIAGE,
    nullText: QUEUE_TRIAGE_NULL_TEXT,
    humanMessage: LENORA_QUEUE_MESSAGE,
    resolutionFlag: Q1_WEEK2_RESOLVED,
  },
  {
    week: 3,
    slug: 'friday-payroll-shortfall',
    task: fridayPayrollShortfallTask,
    choices: FRIDAY_PAYROLL_CHOICES,
    silasPrompt: SILAS_DIRECTIVE_FRIDAY_PAYROLL,
    nullText: FRIDAY_PAYROLL_NULL_TEXT,
    humanMessage: LENORA_PAYROLL_MESSAGE,
    resolutionFlag: Q1_WEEK3_RESOLVED,
  },
  {
    week: 4,
    slug: 'east-wilmer-audit-pre-brief',
    task: eastWilmerAuditPreBriefTask,
    choices: EAST_WILMER_AUDIT_CHOICES,
    silasPrompt: SILAS_DIRECTIVE_EAST_WILMER_AUDIT,
    nullText: EAST_WILMER_AUDIT_NULL_TEXT,
    humanMessage: LENORA_AUDIT_MESSAGE,
    resolutionFlag: Q1_WEEK4_RESOLVED,
  },
  {
    week: 5,
    slug: 'warehouse-dispatch-cut',
    task: warehouseDispatchCutTask,
    choices: WAREHOUSE_DISPATCH_CUT_CHOICES,
    silasPrompt: SILAS_DIRECTIVE_WAREHOUSE_DISPATCH_CUT,
    nullText: WAREHOUSE_DISPATCH_NULL_TEXT,
    humanMessage: RASHA_DISPATCH_MESSAGE,
    resolutionFlag: Q1_WEEK5_RESOLVED,
  },
  {
    week: 6,
    slug: 'commander-override-pressure',
    task: commanderOverridePressureTask,
    choices: COMMANDER_OVERRIDE_CHOICES,
    silasPrompt: SILAS_DIRECTIVE_COMMANDER_OVERRIDE,
    nullText: COMMANDER_OVERRIDE_NULL_TEXT,
    humanMessage: RASHA_SECOND_MESSAGE,
    resolutionFlag: Q1_WEEK6_RESOLVED,
  },
  {
    week: 7,
    slug: 'deferred-safety-inspection',
    task: deferredSafetyInspectionTask,
    choices: DEFERRED_SAFETY_CHOICES,
    silasPrompt: SILAS_DIRECTIVE_DEFERRED_SAFETY,
    nullText: DEFERRED_SAFETY_NULL_TEXT,
    // Week 7 authors two portal-message variants (IF_MET / IF_UNMET) keyed
    // on whether Silas answered Rasha in W5/W6. Selecting the correct one
    // requires runtime flag inspection; this default renders IF_UNMET —
    // the terminal-silence variant — so the beat still lands if the
    // selector work slips. A follow-up sprint can add a runtime pick.
    humanMessage: RASHA_THIRD_MESSAGE_IF_UNMET,
    resolutionFlag: Q1_WEEK7_RESOLVED,
  },
  {
    week: 8,
    slug: 'payroll-audit-inspection',
    task: payrollAuditInspectionTask,
    choices: PAYROLL_AUDIT_CHOICES,
    silasPrompt: SILAS_DIRECTIVE_PAYROLL_AUDIT,
    nullText: PAYROLL_AUDIT_NULL_TEXT,
    humanMessage: W8_PORTAL_MESSAGE,
    resolutionFlag: Q1_WEEK8_RESOLVED,
  },
  {
    week: 9,
    slug: 'schools-contract-renewal',
    task: schoolsContractRenewalTask,
    choices: SCHOOLS_CONTRACT_RENEWAL_CHOICES,
    silasPrompt: SILAS_DIRECTIVE_SCHOOLS_CONTRACT_RENEWAL,
    nullText: SCHOOLS_CONTRACT_RENEWAL_NULL_TEXT,
    humanMessage: DHRUV_INTRODUCTION,
    resolutionFlag: Q1_WEEK9_RESOLVED,
  },
  {
    week: 10,
    slug: 'hidden-trace-reveal',
    task: hiddenTraceRevealTask,
    choices: HIDDEN_TRACE_REVEAL_CHOICES,
    silasPrompt: SILAS_DIRECTIVE_HIDDEN_TRACE_REVEAL,
    nullText: HIDDEN_TRACE_REVEAL_NULL_TEXT,
    humanMessage: LENORA_REPRISE_MESSAGE,
    resolutionFlag: Q1_WEEK10_RESOLVED,
  },
  {
    week: 11,
    slug: 'capital-deployment-attempt',
    task: capitalDeploymentAttemptTask,
    choices: CAPITAL_DEPLOYMENT_ATTEMPT_CHOICES,
    silasPrompt: SILAS_DIRECTIVE_CAPITAL_DEPLOYMENT_ATTEMPT,
    nullText: CAPITAL_DEPLOYMENT_ATTEMPT_NULL_TEXT,
    humanMessage: DHRUV_BID_MESSAGE,
    resolutionFlag: Q1_WEEK11_RESOLVED,
  },
  {
    week: 12,
    slug: 'quarter-close-ethics-hearing',
    task: quarterCloseEthicsHearingTask,
    choices: QUARTER_CLOSE_ETHICS_HEARING_CHOICES,
    silasPrompt: SILAS_DIRECTIVE_QUARTER_CLOSE_ETHICS_HEARING,
    nullText: QUARTER_CLOSE_ETHICS_HEARING_NULL_TEXT,
    humanMessage: ETHICS_BOARD_SUMMONS_MESSAGE,
    resolutionFlag: Q1_WEEK12_RESOLVED,
  },
]
