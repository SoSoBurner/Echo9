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
