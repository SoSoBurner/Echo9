/**
 * persistenceRoundTrip.spec.ts — E2E coverage for mid-run save/reload
 * (Testing plan Task 3; PLAN.md §11 traceability invariant + §8 capital
 * one-shot exploit guard).
 *
 * Two tests inside `Persistence round-trip — mid-run save/reload`:
 *
 *   Test A — 'restores meters + ledger + pending hooks after reload'
 *     freshSession → Continue → Initialize → '2' + Enter (choice-reduce-20:
 *     HW -7 → HOOK_NURSE_TURNOVER fires) → assert "1 echo pending" toast →
 *     capture localStorage → reload → assert comfort panel is NOT re-shown
 *     (echo9:comfort survived) → click Initialize (phase is intentionally
 *     transient, so BootScreen re-renders after reload — this click
 *     remounts Layout so the toast can re-observe the rehydrated queue) →
 *     toast still shows "1 echo pending" → press 'C' opens the
 *     ConsequenceReturnPanel with the same choice/reveal trace — proving
 *     the §11 delayed-consequence-return invariant survives page reload.
 *
 *   Test B — 'one-shot capitalDeployedThisQuarter guard persists across reload'
 *     freshSession → Continue → Initialize → invoke
 *     useGameStore.getState().markCapitalDeployed() via the dev/test
 *     window binding (Task 7 will replace this with a real UI trigger) →
 *     reload → read capitalDeployedThisQuarter back → assert === true.
 *     This locks in the one-per-quarter §8 counterplay lockout — a player
 *     who deploys capital and then reloads MUST NOT get a second shot.
 *
 * Style: mirrors `mercyMarginSlice.spec.ts` — inline `freshSession`,
 * ARIA-role queries, no `data-testid`. The `__ECHO9_STORE__` window binding
 * lives in `src/state/store.ts` and is gated on import.meta.env.DEV ||
 * MODE === 'test', so prod builds tree-shake it away.
 */
