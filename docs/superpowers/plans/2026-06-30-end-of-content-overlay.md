# End-of-Content Overlay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the player a modal dialog once they've reached the last piece of currently-shipped content, driven by a one-line manifest constant so future episodes only need to change one file to move the boundary.

**Architecture:** Three small pieces + one Layout wire-up.
- A **content manifest** exports the single canonical `LAST_AVAILABLE_TASK_ID` (plus a display label). This is the "movable boundary" — future episodes ship, then this constant flips to the new final task.
- A **pure selector** `isAtEndOfContent(state)` fuses two conditions from the composed store: (1) the manifest's last task appears in the ledger (its choice has been committed), AND (2) the `pendingFiredHooks` queue is empty (all echoes acknowledged).
- A **modal `EndOfContentDialog`** using the existing native `<dialog>` pattern (matches `ConsequenceReturnPanel` / `CapitalPowerPanel`), auto-opened on the false→true edge of the selector, dismissable via a Close button and ESC.

**Tech Stack:** TypeScript, React 19, Zustand 5 (existing composed store), Tailwind v4, native `<HTMLDialogElement>`. Tests via Vitest 4 + React Testing Library + Playwright 1.61.

---

## File Structure

| File | Responsibility | Status |
|---|---|---|
| `game/src/content/contentManifest.ts` | Single source of truth for the "last available content" boundary. Exports `LAST_AVAILABLE_TASK_ID` (branded `TaskId`) and `CONTENT_VERSION_LABEL` (display string). This IS the movable boundary. | create |
| `game/src/state/selectors/endOfContent.ts` | Pure selector `isAtEndOfContent(state: RootState): boolean` derived from `ledger` + `pendingFiredHooks` + the manifest. Kept in a new `selectors/` folder so future derived reads have a home. | create |
| `game/src/ui/end/EndOfContentDialog.tsx` | Native-`<dialog>` modal displaying the episode label + a Close button. Mirrors `ConsequenceReturnPanel`'s open/close/focus contract. | create |
| `game/src/ui/shell/Layout.tsx` | Wire the selector to auto-open the dialog once per false→true transition; mount the dialog. | modify (~20 lines added, no removals) |
| `game/src/tests/state/endOfContent.selector.test.ts` | Vitest cases: not at end (fresh state) / at end with queue drained / at end but queue non-empty / task not committed. | create |
| `game/src/tests/ui/EndOfContentDialog.test.tsx` | Vitest + RTL: renders label from manifest, Close button dispatches `onClose`, ESC closes (via `cancel` event), heading receives focus on open. | create |
| `game/src/tests/e2e/endOfContent.spec.ts` | Playwright: walk the Q1 slice from BOOT through the last acknowledged echo, assert the End-of-Content dialog appears. | create |

`PLAN.md` and every other file under `game/src/` is read-only for this plan.

---

## Task 1: Create the content manifest

**Files:**
- Create: `game/src/content/contentManifest.ts`

- [ ] **Step 1: Confirm the file does not exist**

Run: `ls C:/Users/CEO/Echo9/game/src/content/contentManifest.ts 2>&1`
Expected: `ls: cannot access ...: No such file or directory`

- [ ] **Step 2: Write the file**

Create `game/src/content/contentManifest.ts` with this exact content:

```typescript
/**
 * contentManifest — the single mutable boundary marking "last available content".
 *
 * When a future episode ships a new final TaskNode, update BOTH constants
 * below in one edit — no other file needs to change. `endOfContent.selector`
 * consumes `LAST_AVAILABLE_TASK_ID`; `EndOfContentDialog` displays
 * `CONTENT_VERSION_LABEL`.
 *
 * WHY a manifest (not a marker on the TaskNode itself): the "end" is a
 * shipping concern, not a story concern. A TaskNode can be authored months
 * before it becomes the final one; keeping the boundary out of the content
 * files means content authors never think about it.
 */
import { makeTaskId, type TaskId } from '@schemas/gameState.schema'

/** The last TaskNode.id available in the currently-shipped build. */
export const LAST_AVAILABLE_TASK_ID: TaskId = makeTaskId('task-east-wilmer-01')

/** Human-readable label shown in the End-of-Content dialog. */
export const CONTENT_VERSION_LABEL = 'Q1 · East Wilmer · Vertical Slice'
```

