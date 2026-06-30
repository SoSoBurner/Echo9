/**
 * TopBar — displays quarter/week, current phase, and a pause control.
 *
 * Reads `phase` from useGameStore. Quarter/week are hardcoded for T8;
 * T14 will wire real time tracking.
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

export function TopBar() {
  const phase = useGameStore((s) => s.phase)

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

      <div className="flex items-center gap-4">
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
