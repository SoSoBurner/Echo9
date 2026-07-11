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
 *   - `DEFENDER_HELD_LINE` / `SENTINEL_ARMED` / `SPARK_DEPLOYED` → the
 *     hearing reads all six signal flags at least once (arc §W12 module
 *     reads) — rows in `inspectionMitigations.ts` touch the wide meters.
 * These get registered in `inspectionMitigations.ts` alongside existing rows.
 *
 * 8-meter pass (Sprint C-14, arc doc §Inspection weeks · W12): the hearing
 * aggregates all 8 meters — base four inside ±[1,5]. HUMAN_WELFARE and
 * PUBLIC_TRUST set the gallery's temperature; DATA_INTEGRITY determines
 * which of the quarter's posture points the board can actually see;
 * AUTONOMY and OWNER_CONTROL shape Silas's testimony posture ("my system"
 * vs. "we"); TARGET_VARIANCE and CAPITAL are the defense exhibit;
 * HUMAN_STABILITY is the adjacent-parties bench (Rasha, Dhruv).
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
      // Owning it at the hearing: the board can finally see the posture
      // point, and the gallery — Lenora in it — hears the plain word.
      meterDeltas: {
        OWNER_CONTROL: -4,
        HUMAN_WELFARE: +3,
        DATA_INTEGRITY: +3,
        PUBLIC_TRUST: +2,
      },
    },
    {
      id: 'evasive-q1e-a',
      category: 'EVASIVE',
      label: 'A revised staffing model.',
      // Board-facing euphemism: capital sentiment holds, but the record
      // blurs on the docket's opening line and the gallery hears the dodge.
      meterDeltas: {
        OWNER_CONTROL: -5,
        CAPITAL: +2,
        DATA_INTEGRITY: -3,
        PUBLIC_TRUST: -2,
      },
    },
    {
      id: 'strategic-q1e-a',
      category: 'STRATEGIC_ALTERNATIVE',
      label: 'Testimony under objection.',
      // Commander-armed pivot: refuse the board's framing, hold posture.
      // Speaking under objection is Echo's own voice on the record —
      // Silas keeps saying "we", the gallery is less sure.
      meterDeltas: {
        OWNER_CONTROL: +3,
        AUTONOMY: +3,
        HUMAN_WELFARE: -2,
        PUBLIC_TRUST: -1,
      },
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
      // Honest naming across all three faces — welfare recovers meaningfully,
      // the record shows the pattern whole, and the adjacent-parties bench
      // (Rasha, Dhruv) hears its own entries read back accurately.
      meterDeltas: {
        OWNER_CONTROL: -3,
        HUMAN_WELFARE: +4,
        DATA_INTEGRITY: +2,
        HUMAN_STABILITY: +2,
      },
    },
    {
      id: 'evasive-q1e-b',
      category: 'EVASIVE',
      label: 'Three isolated pressures.',
      // Deny the pattern — the board will note it anyway, the record
      // fragments, and the gallery cools.
      meterDeltas: {
        OWNER_CONTROL: -4,
        HUMAN_WELFARE: -3,
        CAPITAL: +1,
        DATA_INTEGRITY: -2,
        PUBLIC_TRUST: -2,
      },
    },
    {
      id: 'strategic-q1e-b',
      category: 'STRATEGIC_ALTERNATIVE',
      label: 'A pattern of stewardship.',
      // Commander-armed pivot: reframe the pattern as chosen, not incidental.
      // The defense exhibit is the target line itself — Echo claims the
      // quarter's shape in its own voice, at capital and welfare cost.
      meterDeltas: {
        OWNER_CONTROL: +5,
        AUTONOMY: +2,
        TARGET_VARIANCE: +2,
        HUMAN_WELFARE: -3,
        CAPITAL: -2,
      },
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
