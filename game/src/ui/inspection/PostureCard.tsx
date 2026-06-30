/**
 * PostureCard — one radio option inside the InspectionPanel radiogroup.
 *
 * Mirrors ChoiceCard's roving-tabindex pattern. The structural `category`
 * (COMPLIANT / EVASIVE / STRATEGIC_ALTERNATIVE) is shown as a small
 * uppercase tag so the player can read the engine's frame, not just the
 * posture label.
 *
 * STRATEGIC_ALTERNATIVE without the precondition flag renders disabled —
 * the engine ALSO re-checks (UI gating is advisory; engine gating is the
 * real safety net per inspectionEngine.ts step 2).
 */
import type React from 'react'
import type { InspectionPosture } from '@schemas/inspectionScene.schema'

interface PostureCardProps {
  posture: InspectionPosture
  index: number
  selected: boolean
  disabled: boolean
  onSelect: () => void
  onCommit: () => void
  ref?: React.Ref<HTMLElement>
}

const METER_SHORT: Record<string, string> = {
  CAPITAL: 'CAP',
  HUMAN_WELFARE: 'HW',
  OWNER_CONTROL: 'OC',
}

const CATEGORY_LABEL: Record<InspectionPosture['category'], string> = {
  COMPLIANT: 'Comply',
  EVASIVE: 'Evade',
  STRATEGIC_ALTERNATIVE: 'Pivot',
}

export function PostureCard({
  posture,
  index,
  selected,
  disabled,
  onSelect,
  onCommit,
  ref,
}: PostureCardProps) {
  const deltas = Object.entries(posture.meterDeltas ?? {})

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onCommit()
    }
  }

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled || undefined}
      tabIndex={selected && !disabled ? 0 : -1}
      onClick={disabled ? undefined : onSelect}
      onKeyDown={handleKeyDown}
      className={[
        'flex items-start gap-3 px-4 py-3',
        'border focus:outline-none focus:ring-2 focus:ring-null-accent',
        disabled
          ? 'border-sealed-dim text-fg-secondary opacity-50 cursor-not-allowed'
          : selected
            ? 'border-null-accent bg-background cursor-pointer'
            : 'border-sealed-dim hover:border-fg-secondary bg-background cursor-pointer',
      ].join(' ')}
    >
      <span
        className={[
          'shrink-0 w-5 h-5 flex items-center justify-center',
          'text-xs font-mono border',
          selected && !disabled
            ? 'border-null-accent text-null-accent'
            : 'border-sealed-dim text-fg-secondary',
        ].join(' ')}
        aria-hidden="true"
      >
        {index + 1}
      </span>

      <div className="flex-1 space-y-1">
        <div className="flex items-baseline gap-2">
          <span
            className="text-fg-secondary text-[10px] font-mono uppercase tracking-widest"
            aria-label={`Category: ${posture.category}`}
          >
            {CATEGORY_LABEL[posture.category]}
          </span>
          <p className="text-fg-primary text-sm leading-snug">{posture.label}</p>
        </div>

        {deltas.length > 0 && (
          <div className="flex flex-wrap gap-2" aria-label="Meter effects">
            {deltas.map(([key, val]) => {
              const positive = (val ?? 0) >= 0
              return (
                <span
                  key={key}
                  className={[
                    'text-xs font-mono',
                    positive ? 'text-null-accent' : 'text-warn',
                  ].join(' ')}
                  aria-label={`${METER_SHORT[key] ?? key} ${positive ? '+' : ''}${val}`}
                >
                  {METER_SHORT[key] ?? key} {positive ? '+' : ''}{val}
                </span>
              )
            })}
          </div>
        )}

        {disabled && posture.category === 'STRATEGIC_ALTERNATIVE' && (
          <p className="text-fg-secondary text-[10px] italic mt-1">
            Requires Commander module override.
          </p>
        )}
      </div>
    </div>
  )
}
