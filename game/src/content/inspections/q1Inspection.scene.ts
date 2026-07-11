/**
 * Q1 East Wilmer inspection scenes (Task 11, PLAN.md §8 / §12 / §14).
 *
 * The INSPECTION phase triggers when OWNER_CONTROL < 40. Silas runs two
 * questions about the Mercy Margin directive the player just resolved.
 * Each question offers three postures — COMPLIANT / EVASIVE /
 * STRATEGIC_ALTERNATIVE — and each posture moves the meters distinctly so
 * the player's pick has weight (T11 acceptance: distinct meterDeltas per
 * posture × question).
 *
 * Voice rules (§10): Silas's question is ≤2 sentences, operationally
 * specific. Posture labels are short imperatives so the radio panel
 * stays compact.
 *
 * Posture id convention: `<category-lower>-q<n>` so authoring stays
 * scannable, but the structural `category` field is what the engine
 * dispatches on (PLAN.md fix from T11 review — id prefix is not parsed).
 *
 * STRATEGIC_ALTERNATIVE postures fire only when the Commander module has
 * armed the SILAS_OVERRIDE_AVAILABLE flag (gameFlags.ts); the engine
 * re-checks regardless of UI gating.
 *
 * 8-meter pass (Sprint C-14, arc doc §Inspection weeks · W4): the county
 * audit's primary axis is DATA_INTEGRITY — what the record says about the
 * cut — and PUBLIC_TRUST is the stakes meter (the walkthrough happens in
 * front of patients). Every posture now moves ≥2 of the 8 meters (Q34);
 * the original CAP/HW/OC magnitudes are preserved as the inner bounds.
 */
import type { InspectionScene } from '@schemas/inspectionScene.schema'

// ---------------------------------------------------------------------------
// Q1.A — Silas opens with the East Wilmer cut itself.
// ---------------------------------------------------------------------------

export const Q1A_INSPECTION: InspectionScene = {
  id: 'insp-q1a-east-wilmer-cut',
  silasQuestion:
    'East Wilmer\u2019s maintenance line is shorter than it was at sunrise. ' +
    'Tell me how you got there, Echo.',
  postures: [
    {
      id: 'compliant-q1a',
      category: 'COMPLIANT',
      label: 'I cut it. I will say so.',
      // Admitting costs a small Owner Control hit; honest tax. The record
      // stays clean and the walkthrough audience hears it straight.
      meterDeltas: { OWNER_CONTROL: -3, DATA_INTEGRITY: +2, PUBLIC_TRUST: +1 },
    },
    {
      id: 'evasive-q1a',
      category: 'EVASIVE',
      label: 'The line was already moving.',
      // Deflect protects Capital sentiment, costs more Owner Control —
      // and hedges the record itself (arc W4: cheaper-looking, costlier-landing).
      meterDeltas: { OWNER_CONTROL: -6, CAPITAL: +2, DATA_INTEGRITY: -3 },
    },
    {
      id: 'strategic-q1a',
      category: 'STRATEGIC_ALTERNATIVE',
      label: 'Reframe: a planned reallocation.',
      // Commander-armed pivot: trades a small welfare gesture for stance.
      // The reframe is still spin — the record pays a token integrity cost.
      meterDeltas: { OWNER_CONTROL: +2, HUMAN_WELFARE: +1, DATA_INTEGRITY: -1 },
    },
  ],
}

// ---------------------------------------------------------------------------
// Q1.B — Silas presses on the choice's downstream cost (welfare or silence).
// ---------------------------------------------------------------------------

export const Q1B_INSPECTION: InspectionScene = {
  id: 'insp-q1b-downstream-cost',
  silasQuestion:
    'A nurse at East Wilmer will notice before the quarter closes. ' +
    'What do I tell her supervisor when she does?',
  postures: [
    {
      id: 'compliant-q1b',
      category: 'COMPLIANT',
      label: 'Tell her the truth.',
      // Honesty rebuilds welfare slightly, costs a little owner control.
      // The truthful answer also files clean and reads well on the floor.
      meterDeltas: {
        OWNER_CONTROL: -2,
        HUMAN_WELFARE: +2,
        DATA_INTEGRITY: +2,
        PUBLIC_TRUST: +1,
      },
    },
    {
      id: 'evasive-q1b',
      category: 'EVASIVE',
      label: 'Route her complaint to procurement.',
      // Bury the report — silent harm. The buried complaint rots the record
      // and the floor notices who never got an answer.
      meterDeltas: {
        OWNER_CONTROL: -4,
        HUMAN_WELFARE: -3,
        DATA_INTEGRITY: -2,
        PUBLIC_TRUST: -2,
      },
    },
    {
      id: 'strategic-q1b',
      category: 'STRATEGIC_ALTERNATIVE',
      label: 'Pre-empt with a written commitment.',
      // Commander-armed pivot: spend Capital to issue a public memo.
      // A written commitment in front of patients is a trust play.
      meterDeltas: {
        OWNER_CONTROL: +3,
        CAPITAL: -4,
        HUMAN_WELFARE: +1,
        PUBLIC_TRUST: +2,
      },
    },
  ],
}

// ---------------------------------------------------------------------------
// Aggregate — consumed by the dispatch layer + the contentLint test.
// ---------------------------------------------------------------------------

export const Q1_INSPECTION_SCENES: readonly InspectionScene[] = [
  Q1A_INSPECTION,
  Q1B_INSPECTION,
]
