/**
 * Playwright configuration for Echo 9 end-to-end tests (Task 15, PLAN.md §14).
 *
 * Scope: chromium only. The vertical slice ships to itch.io and Steam later;
 * cross-browser is not in the budget for the slice. Chromium is sufficient to
 * exercise the React 19 + Zustand + native <dialog> stack and the soak gate
 * relies on `performance.memory` which is chromium-specific anyway.
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
 */
import { defineConfig, devices } from '@playwright/test'

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
  reporter: process.env['CI'] ? [['github'], ['list']] : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
