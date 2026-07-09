# itch.io Subpath Launch Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

---

## The problem in plain language (read this first)

**What went wrong:** You built the game, tried to open the resulting `index.html` file by double-clicking it — and got a blank page. When we tested that failure inside a browser, the browser was looking for the JavaScript and CSS at the *root of your hard drive* (`C:\assets\index-Ddk1LMY5.js`) instead of *next to the HTML file* (`C:\Users\CEO\Echo9\game\dist\assets\index-Ddk1LMY5.js`). Those files don't exist at the root of your hard drive, so the browser gave up and showed nothing.

**Why is this happening:** Vite (the tool that builds the game) is currently told "assume this game lives at the top level of a web server." So it stamps every asset link as `/assets/index...js` — a path that starts at the root. That works when the game *does* live at the root of a server (like `mygame.com/`), but it breaks the moment the game is opened as a file, put in a subfolder, or uploaded to itch.io (which serves your game from inside a folder like `html-classic.itch.zone/html/12345/`).

**The one-line fix:** Change one setting in `game/vite.config.ts` from its invisible default (`base: '/'`) to `base: './'` — meaning "assume the assets live *next to me*, wherever I am." That's it. That's the entire fix.

**Why didn't tests catch this:** Every automated test we run — vitest unit tests, playwright E2E tests, the smoke playtest — hits the game through Vite's dev server or preview server, which both host from `/`. They never open the built HTML file from a folder, from disk, or from a subpath. So the tests all passed. The bug was invisible to the test setup because the test setup couldn't see it. This plan adds a small **regression pin** — a test that literally opens the built file the way you did, from a subfolder — so this class of bug can never sneak back in.

**What you'll get when this plan is done:**
1. The `game/dist/index.html` file works when opened by double-click.
2. The uploaded `echo9-itch.zip` will load correctly on itch.io.
3. A test that opens the built bundle from a subfolder catches this bug automatically forever after.

---

**Goal:** Change one Vite config field so the built game loads assets relative to `index.html`, then pin that behavior with a subpath regression test and regenerate the itch.io upload artifact.

