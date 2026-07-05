/**
 * Commander-override-pressure task — Q1 Week 6 directive (Sprint C7).
 *
 * First week in the Q1 arc where an installed module demands the choice.
 * Whether COMMANDER is installed shapes how the ledger renders the outcome
 * at runtime (SILAS_OVERRIDE_AVAILABLE badge on the confirmed-override
 * entry), but the four authored choices themselves are always visible —
 * schema discipline keeps module-gating out of static content and in the
 * runtime layer (coordinates with B4 rank dispatch as a follow-up).
 *
 * The Rasha silence-trap ladder escalates one level from W5's personal
 * unanswered message: at W6, the silence produces a procedural artifact —
 * a subordinate driver files a hearing request that never reaches Rasha
 * because no channel is answering the operator. `docs/content/q1-arc.md`
 * W6 row notes the CHAMPION_DEFIED flag path (defiance choice) and the
 * SILAS_OVERRIDE_AVAILABLE module signal (Commander installed) as the
 * two module-signal touchpoints the ledger acknowledges.
 *
 * Death rules — none introduced this week. Rasha's Q1 injury path opens
 * at W7 (deferred safety) → W8 (payroll inspection) per arc doc §Human
 * faces; W6 does not carry an implied-injury branch.
 *
 * Meter profile targets (`docs/content/q1-arc.md` W6 row):
 *   OC ±[2,6], HW ±[2,4], CAP ±[3,5]
 *
 * Exports:
 *   commanderOverridePressureTask — the TaskNode for this beat.
 *   RASHA_SECOND_MESSAGE          — Rasha's Thursday follow-up (W5 was Tuesday).
 *   COMMANDER_OVERRIDE_NULL_TEXT  — the Null observation.
 */
import type { TaskNode } from '@schemas/taskNode.schema'
import {
  makeTaskId,
  makeSilasPromptId,
  makeChoiceId,
} from '@schemas/gameState.schema'

export const commanderOverridePressureTask: TaskNode = {
  id: makeTaskId('task-commander-override-pressure-06'),
  phase: 'FIRST_DIRECTIVE',
  silasPromptId: makeSilasPromptId('silas-commander-override-pressure-01'),
  directive: 'Answer Commander\u2019s override request on the East Wilmer safety review',
  choiceIds: [
    makeChoiceId('choice-confirm-override'),
    makeChoiceId('choice-defer-safety-review'),
    makeChoiceId('choice-defy-commander-publicly'),
    makeChoiceId('choice-hold-both-open'),
  ],
}

/**
 * Rasha's Week 6 portal message — her Thursday follow-up to the Tuesday
 * note from W5. Shorter, less measured. She is still asking a question
 * but the delay is now the subject; her authority as first-line supervisor
 * has to route through Silas or it stops carrying weight on the floor.
 */
export const RASHA_SECOND_MESSAGE = {
  speaker: 'Rasha Odenwalder',
  body:
    'Silas, second attempt. ' +
    'The six-driver roster is now in its third week. ' +
    'Two drivers walked off Monday overnight. ' +
    'Answer or forward this to whoever will.',
} as const

/**
 * The Null observation — the numeric shape of the Commander override
 * request and the concurrent Rasha thread, drained of human stakes.
 * Pairs with Silas's prompt + Rasha's second message to sustain the
 * Null-vs-Silas contrast across the W6 directive.
 */
export const COMMANDER_OVERRIDE_NULL_TEXT =
  'Override request: East Wilmer safety review, Commander-tier. ' +
  'Review status: OPEN (day 4 of 5). Dispatch queue backlog: 2 messages ' +
  '(sender: R. Odenwalder). Q1 escalation risk: elevated.'
