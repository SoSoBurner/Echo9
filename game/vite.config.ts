/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

// Path aliases mirror tsconfig.app.json (PLAN.md §11)
const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

// T16: only emit dist/stats.html when --report is passed.
// The npm `build` script routes through scripts/build.mjs, which strips
// `--report` from argv (vite 8 rejects unknown CLI flags) and sets
// BUILD_REPORT=1. Falls back to checking argv directly so `vite build --report`
// also works for ad-hoc invocations once that flag is consumed elsewhere.
const REPORT =
  process.env['BUILD_REPORT'] === '1' ||
  process.env['npm_config_report'] === 'true' ||
  process.argv.includes('--report')

export default defineConfig({
  // Emit RELATIVE asset URLs (./assets/...) instead of root-absolute (/assets/...).
  // Required for: file:// double-click, itch.io subpath hosting, any static host
  // that serves this bundle from a subdirectory. Gated by
  // scripts/verify-subpath-safe.mjs.
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    ...(REPORT
      ? [
          visualizer({
            filename: 'dist/stats.html',
            template: 'treemap',
            gzipSize: true,
            brotliSize: true,
            // Don't auto-open; CI environments have no browser.
            open: false,
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@state':   r('./src/state'),
      '@schemas': r('./src/schemas'),
      '@content': r('./src/content'),
      '@systems': r('./src/systems'),
      '@ui':      r('./src/ui'),
      '@tests':   r('./src/tests'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    css: true,
    typecheck: { tsconfig: './tsconfig.test.json' },
    // Vitest's default `include` picks up *.spec.ts everywhere; the Playwright
    // suite lives in src/tests/e2e/ and must NOT be loaded by vitest (it runs
    // under @playwright/test, which provides its own globals). Preserve vitest
    // defaults via configDefaults and extend.
    exclude: [...configDefaults.exclude, 'src/tests/e2e/**'],
  },
})