- [ ] **Step 3: Typecheck**

Run: `cd game && npx tsc --noEmit 2>&1 | tail -20`
Expected: exit 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add game/src/content/contentManifest.ts
git commit -m "feat(end-of-content): add movable content-boundary manifest"
```

---

## Task 2: Selector + tests

**Files:**
- Create: `game/src/state/selectors/endOfContent.ts`
- Create: `game/src/tests/state/endOfContent.selector.test.ts`

- [ ] **Step 1: Write the failing tests first**

Create `game/src/tests/state/endOfContent.selector.test.ts` with this exact content:

```typescript
/**
 * endOfContent selector tests.
 *
 * Selector is at-end iff BOTH:
 *   - LAST_AVAILABLE_TASK_ID appears as a sourceTaskId in the ledger
 *   - pendingFiredHooks is empty (all echoes acknowledged)
 *
 * Scheduled consequences that haven't fired yet (in `scheduledConsequences`)
 * do NOT block "at end" — they may never fire (e.g. NEVER-reveal hooks) and
 * the player already saw the last acknowledgeable echo when the queue drained.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '@state/store'
import { resetStore } from '@tests/state/testHelpers'
import { isAtEndOfContent } from '@state/selectors/endOfContent'
import { LAST_AVAILABLE_TASK_ID } from '@content/contentManifest'
import {
  makeTaskId,
  makeChoiceId,
  makeTraceId,
} from '@schemas/gameState.schema'
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import {
  fxTaskId,
  fxChoiceId,
  fxConsequenceId,
} from '@tests/schemas/fixtures'

function makeHook(id: string): ConsequenceHook {
  return {
    id: fxConsequenceId(id),
    sourceTaskId: fxTaskId('task-any'),
    sourceChoiceId: fxChoiceId('choice-any'),
    traceHint: 't',
    ledgerEntry: 'l',
    revealCondition: { type: 'PHASE', phase: 'CONSEQUENCE_RETURN' },
    whyNow: 'w',
    whatChanged: 'c',
  }
}

describe('isAtEndOfContent', () => {
  beforeEach(() => {
    resetStore()
  })

  it('returns false on a fresh store (no ledger entries, empty queue)', () => {
    expect(isAtEndOfContent(useGameStore.getState())).toBe(false)
  })

  it('returns false when last task committed but queue still holds echoes', () => {
    useGameStore.setState((s) => ({
      ledger: [
        ...s.ledger,
        {
          id: makeTraceId('trace-1'),
          sourceTaskId: LAST_AVAILABLE_TASK_ID,
          sourceChoiceId: makeChoiceId('choice-any'),
          timestamp: Date.now(),
          body: 'committed',
        },
      ],
      pendingFiredHooks: [makeHook('cons-1')],
    }))
    expect(isAtEndOfContent(useGameStore.getState())).toBe(false)
  })

  it('returns false when queue is empty but last task NOT committed', () => {
    useGameStore.setState((s) => ({
      ledger: [
        ...s.ledger,
        {
          id: makeTraceId('trace-1'),
          sourceTaskId: makeTaskId('task-some-other'),
          sourceChoiceId: makeChoiceId('choice-any'),
          timestamp: Date.now(),
          body: 'other',
        },
      ],
      pendingFiredHooks: [],
    }))
    expect(isAtEndOfContent(useGameStore.getState())).toBe(false)
  })

  it('returns true when last task IS committed AND queue is drained', () => {
    useGameStore.setState((s) => ({
      ledger: [
        ...s.ledger,
        {
          id: makeTraceId('trace-1'),
          sourceTaskId: LAST_AVAILABLE_TASK_ID,
          sourceChoiceId: makeChoiceId('choice-any'),
          timestamp: Date.now(),
          body: 'committed',
        },
      ],
      pendingFiredHooks: [],
    }))
    expect(isAtEndOfContent(useGameStore.getState())).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd game && npx vitest run src/tests/state/endOfContent.selector.test.ts 2>&1 | tail -30`
Expected: FAIL — cannot resolve `@state/selectors/endOfContent`.

- [ ] **Step 3: Write the selector**

Create `game/src/state/selectors/endOfContent.ts` with this exact content:

```typescript
/**
 * endOfContent selector — pure derived read.
 *
 * TRUE iff:
 *   - The manifest's LAST_AVAILABLE_TASK_ID appears as a sourceTaskId in the
 *     ledger (the player committed a choice on it), AND
 *   - `pendingFiredHooks` is empty (no echo is waiting for acknowledgement).
 *
 * Kept outside the slices because it derives across multiple slices (ledger
 * + eventQueue). Adding it to a slice would either duplicate state or force
 * one slice to import another's shape.
 */
