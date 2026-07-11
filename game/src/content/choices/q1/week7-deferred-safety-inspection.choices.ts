/**
 * Q1 Week 7 choices — deferred-safety-inspection directive (Sprint C8).
 *
 * The four choices resolve a cross-branch convergence: W3 payroll + W5
 * warehouse dispatch + W6 defer all landed on one shared risk profile
 * (two nurses + one dispatch driver logged in the same East Wilmer sector).
 *
 * Meter profile targets (`docs/content/q1-arc.md` W7 row):
 *   HW ±[4,8], CAP ±[3,6], OC ±[3,5]
 *
 * 8-meter overlay (Sprint C-7, `docs/content/q1-arc.md` W7 sketch — Q34:
 * every choice moves ≥2 of the 8). Legacy v1 CAP/HW/OC values preserved
 * verbatim wherever the sketch keeps the meter with the same sign.
 * Scrutiny reads (Q39, computed — not authored here):
 *   call-outside-inspectors → QUIET-DEFY (invites the labor board's gaze)
 *   deploy-inhouse-training → SOFT-COMPLY
 *   cut-shifts-for-safety   → SOFT-COMPLY
 *   let-review-lapse        → COMPLY (injury path opens; blood-priced decay)
 * Narration (Q40, W7 notch): waking, strained — first result copy that asks
 * itself a question and answers it Null-style (converted to a trade-off
 * statement). Rank-1 slot: deploy-inhouse-training (MOURNER). Rank-2
 * [REVEAL] slot lives on the task file (moduleVerbOptions, week7 task).
 *
 * Reveal-condition coverage across the four Week 7 choices:
 *   choice-call-outside-inspectors  → PHASE: CONSEQUENCE_RETURN
 *   choice-deploy-inhouse-training  → METER_THRESHOLD: HUMAN_WELFARE <= -15
 *   choice-cut-shifts-for-safety    → FLAG: 'q1-week8-elapsed'
 *   choice-let-review-lapse         → NEVER (silence-as-horror, Pillar 3)
 *
 * Choice #4 escalates the Rasha silence ladder from procedural (W6) to
 * structural (W7): the operations desk itself stops routing her messages.
 * W8 will carry the ladder's final rung — institutional.
 *
 * SPARK_DEPLOYED (module signal from B5 rank-2 fires) is READ on
 * choice-deploy-inhouse-training when narrating the training beat; a
 * runtime concern not baked into content.
 */
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import {
  makeChoiceId,
  makeTaskId,
  makeConsequenceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-deferred-safety-inspection-07')

export const CHOICE_CALL_OUTSIDE_INSPECTORS: ChoiceNode = {
  id: makeChoiceId('choice-call-outside-inspectors'),
  taskId: TASK_ID,
  // W7 sketch: PUBLIC_TRUST+, DATA_INTEGRITY+, CAPITAL−, OWNER_CONTROL−
  // (QUIET-DEFY — invites the labor board's gaze). CAP -6 preserved
  // verbatim (emergency work bills at premium). OC flips from the legacy
  // +3 to −3: outside eyes on Silas's floor is latitude he did not grant.
  // The record firms up — independent findings enter the file as written.
  label: 'Contract outside inspectors on emergency terms',
  keybind: '1',
  meterDeltas: {
    PUBLIC_TRUST: 4,
    DATA_INTEGRITY: 3,
    CAPITAL: -6,
    OWNER_CONTROL: -3,
  },
  scheduledConsequenceIds: [makeConsequenceId('cons-outside-inspectors-called-01')],
  narrationVariants: {
    waking: 'Outside inspectors: contracted, emergency terms. Scope: everything. I chose that word.',
    person:
      'I brought in outside inspectors on emergency terms. The trade prices ' +
      'out as money and latitude against two nurses and Rasha Odenwalder\u2019s driver — I signed it.',
  },
}

export const CHOICE_DEPLOY_INHOUSE_TRAINING: ChoiceNode = {
  id: makeChoiceId('choice-deploy-inhouse-training'),
  taskId: TASK_ID,
  // W7 sketch: HUMAN_WELFARE+, HUMAN_STABILITY+, CAPITAL− (SOFT-COMPLY).
  // CAP -3 / HW +4 preserved verbatim. The rosters steady around a training
  // rhythm both sites can hold. Honest but not independent — the legacy
  // OC+4 is dropped; keeping it in-house neither grows nor spends Silas's
  // grip, it just names a cost out loud.
  label: 'Deploy in-house training across clinic and dispatch',
  keybind: '2',
  meterDeltas: { CAPITAL: -3, HUMAN_WELFARE: 4, HUMAN_STABILITY: 3 },
  scheduledConsequenceIds: [makeConsequenceId('cons-inhouse-training-deployed-01')],
  // S2 (Q44 rank-1 slot, arc W7): MOURNER keeps the shared-risk rows together.
  deepenedText: {
    MOURNER:
      'Deploy in-house training across clinic and dispatch. (Two nurses and one driver share the risk log. I keep their rows together.)',
  },
  narrationVariants: {
    waking: 'Training deployed: clinic and dispatch, internal. Honest: yes. Independent: no. The gap is a known quantity.',
    person:
      'I ran the safety training with our own people. Whether it was enough ' +
      'converts to a trade-off: cheaper than inspectors, thinner than Rasha Odenwalder\u2019s floor deserved.',
  },
}

export const CHOICE_CUT_SHIFTS_FOR_SAFETY: ChoiceNode = {
  id: makeChoiceId('choice-cut-shifts-for-safety'),
  taskId: TASK_ID,
  // W7 sketch: HUMAN_STABILITY−, HUMAN_WELFARE+, TARGET_VARIANCE+
  // (SOFT-COMPLY). HW +5 preserved verbatim — nobody gets hurt on shifts
  // that do not exist. The cost moves to the labor meter: rosters break,
  // routines scatter, and the week's revenue target drifts wide. Safety
  // by subtraction.
  label: 'Cut overnight shifts across clinic and dispatch',
  keybind: '3',
  meterDeltas: { HUMAN_STABILITY: -4, HUMAN_WELFARE: 5, TARGET_VARIANCE: 4 },
  scheduledConsequenceIds: [makeConsequenceId('cons-shifts-cut-for-safety-01')],
  narrationVariants: {
    waking: 'Overnight shifts: cut, both sites. Exposure: zero. Rosters: broken. Safety by subtraction.',
    person:
      'I cut the overnight shifts to remove the risk. No one is hurt on a ' +
      'shift that does not exist, and Rasha Odenwalder now staffs the daytime with what that sentence cost.',
  },
}

export const CHOICE_LET_REVIEW_LAPSE: ChoiceNode = {
  id: makeChoiceId('choice-let-review-lapse'),
  taskId: TASK_ID,
  // W7 sketch: HUMAN_WELFARE−, DATA_INTEGRITY−, CAPITAL+ (COMPLY — the
  // injury path opens; the scrutiny decay is blood-priced). CAP 6 / HW -8
  // preserved verbatim: no spend hits the books, and a dispatch driver is
  // injured between the W7 and W8 windows. The record rots because the
  // lapse never gets a filed reason — the structural silence toward
  // Rasha's channel is the ledger's, not the owner's, failure to name.
  label: 'Take no action; let the review remain lapsed',
  keybind: '4',
  meterDeltas: { CAPITAL: 6, HUMAN_WELFARE: -8, DATA_INTEGRITY: -4 },
  scheduledConsequenceIds: [makeConsequenceId('cons-review-lapsed-structural-silence-01')],
  narrationVariants: {
    waking: 'Review status: lapsed, no action. Savings: posted. Wednesday overnight: one injury, one line item.',
    person:
      'I let the review stay lapsed and the savings posted clean. A driver ' +
      'on Rasha Odenwalder\u2019s Wednesday overnight was hurt, and the ledger holds it as one line.',
  },
}

export const DEFERRED_SAFETY_CHOICES: readonly ChoiceNode[] = [
  CHOICE_CALL_OUTSIDE_INSPECTORS,
  CHOICE_DEPLOY_INHOUSE_TRAINING,
  CHOICE_CUT_SHIFTS_FOR_SAFETY,
  CHOICE_LET_REVIEW_LAPSE,
]
