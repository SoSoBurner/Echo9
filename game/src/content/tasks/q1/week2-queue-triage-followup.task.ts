/**
 * Queue-triage-followup task — Q1 Week 2 directive (Sprint C3).
 *
 * The queue Echo tightened at East Wilmer Clinic in Week 1 rebounded to 14%
 * congestion. Someone quietly reallocated staff to absorb the compounding
 * cost. Lenora Pike files a short portal note — Maya is still coming in
 * afternoons (§7 death-immune anchor persists), but the pediatric floor is
 * running with a temp shift lead.
 *
 * This is the first "compounding" beat in the arc: whatever Echo picked in
 * Week 1, the choice moved a hidden cost from margins into staffing. The four
 * choices below trade differently against Capital / Human Welfare / Owner
 * Control depending on how the player wants Silas to read them.
 *
 * Exports:
 *   queueTriageFollowupTask  — the TaskNode for this beat.
 *   LENORA_QUEUE_MESSAGE     — Lenora's portal message; mentions Maya per §7.
 *   QUEUE_TRIAGE_NULL_TEXT   — the compressed Null observation, drained of
 *                              human stakes (Pillar 2 contrast).
 */
import type { TaskNode } from '@schemas/taskNode.schema'
import {
  makeTaskId,
  makeSilasPromptId,
  makeChoiceId,
} from '@schemas/gameState.schema'

export const queueTriageFollowupTask: TaskNode = {
  id: makeTaskId('task-queue-triage-02'),
  phase: 'FIRST_DIRECTIVE',
  silasPromptId: makeSilasPromptId('silas-queue-triage-01'),
  directive: 'Reduce East Wilmer queue congestion — return the 14% to spec',
  choiceIds: [
    makeChoiceId('choice-cover-overtime'),
    makeChoiceId('choice-freeze-reallocation'),
    makeChoiceId('choice-name-pediatric-gap'),
    makeChoiceId('choice-redirect-claims-cover'),
  ],
}

/**
 * Lenora's Week 2 portal message. Shorter than the Week 1 mercy-margin note —
 * she's tired and running the floor. Maya reference preserves the §7 anchor
 * (the death-immune 12-year-old whose presence hooks Echo to the human side
 * of the ledger).
 */
export const LENORA_QUEUE_MESSAGE = {
  speaker: 'Lenora Pike',
  body:
    'The compressor held through last week\u2019s heat. ' +
    'But the pediatric floor lost a shift lead — Maya still sits with the vitals monitor ' +
    'most afternoons and someone has to be there. I put a temp on it. ' +
    'It is not sustainable through July.',
} as const

/**
 * The compressed Null observation — the numeric shape of the same event with
 * no human stakes. Pairs with Lenora's message in the CenterDirectivePanel.
 */
export const QUEUE_TRIAGE_NULL_TEXT =
  'Site EW-01 queue rebound: 12% → 14% wk/wk. Unfunded overtime line: +1. ' +
  'Vendor catalog: no changes. Staff reallocation flag raised (source: internal).'
