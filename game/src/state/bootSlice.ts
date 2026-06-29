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

export type BootSlice = {
  phase: SlicePhase
  /** Advances BOOT → FIRST_DIRECTIVE. Called by BootScreen on user gesture. */
  initialize: () => void
  /** Generic phase setter; later tasks drive specific transitions through this. */
  setPhase: (next: SlicePhase) => void
}

export const createBootSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  BootSlice
> = (set) => ({
  phase: 'BOOT',
  initialize: () =>
    set((state) => {
      state.phase = 'FIRST_DIRECTIVE'
    }),
  setPhase: (next) =>
    set((state) => {
      state.phase = next
    }),
})
