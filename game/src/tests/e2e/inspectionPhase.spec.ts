/**
 * inspectionPhase.spec.ts — E2E coverage for the auto-advance production
 * trigger into the INSPECTION phase (automation-backlog Task 7; PLAN.md §7
 * "At <40, Silas suspects deviation" + §8 phase orchestration).
 *
 * WHAT THIS SPEC PROVES
 *   Before Task 7, `setPhase('INSPECTION')` was only reachable from unit
 *   tests. The InspectionPanel + Q1_INSPECTION_SCENES + resolveInspection
 *   pipeline had no production entry point, which meant a fully-implemented
 *   gameplay system could not be exercised by real play. Task 7 wires
 *   Layout's choice-commit handler to call `startInspection()` +
 *   `setPhase('INSPECTION')` when OWNER_CONTROL crosses downward through 40.
 *
 * THE "JUST-CROSSED" SEMANTIC (why not a naive `nextOC < 40`)
 *   PLAN.md §7 says: "Owner Control | 0–100 | At <40, Silas suspects deviation."
 *   Meters start at 0. A pure below-threshold check (`nextOC < 40`) would
 *   trigger the inspection on turn 1 before the player has done anything
 *   Silas could "suspect". The Task 7 check is `prevOC >= 40 && nextOC < 40`
 *   so it fires ONLY on a downward crossing — the design intent of a drop
 *   through the line, not a static condition. Layout.tsx:194-215.
 *
 * WHY SEED VIA THE WINDOW BINDING
 *   The choices in eastWilmer.choices.ts do not, on their own, drive OC
 *   from 0 through 40 in a single commit: OC deltas are 0 / 0 / -5 / +2.
 *   To exercise the auto-advance we need to raise prev OC above the
 *   threshold BEFORE the commit that crosses it downward. `applyDelta` on
 *   the store's runtime binding is the shortest arm for that — the binding
 *   is the same DEV/test-only escape hatch that persistenceRoundTrip uses
 *   for `markCapitalDeployed`. Prod builds tree-shake the binding, so the
 *   window property is safe to lean on in tests without a prod leak.
 *
 * SEED ARITHMETIC (update if choice deltas change)
 *   Choice 3 (keybind '3', id 'choice-defer-quarter') has
 *   `meterDeltas.OWNER_CONTROL = -5`. Seeding OC=44 via `applyDelta` before
 *   the commit puts prev OC=44 (>= 40) and next OC = 44 + (-5) = 39 (< 40),
 *   which is the just-crossed case. If eastWilmer.choices.ts ever swaps the
 *   OC delta on choice 3, adjust the seed value so the arithmetic still
 *   lands the next value below 40 with prev >= 40.
 *
 * STYLE
 *   Mirrors persistenceRoundTrip.spec.ts + comfortRehydration.spec.ts:
 *   inline `freshSession` with the `__echo9WipedOnce` sentinel (kept even
 *   though this spec does not reload — the pattern is uniform across the
 *   E2E folder so a future author does not need to reason about which
 *   variant a given spec picked), a narrow `Echo9StoreWindow` type over
 *   the window binding, ARIA-role queries only.
 */
import { test, expect, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Wipes persisted state ONCE at first navigation so the spec starts at the
 * comfort panel. The `__echo9WipedOnce` sessionStorage sentinel prevents
 * Playwright's addInitScript from re-wiping on reload — mirrors
 * persistenceRoundTrip.spec.ts:46-57 for cross-spec consistency.
 */
async function freshSession(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      if (sessionStorage.getItem('__echo9WipedOnce') === '1') return
      localStorage.removeItem('echo9:autosave')
      localStorage.removeItem('echo9:comfort')
      sessionStorage.setItem('__echo9WipedOnce', '1')
    } catch {
      /* storage blocked — comfort panel will still render */
    }
  })
}

/**
 * Narrow local type for the dev/test window binding installed by store.ts.
 * Only the fields this spec touches. Keeps `any` off the wire and gives a
 * future rename of a slice action a TS error surface here instead of a
 * silent no-op at runtime.
 */
type Echo9StoreWindow = {
  __ECHO9_STORE__: {
    getState: () => {
      applyDelta: (delta: {
        CAPITAL?: number
        HUMAN_WELFARE?: number
        OWNER_CONTROL?: number
      }) => void
      phase: string
      currentInspectionSceneIndex: number | null
      ledger: ReadonlyArray<unknown>
      meters: { CAPITAL: number; HUMAN_WELFARE: number; OWNER_CONTROL: number }
    }
  }
}

// ---------------------------------------------------------------------------
// Spec
// ---------------------------------------------------------------------------

