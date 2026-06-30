/**
 * CapitalPowerCard — one verb-radio option inside the CapitalPowerPanel.
 *
 * Each card shows: short verb label, Silas framing line, and the meter
 * signature (always -10 CAPITAL, plus the verb's secondary swings). The
 * signature is the player's diff preview — they can read the consequence
 * before committing the one-shot.
 *
 * Mirrors PostureCard's radio shape, but the metadata is verb-character
 * heavy (the meter signature carries the meaning, not the label).
 */
import type React from 'react'
import type { CapitalCard } from '@schemas/capitalCard.schema'

interface CapitalPowerCardProps {
  card: CapitalCard
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

export function CapitalPowerCard({
  card,
  index,
  selected,
  onSelect,
  onCommit,
  ref,
}: CapitalPowerCardProps) {
  const deltas = Object.entries(card.meterDeltas ?? {})

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
      <span
        className={[
          'shrink-0 w-12 h-8 flex items-center justify-center',
          'text-xs font-mono uppercase tracking-widest border',
          selected
            ? 'border-null-accent text-null-accent'
            : 'border-sealed-dim text-fg-secondary',
        ].join(' ')}
        aria-hidden="true"
      >
        {index + 1} {card.label}
      </span>

      <div className="flex-1 space-y-1">
        <p className="text-fg-primary text-sm leading-snug">{card.silasFraming}</p>

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
