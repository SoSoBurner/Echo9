/**
 * stageWalker.spec.ts — headed playtest driver that walks the achievable
 * Q1 slice from cold boot to the terminal state currently available in
 * the content catalog, screenshotting each checkpoint into
 * `test-results/<sprintId>/` so a sprint-end review can look at the HUD
 * side-by-side with `HUD Mockup.png`.
 *
 * Design notes:
 *
 * 1. The walker is content-forward-compatible: as new Q1 directives land
 *    (Track C sprints C2–C13), the loop keeps advancing until it hits
 *    either the End-of-Content overlay or a state where no further
 *    action is possible. It does NOT hard-code a directive count.
 *
 * 2. Checkpoints are STATE TRANSITIONS, not visual regions. That keeps
 *    the review load bounded (~11 screenshots per sprint) instead of
 *    exploding as panels multiply.
 *
 * 3. The sprint id comes from the `ECHO9_SPRINT` env var so the sprint-end
 *    ritual can pipe screenshots to the right folder without editing
 *    the spec. Defaults to `latest`.
 *
 * 4. State dumps use `window.__ECHO9_STORE__` (the dev/test-guarded
 *    Zustand hook binding in `state/store.ts:252`). We serialize
 *    `getState()` to `state.json` for diffable-across-runs comparison.
 *    The BeatTelemetry binding is separately captured to `beats.json`.
 *
 * 5. This is NOT a regression spec — assertions are lenient. A hard
 *    behavioral spine is enforced by mercyMarginSlice.spec.ts. The
 *    walker exists to *capture what the game currently looks and
 *    behaves like*, not to gate merges.
 *
 * Run: `npx playwright test stageWalker --headed`
 * Skip in non-review runs: filename does not match default test:e2e loops
 * (it will run, but skip screenshots if ECHO9_SPRINT is unset).
 */
import { test, expect, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SPRINT_ID = process.env['ECHO9_SPRINT'] ?? 'latest'
const OUTPUT_DIR = join('test-results', SPRINT_ID)

interface CheckpointOpts {
  name: string
  fullPage?: boolean
}

async function ensureOutputDir(): Promise<void> {
  mkdirSync(OUTPUT_DIR, { recursive: true })
}

async function captureCheckpoint(page: Page, opts: CheckpointOpts): Promise<void> {
  const path = join(OUTPUT_DIR, `${opts.name}.png`)
  await page.screenshot({ path, fullPage: opts.fullPage ?? true, animations: 'disabled' })
}

async function dumpStateSnapshot(page: Page, label: string): Promise<void> {
  const snapshot = await page.evaluate(() => {
    const w = window as unknown as {
      __ECHO9_STORE__?: { getState: () => unknown }
      __ECHO9_BEATS__?: { getBeats: () => unknown }
    }
    const state = w.__ECHO9_STORE__ ? w.__ECHO9_STORE__.getState() : null
    const beats = w.__ECHO9_BEATS__ ? [...(w.__ECHO9_BEATS__.getBeats() as unknown[])] : []
    return { state, beats }
  })
  writeFileSync(
    join(OUTPUT_DIR, `${label}.state.json`),
    JSON.stringify(snapshot.state, null, 2),
  )
  writeFileSync(
    join(OUTPUT_DIR, `${label}.beats.json`),
    JSON.stringify(snapshot.beats, null, 2),
  )
}

async function freshSession(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('echo9:autosave')
      localStorage.removeItem('echo9:comfort')
      localStorage.removeItem('echo9:endOfContentSeen')
    } catch {
      /* storage blocked — comfort panel will still render */
    }
  })
}

/**
 * Walks one directive-cycle if a directive is currently mounted. Returns
 * `true` if a cycle advanced, `false` if no directive is present (used
 * to terminate the loop).
 *
 * The walker prefers key `2` (the middle-of-three choice slot) because
 * the mercyMargin content author picked `2` as the balanced-middle
 * choice; that's the least likely to send the run down a hard-fail
 * branch that ends the slice early. Later content sprints (C-track)
 * should preserve the '2 = middle option' convention or this heuristic
 * will need a `preferredChoice` accessor.
 */
