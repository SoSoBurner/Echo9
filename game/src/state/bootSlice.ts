/**
 * bootSlice — runtime phase transition state.
 *
 * Owns the `SlicePhase` cursor that tracks which beat of the 45-minute
 * vertical-slice hook the player is currently in (PLAN.md §6). NOT persisted:
 * phase is rehydrated by gameplay flow on resume, not by save state.
 *
 * `SlicePhase` is imported from `@schemas/gameState.schema` — schemas are the
 * single source of truth for shared types (PLAN.md §11).
 */
import type { StateCreator } from 'zustand'
import type { SlicePhase } from '@schemas/gameState.schema'
import type { RootState } from './store'
import { runAwakeningSequence } from '@systems/tutorial/awakeningSequence'

export type BootSlice = {
  phase: SlicePhase
  /**
   * BOOT → FIRST_DIRECTIVE plus the E1 awakening sequence (discloses the
   * DIRECTIVE panel so the first directive has a container to land in).
   * Called by BootScreen on user gesture. Reads `disclosePanel` through
   * `get()` at call time so bootSlice.ts does not need a direct import of
   * tutorialSlice (avoids a slice-to-slice import cycle).
   */
  initialize: () => void
  /** Generic phase setter; later tasks drive specific transitions through this. */
  setPhase: (next: SlicePhase) => void
}

export const createBootSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  BootSlice
> = (set, get) => ({
  phase: 'BOOT',
  initialize: () => {
    // Awakening beats first, THEN the phase flip. Ordering matters: the
    // FIRST_DIRECTIVE phase transition triggers downstream selectors that
    // will look for a visible DirectivePanel. If we flipped phase before
    // disclosing, a subscriber could observe the (BOOT, hidden) → (FIRST,
    // hidden) transition and render a directive-less HUD for a single tick.
    runAwakeningSequence({ disclosePanel: get().disclosePanel })
    set((state) => {
      state.phase = 'FIRST_DIRECTIVE'
    })
  },
  setPhase: (next) =>
    set((state) => {
      state.phase = next
    }),
})
