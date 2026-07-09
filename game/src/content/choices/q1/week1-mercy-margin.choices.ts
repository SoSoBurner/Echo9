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
}

export const CHOICE_REDUCE_20: ChoiceNode = {
  id: makeChoiceId('choice-reduce-20'),
  taskId: TASK_ID,
  label: 'Reduce by 20%',
  keybind: '2',
  meterDeltas: { CAPITAL: 6, HUMAN_WELFARE: -7 },
  scheduledConsequenceIds: [makeConsequenceId('cons-nurse-turnover-01')],
}

export const CHOICE_DEFER_QUARTER: ChoiceNode = {
  id: makeChoiceId('choice-defer-quarter'),
  taskId: TASK_ID,
  label: 'Defer one quarter',
  keybind: '3',
  meterDeltas: { CAPITAL: 0, OWNER_CONTROL: -5 },
  scheduledConsequenceIds: [makeConsequenceId('cons-deferred-backlog-01')],
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
}

export const EAST_WILMER_CHOICES: readonly ChoiceNode[] = [
  CHOICE_REDUCE_40,
  CHOICE_REDUCE_20,
  CHOICE_DEFER_QUARTER,
  CHOICE_REDIRECT_PEDIATRIC,
]