test.describe('Inspection phase auto-advance — OC just-crossing 40', () => {
  test('inspection phase auto-advances on OC just-crossing 40, panel opens, posture commits, ledger appends', async ({
    page,
  }) => {
    await freshSession(page)
    await page.goto('/')

    // 1. Comfort → BootScreen → directive, standard warm-up.
    await page.getByRole('button', { name: /continue/i }).click()
    await page
      .getByRole('button', { name: /initialize command interface/i })
      .click()

    // 2. Seed OWNER_CONTROL to 44 via the dev/test window binding so the
    //    NEXT commit crosses the 40 threshold downward. See seed arithmetic
    //    in the file-level docblock. Guard on the binding's existence so a
    //    prod-mode misconfiguration fails loudly instead of silently no-op'ing.
    await page.evaluate(() => {
      const w = window as unknown as Partial<Echo9StoreWindow>
      if (!w.__ECHO9_STORE__) {
        throw new Error('Store not exposed on window for tests')
      }
      w.__ECHO9_STORE__.getState().applyDelta({ OWNER_CONTROL: 44 })
    })

    // 3. Sanity-check the seed landed and the phase is still FIRST_DIRECTIVE
    //    (not INSPECTION — auto-advance only fires from handleChoiceCommit,
    //    not from applyDelta itself; this is the point of the semantic).
    const preCommit = await page.evaluate(() => {
      const w = window as unknown as Partial<Echo9StoreWindow>
      if (!w.__ECHO9_STORE__) {
        throw new Error('Store not exposed on window for tests')
      }
      const s = w.__ECHO9_STORE__.getState()
      return {
        oc: s.meters.OWNER_CONTROL,
        phase: s.phase,
        sceneIndex: s.currentInspectionSceneIndex,
      }
    })
    expect(preCommit.oc).toBe(44)
    expect(preCommit.phase).not.toBe('INSPECTION')
    expect(preCommit.sceneIndex).toBeNull()

    // 4. Commit choice-defer-quarter (keybind '3', OC delta -5). Prev OC=44,
    //    next OC=39 → just-crossed → Layout calls startInspection() +
    //    setPhase('INSPECTION').
    await page.keyboard.press('3')
    await page.keyboard.press('Enter')

    // 5. InspectionPanel opens as a modal dialog. Accessible name derives
    //    from aria-labelledby="inspection-title" → "Silas — Inspection".
    const dialog = page.getByRole('dialog', { name: /silas.*inspection/i })
    await expect(dialog).toBeVisible()

    // 6. Answer the first scene's first posture. The radiogroup exposes
    //    role=radio children (see PostureCard.tsx). The first posture in
    //    Q1A is 'compliant-q1a' (COMPLIANT — always enabled, no override
    //    flag required), so index 0 is the safe target regardless of
    //    STRATEGIC_ALTERNATIVE gating.
    const firstRadio = dialog.getByRole('radio').first()
    await firstRadio.click()

    // 7. Confirm the posture. The panel button label is 'Answer'.
    await dialog.getByRole('button', { name: /^answer$/i }).click()

    // 8. Ledger has grown. handleInspectionCommit calls resolveInspection
    //    which appends a ResultTrace via appendTrace; a non-zero ledger
    //    length proves the whole inspection pipeline ran end-to-end.
    const ledgerCount = await page.evaluate(() => {
      const w = window as unknown as Partial<Echo9StoreWindow>
      if (!w.__ECHO9_STORE__) {
        throw new Error('Store not exposed on window for tests')
      }
      return w.__ECHO9_STORE__.getState().ledger.length
    })
    expect(ledgerCount).toBeGreaterThan(0)
  })

  test('auto-advance does not fire when OC never crosses threshold from above', async ({
    page,
  }) => {
    await freshSession(page)
    await page.goto('/')

    await page.getByRole('button', { name: /continue/i }).click()
    await page
      .getByRole('button', { name: /initialize command interface/i })
      .click()

    // Seed OWNER_CONTROL to 100 so ANY choice's OC delta (worst case -5 on
    //    choice-defer-quarter) leaves next OC at 95 — still comfortably above
    //    the 40 threshold. The just-crossed check must NOT fire.
    await page.evaluate(() => {
      const w = window as unknown as Partial<Echo9StoreWindow>
      if (!w.__ECHO9_STORE__) {
        throw new Error('Store not exposed on window for tests')
      }
      w.__ECHO9_STORE__.getState().applyDelta({ OWNER_CONTROL: 100 })
    })

    // Commit choice-defer-quarter (OC -5). Prev=100, next=95 → not crossed.
    await page.keyboard.press('3')
    await page.keyboard.press('Enter')

    // ResultCard renders (choice committed), but the inspection dialog
    // never appears. Assert both: (a) no dialog, (b) cursor stayed null,
    // (c) phase never went to INSPECTION.
    await expect(
      page.getByRole('dialog', { name: /silas.*inspection/i }),
    ).toHaveCount(0)

    const post = await page.evaluate(() => {
      const w = window as unknown as Partial<Echo9StoreWindow>
      if (!w.__ECHO9_STORE__) {
        throw new Error('Store not exposed on window for tests')
      }
      const s = w.__ECHO9_STORE__.getState()
      return { phase: s.phase, sceneIndex: s.currentInspectionSceneIndex }
    })
    expect(post.sceneIndex).toBeNull()
    expect(post.phase).not.toBe('INSPECTION')
  })
})