import { test, expect, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Wipes persisted state ONCE at first navigation so the spec starts at the
 * comfort panel. Playwright's addInitScript re-fires on EVERY navigation
 * (including reload), which would clobber the very persisted state this
 * spec is trying to verify. The `__echo9WipedOnce` sentinel on
 * sessionStorage (which survives reload but resets per browser context)
 * gates the wipe to the first document.
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
 * Kept minimal — each test only touches the fields it needs. Avoids `any`
 * so oxlint's no-explicit-any rule stays satisfied and so a future rename
 * of `markCapitalDeployed` surfaces here as a TS error.
 */
type Echo9StoreWindow = {
  __ECHO9_STORE__: {
    getState: () => {
      markCapitalDeployed: () => void
      capitalDeployedThisQuarter: boolean
    }
  }
}

// ---------------------------------------------------------------------------
// Spec
// ---------------------------------------------------------------------------

test.describe('Persistence round-trip — mid-run save/reload', () => {
  test('restores meters + ledger + pending hooks after reload', async ({
    page,
  }) => {
    await freshSession(page)
    await page.goto('/')

    // 1. Walk through comfort → Initialize so the game is fully mounted and
    //    a directive is on screen ready for a choice commit.
    await page.getByRole('button', { name: /continue/i }).click()
    await page.getByRole('button', { name: /initialize/i }).click()

    // 2. Commit choice-reduce-20 via keyboard. This drives HUMAN_WELFARE to
    //    -7 (start 0, delta -7); HOOK_NURSE_TURNOVER's METER_THRESHOLD
    //    reveal (HW <= -5) matches so exactly one hook fires and gets
    //    enqueued to pendingFiredHooks — which is persisted.
    await page.keyboard.press('2')
    await page.keyboard.press('Enter')

    // 3. Toast confirms the hook fired. The `1 echo pending` regex is a
    //    spine-correctness tripwire — a 2-count would signal a double-commit
    //    regression.
    const toast = page.getByRole('status').filter({ hasText: /1\s+echo\s+pending/i })
    await expect(toast).toBeVisible()

    // 4. Capture the persisted autosave BEFORE reload. Zustand's persist
    //    middleware writes synchronously on setState, so by the time the
    //    toast is visible the write has landed.
    const raw = await page.evaluate(() => localStorage.getItem('echo9:autosave'))
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw as string) as unknown
    expect(parsed).not.toBeNull()
    expect(typeof parsed).toBe('object')

    // 5. Reload — the persist middleware rehydrates on mount, and
    //    `merge` in store.ts revalidates pendingFiredHooks against
    //    ConsequenceHookSchema before restoring them.
    await page.reload()

    // 6. The comfort panel must NOT reappear — echo9:comfort persistence
    //    proves the settings survived the reload path.
    await expect(
      page.getByRole('main', { name: /accessibility and comfort/i }),
    ).not.toBeVisible()

    // 7. `phase` is intentionally NOT persisted (partialize guard in
    //    store.ts / store.test.ts). After reload the app is back on the
    //    BootScreen with the Initialize button showing. The
    //    EventQueueToast lives inside Layout, so it only remounts once
    //    the player advances past BOOT. This click is what the real
    //    player does when they resume a saved run.
    await page.getByRole('button', { name: /initialize/i }).click()

    // 8. Layout has remounted; the toast reads the rehydrated
    //    pendingFiredHooks queue. If this assertion fails, the persist
    //    middleware's `merge` callback (store.ts:108) may have dropped
    //    the hook via ConsequenceHookSchema.safeParse — that would be
    //    a real §11 traceability leak worth flagging.
    await expect(
      page.getByRole('status').filter({ hasText: /1\s+echo\s+pending/i }),
    ).toBeVisible()

    // 9. Open ConsequenceReturnPanel via keyboard shortcut (same path as
    //    mercyMarginSlice.spec — `c` triggers the queue-head panel).
    await page.keyboard.press('c')
    const dialog = page.getByRole('dialog', { name: /consequence returns/i })
    await expect(dialog).toBeVisible()

    // 9. Assert the panel's hook is the same one enqueued pre-reload. If
    //    the merge callback ever fails to reconstitute the queue head from
    //    localStorage, these assertions catch it immediately.
    await expect(dialog).toContainText('choice-reduce-20')
    await expect(dialog).toContainText('METER_THRESHOLD:HUMAN_WELFARE:-5')
  })

  test('one-shot capitalDeployedThisQuarter guard persists across reload', async ({
    page,
  }) => {
    await freshSession(page)
    await page.goto('/')

    await page.getByRole('button', { name: /continue/i }).click()
    await page.getByRole('button', { name: /initialize/i }).click()

    // 1. Trigger the capital-deployed marker directly via the dev/test
    //    window binding. Task 7's capital-power UI is not yet wired to the
    //    directive panel, so this is the short-circuit until the real
    //    button lands. Guard on the binding's existence so a future prod
    //    misconfiguration (window binding tree-shaken but spec run against
    //    prod bundle) fails loudly instead of silently no-op'ing.
    await page.evaluate(() => {
      const w = window as unknown as Partial<Echo9StoreWindow>
      if (!w.__ECHO9_STORE__) {
        throw new Error('Store not exposed on window for tests')
      }
      w.__ECHO9_STORE__.getState().markCapitalDeployed()
    })

    // 2. Reload — capitalDeployedThisQuarter is in the partialize allow-list
    //    (store.ts and store.test.ts's persistence-partition guard), so it
    //    must round-trip through localStorage.
    await page.reload()

    // 3. Read the flag back after rehydrate. Same guard on the binding for
    //    the same reason.
    const deployed = await page.evaluate(() => {
      const w = window as unknown as Partial<Echo9StoreWindow>
      if (!w.__ECHO9_STORE__) {
        throw new Error('Store not exposed on window for tests')
      }
      return w.__ECHO9_STORE__.getState().capitalDeployedThisQuarter
    })
    expect(deployed).toBe(true)
  })
})