async function walkOneDirective(
  page: Page,
  index: number,
  prevDirectiveText: string | null,
): Promise<{ advanced: boolean; directiveText: string | null }> {
  const directiveHeading = page.getByRole('heading', { level: 2 }).first()
  const hasDirective = await directiveHeading.isVisible().catch(() => false)
  if (!hasDirective) return { advanced: false, directiveText: null }

  // Identity guard: if the same directive re-shows across iterations
  // (Q1 content is sparse today — mercyMargin loops), stop advancing.
  // Once Track C fills in weeks 2–12, each iteration will surface a
  // new directive and this guard will pass through.
  const directiveText = (await directiveHeading.textContent().catch(() => null))?.trim() ?? null
  if (directiveText && directiveText === prevDirectiveText) {
    return { advanced: false, directiveText }
  }

  await captureCheckpoint(page, { name: `05-directive-${String(index).padStart(2, '0')}` })

  await page.keyboard.press('2')
  await captureCheckpoint(page, { name: `06-choice-selected-${String(index).padStart(2, '0')}` })

  await page.keyboard.press('Enter')

  // Result card is the reliable signal that the choice committed. Miss it
  // and we're likely on a different UI branch — bail rather than loop.
  const resultCard = page.getByRole('heading', { name: /^result$/i, level: 2 })
  const resultShowed = await resultCard.isVisible({ timeout: 5_000 }).catch(() => false)
  if (!resultShowed) return false
  await captureCheckpoint(page, { name: `07-result-${String(index).padStart(2, '0')}` })

  // If an echo is pending, drain it via 'c' so the walker doesn't leave
  // the queue growing across iterations. Not every choice fires a hook —
  // guard on the toast being visible before pressing.
  const toast = page.getByRole('status').filter({ hasText: /echoe?s? pending/i })
  const hasEcho = await toast.isVisible({ timeout: 1_500 }).catch(() => false)
  if (hasEcho) {
    await captureCheckpoint(page, { name: `08-echo-toast-${String(index).padStart(2, '0')}` })
    await page.keyboard.press('c')
    const dialog = page.getByRole('dialog').first()
    const dialogOpen = await dialog.isVisible({ timeout: 3_000 }).catch(() => false)
    if (dialogOpen) {
      await captureCheckpoint(page, { name: `09-consequence-${String(index).padStart(2, '0')}` })
      const ack = dialog.getByRole('button', { name: /acknowledge/i })
      const ackVisible = await ack.isVisible().catch(() => false)
      if (ackVisible) {
        await ack.click()
        await expect(dialog).toBeHidden({ timeout: 5_000 })
      }
    }
  }

  return { advanced: true, directiveText }
}

test.describe('Stage walker — playtest capture for sprint review', () => {
  test('walk cold boot → Q1 loop → terminal state, capturing checkpoints', async ({
    page,
  }) => {
    // Walker is capture-first: give it a wider budget than the tight
    // mercyMargin spine spec. Content-fill sprints will grow the loop.
    test.setTimeout(180_000)

    await ensureOutputDir()
    await freshSession(page)
    await page.goto('/')

    // 01 — Comfort panel (fresh session always lands here).
    await expect(
      page.getByRole('main', { name: /accessibility and comfort settings/i }),
    ).toBeVisible()
    await captureCheckpoint(page, { name: '01-comfort-panel' })
    await page.getByRole('button', { name: /continue/i }).click()

    // 02 — Boot screen ("Initialize Command Interface").
    const initialize = page.getByRole('button', {
      name: /initialize command interface/i,
    })
    await expect(initialize).toBeVisible()
    await captureCheckpoint(page, { name: '02-boot-screen' })
    await initialize.click()

    // 03 — Fresh HUD (post-boot, pre-choice). This is the "AI comes
    // online" moment that Track E will progressively enrich.
    await expect(
      page.getByRole('heading', { level: 2 }).first(),
    ).toBeVisible({ timeout: 10_000 })
    await captureCheckpoint(page, { name: '03-hud-fresh' })
    await dumpStateSnapshot(page, '03-hud-fresh')

    // 04 — Module install side path (RightModuleConsole). We install
    // the first module so the walker exercises the module system too.
    // If the console isn't visible (content pruned it), skip gracefully.
    const grid = page.getByRole('grid', { name: /select a personality module/i })
    const gridVisible = await grid.isVisible({ timeout: 2_000 }).catch(() => false)
    if (gridVisible) {
      const firstCell = grid.getByRole('gridcell').first()
      await firstCell.click()
      const confirm = page.getByRole('button', { name: /^confirm install$/i })
      const confirmVisible = await confirm.isVisible({ timeout: 2_000 }).catch(() => false)
      if (confirmVisible) {
        await captureCheckpoint(page, { name: '04-module-confirm' })
        await confirm.click()
        await expect(grid).toHaveCount(0, { timeout: 3_000 })
        await captureCheckpoint(page, { name: '04-module-installed' })
      }
    }

    // Loop: walk directives until we run out. Cap at 20 to catch a
    // runaway state where the walker keeps seeing "a directive" without
    // progressing (defensive; the Q1 arc is 12 weeks).
    let advanced = 0
    let prevDirectiveText: string | null = null
    for (let i = 1; i <= 20; i++) {
      const step = await walkOneDirective(page, i, prevDirectiveText)
      if (!step.advanced) break
      advanced++
      prevDirectiveText = step.directiveText
      // Small pace between iterations so state settles.
      await page.waitForTimeout(250)
    }

    // 10 — Terminal-state screenshot (whatever the last-visible HUD
    // looks like). This is the "how far did we get?" record.
    await captureCheckpoint(page, { name: '10-terminal-state' })
    await dumpStateSnapshot(page, '10-terminal-state')

    // 11 — End-of-Content overlay, if it appeared. The overlay is
    // guarded by `endOfContentSeen` in localStorage and by the walker
    // reaching the terminal hook. Screenshot if visible; do not fail
    // if it isn't (Track C sprints will produce it once week 12 lands).
    const overlay = page.getByRole('dialog', { name: /thank you|end of content/i })
    const overlayVisible = await overlay.isVisible({ timeout: 1_500 }).catch(() => false)
    if (overlayVisible) {
      await captureCheckpoint(page, { name: '11-end-of-content' })
    }

    // Sanity: at least one directive advanced. If zero, the walker is
    // broken (mercyMargin should always be reachable today).
    expect(advanced).toBeGreaterThanOrEqual(1)
  })
})
