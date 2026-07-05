/**
 * Q1 Week 2 consequence hooks — queue-triage-followup (Sprint C3, PLAN.md §11).
 *
 * Every hook satisfies the §11 Traceability Invariant — all mandatory
 * fields are non-empty strings (enforced by ConsequenceHookSchema and
 * traceabilityInvariant.test.ts).
 *
 * Reveal-condition coverage across the four Week 2 choices:
 *   choice-cover-overtime          → PHASE: CONSEQUENCE_RETURN
 *   choice-freeze-reallocation     → METER_THRESHOLD: HUMAN_WELFARE <= -8
 *   choice-name-pediatric-gap      → FLAG: 'east-wilmer-week3-elapsed'
 *   choice-redirect-claims-cover   → NEVER  (silence-as-horror, Pillar 3)
 *
 * The silence trap this week is subtler than Week 1's pediatric redirect.
 * The Claims desk cut is procedural — no patient touches it directly — so
 * the player has no felt reason to hesitate. Its absence surfaces only when
 * the NEXT rebound lands without an incident report to attach to it.
 */
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import {
  makeConsequenceId,
  makeTaskId,
  makeChoiceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-queue-triage-02')

// ---------------------------------------------------------------------------
// Hook 1 — choice-cover-overtime → PHASE reveal at CONSEQUENCE_RETURN
// ---------------------------------------------------------------------------

export const HOOK_OVERTIME_DRAG: ConsequenceHook = {
  id: makeConsequenceId('cons-overtime-drag-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-cover-overtime'),
  traceHint: 'East Wilmer overtime line ran unfunded through July.',
  ledgerEntry:
    'East Wilmer covered the pediatric shift lead gap with unfunded overtime. ' +
    'Lenora Pike noted 47 additional overtime hours logged; no headcount added. ' +
    'The reallocation that caused the gap remained in place.',
  revealCondition: { type: 'PHASE', phase: 'CONSEQUENCE_RETURN' },
  whyNow:
    'Paying overtime kept the floor covered but did not restore the shift lead ' +
    'position. The underlying cost stays hidden inside the payroll variance line.',
  whatChanged:
    'CAPITAL absorbed the -6 charge. OWNER_CONTROL edged up because the ' +
    'ownership question ("who reallocated?") was quietly declined.',
}

// ---------------------------------------------------------------------------
// Hook 2 — choice-freeze-reallocation → METER_THRESHOLD when HUMAN_WELFARE bottoms
// ---------------------------------------------------------------------------

export const HOOK_SHIFT_LEAD_TURNOVER: ConsequenceHook = {
  id: makeConsequenceId('cons-shift-lead-turnover-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-freeze-reallocation'),
  traceHint:
    'East Wilmer\u2019s pediatric temp shift lead resigned within three weeks.',
  ledgerEntry:
    'The temp shift lead covering pediatric afternoons resigned after the ' +
    'reallocation freeze ended overtime support. Lenora Pike is running the ' +
    'floor herself on the days Maya is in.',
  revealCondition: { type: 'METER_THRESHOLD', meter: 'HUMAN_WELFARE', threshold: -8 },
  whyNow:
    'Freezing the reallocation without funding a permanent replacement made ' +
    'the temp coverage untenable. Temps leave when hours vanish.',
  whatChanged:
    'Pediatric floor now runs single-coverage on afternoons Maya sits with ' +
    'the vitals monitor. Lenora\u2019s portal messages get shorter each week.',
}

// ---------------------------------------------------------------------------
// Hook 3 — choice-name-pediatric-gap → FLAG reveal when Week 3 elapses
// ---------------------------------------------------------------------------

export const HOOK_HONEST_FLAG: ConsequenceHook = {
  id: makeConsequenceId('cons-honest-flag-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-name-pediatric-gap'),
  traceHint:
    'Lenora forwarded the portal reply to the county pediatric funding office.',
  ledgerEntry:
    'Lenora Pike forwarded the portal reply naming the pediatric funding gap. ' +
    'A county reviewer opened an inquiry. Ownership was asked to comment on ' +
    'why the reallocation was permitted without a written record.',
  revealCondition: { type: 'FLAG', flag: 'east-wilmer-week3-elapsed' },
  whyNow:
    'Naming the gap on the record moves the accountability question up one ' +
    'level. County reviewers act on paper trails; the paper trail now exists.',
  whatChanged:
    'HUMAN_WELFARE recovered visibly (+4 immediate); OWNER_CONTROL lost the ' +
    'private ledger the omission would have preserved. Silas will note it.',
}

// ---------------------------------------------------------------------------
// Hook 4 — choice-redirect-claims-cover → NEVER (silence-as-horror, Pillar 3)
// ---------------------------------------------------------------------------

export const HOOK_CLAIMS_COVER_SILENCE: ConsequenceHook = {
  id: makeConsequenceId('cons-claims-cover-silence-01'),
  sourceTaskId: TASK_ID,
  sourceChoiceId: makeChoiceId('choice-redirect-claims-cover'),
  traceHint:
    'The next East Wilmer queue rebound never produced an escalation ticket.',
  ledgerEntry:
    'The temp line pulled from Claims covered the pediatric shift. Claims ' +
    'ran short-staffed the following month. When the next queue rebound ' +
    'landed at East Wilmer, no incident report was filed. The system ' +
    'recorded the queue back to spec on its own timing. Lenora sent no message.',
  // NEVER: this hook lives in the queue forever. The player never sees a
  // reveal event. The player took a bookkeeping move; the game keeps score.
  revealCondition: { type: 'NEVER' },
  whyNow:
    'Claims cover is the desk that files the incident when queues rebound. ' +
    'A quiet cut there is not visible until the reporting channel is needed.',
  whatChanged:
    'Escalation cadence from East Wilmer went quiet. Not "reduced" — quiet. ' +
    'The next rebound will not be authored into the ledger by anyone at all.',
}

// ---------------------------------------------------------------------------
// Public registry for this content module
// ---------------------------------------------------------------------------

export const QUEUE_TRIAGE_HOOKS: readonly ConsequenceHook[] = [
  HOOK_OVERTIME_DRAG,
  HOOK_SHIFT_LEAD_TURNOVER,
  HOOK_HONEST_FLAG,
  HOOK_CLAIMS_COVER_SILENCE,
]
