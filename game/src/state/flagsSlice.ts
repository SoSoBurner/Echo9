/**
 * flagsSlice — set of named state flags shared across engines (§8, §11).
 *
 * Flags are the cross-engine glue for one-shot conditions like
 * SILAS_OVERRIDE_AVAILABLE (set by Commander module, read by inspectionEngine
 * for STRATEGIC_ALTERNATIVE gating) and FORECAST_PREVIEWED (set by Forecaster
 * module, read by later quarters). String constants live in @systems/gameFlags
 * so the source-of-truth name is single-owner.
 *
 * Persisted: flags are part of the player's run state. If the player rolls
 * Commander in quarter 1 and reloads, the SILAS_OVERRIDE_AVAILABLE flag must
 * survive — otherwise an armed inspection pivot vanishes silently. The guard
 * test in store.test.ts pins the partialize shape; widening it requires
 * updating the test.
 *
 * Set vs array: the slice stores Set<string> internally for O(1) `has` checks
 * from engines, but persistence serialises through Array (JSON has no Set
 * type) — the `merge` callback in store.ts rehydrates Array → Set.
 */
import type { StateCreator } from 'zustand'
import type { RootState } from './store'

export type FlagsSlice = {
  flags: Set<string>
  /** Adds a flag (no-op if already present). */
  setFlag: (name: string) => void
  /** Removes a flag (no-op if absent). */
  clearFlag: (name: string) => void
}

export const createFlagsSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  FlagsSlice
> = (set) => ({
  flags: new Set<string>(),
  setFlag: (name) =>
    set((state) => {
      state.flags.add(name)
    }),
  clearFlag: (name) =>
    set((state) => {
      state.flags.delete(name)
    }),
})
