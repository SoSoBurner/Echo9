/**
 * devMetrics — dev-only perf instrumentation store (Task 16, PLAN.md §13).
 *
 * Module-scope ring buffers + a thin subscription mechanism. DevHUD reads via
 * `useSyncExternalStore`. Everything in this module is gated on
 * `import.meta.env.DEV` at the call sites that install observers; the data
 * structures themselves are inert (push-only ring buffers + a Set of
 * listeners) so no runtime cost in prod if the module is imported.
 *
 * Why a module-scope store and not a Zustand slice:
 *   - Perf timings are pure UI metadata. They MUST NOT enter the persisted
 *     state or the §11 traceability ledger.
 *   - Avoid render cascades — DevHUD subscribes via getSnapshot and we hand
 *     out a frozen snapshot object only when something changed.
 *
 * Ring buffer size = 60. At one sample per frame (FPS) that's a rolling 1s
 * mean on the FPS readout; for choice/save samples it's "last 60 events".
 */

const RING_SIZE = 60

interface MetricsSnapshot {
  /** Most recent choice resolve duration (ms). 0 = no sample yet. */
  lastChoiceMs: number
  /** p95 of the last RING_SIZE choice samples (ms). 0 = no samples. */
  choiceP95Ms: number
  /** Most recent save serialize duration (ms). 0 = no sample yet. */
  lastSaveMs: number
  /** p95 of the last RING_SIZE save samples (ms). 0 = no samples. */
  saveP95Ms: number
  /** Bytes of last autosave write (UTF-16 chars * 2 approximation). */
  lastSaveBytes: number
  /** Live JS heap (chromium-only). NaN when unavailable. */
  heapBytes: number
  /** Cumulative long-task count (PerformanceObserver longtask, >50ms). */
  longTaskCount: number
  /** Rolling 1s mean FPS (NaN until first sample). */
  fps: number
  /** Monotonic version for cheap snapshot equality. */
  version: number
}

const choiceMs: number[] = []
const saveMs: number[] = []
const frameDeltas: number[] = []
let lastSaveBytes = 0
let longTaskCount = 0
let heapBytes = Number.NaN
let version = 0

let snapshot: MetricsSnapshot = {
  lastChoiceMs: 0,
  choiceP95Ms: 0,
  lastSaveMs: 0,
  saveP95Ms: 0,
  lastSaveBytes: 0,
  heapBytes: Number.NaN,
  longTaskCount: 0,
  fps: Number.NaN,
  version: 0,
}

const listeners = new Set<() => void>()

function pushBounded(arr: number[], v: number): void {
  arr.push(v)
  if (arr.length > RING_SIZE) arr.shift()
}

function p95(values: readonly number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  // Nearest-rank p95: 1-indexed ceil(0.95*n), 0-indexed ceil(0.95*n)-1.
  const idx = Math.max(0, Math.ceil(sorted.length * 0.95) - 1)
  return sorted[idx] ?? 0
}

function rebuildSnapshot(): void {
  version += 1
  // Rolling 1s FPS — sum frame deltas until ≤1000ms or buffer end, then
  // count = number of frames in that window. Avoids depending on wall clock.
  let sumMs = 0
  let frames = 0
  for (let i = frameDeltas.length - 1; i >= 0; i--) {
    sumMs += frameDeltas[i] ?? 0
    frames += 1
    if (sumMs >= 1000) break
  }
  const fps = frames > 0 && sumMs > 0 ? (frames * 1000) / sumMs : Number.NaN
  snapshot = {
    lastChoiceMs: choiceMs[choiceMs.length - 1] ?? 0,
    choiceP95Ms: p95(choiceMs),
    lastSaveMs: saveMs[saveMs.length - 1] ?? 0,
    saveP95Ms: p95(saveMs),
    lastSaveBytes,
    heapBytes,
    longTaskCount,
    fps,
    version,
  }
  for (const l of listeners) l()
}

