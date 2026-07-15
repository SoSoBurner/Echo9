#!/usr/bin/env node
/**
 * scripts/build-itch.mjs — T17/F1: package dist/ into an itch.io-ready zip.
 *
 * Pipeline (fails loud at every step):
 *   1. Production build via scripts/build.mjs (tsc -b && vite build) — child
 *      process so build.mjs stays the single owner of build invocation quirks.
 *   2. Assert dist/index.html exists.
 *   3. Assert every src=/href= asset path in index.html is RELATIVE (`./...`).
 *      itch.io serves uploads from a deep subpath (v6p9d…/html/ID/) — one
 *      root-absolute path means a blank page on itch. Guarded upstream by
 *      vite.config.ts `base: './'` (sacred) and verify-subpath-safe.mjs.
 *   4. Assert gzip-equivalent total of dist/ < 2 MB (PLAN.md §13 tripwire:
 *      "itch.io zip upload ≤ 2 MB"). Gzip-equivalent = sum of gzipSync() of
 *      every file — a stable proxy for the deflate the zip will apply.
 *   5. Zip the CONTENTS of dist/ to <repo-root>/echo9-itch.zip. The zip ROOT
 *      must be index.html itself (itch.io requirement — it refuses to guess
 *      inside nested folders). Verified post-hoc by reading the zip's central
 *      directory (dependency-free) and asserting a root-level index.html.
 *   6. Re-run scripts/verify-subpath-safe.mjs (Playwright 3-way boot:
 *      file://, http-root, http-subpath) and fail if it fails.
 *
 * Zipping strategy (dependency-free, documented per plan):
 *   - Prefer the `zip` CLI when present (Git Bash / WSL / macOS / Linux):
 *     `zip -r -X <out> .` from inside dist/ → forward-slash entries at root.
 *   - win32 fallback: PowerShell `Compress-Archive -Path dist\* …`. Windows
 *     PowerShell 5.1 may emit backslash entry separators; itch.io's unzipper
 *     normalizes these, and our central-directory check below normalizes
 *     `\` → `/` before asserting.
 *
 * Usage: npm run build:itch   (from game/)
 * Output: <repo-root>/echo9-itch.zip  (gitignored — never commit the artifact)
 */
import { spawnSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync, existsSync, rmSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPTS_DIR = dirname(fileURLToPath(import.meta.url))
const GAME_DIR = resolve(SCRIPTS_DIR, '..')
const REPO_ROOT = resolve(GAME_DIR, '..')
const DIST = join(GAME_DIR, 'dist')
const ZIP_PATH = join(REPO_ROOT, 'echo9-itch.zip')
const GZIP_BUDGET_BYTES = 2 * 1024 * 1024 // §13: itch zip ≤ 2 MB

function fail(msg) {
  console.error(`\n[build-itch] FAIL: ${msg}`)
  process.exit(1)
}

function run(cmd, cwd = GAME_DIR) {
  // Same shell-string convention as build.mjs: on Windows, node binaries are
  // .cmd shims that need shell resolution; args here are local literals.
  console.log(`\n[build-itch] $ ${cmd}`)
  const r = spawnSync(cmd, { stdio: 'inherit', shell: true, cwd })
  return r.status ?? 1
}

function commandExists(cmd) {
  const r = spawnSync(cmd, { shell: true, stdio: 'ignore' })
  return r.status === 0
}

/** Recursively list files under dir, absolute paths. */
function listFiles(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...listFiles(p))
    else out.push(p)
  }
  return out
}

/**
 * Read entry names from a zip's central directory. Dependency-free: scan for
 * the central-directory-file-header signature (0x02014b50 LE) and read the
 * filename field (length at +28, bytes at +46). Adequate for our small,
 * non-zip64 artifact; normalizes backslash separators from Compress-Archive.
 */
function zipEntryNames(zipFile) {
  const buf = readFileSync(zipFile)
  const SIG = 0x02014b50
  const names = []
  let i = 0
  while ((i = buf.indexOf('PK\x01\x02', i, 'binary')) !== -1) {
    if (buf.readUInt32LE(i) === SIG) {
      const nameLen = buf.readUInt16LE(i + 28)
      names.push(buf.toString('utf8', i + 46, i + 46 + nameLen).replaceAll('\\', '/'))
    }
    i += 4
  }
  return names
}

// ---------------------------------------------------------------- 1. build
if (run('node scripts/build.mjs') !== 0) fail('production build failed')

// ------------------------------------------------- 2. dist/index.html exists
const indexPath = join(DIST, 'index.html')
if (!existsSync(indexPath)) fail(`missing ${indexPath} — build produced no index.html`)

