#!/usr/bin/env node
/**
 * analyze-flakes.mjs — post-processor for playwright's json reporter.
 *
 * Automation-backlog Task 10 (PLAN.md §14). Playwright records every retry
 * attempt in its json output; a test that passes only after `retry > 0` is
 * flaky — the second run masks a real timing bug that will bite CI later.
 * This script scans `test-results/flakes.json` for that signature and
 * appends offenders to `docs/test-flakes.md` (append-only quarantine log).
 *
 * Runs after every `npm run test:e2e`. Fails silently (no throw) when the
 * json report is missing — the report only exists on CI (playwright.config.ts
 * gates the json reporter on `process.env.CI`), so a local dev run should
 * still complete cleanly.
 *
 * Triage rule: any test appearing 3+ times in a 30-day window is a real bug,
 * not a coincidence — either fix the timing assumption or mark `test.fixme`
 * with an issue id. See `docs/review-cadence.md` (monthly cadence step).
 */
import { existsSync, readFileSync, appendFileSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const GAME_ROOT = resolve(__dirname, '..')
const REPORT_PATH = join(GAME_ROOT, 'test-results', 'flakes.json')
const LOG_PATH = join(GAME_ROOT, 'docs', 'test-flakes.md')

if (!existsSync(REPORT_PATH)) {
  // Local dev — no CI-only json reporter output. Not an error.
  console.log('[flakes] no report at test-results/flakes.json (local run) — skipping')
  process.exit(0)
}

let report
try {
  report = JSON.parse(readFileSync(REPORT_PATH, 'utf-8'))
} catch (err) {
  console.error(`[flakes] failed to parse ${REPORT_PATH}: ${err.message}`)
  process.exit(0)
}

/**
 * Playwright's json report is a tree: suites → (specs | nested suites).
 * Each spec has tests[] and each test has results[] (one per retry).
 * "Flaky" = final status passed AND at least one earlier result was a retry.
 * Recurse so nested describes (persistenceRoundTrip > "one-shot ...") report
 * a fully-qualified title, not just the leaf name.
 */
const flakes = []

function walkSuite(suite, titleChain) {
  const chain = suite.title ? [...titleChain, suite.title] : titleChain
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const passed = test.results?.some((r) => r.status === 'passed')
      const retried = test.results?.some((r) => (r.retry ?? 0) > 0)
      if (passed && retried) {
        flakes.push([...chain, spec.title].filter(Boolean).join(' > '))
      }
    }
  }
  for (const child of suite.suites ?? []) {
    walkSuite(child, chain)
  }
}

for (const rootSuite of report.suites ?? []) {
  walkSuite(rootSuite, [])
}

if (flakes.length === 0) {
  console.log('[flakes] none in this run.')
  process.exit(0)
}

const stamp = new Date().toISOString().slice(0, 10)
const entry = `\n## ${stamp}\n${flakes.map((f) => `- ${f}`).join('\n')}\n`

try {
  appendFileSync(LOG_PATH, entry)
  console.log(`[flakes] recorded ${flakes.length} flaky test(s) → docs/test-flakes.md`)
} catch (err) {
  console.error(`[flakes] failed to append to ${LOG_PATH}: ${err.message}`)
  process.exit(0)
}
