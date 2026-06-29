/**
 * persistSlice — hydration metadata (NOT itself persisted).
 *
 * Tracks whether the persist middleware has finished rehydrating the
 * partialized state. UI code should gate ledger / meter reads on `isHydrated`
 * to avoid flashing zero-state on first paint.
 *
 * `lastSavedAt` is left null until T14 (save engine) wires real save events.
 * Do not stamp it from hydration — that would conflate load with save.
 */
import type { StateCreator } from 'zustand'
import type { RootState } from './store'

export type PersistSlice = {
  lastSavedAt: number | null
  isHydrated: boolean
  markHydrated: () => void
}

export const createPersistSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  PersistSlice
> = (set) => ({
  lastSavedAt: null,
  isHydrated: false,
  markHydrated: () =>
    set((state) => {
      state.isHydrated = true
    }),
})
