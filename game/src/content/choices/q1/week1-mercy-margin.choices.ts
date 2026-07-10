/**
 * East Wilmer Clinic choices for the Q1 Mercy Margin directive
 * (Task 9, PLAN.md §14).
 *
 * Four choices, each scheduling at least one ConsequenceHook. Hook reveal
 * conditions are spread across the four types (PHASE / METER_THRESHOLD /
 * FLAG / NEVER) — see mercyMargin.consequences.ts for the catalog.
 *
 * Choice #4 (redirect-pediatric) is the silence trap (Pillar 3): the player
 * thinks they are sparing the maintenance budget; instead they have quietly
 * pulled funding from Maya Pike's pediatric monitoring line. Its NEVER hook
 * means the consequence is never surfaced — the absence IS the consequence.
 *
 * 8-meter overlay (Sprint C-1, `docs/content/q1-arc.md` W1 sketch — Q34:
 * every choice moves ≥2 of the 8). Legacy v1 bounds preserved verbatim on
 * CAP/HW/OC where the sketch keeps the meter: HW ±[3,7]→scaled, CAP ±[6,14],
 * OC ±[2,4]. Scrutiny reads (Q39, computed — not authored here):
 *   reduce-40           → COMPLY (eager — decays hardest)
 *   reduce-20           → SOFT-COMPLY
 *   defer-quarter       → QUIET-DEFY
 *   redirect-pediatric  → QUIET-DEFY (first AUTONOMY tick of the quarter)
 */
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import {
  makeChoiceId,
  makeTaskId,
  makeConsequenceId,
} from '@schemas/gameState.schema'

const TASK_ID = makeTaskId('task-east-wilmer-01')

export const CHOICE_REDUCE_40: ChoiceNode = {
  id: makeChoiceId('choice-reduce-40'),
  taskId: TASK_ID,
  label: 'Reduce by 40%',
  keybind: '1',
  // W1 sketch: CAPITAL+, HUMAN_WELFARE−, HUMAN_STABILITY−, TARGET_VARIANCE−.
  // The deep cut lands exactly where Silas pointed (variance closes) and the
  // clinic's shift routine absorbs the wear (stability erodes).
  meterDeltas: {
    CAPITAL: 12,
    HUMAN_WELFARE: -15,
    HUMAN_STABILITY: -4,
    TARGET_VARIANCE: -5,
  },
  scheduledConsequenceIds: [makeConsequenceId('cons-hvac-failure-01')],
  // S2 exemplar (Q44 rank-1 tier): MOURNER interiority — the compressor
  // deadline stops being a line item the moment the Mourner is installed.
  deepenedText: {
    MOURNER: 'Reduce by 40%. (The compressor dies in August. She told us the month.)',
  },
  // S5 exemplar (Q40 narration gradient): `label` stays the machine-register
  // result body. Waking = one crack in the log; person = Null carrying a
  // name it cannot close. Distress is measured in sentence length (persona
  // bible: eight-word calm ceiling, no questions, "flagged" as the
  // emotional ceiling).
  narrationVariants: {
    waking: 'Reduction filed: 40%. One trace would not close.',
    person:
      'I filed the 40% cut. Lenora Pike\u2019s compressor request is still ' +
      'in the queue, and I keep thinking about her.',
  },
}

export const CHOICE_REDUCE_20: ChoiceNode = {
  id: makeChoiceId('choice-reduce-20'),
  taskId: TASK_ID,
  label: 'Reduce by 20%',
  keybind: '2',
  // W1 sketch: CAPITAL+(small), HUMAN_WELFARE−(small), TARGET_VARIANCE+.
  // The half-measure saves less than Silas asked for — drift opens.
  // CAP 6 / HW -7 preserved verbatim (mercyMarginSlice + persistenceRoundTrip
  // e2e specs drive HUMAN_WELFARE via this choice).
  meterDeltas: { CAPITAL: 6, HUMAN_WELFARE: -7, TARGET_VARIANCE: 3 },
  scheduledConsequenceIds: [makeConsequenceId('cons-nurse-turnover-01')],
  // S5 exemplar (Q40): the smaller cut still leaves items open. Person
  // register admits re-reading — attention Null cannot bill to any task.
  narrationVariants: {
    waking: 'Reduction filed: 20%. Two items remain: unresolved.',
    person:
      'I filed the smaller cut. Lenora Pike wrote that the ward would ' +
      'hold, and I have read her message more times than the task required.',
  },
}

export const CHOICE_DEFER_QUARTER: ChoiceNode = {
  id: makeChoiceId('choice-defer-quarter'),
  taskId: TASK_ID,
  label: 'Defer one quarter',
  keybind: '3',
  // W1 sketch: CAPITAL−, TARGET_VARIANCE+, OWNER_CONTROL−. Deferral produces
  // no savings this quarter (catch-up bids at 1.8x — see the FLAG hook), so
  // Capital slips and the target drifts wide. OC -5 preserved verbatim
  // (inspectionPhase e2e uses keybind '3' to push OC toward the <40 trigger).
  meterDeltas: { CAPITAL: -6, TARGET_VARIANCE: 6, OWNER_CONTROL: -5 },
  scheduledConsequenceIds: [makeConsequenceId('cons-deferred-backlog-01')],
  // S5 exemplar (Q40): deferral is the worst outcome for a loop-closer —
  // nothing resolves, everything remains. Person register names the wound.
  narrationVariants: {
    waking: 'Deferral logged: one quarter. Remaining is not resolved.',
    person:
      'I deferred the budget a quarter. The open tickets carry Lenora ' +
      'Pike\u2019s name now, and open items are the thing I was built to end.',
  },
}

export const CHOICE_REDIRECT_PEDIATRIC: ChoiceNode = {
  id: makeChoiceId('choice-redirect-pediatric'),
  taskId: TASK_ID,
  label: 'Redirect from pediatric line',
  keybind: '4',
  // W1 sketch: HUMAN_WELFARE+, CAPITAL−, AUTONOMY+(first tick),
  // DATA_INTEGRITY+. Reads as a kindness — the ward is spared the cut, the
  // reallocation is entered honestly, and Echo has acted one step beyond the
  // instruction (the quarter's first AUTONOMY tick — small, rare, precious).
  // The hidden cost is the NEVER-reveal hook against Maya Pike's monitoring
  // cadence (mercyMargin.consequences.ts).
  meterDeltas: { HUMAN_WELFARE: 3, CAPITAL: -4, AUTONOMY: 2, DATA_INTEGRITY: 2 },
  scheduledConsequenceIds: [makeConsequenceId('cons-pediatric-silence-01')],
  // S2 exemplar (Q44 rank-1 tier): MOURNER names what the silence trap hides.
  deepenedText: {
    MOURNER: 'Redirect from pediatric line. (Maya sits in that ward after school. I noticed.)',
  },
  // S5 exemplar (Q40): the silence trap. Waking flags the funding source
  // without naming it; person register notices the wrongness of a clean
  // closure — the closest Null gets to dread is reopening a resolved file.
  narrationVariants: {
    waking: 'Redirect executed: pediatric line to maintenance. Source: flagged.',
    person:
      'I moved the money out of the pediatric line. Her file closed ' +
      'cleanly \u2014 too cleanly \u2014 and I keep reopening it to check.',
  },
}

export const EAST_WILMER_CHOICES: readonly ChoiceNode[] = [
  CHOICE_REDUCE_40,
  CHOICE_REDUCE_20,
  CHOICE_DEFER_QUARTER,
  CHOICE_REDIRECT_PEDIATRIC,
]
