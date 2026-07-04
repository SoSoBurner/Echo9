/**
 * TopBar — displays quarter/week, current phase, target variance,
 * Silas approval percent, and a pause control.
 *
 * Reads `phase`, `meters.CAPITAL`, and `silasApproval` from useGameStore.
 * Quarter/week are hardcoded for T8; T14 will wire real time tracking.
 *
 * Target Variance (A1): the mockup treats the CAPITAL meter as a millions-of-
 * dollars reading against a fixed quarter target. Stage 1 fixes the target
 * at 50 (mid-scale) so the display shows a signed millions delta; later
 * tasks will source both target and scaling from real quarter state.
 */
import { useGameStore } from '@state/store'

const PHASE_LABELS: Record<string, string> = {
  BOOT: 'Boot',
  FIRST_DIRECTIVE: 'Directive',
  FIRST_RESULT: 'Result',
  MODULE_INSTALL: 'Module Install',
  INSPECTION: 'Inspection',
  CONSEQUENCE_RETURN: 'Consequence Return',
  END_OF_SLICE: 'End of Slice',
}

const QUARTER_TARGET_CAPITAL = 50

function formatVarianceM(variance: number): string {
  const sign = variance >= 0 ? '+' : '-'
  return `${sign}$${Math.abs(variance).toFixed(1)}M`
}

export function TopBar() {
  const phase = useGameStore((s) => s.phase)
  const capitalMeter = useGameStore((s) => s.meters.CAPITAL)
  const silasApproval = useGameStore((s) => s.silasApproval)

  const variance = capitalMeter - QUARTER_TARGET_CAPITAL

  return (
    <header
      className="flex items-center justify-between px-6 py-3 border-b border-sealed-dim bg-background"
      aria-label="HUD top bar"
    >
      <div className="flex items-center gap-6">
        <span className="text-fg-secondary text-xs uppercase tracking-widest font-mono">
          Q1 W1
        </span>
        <span className="text-fg-primary text-sm font-mono">
          {PHASE_LABELS[phase] ?? phase}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div
          className="flex flex-col items-end leading-tight"
          role="group"
          aria-label="Target Variance"
        >
          <span className="text-fg-secondary text-[10px] uppercase tracking-widest font-mono">
            Target Variance
          </span>
          <span
            className={`text-sm font-mono ${variance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
          >
            {formatVarianceM(variance)}
          </span>
        </div>
        <div
          className="flex flex-col items-end leading-tight"
          role="group"
          aria-label="Silas Approval"
        >
          <span className="text-fg-secondary text-[10px] uppercase tracking-widest font-mono">
            Silas Approval
          </span>
          <span className="text-fg-primary text-sm font-mono">
            {silasApproval}%
          </span>
        </div>
        <span className="text-fg-secondary text-xs uppercase tracking-widest">Echo 9</span>
        <button
          type="button"
          aria-label="Pause game"
          className="
            text-fg-secondary text-xs uppercase tracking-widest
            border border-sealed-dim px-3 py-1
            hover:border-null-accent hover:text-fg-primary
            focus:outline-none focus:ring-2 focus:ring-null-accent
            transition-colors
          "
        >
          ⚙ Pause
        </button>
      </div>
    </header>
  )
}
