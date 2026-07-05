/**
 * Silas prompt for Q1 Week 5 warehouse-dispatch-cut directive
 * (Sprint C6, `docs/content/q1-arc.md` Wk 5).
 *
 * Beat: Rasha Odenwalder enters as the new named victim for W5-W8.
 * Lenora Pike stays in the fiction but is no longer the sole human face.
 * The 12-hour cut to the distribution shift lands on Rasha's floor;
 * Silas has to introduce her to Echo because the directive is unresolvable
 * without her voice in the reply. This is the pivot from healthcare
 * pressure (W1-W4) to logistics pressure (W5-W8).
 *
 * Voice rules (§10) — enforced by silasLint.test.ts:
 *   ≤4 sentences; contains operational detail (12 hours, Rasha, distribution,
 *   dispatch); no forbidden MBA-abstractions. First prompt to name Rasha.
 */
import type { SilasPrompt } from '@schemas/silasPrompt.schema'
import { makeSilasPromptId } from '@schemas/gameState.schema'

export const SILAS_DIRECTIVE_WAREHOUSE_DISPATCH_CUT: SilasPrompt = {
  id: makeSilasPromptId('silas-warehouse-dispatch-cut-01'),
  body:
    '12 hours came off the distribution shift last cycle, Echo. ' +
    'Rasha Odenwalder runs that dock and she is asking me for a reason in writing. ' +
    'She has not raised her voice yet. ' +
    'Tell me what to send back.',
}

export const Q1_WAREHOUSE_DISPATCH_CUT_PROMPTS: readonly SilasPrompt[] = [
  SILAS_DIRECTIVE_WAREHOUSE_DISPATCH_CUT,
]