**Architecture:** The fix is a single-character configuration change (`base: '/'` → `base: './'`). The bulk of this plan is *the safety net around it*: a verification script that opens the built bundle three different ways (file://, HTTP root, HTTP subpath) and asserts they all boot, plus a static assertion that greps `dist/index.html` and fails if any asset href starts with `/`. Documentation updates thread the requirement into the T17 ship runbook, the ship-gate checklist, and CLAUDE.md so future work does not silently regress it.

**Tech Stack:** Vite 8, Playwright 1.61, Node 22, existing `scripts/` folder, existing `dist/` build artifact, existing `game/echo9-itch.zip` staging path.

---

## Context

The bug surfaced when the user tried to open `game/dist/index.html` directly (file://) and saw a blank page. Empirical repro via a headless Playwright script that loaded the file URL confirmed the browser resolved `<script src="/assets/index-Ddk1LMY5.js">` to `C:/assets/index-Ddk1LMY5.js` — the root of the filesystem — and hit `net::ERR_FAILED`. Body text length: 0. Console errors: 4. Failed requests: 2.

The root cause is that Vite's `base` option defaults to `/`. That default is fine for a game served from the root of a domain, but it breaks for three real deploy paths that Echo9 uses:

1. **file:// double-click** — the user's expected local smoke test.
2. **itch.io hosted HTML5** — served at `https://html-classic.itch.zone/html/{id}/index.html`, i.e. a subpath.
3. **Any future GitHub Pages / static host with a project subdirectory.**

The correct value is `base: './'`, which tells Vite to emit relative hrefs (`./assets/...`) that resolve against wherever `index.html` actually lives.

Every existing automated test hits the game through `npm run dev` (Vite dev server at `/`) or `npm run preview` (Vite preview server at `/`). Neither path exercises subpath serving. That is why 297/297 vitest tests + all playwright specs + the itch-smoke playtest ran green while the built artifact was broken. Closing this observability gap is the second-most-important outcome of this plan.

An Explore-agent audit of the codebase confirmed the base fix is the only change required — no code references `import.meta.env.BASE_URL`, no service worker is registered, no code fetches asset URLs at runtime beyond what Vite rewrites, and the `favicon.svg` reference in `index.html` will follow the same `base` rewrite.

---

## File Structure

**Created:**
- `game/scripts/verify-subpath-safe.mjs` — Playwright walker that opens the built bundle from file://, HTTP root, and HTTP subpath, asserting each renders content and produces zero console errors
- `game/src/tests/build/subpathAssetPaths.test.ts` — vitest static assertion that greps `dist/index.html` after build and fails if any asset href starts with `/`

**Modified:**
- `game/vite.config.ts` — add `base: './'` field after `defineConfig({` opening
- `game/echo9-itch.zip` — regenerated from corrected `dist/`
- `docs/superpowers/plans/2026-06-30-t17-itch-ship.md` — document `base: './'` as a T17 prerequisite
- `docs/ship-gate.md` — add subpath verification step to Phase 1
- `Echo9/CLAUDE.md` — add "Vite `base` must stay `./`" to Gotchas
- `game/package.json` — add `verify:subpath` script wrapping the new verifier

---

## Task 1: Reproduce the failure with a regression pin

**Files:**
- Create: `game/scripts/verify-subpath-safe.mjs`
- Create: `game/scripts/subpath-fixture/` — empty directory the verifier stages content into

- [ ] **Step 1: Write the verifier script (should FAIL against the current broken build)**

Create `game/scripts/verify-subpath-safe.mjs`:

```javascript
#!/usr/bin/env node
/**
 * verify-subpath-safe.mjs — regression pin for itch.io subpath serving.
 *
 * Opens the built dist/ bundle three ways and asserts each renders:
 *   1. file:// — user double-clicks index.html
 *   2. http://localhost:PORT/     — served from root (dev-server-equivalent)
 *   3. http://localhost:PORT/game/ — served from a subpath (itch.io-equivalent)
 *
 * Fails loudly if the root <div id="root"> has no children after 3s. This is
 * the test that would have caught the base:'/' bug — automated tests all hit
 * Vite dev/preview at '/', so subpath serving was untested.
 *
 * Usage: node scripts/verify-subpath-safe.mjs
 * Precondition: dist/ must exist (run `npm run build` first).
 */
import { chromium } from '@playwright/test'
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, join, extname } from 'node:path'
import { pathToFileURL } from 'node:url'

const DIST = resolve('dist')
const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
}

async function startServer(mountPath) {
  // mountPath = '' for root, '/game' for subpath. Requests to /game/foo.js
  // resolve to dist/foo.js.
  const server = createServer(async (req, res) => {
    let urlPath = new URL(req.url, 'http://x').pathname
    if (mountPath && urlPath.startsWith(mountPath)) urlPath = urlPath.slice(mountPath.length)
    if (urlPath === '' || urlPath === '/') urlPath = '/index.html'
    const filePath = join(DIST, urlPath)
    try {
      await stat(filePath)
      const body = await readFile(filePath)
      res.setHeader('Content-Type', MIME[extname(filePath)] ?? 'application/octet-stream')
      res.end(body)
    } catch {
      res.statusCode = 404
      res.end('not found')
    }
  })
  await new Promise((r) => server.listen(0, r))
  const port = server.address().port
  return { server, port }
}

async function boots(page, url, label) {
  const errors = []
  const failed = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push('PAGE_ERR: ' + e.message))
  page.on('requestfailed', (r) => failed.push(r.url() + ' — ' + r.failure()?.errorText))
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 8000 })
  } catch (e) {
    console.log(`[${label}] nav error: ${e.message}`)
  }
  await new Promise((r) => setTimeout(r, 1500))
  const hasRoot = await page.evaluate(() => !!document.getElementById('root')?.children.length)
  const bodyLen = await page.evaluate(() => document.body.textContent?.trim().length ?? 0)
  console.log(`[${label}] root_has_children=${hasRoot}  body_len=${bodyLen}  errors=${errors.length}  failed=${failed.length}`)
  errors.slice(0, 3).forEach((e) => console.log(`  ! ${e}`))
  failed.slice(0, 3).forEach((f) => console.log(`  x ${f}`))
  return hasRoot && errors.length === 0 && failed.length === 0
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const results = {}

  // 1. file://
  {
    const page = await browser.newPage()
    const url = pathToFileURL(join(DIST, 'index.html')).href
    results.file = await boots(page, url, 'file://')
    await page.close()
  }

  // 2. HTTP root
  const { server: rootServer, port: rootPort } = await startServer('')
  {
    const page = await browser.newPage()
    results.httpRoot = await boots(page, `http://localhost:${rootPort}/`, 'http-root')
    await page.close()
  }
  rootServer.close()

  // 3. HTTP subpath
  const { server: subServer, port: subPort } = await startServer('/game')
  {
    const page = await browser.newPage()
    results.httpSub = await boots(page, `http://localhost:${subPort}/game/`, 'http-subpath')
    await page.close()
  }
  subServer.close()

  await browser.close()

  const allPassed = Object.values(results).every(Boolean)
  console.log('\n=== VERDICT ===')
  console.log(`file://       : ${results.file ? 'PASS' : 'FAIL'}`)
  console.log(`http-root     : ${results.httpRoot ? 'PASS' : 'FAIL'}`)
  console.log(`http-subpath  : ${results.httpSub ? 'PASS' : 'FAIL'}`)
  console.log(`overall       : ${allPassed ? 'PASS' : 'FAIL'}`)
  process.exit(allPassed ? 0 : 1)
}

