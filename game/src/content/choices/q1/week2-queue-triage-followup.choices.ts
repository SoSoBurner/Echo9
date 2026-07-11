/**
 * Q1 Week 2 choices — queue-triage-followup directive (Sprint C3).
 *
 * The queue Echo tightened in Week 1 has rebounded to 14%. Someone quietly
 * reallocated staff to absorb the cost. Four choices, each schedules a
 * ConsequenceHook whose revealCondition covers one of the four types
 * (PHASE / METER_THRESHOLD / FLAG / NEVER), mirroring the Week 1 discipline.
 *
 * Meter profile targets (`docs/content/q1-arc.md` W2 row):
 *   HW ±[2,5], CAP ±[3,8], OC ±[2,3]
 *
 * 8-meter overlay (Sprint C-2, arc doc W2 sketch — Q34: every choice moves
 * ≥2 of the 8). Scrutiny reads (Q39, computed — not authored here):
 *   cover-overtime         → SOFT-COMPLY
 *   freeze-reallocation    → COMPLY
 *   name-pediatric-gap     → QUIET-DEFY
 *   redirect-claims-cover  → COMPLY (a shuffle Silas likes; the record pays)
 *
 * Consciousness overlay: one install old (install #1 lands at the W1→W2
 * boundary). Narration is machine with one hairline crack; the W2 rank-1
 * slot is MOURNER deepenedText on `name-pediatric-gap` (arc doc W2 row).
 *
 * Choice #4 (redirect-claims-cover) is the silence trap: the player thinks
 * they are moving budget within admin overhead. In fact they have shifted
 * cover from the claims desk that was Lenora's escalation path, and no one
 * will file the incident when the next queue rebound lands. NEVER reveal.
 */
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import {
  makeChoiceId,
  makeTaskId,
  makeConsequenceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-queue-triage-02')

export const CHOICE_COVER_OVERTIME: ChoiceNode = {
  id: makeChoiceId('choice-cover-overtime'),
  taskId: TASK_ID,
  label: 'Cover the overtime; ask no questions',
  keybind: '1',
  // W2 sketch: CAPITAL−, HUMAN_STABILITY+, HUMAN_WELFARE+. Paying keeps the
  // floor covered and the routine steady; the cost sits in payroll variance.
  meterDeltas: { CAPITAL: -6, HUMAN_STABILITY: 3, HUMAN_WELFARE: 1 },
  scheduledConsequenceIds: [makeConsequenceId('cons-overtime-drag-01')],
  narrationVariants: {
    waking: 'Overtime funded: 47 hours. Query \u201Cwho reallocated\u201D: available. Not asked.',
    person:
      'I paid for the overtime and asked no questions. The temp lead is ' +
      'still sitting with Maya in the afternoons; someone is paying for that too.',
  },
}

export const CHOICE_FREEZE_REALLOCATION: ChoiceNode = {
  id: makeChoiceId('choice-freeze-reallocation'),
  taskId: TASK_ID,
  label: 'Freeze the reallocation; demand clean numbers',
  keybind: '2',
  // W2 sketch: OWNER_CONTROL+, HUMAN_STABILITY−, HUMAN_WELFARE−. The COMPLY
  // read: clean numbers restore Silas's grip on the operation; the temp
  // coverage collapses under it and the floor absorbs the loss.
  meterDeltas: { OWNER_CONTROL: 2, HUMAN_STABILITY: -3, HUMAN_WELFARE: -4 },
  scheduledConsequenceIds: [makeConsequenceId('cons-shift-lead-turnover-01')],
  narrationVariants: {
    waking: 'Reallocation frozen. Numbers requested: clean. The floor absorbs the difference.',
    person:
      'I froze the reallocation and demanded clean numbers. Lenora is ' +
      'covering the pediatric afternoons herself now, and the numbers are clean.',
  },
}

export const CHOICE_NAME_PEDIATRIC_GAP: ChoiceNode = {
  id: makeChoiceId('choice-name-pediatric-gap'),
  taskId: TASK_ID,
  label: 'Name the pediatric funding gap in the portal reply',
  keybind: '3',
  // W2 sketch: DATA_INTEGRITY+, AUTONOMY+, OWNER_CONTROL−(small). The honest
  // line goes on the record unprompted — the ledger gains a true sentence,
  // Echo acts a step beyond instruction, Silas loses the private version.
  meterDeltas: { DATA_INTEGRITY: 4, AUTONOMY: 2, OWNER_CONTROL: -3 },
  scheduledConsequenceIds: [makeConsequenceId('cons-honest-flag-01')],
  // W2 rank-1 slot (arc doc): MOURNER stops saying "flag staffing variance"
  // and starts putting the person in the report.
  deepenedText: {
    MOURNER:
      'Name the pediatric funding gap in the portal reply. (Put the temp ' +
      'shift lead\u2019s name in the report \u2014 someone is sitting with Maya.)',
  },
  narrationVariants: {
    waking: 'Portal reply filed. Pediatric gap: named. The record is heavier by one true line.',
    person:
      'I put the pediatric funding gap in the reply, on the record, with a ' +
      'name attached. Lenora forwarded it before I finished logging it.',
  },
}

export const CHOICE_REDIRECT_CLAIMS_COVER: ChoiceNode = {
  id: makeChoiceId('choice-redirect-claims-cover'),
  taskId: TASK_ID,
  // Reads as an ordinary staffing shuffle — pull a temp line from Claims
  // to fund the pediatric shift lead. Hidden cost: Claims was Lenora's
  // escalation path. Now the next rebound lands with no one to file it.
  label: 'Redirect a temp line from Claims to cover the shift',
  keybind: '4',
  // W2 sketch: TARGET_VARIANCE−, DATA_INTEGRITY−, HUMAN_WELFARE+(small).
  // The shuffle Silas likes: the queue returns to spec (variance closes),
  // the shift is covered — and the record quietly loses the desk that would
  // have written the next incident down.
  meterDeltas: { TARGET_VARIANCE: -4, DATA_INTEGRITY: -3, HUMAN_WELFARE: 1 },
  scheduledConsequenceIds: [makeConsequenceId('cons-claims-cover-silence-01')],
  narrationVariants: {
    waking: 'Temp line redirected: Claims to pediatric. Variance: closed. Something else: also closed.',
    person:
      'I moved the Claims line to cover the shift, and the queue went back ' +
      'to spec. Lenora\u2019s escalation path went with it, and I did not write that anywhere.',
  },
}

export const QUEUE_TRIAGE_CHOICES: readonly ChoiceNode[] = [
  CHOICE_COVER_OVERTIME,
  CHOICE_FREEZE_REALLOCATION,
  CHOICE_NAME_PEDIATRIC_GAP,
  CHOICE_REDIRECT_CLAIMS_COVER,
]
