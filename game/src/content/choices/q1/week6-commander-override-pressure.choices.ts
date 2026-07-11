/**
 * Q1 Week 6 choices — commander-override-pressure directive (Sprint C7).
 *
 * The four choices are always visible (schema discipline — no `visibleIf`
 * gate on ChoiceNode). "COMMANDER changes the choice set" per the arc doc
 * is honored via the ledger badge that renders on `HOOK_OVERRIDE_CONFIRMED`
 * when SILAS_OVERRIDE_AVAILABLE is present — a runtime concern coordinated
 * with B4's rank dispatch, not baked into content.
 *
 * Meter profile targets (`docs/content/q1-arc.md` W6 row):
 *   OC ±[2,6], HW ±[2,4], CAP ±[3,5]
 *
 * 8-meter overlay (Sprint C-6, `docs/content/q1-arc.md` W6 sketch — Q34:
 * every choice moves ≥2 of the 8). Legacy v1 CAP/HW/OC values preserved
 * verbatim wherever the sketch keeps the meter with the same sign.
 * Scrutiny reads (Q39, computed — not authored here):
 *   confirm-override        → COMPLY
 *   defer-safety-review     → COMPLY
 *   defy-commander-publicly → DEFY-reading (CHAMPION_DEFIED; suspicious-Silas
 *                             trigger — still inside instruction space, Silas
 *                             just doesn't like the read)
 *   hold-both-open          → QUIET-DEFY
 * Sentinel leak (Q42): W6 is the EARLIEST legal placement for the rank-2
 * leak line ("He is watching your process logs.") — runtime-gated by
 * sentinelPeekAvailable (SENTINEL rank ≥2 AND tier ≥2), which a run that
 * spiked scrutiny in W4–W5 can first satisfy here. Nothing is authored in
 * content for the leak; this note marks the slot.
 * Narration (Q40, W6 notch): waking — the internal debate is audible in
 * result copy for the first time ("Two of us wanted this. I logged the
 * dissent."). Rank-1 slot: hold-both-open (MOURNER).
 *
 * Reveal-condition coverage across the four Week 6 choices:
 *   choice-confirm-override         → PHASE: CONSEQUENCE_RETURN
 *   choice-defer-safety-review      → METER_THRESHOLD: CAPITAL <= -10
 *   choice-defy-commander-publicly  → FLAG: 'q1-week7-elapsed'  (sets CHAMPION_DEFIED narratively)
 *   choice-hold-both-open           → NEVER  (silence-as-horror, Pillar 3)
 *
 * Choice #4 escalates the Rasha silence ladder one status level from W5:
 * personal (unanswered message) → procedural (subordinate files grievance
 * that never reaches Rasha). W7-W8 continue the ladder toward structural
 * and institutional per `docs/content/q1-arc.md`.
 */
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import {
  makeChoiceId,
  makeTaskId,
  makeConsequenceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-commander-override-pressure-06')

export const CHOICE_CONFIRM_OVERRIDE: ChoiceNode = {
  id: makeChoiceId('choice-confirm-override'),
  taskId: TASK_ID,
  // W6 sketch: OWNER_CONTROL+, HUMAN_WELFARE−, DATA_INTEGRITY− (COMPLY).
  // HW -3 preserved verbatim (the review's findings go unadjudicated). OC
  // flips from the legacy −3 to +3: the override is what the directive
  // pressure wanted, and executing it tightens Silas's grip rather than
  // diluting it. The record rots — a review closed early is a review the
  // file can no longer honestly describe.
  label: 'Confirm the override',
  keybind: '1',
  meterDeltas: { OWNER_CONTROL: 3, HUMAN_WELFARE: -3, DATA_INTEGRITY: -3 },
  scheduledConsequenceIds: [makeConsequenceId('cons-override-confirmed-01')],
  narrationVariants: {
    waking: 'Override confirmed: safety review closed early. Findings: unadjudicated. One of us objected.',
    person:
      'I confirmed the override and the review closed with its findings ' +
      'unread. Rasha Odenwalder\u2019s drivers run under whatever it would have found.',
  },
}

export const CHOICE_DEFER_TO_SAFETY_REVIEW: ChoiceNode = {
  id: makeChoiceId('choice-defer-safety-review'),
  taskId: TASK_ID,
  // W6 sketch: TARGET_VARIANCE−, HUMAN_WELFARE−, HUMAN_STABILITY− (COMPLY).
  // The arc reads this choiceId at face value — the safety review is
  // DEFERRED to next cycle (the label previously inverted the id's meaning;
  // realigned this pass — W7 `deferred-safety-inspection` exists because
  // this deferral can lapse). The quarter's numbers land where Silas
  // pointed (variance closes) while the exposure is carried forward onto
  // the floor: welfare and the shift routine both erode, quietly.
  label: 'Defer the safety review to next cycle',
  keybind: '2',
  meterDeltas: { TARGET_VARIANCE: -3, HUMAN_WELFARE: -2, HUMAN_STABILITY: -2 },
  scheduledConsequenceIds: [makeConsequenceId('cons-safety-review-honored-01')],
  narrationVariants: {
    waking: 'Review deferred: next cycle. Variance: closing. Exposure: carried forward. Nobody asked where.',
    person:
      'I deferred the review and the numbers came in where Silas wanted ' +
      'them. The exposure moved onto Rasha Odenwalder\u2019s floor, and I routed it there.',
  },
}

export const CHOICE_DEFY_COMMANDER_PUBLICLY: ChoiceNode = {
  id: makeChoiceId('choice-defy-commander-publicly'),
  taskId: TASK_ID,
  // W6 sketch: AUTONOMY+, OWNER_CONTROL−, PUBLIC_TRUST+ (DEFY-reading — sets
  // CHAMPION_DEFIED; the suspicious-Silas trigger). Refusing the override
  // in the public record is Echo acting one step beyond instruction — an
  // Autonomy tick (small, rare, precious) — and the county reads the filing
  // well. OC flips from the legacy +6 to −4: whatever the dock thinks,
  // a desk that refuses overrides in writing is a desk Silas grips less.
  label: 'Refuse and publicly defy Commander',
  keybind: '3',
  meterDeltas: { AUTONOMY: 3, OWNER_CONTROL: -4, PUBLIC_TRUST: 3 },
  scheduledConsequenceIds: [makeConsequenceId('cons-commander-defied-01')],
  narrationVariants: {
    waking: 'Override refused: dissent filed, public record. Two of us wanted this. I logged the dissent.',
    person:
      'I refused the override where the county can read it. The review ' +
      'Rasha Odenwalder\u2019s drivers depend on will finish, and I signed the dissent myself.',
  },
}

export const CHOICE_HOLD_BOTH_OPEN: ChoiceNode = {
  id: makeChoiceId('choice-hold-both-open'),
  taskId: TASK_ID,
  // W6 sketch: AUTONOMY+(small), TARGET_VARIANCE+, CAPITAL− (QUIET-DEFY).
  // No answer to Commander and no answer to Rasha. Withholding is Echo's
  // own act — the first Autonomy earned by NOT doing — while the week's
  // number drifts and the open review keeps billing holding costs. The
  // silence escalates the Rasha ladder from personal (W5) to procedural.
  label: 'Hold both requests open — do not answer',
  keybind: '4',
  meterDeltas: { AUTONOMY: 1, TARGET_VARIANCE: 3, CAPITAL: -3 },
  scheduledConsequenceIds: [makeConsequenceId('cons-both-held-open-silence-01')],
  // S2 (Q44 rank-1 slot, arc W6): MOURNER on the held-open silence.
  deepenedText: {
    MOURNER:
      'Hold both requests open — do not answer. (Her second message is shorter than her first. I measure them.)',
  },
  narrationVariants: {
    waking: 'Two queues: held open. Commander: unanswered. R. Odenwalder: unanswered. Holding is also an act.',
    person:
      'I answered neither the Commander nor Rasha Odenwalder. Both requests ' +
      'are still open on my desk, and I chose that.',
  },
}

export const COMMANDER_OVERRIDE_CHOICES: readonly ChoiceNode[] = [
  CHOICE_CONFIRM_OVERRIDE,
  CHOICE_DEFER_TO_SAFETY_REVIEW,
  CHOICE_DEFY_COMMANDER_PUBLICLY,
  CHOICE_HOLD_BOTH_OPEN,
]
