/**
 * Silas prompt for Q1 Week 10 hidden-trace-reveal directive
 * (Sprint C11, `docs/content/q1-arc.md` Wk 10).
 *
 * Beat: Act III's traceability payoff. Lenora Pike returns for the first
 * time since the W4 audit and reaches Silas *privately* — not through the
 * audit desk, not through compliance. She has noticed a specific
 * discrepancy in the East Wilmer January ledger that traces back to a
 * Week 1 choice, and she is asking Echo (via Silas) what happened.
 *
 * This is the Pillar 3 (traceability) payoff for the East Wilmer W1
 * decision — the game demonstrates that a choice from eleven in-fiction
 * weeks ago is still visible in someone's records, and that the person
 * looking is the same named face who absorbed the original consequence.
 *
 * Voice fatigue thread (arc doc §Human faces):
 *   W7 - "Tell me what to spend."
 *   W8 - "Tell me the posture and I will hold it through the audit."
 *   W9 - "Give me the number."
 *   W10 - Silas is still tired, but he is not just executing orders here;
 *   he is surfacing something Lenora found. The fatigue continues but
 *   his sharpness returns through it. Closes with "Tell me how to answer"
 *   \u2014 imperative-form as W7-W9, but the object is a conversation with a
 *   human being rather than a variable.
 *
 * Voice rules (§10) \u2014 enforced by silasLint.test.ts:
 *   \u2264 4 sentences; operational detail (Lenora Pike, $4,200, East Wilmer,
 *   Week 1); no forbidden MBA-abstractions.
 */
import type { SilasPrompt } from '@schemas/silasPrompt.schema'
import { makeSilasPromptId } from '@schemas/gameState.schema'

export const SILAS_DIRECTIVE_HIDDEN_TRACE_REVEAL: SilasPrompt = {
  id: makeSilasPromptId('silas-hidden-trace-reveal-01'),
  body:
    'Lenora Pike opened a private message this morning, Echo. ' +
    'She noticed a $4,200 discrepancy in the East Wilmer January ledger that traces back to a Week 1 choice. ' +
    'She asked me directly, not the audit desk. ' +
    'Tell me how to answer her.',
}

export const Q1_HIDDEN_TRACE_REVEAL_PROMPTS: readonly SilasPrompt[] = [
  SILAS_DIRECTIVE_HIDDEN_TRACE_REVEAL,
]
