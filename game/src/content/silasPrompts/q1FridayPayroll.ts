/**
 * Silas prompt for Q1 Week 3 friday-payroll-shortfall directive
 * (Sprint C4, `docs/content/q1-arc.md` Wk 3).
 *
 * Beat: payroll is $180K short by Friday. County has asked for a
 * "story" — a written account of the run-rate variance. This is the
 * first Owner-Control vs. Capital squeeze in the arc; the choices here
 * tend to depress OC, which sets the stage for the Week 4 East Wilmer
 * inspection to fire natively at OC < 40 (§8).
 *
 * Voice rules (§10) — enforced by silasLint.test.ts:
 *   ≤4 sentences; contains an operational detail ($180K, Friday, Lenora,
 *   East Wilmer, county); no forbidden MBA-abstractions.
 *
 * Network mention #1 (arc doc §Network mentions, Q30/Q33): Silas's first
 * "network of clinics" name-drop lives HERE — dialogue-only, no mechanics,
 * delivered warm-tired as context, not threat. The arc's two canonical
 * sentences are joined with an em dash to hold the §10 four-sentence lint.
 * Placement #2 is the W9 schools-contract prompt (another sprint's file).
 */
import type { SilasPrompt } from '@schemas/silasPrompt.schema'
import { makeSilasPromptId } from '@schemas/gameState.schema'

export const SILAS_DIRECTIVE_FRIDAY_PAYROLL: SilasPrompt = {
  id: makeSilasPromptId('silas-friday-payroll-01'),
  body:
    'Payroll runs $180K short by Friday, Echo — the county wants a written story before then, ' +
    'and Lenora has already asked twice about the East Wilmer maintenance line I froze. ' +
    'I\u2019ve got a network of clinics watching how this quarter closes \u2014 ' +
    'East Wilmer doesn\u2019t get to be the exception that prices the rest. ' +
    'Pick where the money comes from. ' +
    'Show me the trade before I have to explain it in a room.',
}

export const Q1_FRIDAY_PAYROLL_PROMPTS: readonly SilasPrompt[] = [
  SILAS_DIRECTIVE_FRIDAY_PAYROLL,
]
