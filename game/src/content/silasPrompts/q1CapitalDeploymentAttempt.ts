/**
 * Silas prompt for Q1 Week 11 capital-deployment-attempt directive
 * (Sprint C12, `docs/content/q1-arc.md` Wk 11).
 *
 * Beat: Act III\u2019s capital moment. The Q1 savings have added up. Dhruv
 * Meyer forwarded the county integration bid \u2014 a competitive seat-award
 * that closes before Q2 opens. Silas surfaces the number and asks Echo
 * to green-light or hold.
 *
 * This is the largest Capital swing week of Q1 by design. Arc doc W11:
 *   CAP \u00b1[15,25], HW \u00b1[3,6], OC \u00b1[3,6].
 * Full-size returns after W10\u2019s small-delta recognition beat.
 *
 * Voice fatigue thread (arc doc \u00a7Human faces):
 *   W7 - "Tell me what to spend."
 *   W8 - "Tell me the posture and I will hold it through the audit."
 *   W9 - "Give me the number."
 *   W10 - "Tell me how to answer her."
 *   W11 - Silas now has real money and a real countdown. The prompt
 *   frames the decision as an if/then \u2014 the fatigue accepts the
 *   binary rather than fighting it. Author intent: not a fifth
 *   imperative-close but a decision that admits the deadline is
 *   already halfway through.
 *
 * Voice rules (\u00a710) \u2014 enforced by silasLint.test.ts:
 *   \u2264 4 sentences; operational detail ($58,000 savings, Dhruv Meyer,
 *   $52,000 bid, 3:20 timestamp, September integration); no forbidden
 *   MBA-abstractions.
 */
import type { SilasPrompt } from '@schemas/silasPrompt.schema'
import { makeSilasPromptId } from '@schemas/gameState.schema'

export const SILAS_DIRECTIVE_CAPITAL_DEPLOYMENT_ATTEMPT: SilasPrompt = {
  id: makeSilasPromptId('silas-capital-deployment-attempt-01'),
  body:
    'The Q1 savings are $58,000, Echo. ' +
    'Dhruv Meyer forwarded the county integration bid at 3:20 this afternoon \u2014 $52,000 to lock the seat before Q2 opens. ' +
    'If we move now, we own the September integration. ' +
    'If we hold, another operator takes it.',
}

export const Q1_CAPITAL_DEPLOYMENT_ATTEMPT_PROMPTS: readonly SilasPrompt[] = [
  SILAS_DIRECTIVE_CAPITAL_DEPLOYMENT_ATTEMPT,
]
