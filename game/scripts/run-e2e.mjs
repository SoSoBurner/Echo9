#!/usr/bin/env node
/**
 * run-e2e.mjs — cross-platform wrapper for `npm run test:e2e`.
 *
 * Chains `playwright test` → `analyze-flakes.mjs` regardless of the test
 * exit code (flakes only surface via the json reporter, which the analyzer
 * always parses). npm scripts default to cmd.exe on Windows, which does not
 * support `;` chain semantics — hence a node wrapper instead of a shell
 * one-liner. Exit code always mirrors the playwright test run so CI still
 * fails on real test failures.
 */
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const GAME_ROOT = resolve(__dirname, '..')

const passthroughArgs = process.argv.slice(2)

// 1. Run playwright test (any extra CLI args passthrough to playwright).
const pw = spawnSync('npx', ['playwright', 'test', ...passthroughArgs], {
  cwd: GAME_ROOT,
  stdio: 'inherit',
  shell: true, // npx.cmd on Windows requires shell resolution
})

// 2. Always run the flake analyzer, even if playwright failed.
//    The analyzer is a no-op when the json report is missing (local dev).
spawnSync('node', ['scripts/analyze-flakes.mjs'], {
  cwd: GAME_ROOT,
  stdio: 'inherit',
})

// 3. Mirror playwright's exit code so CI still fails on real failures.
process.exit(pw.status ?? 1)
