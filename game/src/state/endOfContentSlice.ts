/**
 * endOfContentSlice — one-shot flag for the Q1 End-of-Content overlay (Q48 lock).
 *
 * The overlay appears when the terminal Content-Boundary hook (see
 * `contentBoundary.manifest.ts`) fires. Once shown, `endOfContentSeen` flips to
 * true so the overlay does not re-mount every render.
 *
 * SEPARATE PERSISTER (Q48 design lock): this flag is stored under its OWN
 * localStorage key, `echo9:endOfContentSeen`, INDEPENDENT of the main
 * `echo9:autosave` blob. Rationale: the Replay flow must wipe BOTH keys, but
 * closing the browser tab without Replay must leave `endOfContentSeen === true`
 * so the overlay reappears on next boot. Bundling this into the main persist
 * partialize would couple its lifetime to the autosave blob's lifetime, which
 * breaks that independence.
 *
 * Implementation:
 * - `endOfContentSeen` is initialised from localStorage at StateCreator time.
 * - `markEndOfContentSeen` writes true to state AND localStorage in one action.
 * - `resetEndOfContentSeen` clears both state and localStorage.
 * - This slice is intentionally NOT in the main store's `partialize` allow-list.
 *   The store.test.ts partition guard enforces that boundary.
 */
import type { StateCreator } from 'zustand'
import type { RootState } from './store'

export const END_OF_CONTENT_STORAGE_KEY = 'echo9:endOfContentSeen'

const readInitial = (): boolean => {
  try {
    return localStorage.getItem(END_OF_CONTENT_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export type EndOfContentSlice = {
  endOfContentSeen: boolean
  /** Marks the End-of-Content overlay as shown (state + own localStorage key). */
  markEndOfContentSeen: () => void
  /** Clears the flag (state + own localStorage key). Called by Replay flow. */
  resetEndOfContentSeen: () => void
}

export const createEndOfContentSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  EndOfContentSlice
> = (set) => ({
  endOfContentSeen: readInitial(),
  markEndOfContentSeen: () =>
    set((state) => {
      state.endOfContentSeen = true
      try {
        localStorage.setItem(END_OF_CONTENT_STORAGE_KEY, 'true')
      } catch {
        // localStorage unavailable (private mode, quota) — state still flips
        // in memory so the overlay dismisses for this session.
      }
    }),
  resetEndOfContentSeen: () =>
    set((state) => {
      state.endOfContentSeen = false
      try {
        localStorage.removeItem(END_OF_CONTENT_STORAGE_KEY)
      } catch {
        // Same fallback: in-memory reset stands even if storage refuses.
      }
    }),
})
