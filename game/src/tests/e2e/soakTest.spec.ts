/**
 * soakTest.spec.ts — performance soak gate for the Mercy Margin slice
 * (Task 15, PLAN.md §13 perf budgets, §14).
 *
 * What this catches:
 *   - Heap leak across repeated boot+choice cycles (every iteration creates
 *     stores, ledger traces, hooks; if a slice forgot to release a ref,
 *     usedJSHeapSize grows unboundedly).
 *   - Save serialize regression (Zustand persist middleware writes
 *     `echo9:autosave` on every state change; we monkey-patch
 *     localStorage.setItem to time each write and assert p95 < 250ms).
 *
 * Why page.reload() per iteration:
 *   The slice has no in-test "reset run" action — once a choice commits,
 *   the player is in ResultCard and the only path back to a fresh boot is
 *   to drop the autosave and reload. addInitScript clears the slot before
 *   every navigation so the boot path runs cleanly each cycle.
 *
 * CPU throttle:
 *   PLAN.md §13 names a "4 GB Chromebook" target. Chromium DevTools Protocol
 *   `Emulation.setCPUThrottlingRate {rate: 4}` slows CPU 4× — matches the
 *   spec's "soak under throttled CPU" phrasing.
 *
 * Iteration count:
 *   Defaults to 100 (configurable via SOAK_ITERATIONS env var). PLAN.md
 *   §13 names 500 as the release gate. 100 is sufficient to expose any
 *   per-cycle leak >50KB while keeping local runtime under ~5 min.
 *   Full release-gate run: `SOAK_ITERATIONS=500 npx playwright test soakTest`.
 *   CI is expected to set the env var directly; wiring that is a release-
 *   sign-off follow-up tracked separately from this commit.
 */
import { test, expect, type Page } from '@playwright/test'

const ITERATIONS = Number(process.env['SOAK_ITERATIONS'] ?? '100')
const HEAP_GROWTH_BUDGET_BYTES = 5 * 1024 * 1024 // 5 MB per PLAN.md §13
const SAVE_SERIALIZE_BUDGET_MS = 250 // setItem hard ceiling

interface SoakSample {
  iteration: number
  usedJSHeapSize: number
  lastSetItemMs: number
}

// `performance.memory` is chromium-only and not in the TS DOM lib.
declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number
      totalJSHeapSize: number
      jsHeapSizeLimit: number
    }
  }
}

/**
 * Installed once per browser context. Clears persisted state before each nav
 * AND patches localStorage.setItem to record the most recent write duration
 * onto window.__lastSetItemMs so the spec can read it after each choice.
 */
async function installSoakHarness(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('echo9:autosave')
      localStorage.removeItem('echo9:comfort')
    } catch {
      /* ignore — comfort panel will render */
    }
    // Preinstall comfort defaults so the spec skips the panel and goes
    // straight to BootScreen. Mirrors the schema's COMFORT_DEFAULTS.
    try {
      localStorage.setItem(
        'echo9:comfort',
        JSON.stringify({
          textSize: 'M',
          motion: 'full',
          contrast: 'standard',
          voicePrefix: 'silas',
          narrationPace: 'polite-queue',
          pauseOnBlur: 'on',
        }),
      )
    } catch {
      /* ignore */
    }
    // Patch setItem to time autosave writes. window.__lastSetItemMs holds
    // the duration of the most recent echo9:autosave write.
    const w = window as unknown as { __lastSetItemMs?: number }
    w.__lastSetItemMs = 0
    const orig = Storage.prototype.setItem
    Storage.prototype.setItem = function patched(
      key: string,
      value: string,
    ): void {
      if (key === 'echo9:autosave') {
        const t0 = performance.now()
        orig.call(this, key, value)
        w.__lastSetItemMs = performance.now() - t0
      } else {
        orig.call(this, key, value)
      }
    }
  })
}