// ---------------------------------------------------------------------------
// Public API — recorders called from instrumented call sites.
// ---------------------------------------------------------------------------

export function recordChoiceMs(ms: number): void {
  pushBounded(choiceMs, ms)
  rebuildSnapshot()
}

export function recordSave(ms: number, bytes: number): void {
  pushBounded(saveMs, ms)
  lastSaveBytes = bytes
  rebuildSnapshot()
}

export function recordLongTask(): void {
  longTaskCount += 1
  rebuildSnapshot()
}

export function recordFrame(deltaMs: number): void {
  pushBounded(frameDeltas, deltaMs)
  // FPS rebuild is the hot path — skip notify when nothing visible changed
  // would require diffing; since DevHUD subscribes only when mounted in dev
  // and the listener Set is empty otherwise, the cost is negligible.
  rebuildSnapshot()
}

export function recordHeap(bytes: number): void {
  if (bytes === heapBytes) return
  heapBytes = bytes
  rebuildSnapshot()
}

// ---------------------------------------------------------------------------
// useSyncExternalStore plumbing
// ---------------------------------------------------------------------------

export function subscribeDevMetrics(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getDevMetricsSnapshot(): MetricsSnapshot {
  return snapshot
}

// ---------------------------------------------------------------------------
// One-time installers — called from main.tsx behind import.meta.env.DEV.
// Idempotent: guards prevent double-install during HMR.
// ---------------------------------------------------------------------------

let installed = false

export function installDevMetricsObservers(): void {
  if (installed) return
  installed = true

  // 1. Patch localStorage.setItem to time autosave writes.
  //    Mirrors src/tests/e2e/soakTest.spec.ts so DevHUD numbers match soak
  //    gate semantics. Bytes = value.length * 2 (UTF-16 char approximation;
  //    documented in docs/perf-baseline.md).
  try {
    const orig = Storage.prototype.setItem
    Storage.prototype.setItem = function patched(
      key: string,
      value: string,
    ): void {
      if (key === 'echo9:autosave') {
        const t0 = performance.now()
        orig.call(this, key, value)
        const dt = performance.now() - t0
        recordSave(dt, value.length * 2)
      } else {
        orig.call(this, key, value)
      }
    }
  } catch {
    /* SSR or restricted env — ignore. */
  }

  // 2. PerformanceObserver for long tasks (>50ms). Not all browsers expose
  //    'longtask' (Firefox lacks it as of 2026). Guard the entryTypes call.
  try {
    if (typeof PerformanceObserver !== 'undefined') {
      const supported = (
        PerformanceObserver as unknown as { supportedEntryTypes?: readonly string[] }
      ).supportedEntryTypes
      if (!supported || supported.includes('longtask')) {
        const po = new PerformanceObserver((list) => {
          for (const _ of list.getEntries()) {
            recordLongTask()
          }
        })
        po.observe({ entryTypes: ['longtask'] })
      }
    }
  } catch {
    /* unsupported — DevHUD shows 0. */
  }

  // 3. requestAnimationFrame loop for FPS sampling. Self-perpetuating; the
  //    loop only runs while the page is alive, and recordFrame is cheap.
  try {
    if (typeof requestAnimationFrame !== 'undefined') {
      let last = performance.now()
      const tick = (now: number): void => {
        const delta = now - last
        last = now
        if (delta > 0 && delta < 1000) recordFrame(delta)
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }
  } catch {
    /* no rAF — DevHUD shows NaN. */
  }

  // 4. Heap sampler (chromium-only). Poll every 1s; cheaper than a per-frame
  //    read and good enough for visual feedback.
  try {
    const perf = performance as Performance & {
      memory?: { usedJSHeapSize: number }
    }
    if (perf.memory) {
      const sample = (): void => {
        const mem = perf.memory
        if (mem) recordHeap(mem.usedJSHeapSize)
      }
      sample()
      setInterval(sample, 1000)
    }
  } catch {
    /* unavailable — DevHUD shows '—'. */
  }
}
