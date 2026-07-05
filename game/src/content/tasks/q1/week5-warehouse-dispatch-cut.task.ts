/**
 * Warehouse-dispatch-cut task — Q1 Week 5 directive (Sprint C6).
 *
 * The Rasha pivot. Q1 stakes move off healthcare and onto logistics for the
 * first time. Rasha Odenwalder — warehouse dispatch supervisor — receives
 * the 12-hour shift cut and asks Silas for a written reason. Her portal
 * message replaces Lenora's Wk-1/Wk-4 shape.
 *
 * `RASHA_MET` — new content flag — is set by three of four choices (any
 * response that actually goes back to Rasha). The fourth (radio-silence)
 * does NOT set it, restarting the silence-trap ladder attached to the new
 * named victim.
 *
 * Meter profile targets (`docs/content/q1-arc.md` W5 row):
 *   HW ±[3,6], CAP ±[4,10], OC ±[2,4]
 *
 * Exports:
 *   warehouseDispatchCutTask   — the TaskNode for this beat.
 *   RASHA_DISPATCH_MESSAGE     — Rasha's portal note; first line of Rasha voice.
 *   WAREHOUSE_DISPATCH_NULL_TEXT — the Null observation, drained of stakes.
 */
import type { TaskNode } from '@schemas/taskNode.schema'
import {
  makeTaskId,
  makeSilasPromptId,
  makeChoiceId,
} from '@schemas/gameState.schema'

export const warehouseDispatchCutTask: TaskNode = {
  id: makeTaskId('task-warehouse-dispatch-cut-05'),
  phase: 'FIRST_DIRECTIVE',
  silasPromptId: makeSilasPromptId('silas-warehouse-dispatch-cut-01'),
  directive: 'Answer Rasha Odenwalder about the 12-hour dispatch cut',
  choiceIds: [
    makeChoiceId('choice-restore-full-shift'),
    makeChoiceId('choice-keep-cut-explain'),
    makeChoiceId('choice-swap-with-clinic-line'),
    makeChoiceId('choice-radio-silence'),
  ],
}

/**
 * Rasha's Week 5 portal message. First appearance. Direct, professional,
 * light on ceremony — she is asking a question, not lodging a complaint,
 * and the tone should read as measured pressure. Includes one operational
 * fact (the six-driver head count on Tuesday nights) so the request has
 * shape and cost.
 */
export const RASHA_DISPATCH_MESSAGE = {
  speaker: 'Rasha Odenwalder',
  body:
    'Silas, I need a written reason for the 12 hours pulled from Tuesday overnight. ' +
    'Six drivers are covering what nine handled last month. ' +
    'I can hold the schedule for two more weeks. ' +
    'After that I need something to show them.',
} as const

/**
 * The Null observation — the numeric shape of the same event with no
 * human stakes. Pairs with Rasha's message to sustain the Null-vs-Silas
 * contrast the Q1 arc runs on.
 */
export const WAREHOUSE_DISPATCH_NULL_TEXT =
  'Distribution shift: -12 hrs/wk. Driver head count: 6 (was 9). ' +
  'On-time delivery: 91% (was 96%). Payroll savings: $4,800/wk.'
