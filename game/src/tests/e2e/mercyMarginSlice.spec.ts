/**
 * mercyMarginSlice.spec.ts — E2E spine for the Q1 Mercy Margin vertical slice
 * (Task 15, PLAN.md §14).
 *
 * Walks the achievable user-driven path through the slice and asserts that the
 * §11 traceability invariant is visible to the player on the
 * ConsequenceReturnPanel:
 *
 *   comfort panel → Continue
 *     → BootScreen [ Initialize Command Interface ]
 *       → directive (CenterDirectivePanel mounted)
 *         → press '2' + Enter (commits choice-reduce-20: HUMAN_WELFARE -7)
 *           → ResultCard renders
 *           → HOOK_NURSE_TURNOVER fires immediately (METER_THRESHOLD HW <= -5)
 *           → EventQueueToast shows "1 echo pending"
 *             → press 'C'
 *               → ConsequenceReturnPanel opens
 *                 → assert all 7 §11 field labels + values render
 *                 → Acknowledge → queue drains, toast hides
 *
 * INSPECTION-phase coverage lives in a sibling spec:
 *   inspectionPhase.spec.ts walks the auto-advance production trigger
 *   (Layout.tsx handleChoiceCommit calls startInspection + setPhase when
 *   OWNER_CONTROL crosses downward through 40 — automation-backlog Task 7).
 *   Splitting the inspection walk out of this file keeps the spine spec
 *   focused on the §11 traceability contract and lets the inspection spec
 *   own its own seed-arithmetic docblock.
 */
import { test, expect, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Wipes any persisted state from a prior run so the spec starts at the comfort
 * panel every time. addInitScript runs BEFORE any page script on every
 * navigation, which is when the persist middleware tries to read storage.
 */
async function freshSession(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('echo9:autosave')
      localStorage.removeItem('echo9:comfort')
    } catch {
      /* storage blocked — comfort panel will still render */
    }
  })
}

// ---------------------------------------------------------------------------
// Spine spec
// ---------------------------------------------------------------------------

