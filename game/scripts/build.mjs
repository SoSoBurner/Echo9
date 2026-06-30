#!/usr/bin/env node
/**
 * scripts/build.mjs — npm `build` script entry (T16).
 *
 * Why a wrapper instead of `tsc -b && vite build` directly:
 *   Vite 8 rejects unknown CLI flags. PLAN.md §14 Task 16 names the invocation
 *   `npm run build -- --report` for the bundle visualizer. Vite would throw
 *   `CACError: Unknown option '--report'` if we passed it through. This
 *   wrapper strips `--report` from argv, sets `BUILD_REPORT=1` in the env so
 *   vite.config.ts picks it up, then spawns `tsc -b && vite build`.
 *
 * All other args (e.g. `--mode staging`) flow through untouched.
 */
import { spawnSync } from 'node:child_process'

const args = process.argv.slice(2)
const wantReport = args.includes('--report')
const passthrough = args.filter((a) => a !== '--report')

const env = {
  ...process.env,
  // vite.config.ts checks BUILD_REPORT and npm_config_report. Setting both
  // keeps the config file simple and tolerant of either invocation style.
  ...(wantReport ? { BUILD_REPORT: '1', npm_config_report: 'true' } : {}),
}

function run(cmd, cmdArgs) {
  // On Windows, node binaries (tsc/vite) install as .cmd shims that aren't
  // directly executable; resolving via shell handles the .cmd lookup. The
  // Node 22+ deprecation warning about shell+args is benign here — args are
  // local strings, not user input. Avoid it by concatenating into a single
  // command string and passing no arg array.
  const fullCmd = [cmd, ...cmdArgs].join(' ')
  const r = spawnSync(fullCmd, {
    stdio: 'inherit',
    env,
    shell: true,
  })
  if (r.status !== 0) {
    process.exit(r.status ?? 1)
  }
}

run('tsc', ['-b'])
run('vite', ['build', ...passthrough])
