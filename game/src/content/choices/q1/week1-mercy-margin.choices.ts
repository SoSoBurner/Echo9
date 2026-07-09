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
  meterDeltas: { CAPITAL: 12, HUMAN_WELFARE: -15 },
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
  meterDeltas: { CAPITAL: 6, HUMAN_WELFARE: -7 },
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
  meterDeltas: { CAPITAL: 0, OWNER_CONTROL: -5 },
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
  // Reads as a kindness: small Capital gain, small Welfare gain, small
  // Owner-Control gain. The hidden cost is the NEVER-reveal hook against
  // Maya Pike's monitoring cadence (mercyMargin.consequences.ts).
  meterDeltas: { CAPITAL: 4, HUMAN_WELFARE: 3, OWNER_CONTROL: 2 },
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
