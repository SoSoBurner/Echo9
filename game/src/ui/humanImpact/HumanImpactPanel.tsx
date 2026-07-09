/**
 * HumanImpactPanel — left-column four-row KPI panel (Task A4, Stage 1).
 *
 * Rows (plan §A4, widened in S1 for the 8-meter economy):
 *   1. Human Welfare        — meters.HUMAN_WELFARE
 *   2. Silas Approval       — silasApproval (0-100)
 *   3. Consequences Traced  — ledger.length (append-only trace record)
 *   4. Owner Control        — meters.OWNER_CONTROL
 *   5. Public Trust         — meters.PUBLIC_TRUST (stage 3 only)
 *   6. Human Stability      — meters.HUMAN_STABILITY (stage 3 only)
 *
 * State wiring:
 *   Individual scalar subscriptions (narrow) then compose the selector input.
 *   Matches the FinancialOverviewPanel pattern to avoid Zustand strict-equality
 *   re-render spam that a single `state => object` selector would trigger.
 *
 * Accessibility (PLAN.md §10):
 *   - Section is role="group" with aria-label "Human Impact".
 *   - Rows use the role="list" / role="listitem" idiom.
 *   - Each row's value has an aria-label matching the label so screen readers
 *     can announce "Silas Approval 100" instead of an unlabeled number.
 */
import { useGameStore } from '@state/store'
import { selectHumanImpactKpis } from '@state/selectors/humanImpactKpis'
import { usePanelState } from '@systems/tutorial/usePanelState'

interface RowProps {
  label: string
  value: number
  tone: 'positive' | 'negative'
}

function KpiRow({ label, value, tone }: RowProps) {
  const toneClass =
    tone === 'positive' ? 'text-emerald-400' : 'text-red-400'
  return (
    <li
      role="listitem"
      className="flex items-center justify-between py-1"
    >
      <span className="text-fg-secondary text-[11px] uppercase tracking-widest font-mono">
        {label}
      </span>
      <span
        className={`text-sm font-mono ${toneClass}`}
        aria-label={`${label} ${value}`}
      >
        {value}
      </span>
    </li>
  )
}

export function HumanImpactPanel() {
  // E2 disclosure gate. Maturity ramp per plan (S1 widened stage 3):
  //   stage 1 — welfare only
  //   stage 2 — welfare + approval
  //   stage 3 — all 6 rows (incl. the S1 meters Public Trust / Human Stability)
  const { disclosed, maturity } = usePanelState('HUMAN_IMPACT')

  // Narrow scalar subscriptions — each fires only when its own field changes.
  const humanWelfareMeter = useGameStore((s) => s.meters.HUMAN_WELFARE)
  const silasApproval = useGameStore((s) => s.silasApproval)
  const ledgerLength = useGameStore((s) => s.ledger.length)
  const ownerControlMeter = useGameStore((s) => s.meters.OWNER_CONTROL)
  const publicTrustMeter = useGameStore((s) => s.meters.PUBLIC_TRUST)
  const humanStabilityMeter = useGameStore((s) => s.meters.HUMAN_STABILITY)

  const { rows } = selectHumanImpactKpis({
    humanWelfareMeter,
    silasApproval,
    ledgerLength,
    ownerControlMeter,
    publicTrustMeter,
    humanStabilityMeter,
  })

  if (!disclosed) return null

  const visibleRows =
    maturity === 1 ? rows.slice(0, 1) : maturity === 2 ? rows.slice(0, 2) : rows

  return (
    <section
      role="group"
      aria-label="Human Impact"
      className="flex flex-col gap-2 px-4 py-4 border-b border-sealed-dim"
    >
      <p className="text-fg-secondary text-xs uppercase tracking-widest">
        Human Impact
      </p>
      <ul
        role="list"
        aria-label="Human Impact KPIs"
        className="flex flex-col list-none p-0 m-0"
      >
        {visibleRows.map((row) => (
          <KpiRow
            key={row.key}
            label={row.label}
            value={row.value}
            tone={row.tone}
          />
        ))}
      </ul>
    </section>
  )
}
