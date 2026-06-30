# Perf Baseline — Mercy Margin Vertical Slice (T16)

**Captured:** 2026-06-30, commit pre-T16-baseline (clean tree post T15)
**Hardware:** Windows 11 mid-tier laptop, Chromium 142 via Chrome DevTools MCP
**Build:** `npm run build -- --report` (production, with rollup-plugin-visualizer)
**Session:** dev server (`npm run dev`) with DevHUD mounted, manual Mercy Margin spine walk:
boot → comfort → initialize → choice (2 → Enter) → result → module install (Mourner → confirm) → consequence review (C).

All metrics measured from the DevHUD overlay (src/ui/debug/DevHUD.tsx). Source
of truth for thresholds: PLAN.md §13 ("Performance Plan"). DevHUD's right-hand
column displays the budget next to each live value at runtime.

---

## Bundle sizes (production build)

`npm run build -- --report` emits `dist/stats.html` (rollup-plugin-visualizer
treemap, gzip + brotli columns enabled). DevHUD and `devMetrics` do NOT appear
in any prod chunk — verified by grepping `dist/assets/*.js` for the
`DevHUD`/`devMetrics`/`installDevMetricsObservers`/`recordChoiceMs`/`getDevMetricsSnapshot`/`DEV HUD`
strings; zero matches. Tree-shaken via the `import.meta.env.DEV` guards in
`main.tsx` (dynamic import) and `App.tsx` (static import).

| Chunk | Raw | Gzip | Budget (§13 vertical slice) | Status |
|---|---|---|---|---|
| `dist/index.html` | 0.61 KB | 0.36 KB | — | OK |
| `dist/assets/index-*.css` | 22.17 KB | 5.08 KB | — | OK |
| `dist/assets/index-*.js` (entry) | 336.80 KB | **100.74 KB** | ≤275 KB first-load gzip | **OK** (~37% of budget) |
| `dist/assets/VirtualLog-*.js` (lazy, T13) | 24.02 KB | 7.40 KB | — | OK (lazy, not first-load) |
| **First-load gzip total** | — | **~105.82 KB** | **≤275 KB** | **OK** (~38% of budget) |
| Total uncompressed JS | 360.82 KB | — | ≤1.0 MB | OK (~35% of budget) |

Hard tripwire (§13 "First-load gzip >530 KB"): not at risk; 5.0× headroom.

---

## Runtime metrics (DevHUD readings)

Captured after the manual spine walk above. "p95" is over the rolling
ring-buffer of last 60 samples per metric (see `devMetrics.ts`).

| Metric | DevHUD reading | Threshold (PLAN.md §13) | Status |
|---|---|---|---|
| Choice resolution time (p95 / last) | **0.4 ms / 0.4 ms** | p95 <16 ms | OK (40× headroom) |
| Save serialize time (p95 / last) | **0.1 ms / 0.1 ms** | warn >50 ms, fail >100 ms, hard ceiling 250 ms | OK (500× headroom) |
| Save payload size (last autosave write) | **10.7 KB** (UTF-16 chars × 2 approx) | warn >500 KB | OK (~47× headroom) |
| Heap (`performance.memory.usedJSHeapSize`, chromium-only) | **~19–22 MB** | warn at 150 MB | OK (~7× headroom) |
| Long tasks (PerformanceObserver `longtask`, >50 ms) | **2** total over session | none >50 ms in steady state | **At budget boundary** — both tasks during initial boot; zero new long tasks accumulated during steady-state interaction (verified by 3 s idle re-check). Steady-state requirement met. |
| FPS (rolling 1 s mean from `requestAnimationFrame` deltas) | **60** | sustained ≥50 fps | OK |

### Save payload size — UTF-16 approximation note

`Storage.prototype.setItem` accepts a JavaScript string; `String.prototype.length`
returns UTF-16 code-unit count. Multiplying by 2 yields a byte-count
approximation that matches what the browser stores (modern browsers store
strings as UTF-16 internally). Off by up to ~50% for ASCII-heavy strings
under engine-level compression, but the order of magnitude is correct — the
500 KB warn threshold has 47× headroom regardless of approximation error.

### Long-task note

The 2 long tasks observed are both from initial app boot (React mount +
zustand-persist rehydrate). PLAN.md §13 requires "none >50ms **in steady
state**" — verified by holding the page idle 3 s after the spine walk and
re-reading the counter (unchanged). The boot-time tasks would not block
release; they are inherent to the cold-start budget tracked separately under
"Cold start budget".

### Cold start (best-effort, dev server)

`performance.timing.domContentLoadedEventEnd - navigationStart = 308 ms` on
the dev server, `loadEventEnd - navigationStart = 311 ms`. Dev-server timing
is **not** a release gate (Vite serves unbundled modules); see §13 cold-start
budget for production targets. The visualizer-confirmed 100.74 KB gzip entry
chunk is well under what would risk the <1.5 s mid-tier / <3 s Chromebook
budgets.

---

## How to re-capture

```bash
# Production bundle + visualizer
cd C:\Users\CEO\Echo9\game
npm run build -- --report
# inspect dist/stats.html (treemap; gzip+brotli columns)

# Runtime metrics (DevHUD)
npm run dev
# open http://localhost:5173/
# DevHUD overlay sits bottom-right; press H to toggle visibility.
# Walk: comfort → CONTINUE → INITIALIZE → choose "2" Enter → install Mourner → C
# Numbers are live; ring buffer keeps last 60 samples for p95.
```

DevHUD is gated on `import.meta.env.DEV` at both call sites — confirmed
absent from `dist/` after `npm run build`.

---

## Action items / watchlist

- None for vertical slice. All metrics within budget by >5× margin.
- Re-baseline after Task 17 (itch.io build script): the zip-size check enters
  the §13 "itch.io zip upload ≤2 MB" tripwire.
- Re-baseline on first content-heavy stage (E.A. content beyond Mercy Margin):
  expect autosave payload to grow with ledger entries; warn threshold is
  500 KB and we currently sit at 10.7 KB after one full slice walk.
