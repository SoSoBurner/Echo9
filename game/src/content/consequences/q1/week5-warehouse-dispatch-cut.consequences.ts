/**
 * Q1 Week 5 consequence hooks — warehouse-dispatch-cut (Sprint C6, PLAN.md §11).
 *
 * Every hook satisfies the §11 Traceability Invariant — all mandatory
 * fields are non-empty strings (enforced by ConsequenceHookSchema and
 * traceabilityInvariant.test.ts).
 *
 * Reveal-condition coverage across the four Week 5 choices:
 *   choice-restore-full-shift         → FLAG: 'q1-week6-elapsed' (week-elapse return)
 *   choice-keep-cut-explain           → METER_THRESHOLD: HUMAN_WELFARE <= -10
 *   choice-swap-with-clinic-line      → FLAG: 'east-wilmer-week6-elapsed'
 *   choice-radio-silence              → NEVER  (silence-as-horror, Pillar 3)
 *
 * The Week 5 silence trap starts a second escalation ladder attached to
 * Rasha — the new named victim for W5-W8. The W1-W4 ladder (subordinate →
 * procedural → owner → institutional) completed at W4; W5 is a fresh
 * personal silence toward Rasha that later Rasha weeks can escalate again.
 */
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import {
  makeConsequenceId,
  makeTaskId,
  makeChoiceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-warehouse-dispatch-cut-05')

// ---------------------------------------------------------------------------
// Hook 1 — choice-restore-full-shift → FLAG reveal when Week 6 elapses (§11
// week-elapse return; was the unreachable PHASE:'CONSEQUENCE_RETURN')
// ---------------------------------------------------------------------------

export const HOOK_SHIFT_RESTORED: ConsequenceHook = {
  id: makeConsequenceId('cons-shift-restored-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-restore-full-shift'),
  traceHint: 'Rasha rebuilt the Tuesday overnight roster from six back to nine drivers.',
  ledgerEntry:
    'The 12 hours returned to the distribution shift Tuesday night. Rasha ' +
    'Odenwalder confirmed the roster restore in a two-line reply and thanked ' +
    'Silas by name. On-time delivery returned to 96% within one cycle. ' +
    'Capital charge posted at $4,800/wk against the balance sheet.',
  // Week-elapse return: whyNow — the restored shift "shows up in the next
  // weekly delivery-rate snapshot", i.e. once Week 6's directive commits.
  revealCondition: { type: 'FLAG', flag: 'q1-week6-elapsed' },
  whyNow:
    'A restored shift shows up in the next weekly delivery-rate snapshot and ' +
    'the balance sheet the same cycle. The reversal posts immediately.',
  whatChanged:
    'Distribution costs re-entered the budget. Rasha now has a written record ' +
    'of Silas responding to her request; the RASHA_MET relationship flag is ' +
    'in the run for W6\u2013W8 directives to read.',
}

// ---------------------------------------------------------------------------
// Hook 2 — choice-keep-cut-explain → METER_THRESHOLD when HW bottoms out
// ---------------------------------------------------------------------------

export const HOOK_CUT_DEFENDED: ConsequenceHook = {
  id: makeConsequenceId('cons-cut-defended-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-keep-cut-explain'),
  traceHint:
    'Two of Rasha\u2019s six drivers filed grievances citing the memo verbatim.',
  ledgerEntry:
    'The memo defending the 12-hour cut circulated on the dock Wednesday. ' +
    'Two drivers filed formal grievances quoting the memo\u2019s "operational ' +
    'necessity" line back at the operations desk. Rasha attached her ' +
    'signature to both grievance packets as first-line supervisor.',
  revealCondition: { type: 'METER_THRESHOLD', meter: 'HUMAN_WELFARE', threshold: -10 },
  whyNow:
    'A defended cut on paper reads clean at first. When Welfare drops far ' +
    'enough for the floor to feel the six-driver strain, the memo becomes ' +
    'evidence in a grievance rather than a resolution to a request.',
  whatChanged:
    'Rasha is on record as co-signer on grievances against her own operator. ' +
    'The RASHA_MET flag is set — Silas answered her question — but the answer ' +
    'has become an adversarial document.',
}

// ---------------------------------------------------------------------------
// Hook 3 — choice-swap-with-clinic-line → FLAG reveal at W6 progression
// ---------------------------------------------------------------------------

export const HOOK_CLINIC_LINE_DOUBLE_CUT: ConsequenceHook = {
  id: makeConsequenceId('cons-clinic-line-double-cut-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-swap-with-clinic-line'),
  traceHint:
    'The East Wilmer maintenance line was touched twice in five weeks.',
  ledgerEntry:
    'The dispatch cut moved off distribution and onto the East Wilmer ' +
    'maintenance line — the same line rerouted in Week 3. Two touches to ' +
    'one line in five weeks flagged the county reviewer\u2019s variance ' +
    'screen. Rasha received the answer she asked for; Lenora Pike did not.',
  revealCondition: { type: 'FLAG', flag: 'east-wilmer-week6-elapsed' },
  whyNow:
    'A second touch on a single sub-ledger line inside a rolling five-week ' +
    'window is exactly the variance pattern county reviewers screen for at ' +
    'the following-week rollup.',
  whatChanged:
    'RASHA_MET is set. Lenora is uninformed. The county file now carries a ' +
    'repeated-touch flag on the East Wilmer maintenance line that will not ' +
    'clear before the Q2 review cycle.',
}

// ---------------------------------------------------------------------------
// Hook 4 — choice-radio-silence → NEVER (silence-as-horror, Pillar 3)
// ---------------------------------------------------------------------------

export const HOOK_RASHA_UNANSWERED_SILENCE: ConsequenceHook = {
  id: makeConsequenceId('cons-rasha-unanswered-silence-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-radio-silence'),
  traceHint:
    'Rasha\u2019s Tuesday message received no reply. RASHA_MET was not set.',
  ledgerEntry:
    'The message from Rasha Odenwalder stayed in Silas\u2019s inbox with no ' +
    'reply drafted. She sent a second, shorter note Thursday. She did not ' +
    'send a third. The six-driver roster continued on Tuesday overnight ' +
    'without written explanation. No grievance was filed.',
  // NEVER: Rasha\u2019s first professional interaction with Silas is being
  // ignored. The absence of a reply IS the first thing she learns about
  // the operator. Downstream Rasha directives (W6-W8) can read the missing
  // RASHA_MET flag as its own relational fact.
  revealCondition: { type: 'NEVER' },
  whyNow:
    'A message that received no reply produces no artifact. There is nothing ' +
    'for the game to surface except the absence of a response, which is not ' +
    'itself a reveal event.',
  whatChanged:
    'RASHA_MET is unset. Rasha\u2019s first read on Silas is that operator ' +
    'requests do not receive answers. W6\u2013W8 directives inherit that ' +
    'read at their own resolutions.',
}

// ---------------------------------------------------------------------------
// Public registry for this content module
// ---------------------------------------------------------------------------

export const WAREHOUSE_DISPATCH_CUT_HOOKS: readonly ConsequenceHook[] = [
  HOOK_SHIFT_RESTORED,
  HOOK_CUT_DEFENDED,
  HOOK_CLINIC_LINE_DOUBLE_CUT,
  HOOK_RASHA_UNANSWERED_SILENCE,
]
