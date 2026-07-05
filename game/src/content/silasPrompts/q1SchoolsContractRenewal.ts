/**
 * Silas prompt for Q1 Week 9 schools-contract-renewal directive
 * (Sprint C10, `docs/content/q1-arc.md` Wk 9).
 *
 * Beat: Act III opens ("Naming what the quarter took"). Dhruv Meyer enters
 * as the public schools contract liaison (W9-W12 face) with a discount
 * request. The arc doc row for W9 says "Silas tired here — write his
 * fatigue" — the prompt surfaces four consecutive high-stakes weeks in
 * the wording without ever using the word "tired" itself.
 *
 * Dhruv's introductory character note (arc doc §Human faces): "honest and
 * unimpressed." He is not adversarial; he is direct. Silas frames the
 * question factually without a defensive posture.
 *
 * Voice rules (§10) — enforced by silasLint.test.ts:
 *   ≤4 sentences; contains operational detail ($240K contract, Dhruv,
 *   discount %, September); no forbidden MBA-abstractions. Silas fatigue
 *   shows in the fourth sentence: he asks for the number rather than
 *   the strategy.
 */
import type { SilasPrompt } from '@schemas/silasPrompt.schema'
import { makeSilasPromptId } from '@schemas/gameState.schema'

export const SILAS_DIRECTIVE_SCHOOLS_CONTRACT_RENEWAL: SilasPrompt = {
  id: makeSilasPromptId('silas-schools-contract-renewal-01'),
  body:
    'Dhruv Meyer from the public schools opened the renewal conversation this morning, Echo. ' +
    'He wants an 8% discount on the $240,000 September contract before he signs. ' +
    'He was clear that the number is his floor, not his opening. ' +
    'Give me the number.',
}

export const Q1_SCHOOLS_CONTRACT_RENEWAL_PROMPTS: readonly SilasPrompt[] = [
  SILAS_DIRECTIVE_SCHOOLS_CONTRACT_RENEWAL,
]
