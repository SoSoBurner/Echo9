/**
 * comfortRehydration.spec.ts — E2E coverage for the `echo9:comfort`
 * localStorage rehydration path (Testing plan Task 4; PLAN.md §10
 * Accessibility & Comfort panel + §3.3.7 Redundant Entry).
 *
 * Two tests inside `Comfort settings rehydration`:
 *
 *   Test 1 — 'setting comfort + reload → panel does NOT reappear'
 *     freshSession (with a sessionStorage `__echo9WipedOnce` sentinel so the
 *     init-script wipe only fires on the FIRST navigation — otherwise the
 *     reload would clobber the very comfort payload the test is trying to
 *     verify) → goto('/') → assert AccessibilityComfortPanel visible →
 *     click the "Reduced motion" radio → click Continue → assert BootScreen
 *     Initialize button visible → reload → assert the comfort panel does NOT
 *     reappear → assert Initialize button still visible → read
 *     `echo9:comfort` from localStorage and assert `stored.motion ===
 *     'reduced'`. This locks in BootScreen.tsx:23-32's `hasValidPersistedComfort`
 *     rehydrate path — a valid payload must skip the panel on next boot.
 *
 *   Test 2 — 'corrupted comfort storage → panel reappears with defaults (no crash)'
 *     addInitScript writes truncated JSON (`'{"motion":'`) into
 *     `echo9:comfort` → goto('/') → assert AccessibilityComfortPanel IS
 *     visible. This locks in BootScreen.tsx:26-31's try/catch +
 *     `ComfortSettingsSchema.safeParse` fallback: a corrupt payload must
 *     reroute to first-boot behaviour, not crash the app.
 *
 * SCHEMA SHAPE REFERENCED (src/schemas/comfortSettings.schema.ts):
 *   {
 *     textSize:      'S' | 'M' | 'L' | 'XL',
 *     motion:        'full' | 'reduced' | 'none',
 *     contrast:      'standard' | 'increased',
 *     voicePrefix:   'off' | 'silas' | 'silas-says',
 *     narrationPace: 'instant' | 'polite-queue' | 'on-demand',
 *     pauseOnBlur:   'on' | 'off',
 *   }
 *
 * API DRIFTS CORRECTED FROM THE TASK PLAN (for future readers):
 *
 *   1. The plan drafted the motion-radio matcher as `/reduced motion.*on/i`.
 *      The actual radio label is literally "Reduced motion"
 *      (AccessibilityComfortPanel.tsx:49). The trailing "on" would fail to
 *      match — the correct matcher is `/reduced motion/i`.
 *
 *   2. The plan drafted `expect(stored.reducedMotion).toBe(true)`. That
 *      field does NOT exist on ComfortSettings. The schema stores motion as
 *      a string enum: `motion: 'full' | 'reduced' | 'none'`. The correct
 *      assertion is `expect(stored.motion).toBe('reduced')`.
 *
 * STORAGE KEY POLICY:
 *   `'echo9:comfort'` is hardcoded as a string literal — NOT imported from
 *   `@schemas/comfortSettings.schema`. Rationale: E2E specs should surface
 *   schema-key drift (a rename would break the persisted contract with any
 *   already-shipped save), not paper over it via a shared import.
 */
import { test, expect, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Wipes persisted state ONCE at first navigation so the spec starts at the
 * comfort panel. Playwright's addInitScript re-fires on EVERY navigation
 * (including reload), which would clobber the very persisted state Test 1
 * is trying to verify. The `__echo9WipedOnce` sentinel on sessionStorage
 * (which survives reload but resets per browser context) gates the wipe to
 * the first document — mirrors persistenceRoundTrip.spec.ts:46-57.
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

// ---------------------------------------------------------------------------
// Spec
// ---------------------------------------------------------------------------

test.describe('Comfort settings rehydration', () => {
  test('setting comfort + reload → panel does NOT reappear', async ({
    page,
  }) => {
    await freshSession(page)
    await page.goto('/')

    // 1. First boot: no persisted echo9:comfort, so the panel renders.
    await expect(
      page.getByRole('main', { name: /accessibility and comfort settings/i }),
    ).toBeVisible()

    // 2. Toggle motion to "reduced". Label is literally "Reduced motion" —
    //    NOT "Reduced motion on" — see AccessibilityComfortPanel.tsx:49.
    await page.getByRole('radio', { name: /reduced motion/i }).click()

    // 3. Continue persists the settings via
    //    `localStorage.setItem(COMFORT_STORAGE_KEY, JSON.stringify(settings))`
    //    (AccessibilityComfortPanel.tsx:82) and unmounts the panel.
    await page.getByRole('button', { name: /continue/i }).click()

    // 4. BootScreen Initialize button confirms the panel unmounted and the
    //    replay path took over.
    const initialize = page.getByRole('button', {
      name: /initialize command interface/i,
    })
    await expect(initialize).toBeVisible()

    // 5. Reload — BootScreen's `hasValidPersistedComfort` reads localStorage
    //    and safeParses on mount (BootScreen.tsx:23-32).
    await page.reload()

    // 6. The comfort panel MUST NOT reappear — this is the §3.3.7 Redundant
    //    Entry contract the rehydrate path exists to satisfy.
    await expect(
      page.getByRole('main', { name: /accessibility and comfort settings/i }),
    ).not.toBeVisible()

    // 7. Initialize is still there immediately post-reload — BootScreen
    //    short-circuited straight to the replay branch.
    await expect(
      page.getByRole('button', { name: /initialize command interface/i }),
    ).toBeVisible()

    // 8. Cross-check the persisted payload actually carries our toggle.
    //    Uses the string enum `motion: 'reduced'`, NOT a boolean
    //    `reducedMotion: true` — see the file header note.
    const stored = await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('echo9:comfort') ?? '{}') as {
          motion?: string
        },
    )
    expect(stored.motion).toBe('reduced')
  })

  test('corrupted comfort storage → panel reappears with defaults (no crash)', async ({
    page,
  }) => {
    // 1. Seed truncated JSON BEFORE navigation so the persist read in
    //    BootScreen sees the malformed payload on first paint. No
    //    freshSession wipe here — we WANT this corrupt string to survive
    //    into the page's initial script pass.
    await page.addInitScript(() => {
      try {
        localStorage.setItem('echo9:comfort', '{"motion":')
      } catch {
        /* storage blocked — panel will still render (first-boot fallback) */
      }
    })

    await page.goto('/')

    // 2. BootScreen's try/catch around JSON.parse + safeParse
    //    (BootScreen.tsx:26-31) must reroute to the panel rather than
    //    crash. If this assertion fails, the corrupted-storage fallback is
    //    broken and a tampered/partial write would white-screen the app.
    await expect(
      page.getByRole('main', { name: /accessibility and comfort settings/i }),
    ).toBeVisible()
  })
})
