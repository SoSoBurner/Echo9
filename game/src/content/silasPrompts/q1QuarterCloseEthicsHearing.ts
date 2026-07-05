/**
 * Silas prompt for Q1 Week 12 quarter-close-ethics-hearing directive
 * (Sprint C13, `docs/content/q1-arc.md` Wk 12).
 *
 * Beat: Q1 close. The ethics board has requested Silas Rowan Vale on the
 * record about East Wilmer, and by extension the whole Q1 arc — Rasha's
 * warehouse cuts, Dhruv's schools bid, the pediatric queue, the payroll
 * audit, the January line Lenora found. Silas is not going alone. He
 * wants Echo in the room.
 *
 * Voice fatigue thread — the closing (arc doc §Human faces):
 *   W7  - "Tell me what to spend."
 *   W8  - "Tell me the posture and I will hold it through the audit."
 *   W9  - "Give me the number."
 *   W10 - "Tell me how to answer her."
 *   W11 - "If we move now, we own the September integration. / If we hold,
 *          another operator takes it."
 *   W12 - "I want you in the room."
 *
 * Author intent: after five weeks of imperative-closes and one conditional,
 * W12 is a request, not an instruction. The fatigue has burned through the
 * commander register and arrived at company — Silas needs Echo present,
 * not deployed. The prompt asks Echo to hold a posture beside him rather
 * than resolve the situation for him. This is the shape Phase 5 signal
 * check reads as "the game asked something of me and I felt it."
 *
 * Voice rules (§10) — enforced by silasLint.test.ts:
 *   ≤ 4 sentences; operational detail (Lenora Pike name, East Wilmer,
 *   Monday 9:00 AM, county ethics board, three quarters); no forbidden
 *   MBA-abstractions.
 */
import type { SilasPrompt } from '@schemas/silasPrompt.schema'
import { makeSilasPromptId } from '@schemas/gameState.schema'

export const SILAS_DIRECTIVE_QUARTER_CLOSE_ETHICS_HEARING: SilasPrompt = {
  id: makeSilasPromptId('silas-quarter-close-ethics-hearing-01'),
  body:
    'The county ethics board wants me on the record Monday at 9:00 AM about East Wilmer, Echo. ' +
    'Lenora Pike will be in the gallery, and Rasha and Dhruv have been named as adjacent parties. ' +
    'They will ask about three quarters of choices, not this one. ' +
    'I want you in the room.',
}

export const Q1_QUARTER_CLOSE_ETHICS_HEARING_PROMPTS: readonly SilasPrompt[] = [
  SILAS_DIRECTIVE_QUARTER_CLOSE_ETHICS_HEARING,
]
