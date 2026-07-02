/**
 * DevHUD — fixed-position perf overlay, dev-only (Task 16, PLAN.md §13).
 *
 * Mounted by App.tsx behind `import.meta.env.DEV`. Tree-shaken from prod
 * bundles via the env guard (verify with `npm run build -- --report`).
 *
 * Layout decisions:
 *   - Fixed bottom-right corner, semi-transparent, monospace, tabular nums.
 *   - `pointer-events: none` so the overlay never intercepts clicks
 *     (E2E specs in src/tests/e2e/ assume nothing else floats over the HUD).
 *   - Render uses inline styles, not Tailwind — keeps DevHUD CSS independent
 *     of palette token regressions and visible even mid-token-bug.
 *   - 'H' key toggles visibility (helps when DevHUD covers a button during
 *     a manual playthrough). Visibility state is local; resets on reload.
 *
 * Thresholds shown next to values per PLAN.md §13:
 *   - Choice resolve  p95 <16ms
 *   - Save serialize  warn >50ms, fail >100ms (hard ceiling 250ms)
 *   - Save payload    warn >500KB
 *   - Heap            warn >150MB
 *   - Long tasks      0 in steady state
 *   - FPS             ≥50 sustained
 */
import { useEffect, useState, useSyncExternalStore } from 'react'
import {
  getDevMetricsSnapshot,
  subscribeDevMetrics,
} from './devMetrics'
import { getBeats } from './BeatTelemetry'

const BUDGETS = {
  choiceP95Ms: 16,
  saveWarnMs: 50,
  saveFailMs: 100,
  saveBytesWarn: 500 * 1024,
  heapWarnBytes: 150 * 1024 * 1024,
  fpsMin: 50,
} as const

function fmtMs(v: number): string {
  if (!Number.isFinite(v) || v === 0) return '—'
  return `${v.toFixed(1)}ms`
}

function fmtBytes(v: number): string {
  if (!Number.isFinite(v) || v === 0) return '—'
  if (v >= 1024 * 1024) return `${(v / 1024 / 1024).toFixed(2)}MB`
  if (v >= 1024) return `${(v / 1024).toFixed(1)}KB`
  return `${v}B`
}

function fmtFps(v: number): string {
  if (!Number.isFinite(v)) return '—'
  return v.toFixed(0)
}

interface RowProps {
  label: string
  value: string
  state?: 'ok' | 'warn' | 'fail'
  budget?: string
}

function Row({ label, value, state = 'ok', budget }: RowProps): React.JSX.Element {
  const color =
    state === 'fail' ? '#ff6b6b' : state === 'warn' ? '#ffd166' : '#a8e6a8'
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <span style={{ opacity: 0.7 }}>{label}</span>
      <span style={{ color }}>
        {value}
        {budget ? <span style={{ opacity: 0.4, marginLeft: 6 }}>({budget})</span> : null}
      </span>
    </div>
  )
}

export function DevHUD(): React.JSX.Element | null {
  const snap = useSyncExternalStore(subscribeDevMetrics, getDevMetricsSnapshot)
  const [visible, setVisible] = useState(true)

  // 'H' toggles visibility. Skip when focus is in an editable field so it
  // doesn't fight with typing in (currently nonexistent) text inputs.
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== 'h' && e.key !== 'H') return
      const t = e.target as HTMLElement | null
      const tag = t?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || t?.isContentEditable) return
      setVisible((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!visible) return null

  const choiceState: RowProps['state'] =
    snap.choiceP95Ms > BUDGETS.choiceP95Ms ? 'warn' : 'ok'
  const saveState: RowProps['state'] =
    snap.saveP95Ms > BUDGETS.saveFailMs
      ? 'fail'
      : snap.saveP95Ms > BUDGETS.saveWarnMs
        ? 'warn'
        : 'ok'
  const saveBytesState: RowProps['state'] =
    snap.lastSaveBytes > BUDGETS.saveBytesWarn ? 'warn' : 'ok'
  const heapState: RowProps['state'] =
    Number.isFinite(snap.heapBytes) && snap.heapBytes > BUDGETS.heapWarnBytes
      ? 'warn'
      : 'ok'
  const longTaskState: RowProps['state'] = snap.longTaskCount > 0 ? 'warn' : 'ok'
  const fpsState: RowProps['state'] =
    Number.isFinite(snap.fps) && snap.fps < BUDGETS.fpsMin ? 'warn' : 'ok'

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        right: 8,
        bottom: 8,
        zIndex: 9999,
        pointerEvents: 'none',
        background: 'rgba(8, 10, 14, 0.82)',
        color: '#cfd8dc',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 6,
        padding: '8px 10px',
        font: '11px/1.4 ui-monospace, Menlo, Consolas, monospace',
        minWidth: 220,
        boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
      }}
      data-testid="dev-hud"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 4,
          opacity: 0.85,
        }}
      >
        <strong style={{ letterSpacing: 0.5 }}>DEV HUD</strong>
        <span style={{ opacity: 0.5 }}>H to hide</span>
      </div>
      <Row
        label="Choice p95"
        value={`${fmtMs(snap.choiceP95Ms)} / ${fmtMs(snap.lastChoiceMs)}`}
        state={choiceState}
        budget="<16ms"
      />
      <Row
        label="Save p95"
        value={`${fmtMs(snap.saveP95Ms)} / ${fmtMs(snap.lastSaveMs)}`}
        state={saveState}
        budget="<50/<100"
      />
      <Row
        label="Save bytes"
        value={fmtBytes(snap.lastSaveBytes)}
        state={saveBytesState}
        budget="<500KB"
      />
      <Row
        label="Heap"
        value={fmtBytes(snap.heapBytes)}
        state={heapState}
        budget="<150MB"
      />
      <Row
        label="Long tasks"
        value={`${snap.longTaskCount}`}
        state={longTaskState}
        budget="0"
      />
      <Row label="FPS" value={fmtFps(snap.fps)} state={fpsState} budget="≥50" />
      <BeatsSection />
    </div>
  )
}

/**
 * Spine-beat pacing readout — one row per beat with the delta from the
 * previous beat. Rendered inside DevHUD so it re-renders alongside the
 * devMetrics snapshot; beats are a module-scope append-only log so the
 * next FPS tick (every frame in dev) picks up any new entry within ~16ms.
 * `import.meta.env.DEV` guard lets the whole section tree-shake from prod.
 */
function BeatsSection(): React.JSX.Element | null {
  if (!import.meta.env.DEV) return null
  const arr = getBeats()
  if (arr.length === 0) return null
  return (
    <div
      aria-label="spine beats"
      style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.12)' }}
    >
      <div style={{ opacity: 0.7, marginBottom: 2 }}>BEATS</div>
      {arr.map((b, i) => {
        const prev = i === 0 ? 0 : arr[i - 1]?.tSinceBoot_ms ?? 0
        const delta = b.tSinceBoot_ms - prev
        return (
          <div
            key={b.name}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <span style={{ opacity: 0.7 }}>{b.name}</span>
            <span style={{ color: '#a8e6a8' }}>+{Math.round(delta)}ms</span>
          </div>
        )
      })}
    </div>
  )
}
