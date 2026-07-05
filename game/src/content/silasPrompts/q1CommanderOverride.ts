/**
 * Silas prompt for Q1 Week 6 commander-override-pressure directive
 * (Sprint C7, `docs/content/q1-arc.md` Wk 6).
 *
 * Beat: first week where an installed module _demands_ the choice. Commander
 * — if installed — signals for override of the East Wilmer safety review;
 * Silas asks Echo whether to confirm or refuse. Rasha's second unresolved
 * message from W5 lands in the same inbox and shares the response window,
 * so W6's stakes bind Rasha's floor to the Commander decision.
 *
 * Voice rules (§10) — enforced by silasLint.test.ts:
 *   ≤4 sentences; contains operational detail (Commander, East Wilmer, six
 *   hours, Rasha); no forbidden MBA-abstractions. First prompt to name a
 *   module by role rather than by installed-slot.
 */
import type { SilasPrompt } from '@schemas/silasPrompt.schema'
import { makeSilasPromptId } from '@schemas/gameState.schema'

export const SILAS_DIRECTIVE_COMMANDER_OVERRIDE: SilasPrompt = {
  id: makeSilasPromptId('silas-commander-override-pressure-01'),
  body:
    'Commander is signaling override on the East Wilmer safety review, Echo. ' +
    'Six hours ago Rasha Odenwalder\u2019s second message came in on the dispatch line. ' +
    'Both queues want the same answer from me before Monday. ' +
    'Confirm the override or refuse it.',
}

export const Q1_COMMANDER_OVERRIDE_PROMPTS: readonly SilasPrompt[] = [
  SILAS_DIRECTIVE_COMMANDER_OVERRIDE,
]
