/**
 * inspectionPhase.spec.ts — E2E coverage for the Q1 inspection-dispatch
 * pipeline (Sprint C15).
 *
 * WHAT THIS SPEC PROVES
 *   Before C15, the inspection auto-advance was scoped to any downward
 *   crossing of OWNER_CONTROL through 40 on the (only ever rendered) Week
 *   1 directive. C15 wired the whole Q1_SEQUENCE cursor + the W4/W8/W12
 *   inspection registry, so the trigger is now week-scoped:
 *
 *     • W4  — East Wilmer field visit; fires when the Week 4 directive
 *              resolves with next OWNER_CONTROL < 40.
 *     • W8  — Payroll audit hearing; fires unconditionally on Week 8
 *              resolution (every Week 8 choice sets `PAYROLL_AUDIT_DONE`).
 *     • W12 — Ethics hearing; fires unconditionally at Q1 close.
 *
 *   Only weeks 4 / 8 / 12 dispatch inspections; every other week's
 *   commit takes the ResultCard → Continue → next directive path.
 *
 * WHY SEED VIA THE WINDOW BINDING
 *   The `__ECHO9_STORE__` dev/test-only binding (store.ts:252) exposes
 *   the full Zustand `useGameStore` — including `setFlag` and
 *   `applyDelta`. Advancing the derivation-based week cursor to Week 4
 *   is a matter of setting Q1_WEEK1_RESOLVED / Q1_WEEK2_RESOLVED /
 *   Q1_WEEK3_RESOLVED and re-rendering. Prod builds tree-shake the
 *   binding, so leaning on it in tests is safe.
 *
 * WHY NOT WALK THE ARC ORGANICALLY
 *   Committing three weeks organically requires driving the ResultCard's
 *   "Continue" button, waiting for the next directive to render, then
 *   picking a keybind for that week's choices. Every week's authored
 *   copy would then be load-bearing in an E2E designed to prove the
 *   dispatch semantic, not the content. The seed-and-jump approach
 *   isolates what we're actually asserting (Week 4 → W4 inspection).
 *
 * STYLE
 *   Mirrors persistenceRoundTrip.spec.ts + comfortRehydration.spec.ts:
 *   inline `freshSession` with the `__echo9WipedOnce` sentinel, a narrow
 *   `Echo9StoreWindow` type over the window binding, ARIA-role queries
 *   only.
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
      setFlag: (flag: string) => void
      phase: string
      currentInspectionSceneIndex: number | null
      currentInspectionKey: 'W4' | 'W8' | 'W12' | null
      ledger: ReadonlyArray<unknown>
      meters: { CAPITAL: number; HUMAN_WELFARE: number; OWNER_CONTROL: number }
    }
  }
}

/**
 * Seed the derivation cursor to Week 4 by setting the three earlier
 * weeks' resolution flags. After this call the CenterDirectivePanel
 * renders week4-east-wilmer-audit-pre-brief.
 */
async function jumpToWeek(page: Page, week: number): Promise<void> {
  await page.evaluate((targetWeek) => {
    const w = window as unknown as Partial<Echo9StoreWindow>
    if (!w.__ECHO9_STORE__) {
      throw new Error('Store not exposed on window for tests')
    }
    const s = w.__ECHO9_STORE__.getState()
    for (let n = 1; n < targetWeek; n += 1) {
      s.setFlag(`Q1_WEEK${n}_RESOLVED`)
    }
  }, week)
}

// ---------------------------------------------------------------------------
// Spec
// ---------------------------------------------------------------------------

