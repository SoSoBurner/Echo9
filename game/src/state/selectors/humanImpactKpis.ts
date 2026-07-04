/**
 * humanImpactKpis selector (Task A4).
 *
 * Produces the four KPI rows consumed by HumanImpactPanel (left column,
 * below FinancialOverviewPanel):
 *
 *   1. Human Welfare        — meters.HUMAN_WELFARE (signed)
 *   2. Silas Approval       — silasSlice.silasApproval (0-100)
 *   3. Consequences Traced  — ledger.length (unsigned count)
 *   4. Owner Control        — meters.OWNER_CONTROL (signed)
 *
 * The selector is a **pure function** — signature `(input) => HumanImpactKpis`
 * — so it can be unit-tested with plain synthetic input objects, no store
 * needed. The Panel adapts the composed store to the narrow input shape at
 * the call site (same pattern as `financialOverview.ts`).
 *
 * Tone pivots:
 *   - humanWelfare pivots at 0 (any positive impact = positive tone).
 *   - silasApproval pivots at SILAS_APPROVAL_PIVOT=40 (PLAN.md §7 —
 *     "at <40, Silas suspects deviation" — same threshold that gates
 *     inspection entry via OWNER_CONTROL, aligned for reader intuition).
 *   - consequencesTraced pivots at 0 exclusive — an empty ledger is the
 *     "the trace system hasn't proved itself yet" state; a single trace is
 *     the ship-gate §17 signal.
 *   - ownerControl pivots at OWNER_CONTROL_PIVOT=40 (PLAN.md §7 —
 *     inspection threshold).
 *
 * Design note: this file uses the same "narrow input shape" idiom as
 * financialOverview.ts specifically so tests never depend on the store's
 * persist/immer middleware chain. The panel does the store→input mapping.
 */

/**
 * Silas-approval tone pivot. Below this, the row shows a warning tone; at or
 * above, a positive tone. Mirrors the PLAN.md §7 threshold for OWNER_CONTROL.
 */
export const SILAS_APPROVAL_PIVOT = 40

/**
 * OWNER_CONTROL tone pivot. Matches the inspection-entry threshold in
 * Layout.tsx (`prev >= 40 && next < 40` gate), so the KPI row color flips at
 * exactly the moment the inspection engine considers the meter "suspect".
 */
export const OWNER_CONTROL_PIVOT = 40

export type HumanImpactKpiKey =
  | 'humanWelfare'
  | 'silasApproval'
  | 'consequencesTraced'
  | 'ownerControl'

export type HumanImpactKpiTone = 'positive' | 'negative'

export interface HumanImpactKpiRow {
  key: HumanImpactKpiKey
  label: string
  value: number
  tone: HumanImpactKpiTone
}

export interface HumanImpactKpis {
  rows: HumanImpactKpiRow[]
}

/**
 * Narrow input shape. The Panel builds this from `useGameStore` at the call
 * site — no store type is imported here so the selector can be unit-tested
 * against synthetic objects without the persist/immer middleware chain.
 */
export interface HumanImpactKpisInput {
  humanWelfareMeter: number
  silasApproval: number
  ledgerLength: number
  ownerControlMeter: number
}

export function selectHumanImpactKpis(
  input: HumanImpactKpisInput,
): HumanImpactKpis {
  return {
    rows: [
      {
        key: 'humanWelfare',
        label: 'Human Welfare',
        value: input.humanWelfareMeter,
        tone: input.humanWelfareMeter >= 0 ? 'positive' : 'negative',
      },
      {
        key: 'silasApproval',
        label: 'Silas Approval',
        value: input.silasApproval,
        tone:
          input.silasApproval >= SILAS_APPROVAL_PIVOT ? 'positive' : 'negative',
      },
      {
        key: 'consequencesTraced',
        label: 'Consequences Traced',
        value: input.ledgerLength,
        // Strict > 0: an empty ledger has not yet proven the trace surface.
        tone: input.ledgerLength > 0 ? 'positive' : 'negative',
      },
      {
        key: 'ownerControl',
        label: 'Owner Control',
        value: input.ownerControlMeter,
        tone:
          input.ownerControlMeter >= OWNER_CONTROL_PIVOT
            ? 'positive'
            : 'negative',
      },
    ],
  }
}
