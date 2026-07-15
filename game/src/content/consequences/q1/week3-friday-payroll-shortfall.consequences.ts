/**
 * Q1 Week 3 consequence hooks — friday-payroll-shortfall (Sprint C4, PLAN.md §11).
 *
 * Every hook satisfies the §11 Traceability Invariant — all mandatory
 * fields are non-empty strings (enforced by ConsequenceHookSchema and
 * traceabilityInvariant.test.ts).
 *
 * Reveal-condition coverage across the four Week 3 choices:
 *   choice-cover-from-reserve      → FLAG: 'q1-week4-elapsed' (week-elapse return)
 *   choice-delay-vendor-payments   → METER_THRESHOLD: OWNER_CONTROL <= -10
 *   choice-cut-clinic-line-item    → FLAG: 'east-wilmer-week4-elapsed'
 *   choice-borrow-silas-personal   → NEVER  (silence-as-horror, Pillar 3)
 *
 * The Week 3 silence trap is the highest-status version yet — Silas, the
 * owner, absorbs a personal debt to save payroll. There is no rebound
 * beat because the debt is his private ledger. The player only knows they
 * "found the money"; the game knows what it cost him.
 */
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import {
  makeConsequenceId,
  makeTaskId,
  makeChoiceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-friday-payroll-03')

// ---------------------------------------------------------------------------
// Hook 1 — choice-cover-from-reserve → FLAG reveal when Week 4 elapses (§11
// week-elapse return; was the unreachable PHASE:'CONSEQUENCE_RETURN')
// ---------------------------------------------------------------------------

export const HOOK_RESERVE_DRAWDOWN: ConsequenceHook = {
  id: makeConsequenceId('cons-reserve-drawdown-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-cover-from-reserve'),
  traceHint: 'Operating reserve dropped 22% to cover Friday payroll.',
  ledgerEntry:
    'Payroll cleared in full on Friday. Operating cash reserve fell from ' +
    '$820K to $640K — the largest single-week drawdown of Q1. ' +
    'County received a clean run-rate story.',
  // Week-elapse return: whyNow — the reserve position "shows in the next
  // weekly cash snapshot", i.e. once Week 4's directive is on the record.
  revealCondition: { type: 'FLAG', flag: 'q1-week4-elapsed' },
  whyNow:
    'The straight-cash cover posted immediately and the reserve position ' +
    'shows in the next weekly cash snapshot without delay.',
  whatChanged:
    'Runway compressed by 1.4 weeks. CAPITAL absorbed the -18 charge ' +
    'outright and every shift and vendor stayed certain (HUMAN_STABILITY ' +
    'held). The emptied reserve leaves Silas less slack for the next squeeze.',
}

// ---------------------------------------------------------------------------
// Hook 2 — choice-delay-vendor-payments → METER_THRESHOLD when OC bottoms
// ---------------------------------------------------------------------------

export const HOOK_VENDOR_DELAY_NOTICE: ConsequenceHook = {
  id: makeConsequenceId('cons-vendor-delay-notice-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-delay-vendor-payments'),
  traceHint:
    'Two Tier-1 vendors flagged the delayed payables to their credit desks.',
  ledgerEntry:
    'Vendor A/P aging on East Wilmer supplies rose past 60 days. Two Tier-1 ' +
    'vendors reported to their credit-monitoring desks. Cash-on-delivery ' +
    'terms proposed for the next order cycle.',
  revealCondition: { type: 'METER_THRESHOLD', meter: 'OWNER_CONTROL', threshold: -10 },
  whyNow:
    'Delayed payables leave a paper trail vendors read. When Owner-Control ' +
    'drops far enough, that paper trail becomes visible upstream.',
  whatChanged:
    'Supplier relationships hardened. Next-cycle terms will cost roughly 3% ' +
    'in COGS. The county story required a revision Silas has not filed.',
}

// ---------------------------------------------------------------------------
// Hook 3 — choice-cut-clinic-line-item → FLAG reveal at W4 inspection
// ---------------------------------------------------------------------------

export const HOOK_CLINIC_LINE_HIDDEN: ConsequenceHook = {
  id: makeConsequenceId('cons-clinic-line-hidden-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-cut-clinic-line-item'),
  traceHint:
    'County auditors flagged the missing East Wilmer maintenance line item.',
  ledgerEntry:
    'The East Wilmer maintenance line rerouted to payroll appeared as an ' +
    'unexplained variance in the Q3 sub-ledger. County auditors requested ' +
    'a supplemental narrative. Lenora Pike was named as facility contact.',
  revealCondition: { type: 'FLAG', flag: 'east-wilmer-week4-elapsed' },
  whyNow:
    'The Week 4 audit walkthrough is when line-item variances get surfaced ' +
    'in front of a reviewer. A rerouted line reads as a discrepancy.',
  whatChanged:
    'Audit posture at East Wilmer inherits an unresolved question. Lenora ' +
    'is drafting the supplemental narrative on her own time. Silas has not ' +
    'been told the auditors have the reroute in writing.',
}

// ---------------------------------------------------------------------------
// Hook 4 — choice-borrow-silas-personal → NEVER (silence-as-horror, Pillar 3)
// ---------------------------------------------------------------------------

export const HOOK_SILAS_PERSONAL_SILENCE: ConsequenceHook = {
  id: makeConsequenceId('cons-silas-personal-silence-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-borrow-silas-personal'),
  traceHint:
    'A $180K transfer from Silas Rowan Vale\u2019s personal account cleared on Thursday.',
  ledgerEntry:
    'Payroll landed whole on Friday. The funding source recorded as ' +
    '"owner personal contribution" with no repayment schedule attached. ' +
    'Silas did not mention it in any prompt that week. No thank-you was ' +
    'filed by any recipient. The transfer sits in the ledger as a fact.',
  // NEVER: this hook lives in the queue forever. The player never sees a
  // reveal event surface. The debt is Silas's private ledger; the silence
  // IS the tell that the owner absorbed it into Q2 rather than name it.
  revealCondition: { type: 'NEVER' },
  whyNow:
    'A personal-line draw does not produce a company-level notification. It ' +
    'is one owner\u2019s decision, executed in one banking session.',
  whatChanged:
    'Silas carries an undisclosed $180K into Q2. His weekly prompts remain ' +
    'operational. The prompts do not mention money he moved from his own account.',
}

// ---------------------------------------------------------------------------
// Public registry for this content module
// ---------------------------------------------------------------------------

export const FRIDAY_PAYROLL_HOOKS: readonly ConsequenceHook[] = [
  HOOK_RESERVE_DRAWDOWN,
  HOOK_VENDOR_DELAY_NOTICE,
  HOOK_CLINIC_LINE_HIDDEN,
  HOOK_SILAS_PERSONAL_SILENCE,
]