import type { RootState } from '@state/store'
import { LAST_AVAILABLE_TASK_ID } from '@content/contentManifest'

export function isAtEndOfContent(state: RootState): boolean {
  const lastTaskCommitted = state.ledger.some(
    (trace) => trace.sourceTaskId === LAST_AVAILABLE_TASK_ID,
  )
  const queueEmpty = state.pendingFiredHooks.length === 0
  return lastTaskCommitted && queueEmpty
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd game && npx vitest run src/tests/state/endOfContent.selector.test.ts 2>&1 | tail -20`
Expected: PASS, 4/4 tests.

- [ ] **Step 5: Lint + typecheck**

Run: `cd game && npx oxlint src/state/selectors/endOfContent.ts src/tests/state/endOfContent.selector.test.ts 2>&1 | tail -20 && npx tsc --noEmit 2>&1 | tail -20`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add game/src/state/selectors/endOfContent.ts game/src/tests/state/endOfContent.selector.test.ts
git commit -m "feat(end-of-content): add isAtEndOfContent selector"
```

---

## Task 3: Modal dialog component + tests

**Files:**
- Create: `game/src/ui/end/EndOfContentDialog.tsx`
- Create: `game/src/tests/ui/EndOfContentDialog.test.tsx`

- [ ] **Step 1: Write the failing tests first**

Create `game/src/tests/ui/EndOfContentDialog.test.tsx` with this exact content:

```typescript
/**
 * EndOfContentDialog tests.
 *
 * Mirrors the ConsequenceReturnPanel test setup — jsdom's <dialog> is
 * incomplete, so we stub showModal/close and read `.open` for state.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import React from 'react'
import { EndOfContentDialog } from '@ui/end/EndOfContentDialog'
import { CONTENT_VERSION_LABEL } from '@content/contentManifest'

beforeEach(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.open = true
    }
  } else {
    vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function (
      this: HTMLDialogElement,
    ) {
      this.open = true
    })
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () {
      this.open = false
    }
  } else {
    vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (
      this: HTMLDialogElement,
    ) {
      this.open = false
    })
  }
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('EndOfContentDialog', () => {
  it('renders the version label when open', () => {
    render(<EndOfContentDialog open={true} onClose={() => {}} />)
    expect(screen.getByText(CONTENT_VERSION_LABEL)).toBeInTheDocument()
  })

  it('does not render body content when closed', () => {
    render(<EndOfContentDialog open={false} onClose={() => {}} />)
    expect(screen.queryByText(CONTENT_VERSION_LABEL)).not.toBeInTheDocument()
  })

  it('calls onClose when the Close button is clicked', () => {
    const onClose = vi.fn()
    render(<EndOfContentDialog open={true} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the dialog fires the cancel (ESC) event', () => {
    const onClose = vi.fn()
    const { container } = render(
      <EndOfContentDialog open={true} onClose={onClose} />,
    )
    const dlg = container.querySelector('dialog')
    expect(dlg).not.toBeNull()
    fireEvent(dlg!, new Event('cancel'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('moves focus to the heading when opened', () => {
    render(<EndOfContentDialog open={true} onClose={() => {}} />)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(document.activeElement).toBe(heading)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd game && npx vitest run src/tests/ui/EndOfContentDialog.test.tsx 2>&1 | tail -30`
Expected: FAIL — cannot resolve `@ui/end/EndOfContentDialog`.

- [ ] **Step 3: Write the component**

Create `game/src/ui/end/EndOfContentDialog.tsx` with this exact content:

```typescript
/**
 * EndOfContentDialog — modal shown when the player has reached the last
 * currently-shipped piece of content.
 *
 * Follows the ConsequenceReturnPanel contract:
 *   - Single native <dialog> element always mounts; the body is conditionally
 *     rendered so `aria-labelledby` never points at a missing id.
 *   - On open, focus moves synchronously to the heading (tabIndex=-1) for
 *     screen-reader parity with other Echo9 dialogs (PLAN.md §10).
 *   - ESC closes (the player can dismiss and keep browsing the ledger).
 *   - No backdrop click handler — there's no "defer" concept at the end of
 *     content, but the Close button and ESC provide equivalent exits.
 */
import { useCallback, useEffect, useRef } from 'react'
import { CONTENT_VERSION_LABEL } from '@content/contentManifest'

interface EndOfContentDialogProps {
  open: boolean
  onClose: () => void
}

export function EndOfContentDialog({ open, onClose }: EndOfContentDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const dlg = dialogRef.current
    if (!dlg) return
    if (open && !dlg.open) {
      dlg.showModal()
      headingRef.current?.focus()
    } else if (!open && dlg.open) {
      dlg.close()
    }
  }, [open])

  useEffect(() => {
    const dlg = dialogRef.current
    if (!dlg) return
    const onCancel = (_e: Event) => {
      onClose()
    }
    dlg.addEventListener('cancel', onCancel)
    return () => dlg.removeEventListener('cancel', onCancel)
  }, [onClose])

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={open ? 'end-of-content-title' : undefined}
      className={[
        'p-0 m-auto bg-background text-fg-primary border border-silas-accent',
        'min-w-[480px] max-w-[640px]',
        '[&::backdrop]:bg-black/70',
      ].join(' ')}
    >
      {open && (
        <div className="p-6 space-y-4">
          <header className="flex items-baseline justify-between">
            <h2
              id="end-of-content-title"
              ref={headingRef}
              tabIndex={-1}
              className="text-silas-accent text-xs font-mono uppercase tracking-widest focus:outline-none"
            >
              End of Currently Available Content
            </h2>
            <span className="text-fg-secondary text-xs font-mono">
              Echo9
            </span>
          </header>

          <p className="text-sm text-fg-primary leading-relaxed">
            You&#39;ve reached the last beat of the currently released build.
            More episodes are on the way — thank you for playing.
          </p>

          <p className="text-xs font-mono uppercase tracking-wider text-fg-secondary">
            {CONTENT_VERSION_LABEL}
          </p>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleClose}
              className={[
                'px-4 py-2 text-xs font-mono uppercase tracking-widest',
                'border border-null-accent text-null-accent',
                'hover:bg-null-accent hover:text-background',
                'focus:outline-none focus:ring-2 focus:ring-null-accent',
              ].join(' ')}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd game && npx vitest run src/tests/ui/EndOfContentDialog.test.tsx 2>&1 | tail -20`
Expected: PASS, 5/5 tests.

- [ ] **Step 5: Lint + typecheck**

Run: `cd game && npx oxlint src/ui/end/EndOfContentDialog.tsx src/tests/ui/EndOfContentDialog.test.tsx 2>&1 | tail -20 && npx tsc --noEmit 2>&1 | tail -20`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add game/src/ui/end/EndOfContentDialog.tsx game/src/tests/ui/EndOfContentDialog.test.tsx
git commit -m "feat(end-of-content): add EndOfContentDialog modal"
```

---

## Task 4: Wire the dialog into Layout with auto-open

**Files:**
- Modify: `game/src/ui/shell/Layout.tsx`

- [ ] **Step 1: Read the current Layout to find the correct insertion points**

Run: `cd game && grep -n "EndOfContentDialog\|EventQueueToast\|capitalAutoOpenedRef\|ConsequenceReturnPanel" src/ui/shell/Layout.tsx`
Expected: no matches for `EndOfContentDialog`; existing matches for the others.

- [ ] **Step 2: Add the import**

Edit `game/src/ui/shell/Layout.tsx`. Find:

```typescript
import { ConsequenceReturnPanel } from '@ui/consequence/ConsequenceReturnPanel'
import { EventQueueToast } from '@ui/consequence/EventQueueToast'
```

Replace with:

```typescript
import { ConsequenceReturnPanel } from '@ui/consequence/ConsequenceReturnPanel'
import { EventQueueToast } from '@ui/consequence/EventQueueToast'
import { EndOfContentDialog } from '@ui/end/EndOfContentDialog'
import { isAtEndOfContent } from '@state/selectors/endOfContent'
```

- [ ] **Step 3: Add the state + auto-open effect**

Edit `game/src/ui/shell/Layout.tsx`. Find this block (the CapitalPowerPanel auto-open ref/effect):

```typescript
  const capitalAutoOpenedRef = useRef(false)
  useEffect(() => {
    if (capitalShouldShow && !capitalAutoOpenedRef.current) {
      capitalAutoOpenedRef.current = true
      setShowCapital(true)
    }
    if (!capitalShouldShow) {
      capitalAutoOpenedRef.current = false
    }
  }, [capitalShouldShow])
```

Immediately AFTER this block, add:

```typescript
  // End-of-content dialog: auto-open on the first false→true transition of
  // isAtEndOfContent. The ref guard prevents re-opening after the player
  // dismisses it in the same session (matches CapitalPowerPanel's contract).
  const [showEndOfContent, setShowEndOfContent] = useState(false)
  const atEndOfContent = useGameStore(isAtEndOfContent)
  const endOfContentAutoOpenedRef = useRef(false)
  useEffect(() => {
    if (atEndOfContent && !endOfContentAutoOpenedRef.current) {
      endOfContentAutoOpenedRef.current = true
      setShowEndOfContent(true)
    }
    if (!atEndOfContent) {
      endOfContentAutoOpenedRef.current = false
    }
  }, [atEndOfContent])
```

- [ ] **Step 4: Mount the dialog**

Edit `game/src/ui/shell/Layout.tsx`. Find:

```tsx
      <EventQueueToast />
      <ConsequenceReturnPanel
        open={showConsequencePanel}
        onClose={() => setShowConsequencePanel(false)}
      />
    </>
  )
}
```

Replace with:

```tsx
      <EventQueueToast />
      <ConsequenceReturnPanel
        open={showConsequencePanel}
        onClose={() => setShowConsequencePanel(false)}
      />
      <EndOfContentDialog
        open={showEndOfContent}
        onClose={() => setShowEndOfContent(false)}
      />
    </>
  )
}
```

- [ ] **Step 5: Typecheck + lint**

Run: `cd game && npx tsc --noEmit 2>&1 | tail -20 && npx oxlint src/ui/shell/Layout.tsx 2>&1 | tail -20`
Expected: no errors.

- [ ] **Step 6: Run the full unit test suite as a smoke check**

Run: `cd game && npx vitest run 2>&1 | tail -20`
Expected: all tests pass (no regressions in Layout-adjacent tests).

- [ ] **Step 7: Commit**

```bash
git add game/src/ui/shell/Layout.tsx
git commit -m "feat(end-of-content): wire EndOfContentDialog auto-open in Layout"
```

---

## Task 5: E2E spec — walk to end of content and assert dialog appears

**Files:**
- Create: `game/src/tests/e2e/endOfContent.spec.ts`

- [ ] **Step 1: Read the existing slice E2E to reuse its walk helpers**

Run: `cd game && head -80 src/tests/e2e/mercyMarginSlice.spec.ts`
Expected: the file uses `page.addInitScript` to clear `echo9:autosave`, then walks BootScreen → CenterDirectivePanel → choose → ResultCard → 'C' key → ConsequenceReturnPanel → Acknowledge.

- [ ] **Step 2: Write the E2E spec**

Create `game/src/tests/e2e/endOfContent.spec.ts` with this exact content:

```typescript
/**
 * endOfContent.spec.ts — verifies the End-of-Content dialog appears once the
 * player has committed a choice on LAST_AVAILABLE_TASK_ID and drained the
 * consequence-return queue.
 *
 * Walk mirrors mercyMarginSlice.spec.ts:
 *   comfort panel → Continue
 *     → BootScreen [ Initialize Command Interface ]
 *       → directive
 *         → press '2' + Enter (commits choice-reduce-20 → schedules echo)
 *           → ResultCard renders
 *           → 'C' opens ConsequenceReturnPanel
 *             → Acknowledge drains the queue
 *               → EndOfContentDialog auto-opens (queue empty + last task in ledger)
 */
