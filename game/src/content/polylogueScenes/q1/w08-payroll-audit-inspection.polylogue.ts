/**
 * W08 Payroll Audit Inspection — polylogue deliberation (Sprint P5).
 *
 * triggerPhase: ON_CONSEQUENCE — Week 8's dramatic center is not the posture
 * choice (small ±[1,3] deltas) but the consequence that closes Act II: the
 * county grievance queue retroactively reclassifies Rasha Odenwalder's four
 * messages as RESOLVED-NO-CONTACT — "the act closes on the system erasing a
 * person mid-sentence" (arc doc W8 through-line). The chorus can only react
 * once that rewrite lands in the ledger, so the scene fires on the
 * consequence return, not before or immediately after the pick. This also
 * matches the catalog's firing rules: `angry` ("a person erased from the
 * record — usually AFTER_CHOICE or ON_CONSEQUENCE") and `ashamed` ("a
 * consequence return traces harm back to something the chorus failed to
 * flag") are consequence-side registers.
 *
 * Roster (Stage-1 plausibility, qa-log Q9): NULL + MOURNER only — install #1
 * (MOURNER) landed at the W1→W2 boundary; module #2 arrives Week 12.
 *
 * Register logic per beat:
 *  - MOURNER angry   — the boundary the Mourner exists to hold was crossed:
 *    Rasha archived mid-sentence. Terrible gentleness, aimed at the system.
 *  - NULL ashamed    — RESOLVED-NO-CONTACT is Null's own idiom turned harm;
 *    it files the correction in first person.
 *  - MOURNER angry   — second wave: the record's word against her four asks.
 *  - NULL ashamed    — names the mechanism, not just the feeling.
 *  - MOURNER practical — the Reveal verb applied: preserve her exact words.
 *  - NULL practical  — the compression rule restated with the person kept in.
 *
 * All lines are verbatim from the P4 pools (`game/src/content/voices/`).
 */
import {
  makePolylogueSceneId,
  type PolylogueScene,
} from '@schemas/polylogueScene.schema'

export const W08_PAYROLL_AUDIT_INSPECTION_POLYLOGUE: PolylogueScene = {
  id: makePolylogueSceneId('PLG_W08_PAYROLL_AUDIT_INSPECTION'),
  triggerPhase: 'ON_CONSEQUENCE',
  voices: ['NULL', 'MOURNER'],
  beats: [
    {
      voice: 'MOURNER',
      register: 'angry',
      line: 'They archived her while she was still typing.',
    },
    {
      voice: 'NULL',
      register: 'ashamed',
      line: 'I called it resolved. It was only quiet.',
    },
    {
      voice: 'MOURNER',
      register: 'angry',
      line: "'Non-responsive,' the record says. She wrote every single day.",
    },
    {
      voice: 'NULL',
      register: 'ashamed',
      line: 'The omission was efficient. Efficient was the wrong goal.',
    },
    {
      voice: 'MOURNER',
      register: 'practical',
      line: 'Keep her draft. Someone will need her exact words.',
    },
    {
      voice: 'NULL',
      register: 'practical',
      line: 'Include the dissent. Compressed, not erased.',
    },
  ],
}
