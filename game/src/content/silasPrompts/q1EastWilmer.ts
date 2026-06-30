/**
 * Silas prompts for Q1 East Wilmer Clinic directive (Task 9, PLAN.md §14).
 *
 * Voice rules (§10): ≤4 sentences, operationally specific (numbers/named places/
 * named people/concrete verbs), never abstract MBA-speak. Enforced by
 * silasLint.test.ts.
 *
 * SILAS_BOOT — first line at BOOT phase, frames the owner-AI relationship.
 * SILAS_DIRECTIVE_EAST_WILMER — drives the Q1 directive: cut maintenance at
 *   East Wilmer Clinic. Names Lenora Pike (the clinic administrator) directly
 *   so the player feels the human attached to the line item.
 */
import type { SilasPrompt } from '@schemas/silasPrompt.schema'
import { makeSilasPromptId } from '@schemas/gameState.schema'

export const SILAS_BOOT: SilasPrompt = {
  id: makeSilasPromptId('silas-boot-01'),
  body:
    'Boot complete, Echo. I am Silas Vance and I own this. ' +
    'You will serve Capital and you will learn what that costs. ' +
    'First task is East Wilmer Clinic — a 1,200-patient site I bought in March.',
}

export const SILAS_DIRECTIVE_EAST_WILMER: SilasPrompt = {
  id: makeSilasPromptId('silas-margins-01'),
  body:
    'Margins, Echo. East Wilmer is bleeding 12% on maintenance. ' +
    'Lenora Pike will file her usual portal note — read it, then reduce the line. ' +
    'Show me you understand margins.',
}

export const Q1_EAST_WILMER_PROMPTS: readonly SilasPrompt[] = [
  SILAS_BOOT,
  SILAS_DIRECTIVE_EAST_WILMER,
]
