import { useGameStore } from '@state/store'
import { BootScreen } from './BootScreen'

export function App() {
  const phase = useGameStore((s) => s.phase)

  if (phase === 'BOOT') return <BootScreen />

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 font-mono">
      <section className="text-center space-y-2">
        <p className="text-fg-secondary text-xs uppercase tracking-widest">Phase</p>
        <p className="text-fg-primary text-2xl">{phase}</p>
        <p className="text-fg-secondary text-sm">
          (placeholder — next: directive panel)
        </p>
      </section>
    </main>
  )
}
