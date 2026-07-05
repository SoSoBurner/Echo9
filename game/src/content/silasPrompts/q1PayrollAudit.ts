/**
 * Silas prompt for Q1 Week 8 payroll-audit-inspection directive
 * (Sprint C9, `docs/content/q1-arc.md` Wk 8).
 *
 * Beat: county opens a three-quarter payroll audit. Silas frames the
 * question as one of posture — the same rules apply, but the auditor's
 * questions land sharper this quarter because W3 payroll pressure, W5
 * warehouse dispatch cut, W6 Commander override, and W7 deferred safety
 * all left readable traces on the payroll ledger. This W8 directive
 * SETS `PAYROLL_AUDIT_DONE` and triggers the Q1P.A/Q1P.B inspection
 * scenes (authored under Track C14).
 *
 * The Rasha silence-trap ladder reaches its final rung this week:
 * institutional. If the terminal-silence choice fires, the county
 * grievance queue reclassifies Rasha's messages as `RESOLVED-NO-CONTACT`
 * upstream of Silas. Neither Silas nor Rasha is notified. The channel
 * is not closed on paper — it is retroactively marked as if it had
 * never asked anything.
 *
 * Voice rules (§10) — enforced by silasLint.test.ts:
 *   ≤4 sentences; contains operational detail (three quarters, Rasha,
 *   audit day, payroll); no forbidden MBA-abstractions. Silas fatigue
 *   is on the surface — this is his fourth consecutive high-stakes week.
 */
import type { SilasPrompt } from '@schemas/silasPrompt.schema'
import { makeSilasPromptId } from '@schemas/gameState.schema'

export const SILAS_DIRECTIVE_PAYROLL_AUDIT: SilasPrompt = {
  id: makeSilasPromptId('silas-payroll-audit-inspection-01'),
  body:
    'The county opened the three-quarter payroll audit this morning, Echo. ' +
    'They will read what we did in weeks 3 and 5 and 7 as one shape, not three. ' +
    'Rasha Odenwalder\u2019s messages have gone quiet on the operations desk. ' +
    'Tell me the posture and I will hold it through the audit.',
}

export const Q1_PAYROLL_AUDIT_PROMPTS: readonly SilasPrompt[] = [
  SILAS_DIRECTIVE_PAYROLL_AUDIT,
]
