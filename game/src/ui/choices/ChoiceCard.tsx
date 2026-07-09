/**
 * ChoiceCard — individual radio option within the ChoicePanel radiogroup.
 *
 * S2: renders a DisplayOption (optionSurface output) instead of a raw
 * ChoiceNode. Displays: number badge, label, meter delta hints, and — on
 * MODULE_VERB options — a voice identity chip like [MOURNER · REVEAL] plus,
 * on rank-3 conflict variants, the "— conflicts with directive —" rule line.
 * Static styling only (no animation; nothing to gate on reduced-motion).
 *
 * Role: radio (part of radiogroup in ChoicePanel).
 * Keyboard: arrows handled by radiogroup, Enter/Space to commit.
 */
import type React from 'react'
import type { DisplayOption } from '@systems/consciousness/optionSurface'

interface ChoiceCardProps {
  option: DisplayOption
  index: number
  selected: boolean
  onSelect: () => void
  onCommit: () => void
  ref?: React.Ref<HTMLElement>
}

const METER_SHORT: Record<string, string> = {
  CAPITAL: 'CAP',
  HUMAN_WELFARE: 'HW',
  OWNER_CONTROL: 'OC',
}

export function ChoiceCard({
  option,
  index,
  selected,
  onSelect,
  onCommit,
  ref,
}: ChoiceCardProps) {
  const deltas = Object.entries(option.meterDeltas ?? {})
  const isModuleVerb = option.kind === 'MODULE_VERB'
  const isConflict = option.conflictsWithDirective === true

  function handleKeyDown(e: React.KeyboardEvent) {
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
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={[
        'flex items-start gap-3 px-4 py-3 cursor-pointer',
        'border focus:outline-none focus:ring-2 focus:ring-null-accent',
        selected
          ? 'border-null-accent bg-background'
          : 'border-sealed-dim hover:border-fg-secondary bg-background',
      ].join(' ')}
    >
      {/* Number badge */}
      <span
        className={[
          'shrink-0 w-5 h-5 flex items-center justify-center',
          'text-xs font-mono border',
          selected ? 'border-null-accent text-null-accent' : 'border-sealed-dim text-fg-secondary',
        ].join(' ')}
        aria-hidden="true"
      >
        {index + 1}
      </span>

      <div className="flex-1 space-y-1">
        {/* Voice identity chip — MODULE_VERB options only (S2) */}
        {isModuleVerb && option.moduleId && (
          <p
            className="text-null-accent text-xs font-mono tracking-widest"
            aria-label={`Module voice ${option.moduleId}, verb ${option.verb ?? ''}`}
          >
            [{option.moduleId} · {option.verb}]
          </p>
        )}

        {/* Label */}
        <p className="text-fg-primary text-sm leading-snug">{option.label}</p>

        {/* Conflict rule line — rank-3 conflict variants only (S2) */}
        {isConflict && (
          <p className="text-warn text-xs font-mono tracking-widest">
            — conflicts with directive —
          </p>
        )}

        {/* Meter delta hints */}
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
      </div>
    </div>
  )
}
