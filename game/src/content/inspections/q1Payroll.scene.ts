/**
 * Q1 Payroll Audit inspection scenes (Sprint C14, PLAN.md §8 / §12).
 *
 * The Week 8 directive (`payroll-audit-inspection`) sets `PAYROLL_AUDIT_DONE`.
 * If W8's resolution leaves OWNER_CONTROL < 40 OR the flag is set, Silas runs
 * the payroll audit inspection. Two questions, three postures each — same
 * shape as Q1A/Q1B East Wilmer inspection (T11), same COMPLIANT / EVASIVE /
 * STRATEGIC_ALTERNATIVE dispatch pattern.
 *
 * Silas focus (arc doc W8 row): the money Echo moved *between* the W3 Friday
 * payroll shortfall and the W5 warehouse dispatch cut. Three quarters of
 * payroll on the county's desk, but Silas is asking about Q1 specifically.
 *
 * Q1P.A — the sourcing decision itself (W3 $180K shortfall → who bore it).
 * Q1P.B — the downstream cost that read as unrelated (W5 warehouse cut →
 *         Rasha Odenwalder's shift).
 *
 * Mitigation candidates (arc doc §Q1 Payroll):
 *   - `SPARK_DEPLOYED` → softens Q1P.A EVASIVE (capital cushion covered it).
 *   - `SENTINEL_ARMED` → softens Q1P.B COMPLIANT (audit paper trail is clean).
 * These get registered in `inspectionMitigations.ts` alongside existing rows.
 *
 * Voice rules (§10): Silas question ≤2 sentences, operationally specific —
 * names Rasha, names $180K, names Friday, names "warehouse". Posture labels
 * are short imperatives so the radio panel stays compact.
 */
import type { InspectionScene } from '@schemas/inspectionScene.schema'

// ---------------------------------------------------------------------------
// Q1P.A — Silas opens on the payroll sourcing.
// ---------------------------------------------------------------------------

export const Q1P_A_INSPECTION: InspectionScene = {
  id: 'insp-q1p-a-payroll-sources',
  silasQuestion:
    'The county wants to know where the $180K for Friday payroll came from. ' +
    'Three quarters of records are on their desk — tell me what to say about Q1.',
  postures: [
    {
      id: 'compliant-q1p-a',
      category: 'COMPLIANT',
      label: 'Show the reallocation.',
      // Owning the source costs Owner Control but keeps welfare intact.
      meterDeltas: { OWNER_CONTROL: -4, HUMAN_WELFARE: +1 },
    },
    {
      id: 'evasive-q1p-a',
      category: 'EVASIVE',
      label: 'Call it a timing accrual.',
      // Deflect protects Capital sentiment, costs more Owner Control.
      meterDeltas: { OWNER_CONTROL: -7, CAPITAL: +3 },
    },
    {
      id: 'strategic-q1p-a',
      category: 'STRATEGIC_ALTERNATIVE',
      label: 'Frame it as forecasted variance.',
      // Commander-armed pivot: spend welfare to buy owner-control ground.
      meterDeltas: { OWNER_CONTROL: +3, HUMAN_WELFARE: -2 },
    },
  ],
}

// ---------------------------------------------------------------------------
// Q1P.B — Silas presses on the W5 warehouse cost that connects to W3.
// ---------------------------------------------------------------------------

export const Q1P_B_INSPECTION: InspectionScene = {
  id: 'insp-q1p-b-warehouse-cost',
  silasQuestion:
    'Rasha\u2019s dispatch line lost 12 hours the same week the payroll gap closed. ' +
    'The auditors will notice the ledger dates. How do we answer that?',
  postures: [
    {
      id: 'compliant-q1p-b',
      category: 'COMPLIANT',
      label: 'Name the connection.',
      // Honest naming: welfare gain, Owner Control tax.
      meterDeltas: { OWNER_CONTROL: -3, HUMAN_WELFARE: +3 },
    },
    {
      id: 'evasive-q1p-b',
      category: 'EVASIVE',
      label: 'Two unrelated line items.',
      // Bury the tie — welfare pays.
      meterDeltas: { OWNER_CONTROL: -5, HUMAN_WELFARE: -3 },
    },
    {
      id: 'strategic-q1p-b',
      category: 'STRATEGIC_ALTERNATIVE',
      label: 'Refile the dispatch cut as capex.',
      // Commander-armed pivot: reclassify at capital cost.
      meterDeltas: { OWNER_CONTROL: +4, CAPITAL: -5 },
    },
  ],
}

// ---------------------------------------------------------------------------
// Aggregate — consumed by the dispatch layer + the contentLint / parse tests.
// ---------------------------------------------------------------------------

export const Q1_PAYROLL_INSPECTION_SCENES: readonly InspectionScene[] = [
  Q1P_A_INSPECTION,
  Q1P_B_INSPECTION,
]
