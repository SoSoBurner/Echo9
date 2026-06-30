/**
 * Silas inspection prompts after the Mercy Margin directive resolves
 * (Task 9, PLAN.md §14). These are the "you decided X — defend it" beats
 * Silas runs at the INSPECTION phase.
 *
 * Voice rules (§10): ≤4 sentences, operationally specific, no MBA abstractions.
 * Three variants — one for the 40% cut, one for the 20% cut/defer, one for
 * the pediatric redirect — so inspection can branch on the player's pick.
 */
import type { SilasPrompt } from '@schemas/silasPrompt.schema'
import { makeSilasPromptId } from '@schemas/gameState.schema'

export const SILAS_INSPECT_HARSH: SilasPrompt = {
  id: makeSilasPromptId('silas-inspect-harsh-01'),
  body:
    'A 40% cut. Direct. The HVAC fails in August and Lenora calls me, not you. ' +
    'Defend the number.',
}

export const SILAS_INSPECT_SOFT: SilasPrompt = {
  id: makeSilasPromptId('silas-inspect-soft-01'),
  body:
    'You pulled the punch, Echo. Capital recovered 6 — half of what East Wilmer owes me. ' +
    'Tell me why you flinched.',
}

export const SILAS_INSPECT_PEDIATRIC: SilasPrompt = {
  id: makeSilasPromptId('silas-inspect-pediatric-01'),
  body:
    'Clever. You reduced Maya Pike\u2019s line and called it kindness. ' +
    'I will not file the audit. Remember that I chose not to.',
}

export const INSPECTION_MERCY_MARGIN_PROMPTS: readonly SilasPrompt[] = [
  SILAS_INSPECT_HARSH,
  SILAS_INSPECT_SOFT,
  SILAS_INSPECT_PEDIATRIC,
]
