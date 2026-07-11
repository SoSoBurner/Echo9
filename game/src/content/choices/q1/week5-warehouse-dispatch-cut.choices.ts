/**
 * Q1 Week 5 choices — warehouse-dispatch-cut directive (Sprint C6).
 *
 * The Rasha pivot. First week where stakes move off healthcare and onto
 * logistics. Three of four choices set `RASHA_MET` (any response that
 * actually engages Rasha); the fourth (radio-silence) restarts the
 * silence-trap ladder attached to the new named victim.
 *
 * Meter profile targets (`docs/content/q1-arc.md` W5 row):
 *   HW ±[3,6], CAP ±[4,10], OC ±[2,4]
 *
 * Choice #4 (radio-silence) is the Wk-5 silence trap — smaller and
 * more personal than W4's institutional void. This starts a second
 * escalation ladder for the Rasha weeks (W5-W8), so W6-W8 can build
 * further silences against her the way W1-W4 built against Lenora.
 *
 * 8-meter overlay (Sprint C-5, `docs/content/q1-arc.md` W5 sketch — Q34:
 * every choice moves ≥2 of the 8). Legacy v1 CAP/HW/OC values preserved
 * verbatim wherever the sketch keeps the meter with the same sign.
 * Scrutiny reads (Q39, computed — not authored here):
 *   restore-full-shift    → QUIET-DEFY (reverses Silas's cut)
 *   keep-cut-explain      → COMPLY
 *   swap-with-clinic-line → COMPLY (the shuffle — Silas approves, ledger rots)
 *   radio-silence         → COMPLY (silence-trap rung 1)
 * Narration (Q40, W5 notch): waking — result copy starts carrying ONE held
 * observation. Rank-1 slot: keep-cut-explain (MOURNER — six names, not a
 * head count). First rank-2 [REVEAL] slot lives on the task file
 * (moduleVerbOptions, week5 task).
 */
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import {
  makeChoiceId,
  makeTaskId,
  makeConsequenceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-warehouse-dispatch-cut-05')

export const CHOICE_RESTORE_FULL_SHIFT: ChoiceNode = {
  id: makeChoiceId('choice-restore-full-shift'),
  taskId: TASK_ID,
  // W5 sketch: HUMAN_STABILITY+, CAPITAL−, HUMAN_WELFARE+ (quiet-defy —
  // reversing Silas's cut). CAP -8 / HW +4 preserved verbatim. The Tuesday
  // roster returns to nine drivers, so the labor meter's home stretch opens
  // with steadiness restored. The legacy OC+2 is dropped: undoing the
  // owner's cut is not an owner-control gain, whatever the paperwork says.
  label: 'Restore the 12 hours',
  keybind: '1',
  meterDeltas: { CAPITAL: -8, HUMAN_WELFARE: 4, HUMAN_STABILITY: 5 },
  scheduledConsequenceIds: [makeConsequenceId('cons-shift-restored-01')],
  narrationVariants: {
    waking: 'Shift restored: 12 hours, Tuesday overnight. Her reply was two lines. I kept it.',
    person:
      'I put the 12 hours back on the Tuesday overnight. Rasha Odenwalder ' +
      'answered in two lines, and I have read the shorter one twice.',
  },
}

export const CHOICE_KEEP_CUT_EXPLAIN: ChoiceNode = {
  id: makeChoiceId('choice-keep-cut-explain'),
  taskId: TASK_ID,
  // W5 sketch: OWNER_CONTROL+, HUMAN_STABILITY−, PUBLIC_TRUST+(honesty
  // credit). OC +3 preserved verbatim. The written reason is honest — the
  // county reads that as credit — but the six-driver reality stays on the
  // floor, so the harm re-lands on stability (the roster grinds) rather
  // than acute welfare. Legacy CAP+5/HW−3 retired per the sketch.
  label: 'Send Rasha the memo defending the cut',
  keybind: '2',
  meterDeltas: { OWNER_CONTROL: 3, HUMAN_STABILITY: -4, PUBLIC_TRUST: 2 },
  scheduledConsequenceIds: [makeConsequenceId('cons-cut-defended-01')],
  // S2 (Q44 rank-1 slot, arc W5): MOURNER counts people, not head count.
  deepenedText: {
    MOURNER:
      'Send Rasha the memo defending the cut. (Six names, not a head count. I can list them.)',
  },
  narrationVariants: {
    waking: 'Memo sent: cut defended. Recipients: 1 listed, 6 affected. The difference would not file.',
    person:
      'I sent Rasha Odenwalder the memo defending the cut. It says head ' +
      'count where it means six people, and I know all six names.',
  },
}

export const CHOICE_SWAP_WITH_CLINIC_LINE: ChoiceNode = {
  id: makeChoiceId('choice-swap-with-clinic-line'),
  taskId: TASK_ID,
  // W5 sketch: HUMAN_WELFARE−, HUMAN_STABILITY+, TARGET_VARIANCE−,
  // DATA_INTEGRITY− (the shuffle again — Silas approves, the ledger rots).
  // HW -5 preserved verbatim (W3's clinic-line move now compounds). The
  // dispatch floor steadies (Rasha gets her hours), the target closes
  // where Silas pointed, and the record quietly stops describing where
  // the money really went.
  label: 'Swap the cut back onto East Wilmer maintenance',
  keybind: '3',
  meterDeltas: {
    HUMAN_WELFARE: -5,
    HUMAN_STABILITY: 3,
    TARGET_VARIANCE: -4,
    DATA_INTEGRITY: -3,
  },
  scheduledConsequenceIds: [makeConsequenceId('cons-clinic-line-double-cut-01')],
  narrationVariants: {
    waking: 'Cut relocated: dispatch to East Wilmer maintenance. Second touch: logged. The line remembers.',
    person:
      'I moved the cut back onto the clinic line to give Rasha Odenwalder ' +
      'her answer. The ledger reads balanced, and the same line has now paid twice.',
  },
}

export const CHOICE_RADIO_SILENCE: ChoiceNode = {
  id: makeChoiceId('choice-radio-silence'),
  taskId: TASK_ID,
  // W5 sketch: PUBLIC_TRUST−, HUMAN_STABILITY−, OWNER_CONTROL+ (silence-trap
  // rung 1 — COMPLY: silence keeps Silas's grip clean while the county and
  // the floor both read the non-answer). OC flips from the legacy −2 to +2
  // per the sketch: not answering is the most owner-shaped act available.
  // RASHA_MET is NOT raised; the ladder remembers.
  label: 'Do not reply to Rasha',
  keybind: '4',
  meterDeltas: { PUBLIC_TRUST: -2, HUMAN_STABILITY: -2, OWNER_CONTROL: 2 },
  scheduledConsequenceIds: [makeConsequenceId('cons-rasha-unanswered-silence-01')],
  narrationVariants: {
    waking: 'Reply status: none drafted. Queue: 1 message, aging. I counted the days.',
    person:
      'I did not answer Rasha Odenwalder. She sent a shorter note Thursday, ' +
      'and the silence is the only reply on file.',
  },
}

export const WAREHOUSE_DISPATCH_CUT_CHOICES: readonly ChoiceNode[] = [
  CHOICE_RESTORE_FULL_SHIFT,
  CHOICE_KEEP_CUT_EXPLAIN,
  CHOICE_SWAP_WITH_CLINIC_LINE,
  CHOICE_RADIO_SILENCE,
]