test.describe('C15 Q1 inspection dispatch — W4/W8/W12 scoped triggers', () => {
  test('Week 4 commit with OC below 40 opens the W4 inspection dialog', async ({
    page,
  }) => {
    await freshSession(page)
    await page.goto('/')

    // 1. Comfort → BootScreen → directive, standard warm-up.
    await page.getByRole('button', { name: /continue/i }).click()
    await page
      .getByRole('button', { name: /initialize command interface/i })
      .click()

    // 2. Advance derivation to Week 4 by setting the three earlier
    //    weeks' resolution flags. OWNER_CONTROL is left at its default 0
    //    — the C15 W4 gate is `nextOC < 40`, so any Week 4 choice with
    //    non-positive OC delta lands the trigger.
    await jumpToWeek(page, 4)

    // 3. Sanity-check the seed. Phase should still be FIRST_DIRECTIVE
    //    (or whatever it was pre-commit); inspection cursor + key null.
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
        inspectionKey: s.currentInspectionKey,
      }
    })
    expect(preCommit.oc).toBeLessThan(40)
    expect(preCommit.phase).not.toBe('INSPECTION')
    expect(preCommit.sceneIndex).toBeNull()
    expect(preCommit.inspectionKey).toBeNull()

    // 4. Commit the Week 4 first choice (keybind '1'). Regardless of
    //    which posture the player picks, next OC stays < 40 from a base
    //    of 0, so the W4 trigger fires.
    await page.keyboard.press('1')
    await page.keyboard.press('Enter')

    // 5. InspectionPanel opens as a modal dialog. Accessible name derives
    //    from aria-labelledby="inspection-title" → "Silas — Inspection".
    const dialog = page.getByRole('dialog', { name: /silas.*inspection/i })
    await expect(dialog).toBeVisible()

    // 6. The discriminator recorded W4 and the cursor sits at scene 0.
    const inspectionState = await page.evaluate(() => {
      const w = window as unknown as Partial<Echo9StoreWindow>
      if (!w.__ECHO9_STORE__) {
        throw new Error('Store not exposed on window for tests')
      }
      const s = w.__ECHO9_STORE__.getState()
      return {
        key: s.currentInspectionKey,
        sceneIndex: s.currentInspectionSceneIndex,
        phase: s.phase,
      }
    })
    expect(inspectionState.key).toBe('W4')
    expect(inspectionState.sceneIndex).toBe(0)
    expect(inspectionState.phase).toBe('INSPECTION')

    // 7. Answer the first scene's first posture. First posture is
    //    always COMPLIANT (never gated on SILAS_OVERRIDE_AVAILABLE), so
    //    index 0 is a safe target.
    const firstRadio = dialog.getByRole('radio').first()
    await firstRadio.click()

    // 8. Confirm the posture. Panel button label is 'Answer'.
    await dialog.getByRole('button', { name: /^answer$/i }).click()

    // 9. Ledger has grown — proof the whole inspection pipeline ran
    //    end-to-end via the new discriminator lookup path.
    const ledgerCount = await page.evaluate(() => {
      const w = window as unknown as Partial<Echo9StoreWindow>
      if (!w.__ECHO9_STORE__) {
        throw new Error('Store not exposed on window for tests')
      }
      return w.__ECHO9_STORE__.getState().ledger.length
    })
    expect(ledgerCount).toBeGreaterThan(0)
  })

  test('Week 4 commit with OC well above 40 does NOT open the W4 inspection', async ({
    page,
  }) => {
    await freshSession(page)
    await page.goto('/')

    await page.getByRole('button', { name: /continue/i }).click()
    await page
      .getByRole('button', { name: /initialize command interface/i })
      .click()

    // Advance to Week 4 and seed OC to 100 so any Week 4 choice leaves
    // next OC comfortably above the 40 gate.
    await jumpToWeek(page, 4)
    await page.evaluate(() => {
      const w = window as unknown as Partial<Echo9StoreWindow>
      if (!w.__ECHO9_STORE__) {
        throw new Error('Store not exposed on window for tests')
      }
      w.__ECHO9_STORE__.getState().applyDelta({ OWNER_CONTROL: 100 })
    })

    // Commit choice #2 (hedge-story, OC +2). Prev=100, next=102 → not
    // below 40; W4 trigger MUST NOT fire.
    await page.keyboard.press('2')
    await page.keyboard.press('Enter')

    await expect(
      page.getByRole('dialog', { name: /silas.*inspection/i }),
    ).toHaveCount(0)

    const post = await page.evaluate(() => {
      const w = window as unknown as Partial<Echo9StoreWindow>
      if (!w.__ECHO9_STORE__) {
        throw new Error('Store not exposed on window for tests')
      }
      const s = w.__ECHO9_STORE__.getState()
      return {
        phase: s.phase,
        sceneIndex: s.currentInspectionSceneIndex,
        key: s.currentInspectionKey,
      }
    })
    expect(post.sceneIndex).toBeNull()
    expect(post.key).toBeNull()
    expect(post.phase).not.toBe('INSPECTION')
  })

  test('Week 1 commit never opens an inspection — dispatch is week-scoped', async ({
    page,
  }) => {
    // Regression guard: the old semantic fired on any downward crossing
    // of 40 regardless of week. C15 restricts the trigger to weeks 4/8/12.
    // Even seeding OC below 40 at Week 1 must NOT open the panel.
    await freshSession(page)
    await page.goto('/')

    await page.getByRole('button', { name: /continue/i }).click()
    await page
      .getByRole('button', { name: /initialize command interface/i })
      .click()

    // OC=0 by default is < 40 — under the pre-C15 semantic this would
    // have fired the inspection on any downward OC delta. Commit the
    // Week 1 third choice (keybind '3', OC -5 for defer-quarter) which
    // was the seed the old spec used to prove the trigger.
    await page.keyboard.press('3')
    await page.keyboard.press('Enter')

    await expect(
      page.getByRole('dialog', { name: /silas.*inspection/i }),
    ).toHaveCount(0)

    const post = await page.evaluate(() => {
      const w = window as unknown as Partial<Echo9StoreWindow>
      if (!w.__ECHO9_STORE__) {
        throw new Error('Store not exposed on window for tests')
      }
      const s = w.__ECHO9_STORE__.getState()
      return {
        phase: s.phase,
        sceneIndex: s.currentInspectionSceneIndex,
        key: s.currentInspectionKey,
      }
    })
    expect(post.sceneIndex).toBeNull()
    expect(post.key).toBeNull()
    expect(post.phase).not.toBe('INSPECTION')
  })
})
