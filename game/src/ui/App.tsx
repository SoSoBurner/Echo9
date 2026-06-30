import { useGameStore } from '@state/store'
import { BootScreen } from './BootScreen'
import { Layout } from './shell/Layout'
// DevHUD is gated below on `import.meta.env.DEV`. Vite's static replacement
// of import.meta.env.DEV at build time lets Rollup tree-shake the entire
// import; the prod bundle (verify in dist/stats.html) does NOT include
// DevHUD or devMetrics. See docs/perf-baseline.md.
import { DevHUD } from './debug/DevHUD'

export function App() {
  const phase = useGameStore((s) => s.phase)

  return (
    <>
      {phase === 'BOOT' ? <BootScreen /> : <Layout />}
      {import.meta.env.DEV ? <DevHUD /> : null}
    </>
  )
}
