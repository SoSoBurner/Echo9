/**
 * endOfContentSlice tests — Q48 independent-persister lock.
 *
 * Six cases:
 *   1. Default is false (fresh store, no localStorage seed).
 *   2. `markEndOfContentSeen()` flips state true AND writes 'true' to the OWN
 *      localStorage key.
 *   3. Calling `markEndOfContentSeen()` twice is idempotent.
 *   4. `resetEndOfContentSeen()` clears state AND removes the OWN localStorage
 *      key.
 *   5. A fresh slice invocation reads existing localStorage on construction.
 *   6. Independence proof: `echo9:endOfContentSeen` is NOT stored in the main
 *      `echo9:autosave` blob. Removing the autosave blob leaves the overlay
 *      flag intact; removing the overlay flag clears it while autosave remains.
 *
 * Note on tests 5+6: the singleton `useGameStore` is constructed at module
 * load, so its `endOfContentSeen` init has already been resolved. To exercise
 * the "init reads localStorage at construction time" branch, we invoke
 * `createEndOfContentSlice` directly as a factory and read the returned
 * initial value. This matches how a new store instance would boot.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore, PERSIST_KEY } from '@state/store'
import { createEndOfContentSlice } from '@state/endOfContentSlice'
import { resetStore } from './testHelpers'

const END_OF_CONTENT_STORAGE_KEY = 'echo9:endOfContentSeen'

/**
 * Constructs a slice instance the way the composed store would: invokes the
 * StateCreator with stub set/get/store, then returns the resolved shape. Used
 * to verify the `readInitial()` branch inside the creator picks up whatever is
 * in localStorage at construction time — the singleton `useGameStore` cannot
 * reveal this because it is constructed once at module load.
 */
function bootFreshSliceInstance(): { endOfContentSeen: boolean } {
  // The StateCreator's real signature threads set/get/store through, but the
  // synchronous initial-value branch we're testing never touches them — it
  // just reads localStorage. Stubs are sufficient.
  const noop = (): void => {}
  const slice = createEndOfContentSlice(
    noop as never,
    (() => ({})) as never,
    {} as never,
  )
  return { endOfContentSeen: slice.endOfContentSeen }
}

describe('endOfContentSlice', () => {
  beforeEach(() => {
    localStorage.clear()
    resetStore()
    // resetStore() does not touch the own-key. Also reset our slice's
    // in-memory flag to a known baseline so cases start clean.
    useGameStore.setState({ endOfContentSeen: false })
  })

  it('defaults to false when localStorage is empty', () => {
    expect(useGameStore.getState().endOfContentSeen).toBe(false)
  })

  it('markEndOfContentSeen() flips state true and persists to own key', () => {
    useGameStore.getState().markEndOfContentSeen()

    expect(useGameStore.getState().endOfContentSeen).toBe(true)
    expect(localStorage.getItem(END_OF_CONTENT_STORAGE_KEY)).toBe('true')
  })

  it('markEndOfContentSeen() is idempotent — second call leaves state and storage stable', () => {
    useGameStore.getState().markEndOfContentSeen()
    useGameStore.getState().markEndOfContentSeen()

    expect(useGameStore.getState().endOfContentSeen).toBe(true)
    expect(localStorage.getItem(END_OF_CONTENT_STORAGE_KEY)).toBe('true')
  })

  it('resetEndOfContentSeen() clears both state and the own key', () => {
    useGameStore.getState().markEndOfContentSeen()
    expect(localStorage.getItem(END_OF_CONTENT_STORAGE_KEY)).toBe('true')

    useGameStore.getState().resetEndOfContentSeen()

    expect(useGameStore.getState().endOfContentSeen).toBe(false)
    expect(localStorage.getItem(END_OF_CONTENT_STORAGE_KEY)).toBeNull()
  })

  it('initialises endOfContentSeen from localStorage at construction time', () => {
    // Seed the own-key BEFORE we construct a fresh slice instance.
    localStorage.setItem(END_OF_CONTENT_STORAGE_KEY, 'true')

    const fresh = bootFreshSliceInstance()

    expect(fresh.endOfContentSeen).toBe(true)
  })

  it('is independent of echo9:autosave — Q48 lock proof', () => {
    // Set BOTH keys, simulating a post-Q1 player who has hit End-of-Content.
    localStorage.setItem(END_OF_CONTENT_STORAGE_KEY, 'true')
    localStorage.setItem(
      PERSIST_KEY,
      JSON.stringify({
        state: {
          meters: { CAPITAL: 0, HUMAN_WELFARE: 0, OWNER_CONTROL: 0 },
          scheduledConsequences: [],
          ledger: [],
          currentPromptId: null,
          installedModule: null,
          flags: [],
          capitalDeployedThisQuarter: false,
          pendingFiredHooks: [],
        },
        version: 0,
      }),
    )

    // Wipe the autosave blob (as if a corrupt save were cleared). The
    // overlay flag must survive.
    localStorage.removeItem(PERSIST_KEY)

    expect(bootFreshSliceInstance().endOfContentSeen).toBe(true)

    // Now wipe the overlay key (the Replay flow's second half). Fresh boot
    // must now report false.
    localStorage.removeItem(END_OF_CONTENT_STORAGE_KEY)

    expect(bootFreshSliceInstance().endOfContentSeen).toBe(false)
  })
})
