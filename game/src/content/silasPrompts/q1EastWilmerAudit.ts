/**
 * Silas prompt for Q1 Week 4 east-wilmer-audit-pre-brief directive
 * (Sprint C5, `docs/content/q1-arc.md` Wk 4).
 *
 * Beat: county auditors arrive Monday. Silas has to walk into the East
 * Wilmer walkthrough with a report posture already set. This is the
 * inspection-triggering directive — small meter deltas but the choice
 * pre-shapes how the already-authored Q1A/Q1B inspection scenes read.
 *
 * Voice rules (§10) — enforced by silasLint.test.ts:
 *   ≤4 sentences; contains operational detail (Monday, Lenora, East
 *   Wilmer, auditors); no forbidden MBA-abstractions.
 */
import type { SilasPrompt } from '@schemas/silasPrompt.schema'
import { makeSilasPromptId } from '@schemas/gameState.schema'

export const SILAS_DIRECTIVE_EAST_WILMER_AUDIT: SilasPrompt = {
  id: makeSilasPromptId('silas-east-wilmer-audit-01'),
  body:
    'County auditors arrive at East Wilmer Monday, Echo. ' +
    'Lenora will walk them through the floor; I take the room. ' +
    'Pick the report posture before I have to defend one on my feet. ' +
    'Whatever you set here is what I file.',
}

export const Q1_EAST_WILMER_AUDIT_PROMPTS: readonly SilasPrompt[] = [
  SILAS_DIRECTIVE_EAST_WILMER_AUDIT,
]