// --------------------------------------- 3. all asset paths in it are ./-relative
const html = readFileSync(indexPath, 'utf8')
const attrRe = /(?:src|href)\s*=\s*"([^"]+)"/g
const badPaths = []
for (const [, url] of html.matchAll(attrRe)) {
  // data: URIs and inline anchors are fine; anything else must start with ./
  if (url.startsWith('data:') || url.startsWith('#')) continue
  if (!url.startsWith('./')) badPaths.push(url)
}
if (badPaths.length > 0) {
  fail(
    `non-relative asset path(s) in dist/index.html — itch.io subpath hosting will 404 these:\n` +
      badPaths.map((p) => `    ${p}`).join('\n') +
      `\n  (vite.config.ts base must stay './')`,
  )
}
console.log('[build-itch] OK: all index.html asset paths are ./-relative')

// -------------------------------------------- 4. gzip-equivalent total < 2 MB
const files = listFiles(DIST)
let gzipTotal = 0
const sized = []
for (const f of files) {
  const g = gzipSync(readFileSync(f), { level: 9 }).length
  gzipTotal += g
  sized.push([f, g])
}
const gzipMB = (gzipTotal / (1024 * 1024)).toFixed(2)
if (gzipTotal >= GZIP_BUDGET_BYTES) {
  const top = sized
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([f, g]) => `    ${(g / 1024).toFixed(0).padStart(6)} KB  ${f.slice(DIST.length + 1)}`)
    .join('\n')
  fail(
    `gzip-equivalent dist/ total is ${gzipTotal} bytes (${gzipMB} MB) — ` +
      `budget is < 2 MB (PLAN.md §13 itch zip tripwire). Largest offenders:\n${top}\n` +
      `  (already-compressed formats like PNG barely shrink under gzip — ` +
      `transcode oversized art to webp; portraitRegistry.ts accepts .webp drop-ins.)`,
  )
}
console.log(
  `[build-itch] OK: gzip-equivalent total ${gzipTotal} bytes (${gzipMB} MB) < 2 MB budget ` +
    `(${files.length} files)`,
)

// ------------------------------------------------------------------ 5. zip
if (existsSync(ZIP_PATH)) rmSync(ZIP_PATH)

if (commandExists('zip -v')) {
  // -X: no platform-specific extra fields; entries land at zip root because
  // we zip '.' from inside dist/.
  if (run(`zip -r -X "${ZIP_PATH}" .`, DIST) !== 0) fail('zip CLI failed')
} else if (process.platform === 'win32') {
  // PowerShell fallback. dist\* (not dist\) so CONTENTS land at zip root.
  // powershell.exe is a real executable — spawn it directly with an args
  // array (no shell) to sidestep cmd.exe quoting pitfalls around paths.
  const ps = `Compress-Archive -Path "${DIST}\\*" -DestinationPath "${ZIP_PATH}" -Force`
  console.log(`\n[build-itch] $ powershell -NoProfile -Command ${ps}`)
  const r = spawnSync('powershell.exe', ['-NoProfile', '-Command', ps], { stdio: 'inherit' })
  if ((r.status ?? 1) !== 0) fail('Compress-Archive failed')
} else {
  fail('no `zip` CLI found and not on win32 — install zip to package for itch')
}
if (!existsSync(ZIP_PATH)) fail(`zip step reported success but ${ZIP_PATH} does not exist`)

// Root-of-zip assertion: itch.io requires index.html at the archive ROOT.
const entries = zipEntryNames(ZIP_PATH)
if (!entries.includes('index.html')) {
  fail(
    `zip root does not contain index.html — itch.io will reject it.\n` +
      `  entries seen: ${entries.slice(0, 10).join(', ')}${entries.length > 10 ? ', …' : ''}`,
  )
}
const nested = entries.find((e) => /^dist\//.test(e))
if (nested) fail(`zip contains a nested dist/ folder (${nested}) — contents must sit at root`)

const zipBytes = statSync(ZIP_PATH).size
console.log(
  `[build-itch] OK: ${ZIP_PATH} written — ${zipBytes} bytes ` +
    `(${(zipBytes / (1024 * 1024)).toFixed(2)} MB), ${entries.length} entries, index.html at root`,
)

// ------------------------------------------------- 6. subpath verification
if (run('node scripts/verify-subpath-safe.mjs') !== 0) {
  fail('verify-subpath-safe.mjs failed — the built bundle does not boot in all 3 serving modes')
}

console.log(`\n[build-itch] DONE — upload ${ZIP_PATH} to itch.io as an HTML game.`)
