import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './ui/App'

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