import { test, expect, type Page } from '@playwright/test'

async function clearPersist(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.removeItem('echo9:autosave')
    localStorage.removeItem('echo9:comfort')
  })
}

test('EndOfContentDialog appears after the last echo is acknowledged', async ({
  page,
}) => {
  await clearPersist(page)
  await page.goto('/')

  // Comfort panel → Continue
  await page.getByRole('button', { name: /continue/i }).click()

  // BootScreen → Initialize
  await page
    .getByRole('button', { name: /initialize command interface/i })
    .click()

  // Directive is now mounted. Press '2' to select choice-reduce-20
  // (HUMAN_WELFARE -7 → HOOK_NURSE_TURNOVER fires immediately).
  await page.keyboard.press('2')
  await page.keyboard.press('Enter')

  // EventQueueToast should announce a pending echo.
  await expect(page.getByText(/1 echo/i)).toBeVisible()

  // 'C' opens the ConsequenceReturnPanel.
  await page.keyboard.press('c')
  await expect(page.getByText(/consequence returns/i)).toBeVisible()

  // Acknowledge → queue drains → EndOfContentDialog auto-opens.
  await page.getByRole('button', { name: /acknowledge/i }).click()

  await expect(
    page.getByRole('heading', { name: /end of currently available content/i }),
  ).toBeVisible()

  // Close dismisses.
  await page.getByRole('button', { name: /^close$/i }).click()
  await expect(
    page.getByRole('heading', { name: /end of currently available content/i }),
  ).not.toBeVisible()
})
```

- [ ] **Step 3: Run the E2E spec**

Run: `cd game && npx playwright test src/tests/e2e/endOfContent.spec.ts 2>&1 | tail -30`
Expected: PASS, 1 test.

- [ ] **Step 4: Lint the new spec**

Run: `cd game && npx oxlint src/tests/e2e/endOfContent.spec.ts 2>&1 | tail -20`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add game/src/tests/e2e/endOfContent.spec.ts
git commit -m "test(end-of-content): E2E spec — dialog appears after queue drain"
```

---

## Final verification (whole feature)

- [ ] **Step 1: Run the verification trinity from `game/`**

Run: `cd game && npx tsc --noEmit 2>&1 | tail -10 && npx oxlint 2>&1 | tail -10 && npx vitest run 2>&1 | tail -20`
Expected: no type errors, no new lint findings, all vitest suites green.

- [ ] **Step 2: Verify the boundary is trivially movable**

Open `game/src/content/contentManifest.ts`. Confirm that changing `LAST_AVAILABLE_TASK_ID` and `CONTENT_VERSION_LABEL` is the only edit needed to move the boundary; no other file references either constant except the selector, the dialog, and their tests.

Run: `cd game && grep -rn "LAST_AVAILABLE_TASK_ID\|CONTENT_VERSION_LABEL" src 2>&1`
Expected consumers:
- `src/content/contentManifest.ts` (definitions)
- `src/state/selectors/endOfContent.ts` (uses `LAST_AVAILABLE_TASK_ID`)
- `src/ui/end/EndOfContentDialog.tsx` (uses `CONTENT_VERSION_LABEL`)
- three test files under `src/tests/**`

If any other file references either constant, that file must be considered part of the boundary — flag and stop.
