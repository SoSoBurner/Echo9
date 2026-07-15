/**
 * Playwright configuration for Echo 9 end-to-end tests (Task 15, PLAN.md §14).
 *
 * Scope: chromium by default. Cross-browser is a pre-ship gate rather than
 * a per-commit cost — set `RELEASE_GATE=1` to enable Firefox + WebKit
 * alongside chromium (see automation-backlog Task 9). Chromium alone is
 * sufficient for the daily loop because the soak spec relies on
 * `performance.memory` (chromium-only) and the spine spec exercises the
 * React 19 + Zustand + native <dialog> stack that all three engines share.
 *
 * The webServer auto-starts `npm run dev` (Vite) so a developer can run
 * `npm run test:e2e` without remembering to start the server in another shell.
 * `reuseExistingServer` lets a hot dev server be reused if one is already up.
 *
 * NOTE on the vitest split: vitest's default `include` pattern picks up
 * `**\/*.spec.ts` everywhere — `vite.config.ts` excludes `src/tests/e2e/**`
 * from vitest's discovery. Without that exclusion, vitest would attempt to
 * load these specs in jsdom, where `@playwright/test`'s `test`/`expect`
 * globals do not resolve and the suite would crash on import.
 *
 * NOTE on the flakes reporter (automation-backlog Task 10): the CI reporter
 * list emits a `json` stream to `test-results/flakes.json`. The companion
 * `scripts/analyze-flakes.mjs` post-processor scans that file for
 * `retry > 0 && status === 'passed'` — the signature of a flake that hid
 * behind a retry — and appends the offender to `docs/test-flakes.md`.
 */
import { defineConfig, devices } from '@playwright/test'

const RELEASE_GATE = Boolean(process.env['RELEASE_GATE'])

export default defineConfig({
  testDir: './src/tests/e2e',
  testMatch: '**/*.spec.ts',
  // Soak is bounded but slow under CPU throttle 4; bump default timeout.
  timeout: 120_000,
  expect: { timeout: 10_000 },
  // Per-worker fullyParallel is off — soak test needs the Vite dev server
  // exclusively and the spine spec is fast enough not to need parallelism.
  fullyParallel: false,
  workers: 1,
  // CI gate: refuse to land if .only got committed.
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI']
    ? [['github'], ['list'], ['json', { outputFile: 'test-results/flakes.json' }]]
    : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: RELEASE_GATE
    ? [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      ]
    : [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Two servers:
  //  - dev (5173): unbundled, fast HMR — every spec except the soak.
  //  - preview (4173): the PRODUCTION bundle — the soak targets this via
  //    test.use({ baseURL }) in soakTest.spec.ts. Rationale: §13 budgets
  //    describe the shipped bundle, and dev mode serves 350+ unbundled
  //    modules per navigation — the soak's rapid goto() loop exhausted
  //    Chrome's network stack (net::ERR_INSUFFICIENT_RESOURCES) once the
  //    P-track content landed (found at ship-gate, 2026-07-14).
  webServer: [
    {
      command: 'npm run dev',
      port: 5173,
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'npm run build && npx vite preview --port 4173 --strictPort',
      port: 4173,
      reuseExistingServer: !process.env['CI'],
      timeout: 240_000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
})
