/**
 * LeftStatusRail — wraps the 3 gameplay meters read from the store.
 *
 * Reads `meters` from useGameStore. Labels map MeterKey enum values to
 * human-readable names for the UI.
 */
import { useGameStore } from '@state/store'
import { Meter } from './Meter'

const METER_LABELS: Record<string, string> = {
  CAPITAL: 'Capital',
  HUMAN_WELFARE: 'Human Welfare',
  OWNER_CONTROL: 'Owner Control',
}

export function LeftStatusRail() {
  const meters = useGameStore((s) => s.meters)

  return (
    <aside
      className="flex flex-col gap-4 px-4 py-6 border-r border-sealed-dim h-full"
      aria-label="Status meters"
    >
      <p className="text-fg-secondary text-xs uppercase tracking-widest">Status</p>
      <div className="space-y-5">
        {Object.entries(meters).map(([key, value]) => (
          <Meter
            key={key}
            name={METER_LABELS[key] ?? key}
            value={value}
          />
        ))}
      </div>
    </aside>
  )
}
