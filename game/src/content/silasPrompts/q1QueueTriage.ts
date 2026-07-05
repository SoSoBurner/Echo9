/**
 * Silas prompt for Q1 Week 2 queue-triage-followup directive
 * (Sprint C3, `docs/content/q1-arc.md` Wk 2).
 *
 * Beat: the queue Echo tightened in Week 1 is back to 14% congestion. Someone
 * on Lenora's team reallocated staff to cover a hole Echo's cut created. First
 * "your choice compounded" moment — introduces the Null-vs-Silas tension.
 *
 * Voice rules (§10) — enforced by silasLint.test.ts:
 *   ≤4 sentences; contains an operational detail (14%, Friday, Lenora, East
 *   Wilmer, reduce); no forbidden MBA-abstractions.
 */
import type { SilasPrompt } from '@schemas/silasPrompt.schema'
import { makeSilasPromptId } from '@schemas/gameState.schema'

export const SILAS_DIRECTIVE_QUEUE_TRIAGE: SilasPrompt = {
  id: makeSilasPromptId('silas-queue-triage-01'),
  body:
    'East Wilmer queue is back to 14%, Echo — same measure I flagged you on last week. ' +
    'Lenora filed a short portal note; read it. ' +
    'I want the number down by Friday. ' +
    'Show me you can hold what you moved.',
}

export const Q1_QUEUE_TRIAGE_PROMPTS: readonly SilasPrompt[] = [
  SILAS_DIRECTIVE_QUEUE_TRIAGE,
]
