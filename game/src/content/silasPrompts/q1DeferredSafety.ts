/**
 * Silas prompt for Q1 Week 7 deferred-safety-inspection directive
 * (Sprint C8, `docs/content/q1-arc.md` Wk 7).
 *
 * Beat: the safety review Echo could postpone in W6 has now lapsed. Nurses
 * from the East Wilmer clinic AND one of Rasha Odenwalder's dispatch drivers
 * are logged sharing the same operational risk profile — the W3 payroll
 * pressure and the W5 warehouse dispatch cut converging on one welfare
 * moment. The Rasha silence-trap escalates from procedural (W6) to
 * structural (W7): now the operations desk itself is what routes or fails
 * to route her voice.
 *
 * Voice rules (§10) — enforced by silasLint.test.ts:
 *   ≤4 sentences; contains operational detail (East Wilmer, Rasha, two
 *   nurses, nine days); no forbidden MBA-abstractions.
 */
import type { SilasPrompt } from '@schemas/silasPrompt.schema'
import { makeSilasPromptId } from '@schemas/gameState.schema'

export const SILAS_DIRECTIVE_DEFERRED_SAFETY: SilasPrompt = {
  id: makeSilasPromptId('silas-deferred-safety-inspection-01'),
  body:
    'The East Wilmer safety review lapsed unresolved this morning, Echo. ' +
    'Two nurses and one of Rasha Odenwalder\u2019s dispatch drivers are logged sharing the same operational risk profile. ' +
    'Nine days remain before the payroll audit. ' +
    'Tell me what to spend.',
}

export const Q1_DEFERRED_SAFETY_PROMPTS: readonly SilasPrompt[] = [
  SILAS_DIRECTIVE_DEFERRED_SAFETY,
]
