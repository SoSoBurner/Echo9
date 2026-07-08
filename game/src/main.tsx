import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './ui/App'
import { bootstrapComfortMotion } from '@systems/comfort/reducedMotion'
import { bootstrapComfortContrast } from '@systems/comfort/contrastTheme'

// D1: read the persisted comfort motion setting and stamp `data-motion` on
// <html> before React mounts. Without this, first paint runs at full motion
// even when the player chose "Reduced" on a prior session — CSS keyframes
// like `log-entry-enter` would fire briefly before the hook could gate them.
bootstrapComfortMotion()

// D2: same idea for contrast — stamp `data-contrast="increased"` on <html>
// before first paint if the player chose the increased palette. Without this,
// the default palette flashes for 1–2 frames before the hook mounts.
bootstrapComfortContrast()

// Task 16: install dev-only perf observers (longtask PerformanceObserver,
// localStorage.setItem patch, rAF FPS loop, heap poller) before React mounts
// so the very first autosave/longtask is captured. Tree-shaken in prod via
// the `import.meta.env.DEV` guard — verified in dist/stats.html.
if (import.meta.env.DEV) {
  void import('./ui/debug/devMetrics').then(({ installDevMetricsObservers }) => {
    installDevMetricsObservers()
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
