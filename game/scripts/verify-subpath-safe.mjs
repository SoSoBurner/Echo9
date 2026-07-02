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
 *   Subpath fixture STRICTLY 404s requests outside the mount so it accurately
 *   simulates itch.io / GitHub Pages / any prefix-hosted deploy. See the
 *   `--allow-file-access-from-files` note at the chromium.launch call below
 *   for why the file:// leg needs that flag and what it does/doesn't gate.
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
  const server = createServer(async (req, res) => {
    const urlPath = new URL(req.url, 'http://x').pathname
    // For subpath mode: any request outside the mount is a real 404 in the
    // wild (itch.io serves /html/ID/ — a request to /foo.js goes to itch.io's
    // root, not your game). Simulate that: refuse to serve anything that
    // isn't under the mount.
    let relativePath
    if (mountPath === '') {
      relativePath = urlPath
    } else {
      if (!urlPath.startsWith(mountPath + '/') && urlPath !== mountPath) {
        res.statusCode = 404
        res.end('not found (outside mount)')
        return
      }
      relativePath = urlPath.slice(mountPath.length) || '/'
    }
    let filePath = join(DIST, relativePath === '/' ? '/index.html' : relativePath)
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
    // Push nav errors into the errors array so the summary log reflects the
    // real cause instead of showing "0 errors + no root children" — a
    // silently-swallowed nav timeout looks identical to a mystery blank page.
    errors.push('NAV_ERR: ' + e.message)
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
  // --allow-file-access-from-files: needed so the file:// leg can fetch its
  // ES-module <script type="module"> and CSS. Chromium blocks null-origin
  // (file://) cross-origin loads by default — that's a browser security
  // policy, not a vite base issue. In the wild, users who double-click
  // dist/index.html on stock Chrome/Edge will hit the same block; the itch.io
  // upload path (Task 5 zip) is served over HTTP so this only affects local
  // smoke-tests. The verifier still gates that the assets are AT the correct
  // relative path — CORS blocks with the flag off would show 404-style errors
  // on absolute paths pre-fix vs the current relative-path fetches.
  const browser = await chromium.launch({
    headless: true,
    args: ['--allow-file-access-from-files'],
  })
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
