/**
 * TopBar — displays quarter/week, current phase, target variance,
 * Silas approval percent, and a pause control.
 *
 * Reads `phase`, `meters.CAPITAL`, and `silasApproval` from useGameStore.
 * Week label (Sprint C15b) is derived from `selectCurrentWeek`, which scans
 * Q1_SEQUENCE for the first unresolved week — the same rule Layout.tsx uses
 * to render the current directive. When Q1 is closed the label falls back
 * to "Q1 W12" so the header still reads coherently at the terminal.
 *
 * Target Variance (A1): the mockup treats the CAPITAL meter as a millions-of-
 * dollars reading against a fixed quarter target. Stage 1 fixes the target
 * at 50 (mid-scale) so the display shows a signed millions delta; later
 * tasks will source both target and scaling from real quarter state.
 */
import { useGameStore } from '@state/store'
import { selectCurrentWeek } from '@state/selectors/currentWeek'

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
  const currentWeek = useGameStore(selectCurrentWeek)

  const variance = capitalMeter - QUARTER_TARGET_CAPITAL
  const weekLabel = `Q1 W${currentWeek ?? 12}`

  return (
    <header
      className="flex items-center justify-between px-6 py-3 border-b border-sealed-dim bg-background"
      aria-label="HUD top bar"
    >
      <div className="flex items-center gap-6">
        {/* V6 mockup parity: the brand anchors the LEFT edge of the bar
            (the mockup's "ECHO 9" wordmark position), with week + phase
            reading as the chapter strip beside it. */}
        <span className="text-fg-primary text-sm font-semibold uppercase tracking-[0.3em]">
          Echo 9
        </span>
        <span
          className="text-fg-secondary text-xs uppercase tracking-widest font-mono tabular-nums"
          aria-label="Current week"
        >
          {weekLabel}
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
            className={`text-sm font-mono tabular-nums ${variance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
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
          <span className="text-fg-primary text-sm font-mono tabular-nums">
            {silasApproval}%
          </span>
        </div>
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
