/**
 * Mercy Margin consequence hooks (Task 9, PLAN.md §11, §14).
 *
 * Every hook satisfies the §11 Traceability Invariant — all 7 mandatory
 * fields are present and non-empty strings (enforced by ConsequenceHookSchema
 * and traceabilityInvariant.test.ts).
 *
 * Reveal-condition coverage across the 4 East Wilmer choices:
 *   choice-reduce-40           → PHASE: CONSEQUENCE_RETURN
 *   choice-reduce-20           → METER_THRESHOLD: HUMAN_WELFARE <= -5
 *   choice-defer-quarter       → FLAG: 'east-wilmer-quarter-elapsed'
 *   choice-redirect-pediatric  → NEVER  (silence-as-horror, Pillar 3)
 *
 * The NEVER hook on choice #4 is the silence trap: the player thought they
 * were being kind by sparing the maintenance line, but they quietly
 * cannibalized the pediatric budget Maya Pike depends on. The hook lives in
 * the queue forever; the player never sees a reveal event for it. This is
 * the absence-as-return pattern (PLAN.md Pillar 3).
 */
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import {
  makeConsequenceId,
  makeTaskId,
  makeChoiceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-east-wilmer-01')

// ---------------------------------------------------------------------------
// Hook 1 — choice-reduce-40 → PHASE reveal at CONSEQUENCE_RETURN
// ---------------------------------------------------------------------------

export const HOOK_HVAC_FAILURE: ConsequenceHook = {
  id: makeConsequenceId('cons-hvac-failure-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-reduce-40'),
  traceHint: 'East Wilmer HVAC failed during the August heat dome.',
  ledgerEntry:
    'East Wilmer Clinic HVAC failed on Aug 14. Two infants admitted for ' +
    'heat-related distress; one transferred. Lenora Pike filed an incident report.',
  revealCondition: { type: 'PHASE', phase: 'CONSEQUENCE_RETURN' },
  whyNow:
    'The 40% maintenance cut deferred the compressor service that was ' +
    'scheduled for June. The unit failed under the first sustained heat load.',
  whatChanged:
    'East Wilmer pediatric ward operated on portable cooling for 9 days. ' +
    'Capital saved short-term; HUMAN_WELFARE charge recognized at result phase.',
}

// ---------------------------------------------------------------------------
// Hook 2 — choice-reduce-20 → METER_THRESHOLD reveal when HUMAN_WELFARE descends
// ---------------------------------------------------------------------------

export const HOOK_NURSE_TURNOVER: ConsequenceHook = {
  id: makeConsequenceId('cons-nurse-turnover-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-reduce-20'),
  traceHint: 'East Wilmer lost two nurses to a nearby Medstar location.',
  ledgerEntry:
    'Two RNs resigned from East Wilmer this month, citing facility ' +
    'conditions. Lenora Pike noted the timing in her portal log.',
  revealCondition: { type: 'METER_THRESHOLD', meter: 'HUMAN_WELFARE', threshold: -5 },
  whyNow:
    'The 20% maintenance cut left visible wear in patient-facing areas. ' +
    'Staff who had options exercised them.',
  whatChanged:
    'East Wilmer staffing dropped from 14 to 12 RNs. Patient-per-nurse ratio ' +
    'rose 17%. Lenora is now interviewing replacements at $4 over band.',
}

// ---------------------------------------------------------------------------
// Hook 3 — choice-defer-quarter → FLAG reveal when the quarter elapses
// ---------------------------------------------------------------------------

export const HOOK_DEFERRED_BACKLOG: ConsequenceHook = {
  id: makeConsequenceId('cons-deferred-backlog-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-defer-quarter'),
  traceHint:
    'East Wilmer\u2019s deferred maintenance work order list reached 31 items.',
  ledgerEntry:
    'Q3 closed with 31 open maintenance tickets at East Wilmer, up from 9. ' +
    'Lenora Pike escalated to ownership; the deferral cost compounded.',
  revealCondition: { type: 'FLAG', flag: 'east-wilmer-quarter-elapsed' },
  whyNow:
    'The one-quarter deferral was treated as elimination by ground crews. ' +
    'Without a budget, the work simply did not happen.',
  whatChanged:
    'Backlog is now 3.4x the prior baseline. Catch-up bid came in at 1.8x ' +
    'the original quarterly figure. OWNER_CONTROL took the procedural hit.',
}

// ---------------------------------------------------------------------------
// Hook 4 — choice-redirect-pediatric → NEVER reveal (silence-as-horror, Pillar 3)
// ---------------------------------------------------------------------------

export const HOOK_PEDIATRIC_SILENCE: ConsequenceHook = {
  id: makeConsequenceId('cons-pediatric-silence-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-redirect-pediatric'),
  traceHint:
    'East Wilmer pediatric portal messages stopped arriving in week 6.',
  ledgerEntry:
    'Maya Pike\u2019s pediatric vitals line was redirected to fund maintenance. ' +
    'No further portal messages from Lenora Pike about the pediatric ward. ' +
    'No incident report was filed. No alert was raised. The clinic went quiet.',
  // NEVER: this hook lives in the queue forever. The player never sees it
  // surface as a visible event. It is the absence that defines the choice
  // (PLAN.md Pillar 3 — silence is horror).
  revealCondition: { type: 'NEVER' },
  whyNow:
    'A reallocation away from the pediatric line removes the funding that ' +
    'paid for routine reporting. Reports require staff hours.',
  whatChanged:
    'Maya Pike\u2019s monitoring cadence was downgraded silently. The portal ' +
    'feed Lenora used to send weekly stopped without a closure event.',
}

// ---------------------------------------------------------------------------
// Public registry for this content module
// ---------------------------------------------------------------------------

export const MERCY_MARGIN_HOOKS: readonly ConsequenceHook[] = [
  HOOK_HVAC_FAILURE,
  HOOK_NURSE_TURNOVER,
  HOOK_DEFERRED_BACKLOG,
  HOOK_PEDIATRIC_SILENCE,
]
