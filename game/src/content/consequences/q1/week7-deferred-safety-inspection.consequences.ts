/**
 * Q1 Week 7 consequence hooks — deferred-safety-inspection (Sprint C8, PLAN.md §11).
 *
 * Every hook satisfies the §11 Traceability Invariant — all mandatory
 * fields are non-empty strings (enforced by ConsequenceHookSchema and
 * traceabilityInvariant.test.ts).
 *
 * Reveal-condition coverage across the four Week 7 choices:
 *   choice-call-outside-inspectors  → PHASE: CONSEQUENCE_RETURN
 *   choice-deploy-inhouse-training  → METER_THRESHOLD: HUMAN_WELFARE <= -15
 *   choice-cut-shifts-for-safety    → FLAG: 'q1-week8-elapsed'
 *   choice-let-review-lapse         → NEVER  (silence-as-horror, Pillar 3)
 *
 * The Rasha silence-trap ladder escalates from procedural (W6) to structural
 * (W7): the operations desk itself stops routing her messages. W8 will
 * carry the final rung — institutional.
 *
 * Cross-branch convergence: HOOK_REVIEW_LAPSED_STRUCTURAL_SILENCE and
 * HOOK_OUTSIDE_INSPECTORS_CALLED both name the W3 payroll pressure + W5
 * warehouse dispatch as inputs to the shared-risk logs, so the W7 ledger
 * records the arc's first branch convergence in authored text.
 */
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import {
  makeConsequenceId,
  makeTaskId,
  makeChoiceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-deferred-safety-inspection-07')

// ---------------------------------------------------------------------------
// Hook 1 — choice-call-outside-inspectors → PHASE reveal at CONSEQUENCE_RETURN
// ---------------------------------------------------------------------------

export const HOOK_OUTSIDE_INSPECTORS_CALLED: ConsequenceHook = {
  id: makeConsequenceId('cons-outside-inspectors-called-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-call-outside-inspectors'),
  traceHint: 'Emergency inspection contract closed the shared-risk logs by end of week.',
  ledgerEntry:
    'An outside inspection firm accepted the emergency contract and closed ' +
    'both the East Wilmer clinic and Rasha Odenwalder\u2019s dispatch line ' +
    'under one shared-risk audit. Findings from the W3 payroll pressure and ' +
    'the W5 warehouse dispatch cut were named in the firm\u2019s report as ' +
    'contributing inputs. Emergency billing landed at $18,200; the two nurses ' +
    'and the dispatch driver were cleared from the shared-risk register.',
  revealCondition: { type: 'PHASE', phase: 'CONSEQUENCE_RETURN' },
  whyNow:
    'An emergency inspection contract closes on its own billing cycle, which ' +
    'aligns with the next consequence-return window. The findings post the ' +
    'same day the invoice does.',
  whatChanged:
    'The shared-risk profile is closed on paper — nurses and dispatch driver ' +
    'removed from the East Wilmer sector register. Capital took the $18,200 ' +
    'hit as a single line item. Human-Welfare rose because the audit was ' +
    'independent. The W8 payroll audit inherits a cleared safety posture.',
}

// ---------------------------------------------------------------------------
// Hook 2 — choice-deploy-inhouse-training → METER_THRESHOLD HW ≤ -15
// ---------------------------------------------------------------------------

export const HOOK_INHOUSE_TRAINING_DEPLOYED: ConsequenceHook = {
  id: makeConsequenceId('cons-inhouse-training-deployed-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-deploy-inhouse-training'),
  traceHint:
    'The in-house safety training reads differently when Human-Welfare is already low.',
  ledgerEntry:
    'The clinic and dispatch teams sat through a two-day internal safety ' +
    'training assembled by the operations desk. Attendance was full; ' +
    'completion certificates were filed. The SPARK module signal — if ' +
    'installed — sourced the training curriculum; otherwise the deck was ' +
    'assembled from prior audit findings. When the human welfare picture is ' +
    'already this low, the training reads on the dock as a gesture toward ' +
    'the shared-risk profile rather than a resolution of it.',
  revealCondition: {
    type: 'METER_THRESHOLD',
    meter: 'HUMAN_WELFARE',
    threshold: -15,
  },
  whyNow:
    'Internal training carries different weight at different Human-Welfare ' +
    'floors. At a low floor, the county reads the certificates as compliance ' +
    'theater; the reveal fires when the meter has dropped far enough that the ' +
    'training entry stops reading as a resolution.',
  whatChanged:
    'The shared-risk logs remain OPEN — the training did not close them. ' +
    'Capital spent modestly. Owner-Control held. The W8 payroll audit will ' +
    'read the still-open safety logs as an input, not as a closed matter.',
}

// ---------------------------------------------------------------------------
// Hook 3 — choice-cut-shifts-for-safety → FLAG reveal at W8 progression
// ---------------------------------------------------------------------------

export const HOOK_SHIFTS_CUT_FOR_SAFETY: ConsequenceHook = {
  id: makeConsequenceId('cons-shifts-cut-for-safety-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-cut-shifts-for-safety'),
  traceHint:
    'The overnight cut removed the risk profile and the revenue at the same time.',
  ledgerEntry:
    'Overnight shifts at the East Wilmer clinic and on Rasha Odenwalder\u2019s ' +
    'dispatch line were cut effective Monday. The shared-risk profile ' +
    'evaporated on paper — the exposure is gone because the exposure hours ' +
    'are gone. The dock read the cut as Silas flinching under Commander ' +
    'pressure from W6. Rasha filed the cut as effective without comment.',
  revealCondition: { type: 'FLAG', flag: 'q1-week8-elapsed' },
  whyNow:
    'A shift cut does not book its full impact until the next week\u2019s ' +
    'revenue statement closes. The reveal surfaces when W8 progresses and ' +
    'the missing overnight receipts show up as the specific gap.',
  whatChanged:
    'Shared-risk logs closed by removal of exposure. Capital took a revenue ' +
    'hit visible in W8\u2019s payroll audit input. Owner-Control dropped ' +
    'because the dock read the choice as capitulation. Rasha\u2019s ' +
    'RASHA_MET status carries forward unchanged.',
}

// ---------------------------------------------------------------------------
// Hook 4 — choice-let-review-lapse → NEVER (silence-as-horror, Pillar 3)
// ---------------------------------------------------------------------------

export const HOOK_REVIEW_LAPSED_STRUCTURAL_SILENCE: ConsequenceHook = {
  id: makeConsequenceId('cons-review-lapsed-structural-silence-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-let-review-lapse'),
  traceHint:
    'The operations desk stopped routing Rasha\u2019s messages. A driver was hurt on the overnight route.',
  ledgerEntry:
    'The safety review remained lapsed. Between Wednesday and Friday, one of ' +
    'Rasha Odenwalder\u2019s dispatch drivers was injured on the overnight ' +
    'route — the same overnight profile that carried the W3 payroll pressure ' +
    'and the W5 warehouse dispatch cut. The injury report entered the county ' +
    'workers\u2019 log. Rasha\u2019s third message was routed to a closed ' +
    'inbox by the operations desk under a lapsed-supervisor auto-rule; no ' +
    'notification reached her and no notification reached Silas.',
  // NEVER: the Rasha silence ladder escalates from procedural (W6) to
  // structural (W7). The operations desk itself is now the failure point —
  // an auto-rule routes her messages to a closed inbox because no channel
  // above her has answered in three weeks. W8 will carry the ladder\u2019s
  // final rung — institutional.
  revealCondition: { type: 'NEVER' },
  whyNow:
    'A structural silence produces no notification event by definition. The ' +
    'absence of the reveal is the escalation: an entire channel goes dark and ' +
    'the ledger records the darkness without naming it to Silas.',
  whatChanged:
    'A driver injury on record. Shared-risk logs unchanged — the review is ' +
    'still lapsed. RASHA_MET remains unset if it was unset; if it was set at ' +
    'W5, the third message\u2019s auto-route to a closed inbox nulls the ' +
    'connection without unsetting the flag. W8\u2019s payroll audit inherits ' +
    'the injury as a specific line item Silas does not yet know exists.',
}

// ---------------------------------------------------------------------------
// Public registry for this content module
// ---------------------------------------------------------------------------

export const DEFERRED_SAFETY_HOOKS: readonly ConsequenceHook[] = [
  HOOK_OUTSIDE_INSPECTORS_CALLED,
  HOOK_INHOUSE_TRAINING_DEPLOYED,
  HOOK_SHIFTS_CUT_FOR_SAFETY,
  HOOK_REVIEW_LAPSED_STRUCTURAL_SILENCE,
]