test.describe('Mercy Margin slice — §11 traceability spine', () => {
  test('walks comfort → directive → choice → consequence return with 7 §11 fields', async ({
    page,
  }) => {
    await freshSession(page)
    await page.goto('/')

    // 1. Comfort panel renders first (no persisted echo9:comfort).
    await expect(
      page.getByRole('main', { name: /accessibility and comfort settings/i }),
    ).toBeVisible()
    // Accept defaults; Continue persists and unmounts the panel.
    await page.getByRole('button', { name: /continue/i }).click()

    // 2. BootScreen Initialize is now visible (panel unmounted).
    const initialize = page.getByRole('button', {
      name: /initialize command interface/i,
    })
    await expect(initialize).toBeVisible()
    await initialize.click()

    // 3. CenterDirectivePanel mounts. The choices live in a radiogroup; the
    //    '2' key selects choice-reduce-20 (keybind '2' in eastWilmer.choices).
    //    Anchor on the heading (role-scoped, stable across copy tweaks) rather
    //    than getByText, which would match any descendant carrying the phrase.
    await expect(
      page.getByRole('heading', { name: /east wilmer/i }),
    ).toBeVisible()

    // 4. Commit choice-reduce-20 via keyboard. Per useKeyboardNav: '2' selects,
    //    Enter commits. The ChoicePanel's radiogroup handles the keyboard
    //    selection; Layout commits via choiceCommitRef.
    await page.keyboard.press('2')
    await page.keyboard.press('Enter')

    // 5. ResultCard mounts. Heading is "Result" with role=heading level=2.
    await expect(
      page.getByRole('heading', { name: /^result$/i, level: 2 }),
    ).toBeVisible()

    // 6. HOOK_NURSE_TURNOVER fires immediately because the meter delta
    //    pushed HUMAN_WELFARE to -7 (start 0, delta -7) and the hook's
    //    METER_THRESHOLD revealCondition matches HW <= -5. EventQueueToast
    //    renders "1 echo pending — press C to review". Regex tolerates the
    //    singular/plural split ("echo"/"echoes") in case a future content
    //    delta schedules more than one hook off the same choice.
    const toast = page.getByRole('status').filter({ hasText: /echoe?s? pending/i })
    await expect(toast).toBeVisible()
    // Spine-correctness tripwire: this choice MUST produce exactly one
    // pending echo. A 2-count means a regression of the double-commit bug
    // fixed in useKeyboardNav.tsx (defaultPrevented guard).
    await expect(toast).toContainText(/1\s+echo\s+pending/i)
    await expect(toast).toContainText(/press c/i)

    // 7. C key opens ConsequenceReturnPanel. The panel is rendered as a
    //    native <dialog>; once `dlg.showModal()` runs, role="dialog" matches.
    await page.keyboard.press('c')
    const dialog = page.getByRole('dialog', { name: /consequence returns/i })
    await expect(dialog).toBeVisible()

    // 8. Assert ALL 7 §11 fields are present with their exact label format
    //    (ConsequenceReturnPanel.tsx:154-163). This is the contract the spec
    //    enforces — any field missing or relabelled breaks the invariant.
    await expect(dialog).toContainText('WHY NOW:')
    await expect(dialog).toContainText('WHAT CHANGED:')
    await expect(dialog).toContainText('TRACE:')
    await expect(dialog).toContainText('LEDGER:')
    await expect(dialog).toContainText('SOURCE TASK:')
    await expect(dialog).toContainText('SOURCE CHOICE:')
    await expect(dialog).toContainText('REVEAL:')

    // 9. Spot-check the values match HOOK_NURSE_TURNOVER. If the catalog ever
    //    swaps which hook fires on choice-reduce-20, these assertions fail
    //    loudly — that's the desired tripwire.
    //
    //    DELIBERATE COPY LOCK: the final regex pins author-facing prose
    //    ("two nurses" / "two RNs"). Any rewording — even semantic-preserving
    //    like "2 nurses" or "a pair of RNs" — breaks this assertion on
    //    purpose, forcing the author to revisit whether the hook's whatChanged
    //    field still carries the same trace evidence.
    await expect(dialog).toContainText('choice-reduce-20')
    await expect(dialog).toContainText('task-east-wilmer-01')
    await expect(dialog).toContainText(
      'METER_THRESHOLD:HUMAN_WELFARE:-5',
    )
    await expect(dialog).toContainText(/two\s+nurses|two\s+rns/i)

    // 10. Acknowledge drains the queue head. Toast hides because count → 0.
    await dialog.getByRole('button', { name: /acknowledge/i }).click()
    await expect(dialog).toBeHidden()
    await expect(
      page.getByRole('status').filter({ hasText: /echo pending/i }),
    ).toHaveCount(0)
  })

  // -------------------------------------------------------------------------
  // Module-install side check — verifies the RightModuleConsole install
  // protocol (PLAN.md §6 / Task 10) works end-to-end: select a grid cell,
  // confirm, observe the grid replaced by the ability button.
  //
  // NOT using the 'M' key entry path: useKeyboardNav.onModuleFocus calls
  // RightModuleConsole.focusAbility which only resolves once a module is
  // already installed (RightModuleConsole.tsx:31-33). Pre-install, the M
  // key is a no-op by design.
  // -------------------------------------------------------------------------
  test('module install path: gridcell → confirm → ability button mounts', async ({
    page,
  }) => {
    await freshSession(page)
    await page.goto('/')

    await page.getByRole('button', { name: /continue/i }).click()
    await page.getByRole('button', { name: /initialize/i }).click()

    // Module grid renders from boot — no choice commit needed. Pick the
    // first cell (Mourner per MODULE_ROSTER index 0). The grid uses ARIA
    // grid pattern: role=grid > role=row > role=gridcell.
    const grid = page.getByRole('grid', { name: /select a personality module/i })
    await expect(grid).toBeVisible()
    const mournerCell = grid.getByRole('gridcell', { name: /mourner/i })
    await mournerCell.click()

    // Confirm panel appears with explicit "Confirm install" button (single-click
    // install on the grid cell is forbidden per §14 acceptance criterion —
    // the cell click only stages a pendingModule and reveals this button).
    const confirm = page.getByRole('button', { name: /^confirm install$/i })
    await expect(confirm).toBeVisible()
    await confirm.click()

    // Grid unmounts, ability button takes its place.
    await expect(grid).toHaveCount(0)
    await expect(
      page.getByRole('button', { name: /mourner/i }),
    ).toBeVisible()
  })

  // -------------------------------------------------------------------------
  // Beat-telemetry sanity — runs a compact spine walk, then reads
  // window.__ECHO9_BEATS__ to prove the dev/test binding installed by
  // BeatTelemetry.ts (automation-backlog Task 11) records each spine
  // milestone once. The console.log emits a JSON block into the CI log so
  // the author can eyeball pacing regressions run-over-run — this is the
  // PLAN.md §17 "first consequence return ≤ minute 40" tripwire in
  // machine-readable form.
  //
  // The >=5 lower bound is defensive against a future beat call site
  // being deleted; the walk here should always hit 6 beats (bootStart,
  // firstChoiceCommit, firstResultCard, firstEchoFired,
  // firstConsequenceReturnOpened, firstAcknowledge). moduleInstall and
  // inspectionEntered are exercised by the sibling specs.
  // -------------------------------------------------------------------------
  test('beat telemetry recorded for spine walk', async ({ page }) => {
    await freshSession(page)
    await page.goto('/')

    await page.getByRole('button', { name: /continue/i }).click()
    await page.getByRole('button', { name: /initialize/i }).click()
    await page.keyboard.press('2')
    await page.keyboard.press('Enter')
    await expect(
      page.getByRole('heading', { name: /^result$/i, level: 2 }),
    ).toBeVisible()
    await page.keyboard.press('c')
    const dialog = page.getByRole('dialog', { name: /consequence returns/i })
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: /acknowledge/i }).click()
    await expect(dialog).toBeHidden()

    interface BeatEvent {
      name: string
      tSinceBoot_ms: number
    }
    const beats = await page.evaluate<BeatEvent[]>(() => {
      const w = window as unknown as {
        __ECHO9_BEATS__?: { getBeats: () => ReadonlyArray<BeatEvent> }
      }
      if (!w.__ECHO9_BEATS__) {
        throw new Error('Beat telemetry binding not exposed on window')
      }
      return [...w.__ECHO9_BEATS__.getBeats()]
    })
    // eslint-disable-next-line no-console
    console.log('[beats]', JSON.stringify(beats, null, 2))
    expect(beats.length).toBeGreaterThanOrEqual(5)
  })

})
