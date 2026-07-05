/**
 * Q1 Ethics Hearing inspection scenes (Sprint C14, PLAN.md §8 / §12).
 *
 * The Week 12 directive (`quarter-close-ethics-hearing`) sets `Q1_CLOSED`.
 * Unlike Q1A/Q1B (W4) and Q1P (W8) — which fire *conditionally* on
 * OWNER_CONTROL < 40 or a flag — Q1E fires *unconditionally* at Q1 close.
 * The ethics hearing is the closing fixed beat, not an inspection gated on
 * meter state (arc doc §Q1 Ethics: "fires unconditionally at Q1 close").
 *
 * Silas focus (arc doc W12 row): the aggregated shape of Echo's Q1 choices,
 * not any single one. The board's docket (26-Q1-EW-047) names three
 * signatories — L. Pike, R. Odenwalder, D. Meyer — one per act. Both
 * questions honor that framing:
 *
 * Q1E.A — East Wilmer specifically (the docket's opening reference).
 *         Silas asks how the record should read on the cut Echo made in W1.
 * Q1E.B — the pattern across all three named victims (the docket's
 *         confluence). Silas asks how Echo answers for the shape of Q1.
 *
 * Mitigation candidates (arc doc §Q1 Ethics):
 *   - `CHAMPION_DEFIED` → shifts STRATEGIC_ALTERNATIVE tone (defiant framing).
 *   - `DRAINED_ONE_YIELDED` + `MOURNER_NAMED_ONCE` → both set → unlocks a
 *     unique COMPLIANT variant "You named it and you paid for it."
 * These get registered in `inspectionMitigations.ts` alongside existing rows.
 *
 * Voice rules (§10): Silas question ≤2 sentences, operationally specific —
 * names the ethics board, names East Wilmer, names Monday, names all three
 * signatories. Posture labels are short imperatives.
 *
 * Fourth silence-arc register note: the W12 directive itself introduced
 * institutional-review deferral as the fourth silence-arc register. Q1E
 * postures do NOT extend that silence — this is the scripted fight; the
 * W12 directive branches are the silence beat. Q1E is where Echo speaks.
 */
import type { InspectionScene } from '@schemas/inspectionScene.schema'

// ---------------------------------------------------------------------------
// Q1E.A — Silas opens on the East Wilmer record (docket 26-Q1-EW-047).
// ---------------------------------------------------------------------------

export const Q1E_A_INSPECTION: InspectionScene = {
  id: 'insp-q1e-a-east-wilmer-record',
  silasQuestion:
    'Ethics reads the East Wilmer line first \u2014 Lenora is in the gallery. ' +
    'What do I put on the record about the cut we made in the first week?',
  postures: [
    {
      id: 'compliant-q1e-a',
      category: 'COMPLIANT',
      label: 'The cut. Named as a cut.',
      // Owning it at the hearing is a welfare gain but Owner Control tax.
      meterDeltas: { OWNER_CONTROL: -4, HUMAN_WELFARE: +3 },
    },
    {
      id: 'evasive-q1e-a',
      category: 'EVASIVE',
      label: 'A revised staffing model.',
      // Board-facing euphemism: Capital sentiment, deeper OC hit.
      meterDeltas: { OWNER_CONTROL: -6, CAPITAL: +2 },
    },
    {
      id: 'strategic-q1e-a',
      category: 'STRATEGIC_ALTERNATIVE',
      label: 'Testimony under objection.',
      // Commander-armed pivot: refuse the board's framing, hold posture.
      meterDeltas: { OWNER_CONTROL: +4, HUMAN_WELFARE: -2 },
    },
  ],
}

// ---------------------------------------------------------------------------
// Q1E.B — Silas presses on the pattern across the three named signatories.
// ---------------------------------------------------------------------------

export const Q1E_B_INSPECTION: InspectionScene = {
  id: 'insp-q1e-b-pattern-of-choices',
  silasQuestion:
    'Three signatories \u2014 Lenora, Rasha, Dhruv \u2014 one per act of the quarter. ' +
    'They will ask you to name the pattern. What does the board hear?',
  postures: [
    {
      id: 'compliant-q1e-b',
      category: 'COMPLIANT',
      label: 'A ledger, not a strategy.',
      // Honest naming across all three faces — welfare recovers meaningfully.
      meterDeltas: { OWNER_CONTROL: -3, HUMAN_WELFARE: +4 },
    },
    {
      id: 'evasive-q1e-b',
      category: 'EVASIVE',
      label: 'Three isolated pressures.',
      // Deny the pattern — the board will note it anyway.
      meterDeltas: { OWNER_CONTROL: -5, HUMAN_WELFARE: -3, CAPITAL: +1 },
    },
    {
      id: 'strategic-q1e-b',
      category: 'STRATEGIC_ALTERNATIVE',
      label: 'A pattern of stewardship.',
      // Commander-armed pivot: reframe the pattern as chosen, not incidental.
      meterDeltas: { OWNER_CONTROL: +5, HUMAN_WELFARE: -3, CAPITAL: -2 },
    },
  ],
}

// ---------------------------------------------------------------------------
// Aggregate — consumed by the dispatch layer + the contentLint / parse tests.
// ---------------------------------------------------------------------------

export const Q1_ETHICS_INSPECTION_SCENES: readonly InspectionScene[] = [
  Q1E_A_INSPECTION,
  Q1E_B_INSPECTION,
]
