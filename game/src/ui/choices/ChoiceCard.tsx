/**
 * ChoiceCard — individual radio option within the ChoicePanel radiogroup.
 *
 * Displays: number badge (1-4), label, meter delta hints.
 * Role: radio (part of radiogroup in ChoicePanel).
 * Keyboard: arrows handled by radiogroup, Enter/Space to commit.
 */
import type { ChoiceNode } from '@schemas/choiceNode.schema'

interface ChoiceCardProps {
  choice: ChoiceNode
  index: number
  selected: boolean
  onSelect: () => void
  onCommit: () => void
}

const METER_SHORT: Record<string, string> = {
  CAPITAL: 'CAP',
  HUMAN_WELFARE: 'HW',
  OWNER_CONTROL: 'OC',
}

export function ChoiceCard({
  choice,
  index,
  selected,
  onSelect,
  onCommit,
}: ChoiceCardProps) {
  const deltas = Object.entries(choice.meterDeltas ?? {})

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onCommit()
    }
  }

  return (
    <div
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
        {/* Label */}
        <p className="text-fg-primary text-sm leading-snug">{choice.label}</p>

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
