// Central aggregator for all game content modules.
// T9 (Mercy Margin content) populates these arrays.
// The §11 traceability test scans every entry in ALL_CONSEQUENCE_MODULES.

import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import type { ResultTrace } from '@schemas/resultTrace.schema'
import { MERCY_MARGIN_HOOKS } from '@content/consequences/q1/week1-mercy-margin.consequences'
import { QUEUE_TRIAGE_HOOKS } from '@content/consequences/q1/week2-queue-triage-followup.consequences'
import { FRIDAY_PAYROLL_HOOKS } from '@content/consequences/q1/week3-friday-payroll-shortfall.consequences'
import { EAST_WILMER_AUDIT_HOOKS } from '@content/consequences/q1/week4-east-wilmer-audit-pre-brief.consequences'
import { WAREHOUSE_DISPATCH_CUT_HOOKS } from '@content/consequences/q1/week5-warehouse-dispatch-cut.consequences'
import { COMMANDER_OVERRIDE_HOOKS } from '@content/consequences/q1/week6-commander-override-pressure.consequences'
import { DEFERRED_SAFETY_HOOKS } from '@content/consequences/q1/week7-deferred-safety-inspection.consequences'
import { PAYROLL_AUDIT_HOOKS } from '@content/consequences/q1/week8-payroll-audit-inspection.consequences'
import { SCHOOLS_CONTRACT_RENEWAL_HOOKS } from '@content/consequences/q1/week9-schools-contract-renewal.consequences'

// ---------------------------------------------------------------------------
// Hook registry (§11 — every delayed consequence has the 7 mandatory fields)
// ---------------------------------------------------------------------------

export const ALL_CONSEQUENCE_MODULES: readonly ConsequenceHook[] = [
  ...MERCY_MARGIN_HOOKS,
  ...QUEUE_TRIAGE_HOOKS,
  ...FRIDAY_PAYROLL_HOOKS,
  ...EAST_WILMER_AUDIT_HOOKS,
  ...WAREHOUSE_DISPATCH_CUT_HOOKS,
  ...COMMANDER_OVERRIDE_HOOKS,
  ...DEFERRED_SAFETY_HOOKS,
  ...PAYROLL_AUDIT_HOOKS,
  ...SCHOOLS_CONTRACT_RENEWAL_HOOKS,
]

// ---------------------------------------------------------------------------
// ResultTrace registry — traces are WRITTEN by the resolver at runtime when
// the player commits a choice (T5 / Layout). The registry here is for any
// authored "seed" traces. T9 ships none; the array is intentionally empty so
// the traceabilityInvariant cross-reference test continues to pass.
// ---------------------------------------------------------------------------

export const ALL_RESULT_TRACES: readonly ResultTrace[] = []