test.describe('Soak — repeated boot+choice cycles under CPU throttle', () => {
  // The soak measures §13 budgets against the SHIPPED bundle, so it targets
  // the vite preview server (production build, port 4173) rather than the
  // dev server. Dev mode serves 350+ unbundled modules per navigation and
  // the soak's rapid goto() loop exhausted Chrome's network stack
  // (net::ERR_INSUFFICIENT_RESOURCES) once the P-track content landed —
  // the preview bundle is ~16 requests per boot. See playwright.config.ts.
  test.use({ baseURL: 'http://localhost:4173' })

  // Soak relies on `performance.memory` (chromium-only) and CDP CPU throttling
  // (chromium-only). Skip under RELEASE_GATE cross-browser runs so Firefox
  // and WebKit projects don't fail on a chromium-specific measurement gap.
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'Soak requires performance.memory + CDP CPU throttling (chromium-only)',
  )

  test(`heap growth and save serialize stay within budget across ${ITERATIONS} iterations`, async ({
    page,
  }) => {
    // Scale timeout with ITERATIONS. Under 4× CPU throttle, empirically each
    // full boot+choice cycle averages ~7s at 100 iterations (measured
    // 2026-07-07 on the C-track walker: 11.6 min / 100 ≈ 6.96s). Late
    // iterations run slower under sustained load (GC pressure, handle churn),
    // so budget 8s/iter with a 15 min floor: 100 iter → 15 min (headroom
    // over observed 11.6), 500 iter → ~67 min (headroom over projected 58).
    // The soak's PURPOSE is to detect leak-induced slowdown; the timeout
    // must not be the bottleneck. If per-iteration cost drops (e.g. via a
    // boot-path speedup), tighten this to keep ship-gate feedback quick.
    test.setTimeout(Math.max(15 * 60, ITERATIONS * 8) * 1000)

    await installSoakHarness(page)

    // CPU throttle via CDP — rate 4 = 4× slowdown, matches PLAN.md §13's
    // "4 GB Chromebook" target.
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })

    const samples: SoakSample[] = []
    const setItemTimes: number[] = []

    for (let i = 0; i < ITERATIONS; i++) {
      await page.goto('/')
      // Comfort defaults already in localStorage → BootScreen renders directly.
      await page
        .getByRole('button', { name: /initialize/i })
        .click({ timeout: 30_000 })
      await page.keyboard.press('2')
      await page.keyboard.press('Enter')
      // Wait for the autosave write to land. ResultCard mount → state change
      // → persist middleware writes echo9:autosave → our patched setItem
      // records duration into window.__lastSetItemMs.
      await expect(
        page.getByRole('heading', { name: /^result$/i, level: 2 }),
      ).toBeVisible()

      const sample = await page.evaluate(() => {
        const mem = performance.memory
        const w = window as unknown as { __lastSetItemMs?: number }
        return {
          usedJSHeapSize: mem?.usedJSHeapSize ?? 0,
          lastSetItemMs: w.__lastSetItemMs ?? 0,
        }
      })
      samples.push({
        iteration: i,
        usedJSHeapSize: sample.usedJSHeapSize,
        lastSetItemMs: sample.lastSetItemMs,
      })
      if (sample.lastSetItemMs > 0) {
        setItemTimes.push(sample.lastSetItemMs)
      }
    }

    // -----------------------------------------------------------------------
    // Heap leak assertion. Compare median of the first 10% iterations
    // (warmup baseline) to median of the last 10% iterations (drift
    // window). Using medians not means keeps a single GC pause from
    // dominating either side.
    // -----------------------------------------------------------------------
    const warmupCount = Math.max(1, Math.floor(ITERATIONS * 0.1))
    const warmupHeap = median(
      samples.slice(0, warmupCount).map((s) => s.usedJSHeapSize),
    )
    const driftHeap = median(
      samples.slice(-warmupCount).map((s) => s.usedJSHeapSize),
    )
    const growth = driftHeap - warmupHeap

    // eslint-disable-next-line no-console
    console.log(
      `[soak] iterations=${ITERATIONS}  warmup_heap=${(
        warmupHeap / 1024 / 1024
      ).toFixed(2)}MB  drift_heap=${(driftHeap / 1024 / 1024).toFixed(
        2,
      )}MB  growth=${(growth / 1024 / 1024).toFixed(2)}MB  budget=${(
        HEAP_GROWTH_BUDGET_BYTES /
        1024 /
        1024
      ).toFixed(2)}MB`,
    )

    // `performance.memory` returns 0 in some headless contexts. If we never
    // got a real reading, the heap assertion would falsely pass; fail loud.
    expect(warmupHeap, 'performance.memory unavailable — soak cannot gate').toBeGreaterThan(0)
    expect(growth).toBeLessThan(HEAP_GROWTH_BUDGET_BYTES)

    // -----------------------------------------------------------------------
    // Save serialize p95. PLAN.md §13: <50ms warn, >100ms forces IndexedDB
    // migration, hard ceiling 250ms.
    // -----------------------------------------------------------------------
    if (setItemTimes.length > 0) {
      const sorted = [...setItemTimes].sort((a, b) => a - b)
      // Nearest-rank p95: for n samples the 95th percentile is at
      // 1-indexed position ceil(0.95 * n), i.e. 0-indexed ceil(0.95*n)-1.
      // The earlier `floor(0.95*n)` shifted one slot up (returning p96 for
      // n=100), which silently weakened the 250ms gate.
      const p95Idx = Math.max(0, Math.ceil(sorted.length * 0.95) - 1)
      const p95 = sorted[p95Idx] ?? 0
      // eslint-disable-next-line no-console
      console.log(
        `[soak] setItem samples=${setItemTimes.length}  p95=${p95.toFixed(2)}ms  budget=${SAVE_SERIALIZE_BUDGET_MS}ms`,
      )
      expect(p95).toBeLessThan(SAVE_SERIALIZE_BUDGET_MS)
    }
  })
})

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
    : sorted[mid] ?? 0
}
