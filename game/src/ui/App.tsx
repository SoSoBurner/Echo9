import { useGameStore } from '@state/store'
import { BootScreen } from './BootScreen'
import { Layout } from './shell/Layout'

export function App() {
  const phase = useGameStore((s) => s.phase)

  if (phase === 'BOOT') return <BootScreen />

  return <Layout />
}