main().catch((e) => { console.error('CRASHED:', e); process.exit(2) })
```

- [ ] **Step 2: Run against the current (broken) build to confirm it fails**

Run: `cd game && npm run build && node scripts/verify-subpath-safe.mjs`
Expected: FAIL — file:// and http-subpath both show `root_has_children=false`, http-root passes.

This is the *failing test* that pins the bug. Do not proceed until this reproduces reliably.

- [ ] **Step 3: Commit the failing verifier**

```bash
git add game/scripts/verify-subpath-safe.mjs
git commit -m "test(build): subpath verifier reproduces the itch.io launch failure"
```

---

## Task 2: Fix the Vite base config

**Files:**
- Modify: `game/vite.config.ts:22`

- [ ] **Step 1: Add `base: './'` inside `defineConfig({...})`**

Edit `game/vite.config.ts`. Replace:

```typescript
export default defineConfig({
  plugins: [
```

With:

```typescript
export default defineConfig({
  // Emit RELATIVE asset URLs (./assets/...) instead of root-absolute (/assets/...).
  // Required for: file:// double-click, itch.io subpath hosting, any static host
  // that serves this bundle from a subdirectory. Verified by
  // scripts/verify-subpath-safe.mjs — do not remove without updating that gate.
  base: './',
  plugins: [
```

- [ ] **Step 2: Rebuild and verify the fix**

Run: `cd game && npm run build && node scripts/verify-subpath-safe.mjs`
Expected: PASS on all three (file://, http-root, http-subpath).

Also confirm `dist/index.html` now contains `./assets/...` instead of `/assets/...`:

Run: `grep -E 'src=|href=' game/dist/index.html`
Expected output includes lines starting with `./assets/` and `./favicon.svg`, NONE starting with `/assets/` or `/favicon.svg`.

- [ ] **Step 3: Verify the trinity still passes**

Run: `cd game && npx tsc --noEmit && npx oxlint && npx vitest run`
Expected: all green (base config change has no code-path implications).

- [ ] **Step 4: Commit the fix**

```bash
git add game/vite.config.ts
git commit -m "fix(build): base:'./' — emit relative asset URLs for subpath and file:// serving"
```

---

## Task 3: Add a static regression pin (grep dist for absolute asset paths)

**Files:**
- Create: `game/src/tests/build/subpathAssetPaths.test.ts`

Why: The Playwright verifier from Task 1 is heavy (spawns Chromium, spins two HTTP servers). A tiny vitest that greps `dist/index.html` catches the same regression in <10ms and runs on every `npm run test:run`. Both layers stay — vitest for speed, Playwright for confidence.

- [ ] **Step 1: Write the failing test**

Create `game/src/tests/build/subpathAssetPaths.test.ts`:

```typescript
/**
 * subpathAssetPaths.test.ts — regression pin for vite.config.ts `base: './'`.
 *
 * Reads dist/index.html and asserts every asset href/src is relative
 * (starts with ./) not root-absolute (starts with /). If someone drops the
 * base:'./' field from vite.config.ts, this test fails immediately without
 * needing to spin up a browser.
 *
 * Skips gracefully if dist/ hasn't been built yet — the Playwright verifier
 * (scripts/verify-subpath-safe.mjs) is the authoritative gate; this is a
 * cheap early-warning tripwire for the common case where devs rebuild often.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

describe('dist/index.html asset paths', () => {
  const distIndex = resolve(__dirname, '../../../dist/index.html')

  it.runIf(existsSync(distIndex))(
    'emits relative (./) asset URLs, never root-absolute (/) — protects file:// and subpath serving',
    () => {
      const html = readFileSync(distIndex, 'utf-8')
      // Match src="..." and href="..." values on non-external URLs.
      const attrRe = /(?:src|href)="([^"]+)"/g
      const violations: string[] = []
      for (const m of html.matchAll(attrRe)) {
        const url = m[1] ?? ''
        // Skip external URLs, data URIs, anchors, and empty.
        if (
          url.startsWith('http') ||
          url.startsWith('//') ||
          url.startsWith('data:') ||
          url.startsWith('#') ||
          url === ''
        ) continue
        // Root-absolute paths break under file:// and subpath hosting.
        if (url.startsWith('/')) violations.push(url)
      }
      expect(
        violations,
        `dist/index.html contains root-absolute asset URLs — set base:'./' in vite.config.ts. Offenders: ${violations.join(', ')}`,
      ).toEqual([])
    },
  )
})
```

- [ ] **Step 2: Verify test passes against the fixed build**

Run: `cd game && npx vitest run src/tests/build/subpathAssetPaths.test.ts`
Expected: PASS.

- [ ] **Step 3: Verify test WOULD fail if the fix regressed**

Manually revert `base: './'` in `vite.config.ts` (do not commit), rebuild, re-run the test:

Run: `cd game && npm run build && npx vitest run src/tests/build/subpathAssetPaths.test.ts`
Expected: FAIL with a list of offending URLs including `/assets/index-*.js` and `/favicon.svg`.

Then restore `base: './'` and rebuild:

Run: `cd game && npm run build && npx vitest run src/tests/build/subpathAssetPaths.test.ts`
Expected: PASS again.

- [ ] **Step 4: Commit the regression pin**

```bash
git add game/src/tests/build/subpathAssetPaths.test.ts
git commit -m "test(build): vitest pin — dist/index.html must use relative asset paths"
```

---

## Task 4: Wire the Playwright verifier into npm scripts

**Files:**
- Modify: `game/package.json`

- [ ] **Step 1: Add the script entry**

Open `game/package.json`. In the `"scripts"` block, add:

```json
"verify:subpath": "npm run build && node scripts/verify-subpath-safe.mjs"
```

Placement: alongside the other verify/test scripts, alphabetized where the existing convention allows.

- [ ] **Step 2: Verify it works end-to-end**

Run: `cd game && npm run verify:subpath`
Expected: build completes, verifier prints three PASS lines, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add game/package.json
git commit -m "chore(build): npm run verify:subpath — one-shot build+subpath gate"
```

---

## Task 5: Regenerate echo9-itch.zip from the corrected dist

**Files:**
- Modify: `game/echo9-itch.zip` (regenerate)

- [ ] **Step 1: Rebuild fresh (defensive; ensures zip content matches the fixed config)**

Run: `cd game && npm run build`
Expected: `dist/index.html` contains `./assets/...` (verify via grep from Task 2 Step 2).

- [ ] **Step 2: Repack the zip**

The zip must have `index.html` at the archive root (not nested under a `dist/` folder), because itch.io serves the archive's root as the game URL.

PowerShell (repo root or absolute paths):

```powershell
cd C:\Users\CEO\Echo9\game\dist
Compress-Archive -Path * -DestinationPath ..\echo9-itch.zip -Force
```

Or bash equivalent from `game/`:

```bash
cd dist && zip -r ../echo9-itch.zip . -x '*.map' 'stats.html' && cd ..
```

- [ ] **Step 3: Verify zip structure**

Run: `cd game && unzip -l echo9-itch.zip | head -20`
Expected: `index.html` appears at zip root (no `dist/` prefix). `assets/` directory present.

- [ ] **Step 4: Smoke-test the packaged bundle**

Extract to a temp dir and open via file:// (Chrome/Edge):

```bash
mkdir -p /tmp/echo9-itch-check && cd /tmp/echo9-itch-check && unzip -o C:/Users/CEO/Echo9/game/echo9-itch.zip
```

Then either open `/tmp/echo9-itch-check/index.html` manually, or reuse the verifier by pointing it at that dir temporarily. For automated smoke, the Task 1 verifier already tests file:// against `dist/` — if that passed after Task 2, the zip built from the same `dist/` will behave identically.

- [ ] **Step 5: Commit the regenerated artifact**

```bash
git add game/echo9-itch.zip
git commit -m "build(itch): regenerate echo9-itch.zip from base:'./' bundle"
```

Note: only commit the zip if it's already tracked. If `.gitignore` excludes it (many repos ignore build artifacts), skip the commit — the important thing is that the *file on disk* matches the corrected build for upload.

---

## Task 6: Update T17 ship plan, ship-gate runbook, and CLAUDE.md

**Files:**
- Modify: `docs/superpowers/plans/2026-06-30-t17-itch-ship.md`
- Modify: `docs/ship-gate.md`
- Modify: `Echo9/CLAUDE.md`

- [ ] **Step 1: Add subpath requirement to T17 ship plan**

Open `docs/superpowers/plans/2026-06-30-t17-itch-ship.md` and locate the section covering build/packaging (likely titled "Build artifact" or "Packaging" or similar). Add a new subsection near the top of build prep:

```markdown
### Prerequisite: Vite base config

Before packaging, verify `game/vite.config.ts` contains `base: './'`. This
is enforced by:

- `game/src/tests/build/subpathAssetPaths.test.ts` (fast static assertion)
- `game/scripts/verify-subpath-safe.mjs` (loads bundle from file://, HTTP root,
  and HTTP subpath, asserts all three render)

Run `npm run verify:subpath` from `game/` before generating the itch upload.
If the vitest assertion or the Playwright walk fails, DO NOT upload —
`base: './'` has been dropped and the itch bundle will show a blank page.
```

Precise anchor to search for: any heading containing "build", "package", "dist", or "itch". If unsure, insert immediately after the plan's Context section.

- [ ] **Step 2: Add subpath gate to ship-gate runbook**

Open `docs/ship-gate.md`. In Phase 1 (Mechanical), add a new numbered step after the trinity, before the traceability skill invocation:

```markdown
6.5. `cd game && npm run verify:subpath` — build + file://, HTTP root, HTTP
     subpath all render. Fails loudly if `base: './'` regressed in vite.config.ts.
```

Renumber subsequent steps if needed (or leave `6.5` as-is — the fractional number makes the insertion obvious in diff review).

- [ ] **Step 3: Add gotcha to CLAUDE.md**

Open `Echo9/CLAUDE.md`. In the `## Gotchas` section (bottom of file), add a new bullet:

```markdown
- `vite.config.ts` must keep `base: './'`. Vite's default (`/`) breaks file:// double-click, itch.io subpath hosting, and any static host that serves from a subdirectory. Verified by `npm run verify:subpath` and `src/tests/build/subpathAssetPaths.test.ts`.
```

- [ ] **Step 4: Commit doc updates**

```bash
git add docs/superpowers/plans/2026-06-30-t17-itch-ship.md docs/ship-gate.md Echo9/CLAUDE.md
git commit -m "docs(build): thread base:'./' requirement into T17 plan, ship-gate, and CLAUDE.md"
```

---

## Verification

After all 6 tasks land:

### Objective (automated)
- `cd game && npx vitest run src/tests/build/subpathAssetPaths.test.ts` — PASS.
- `cd game && npm run verify:subpath` — three PASS lines (file://, http-root, http-subpath), exit 0.
- `cd game && npx tsc --noEmit && npx oxlint && npx vitest run` — trinity still green.
- `cd game && grep -c 'src="/assets' dist/index.html` — output is `0`.
- `cd game && grep -c 'src="./assets' dist/index.html` — output is `1`.
- `cd game && unzip -l echo9-itch.zip | grep -c 'index.html'` — output is `1`, with `index.html` at zip root.

### Subjective (author-driven)
- User can double-click `game/dist/index.html` on Windows and the game boots (comfort panel appears).
- Uploading `game/echo9-itch.zip` to a fresh itch.io HTML5 project renders the game (comfort panel appears in the itch iframe).
- Ship-gate runbook now includes the subpath gate at step 6.5.
- CLAUDE.md Gotchas section names the `base: './'` requirement so future work does not regress it.

### Failure signals (what "broken" looks like)
- `subpathAssetPaths.test.ts` passes but `verify-subpath-safe.mjs` fails — a code path is fetching an absolute URL at runtime that vitest can't see. Investigate with Chrome DevTools MCP against the file:// open.
- Zip uploaded to itch.io shows blank page — check that the archive has `index.html` at the root, not nested under `dist/`.
- `subpathAssetPaths.test.ts` false-negatives on a hardcoded `http://` asset URL — the test correctly skips external URLs; add the specific URL to the skip list only if it's genuinely external and intentional.
