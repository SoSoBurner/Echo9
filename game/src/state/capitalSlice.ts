/**
 * capitalSlice — tracks the once-per-quarter capital deployment lockout (§8).
 *
 * When CAPITAL > 80 the player gets exactly ONE deployment per quarter.
 * `capitalDeployedThisQuarter` is set to true on commit and reset on each
 * quarter boundary (a later task wires the quarter-rollover trigger).
 *
 * Persisted: a player who deployed capital and reloaded must NOT get a second
 * shot in the same quarter — that would convert a one-shot counterplay into
 * an exploit. Persistence is enforced via the partialize guard in
 * store.test.ts; widening that guard's allow-list is what permits this.
 */
import type { StateCreator } from 'zustand'
import type { RootState } from './store'

export type CapitalSlice = {
  capitalDeployedThisQuarter: boolean
  /** Locks deployment for the remainder of the current quarter. */
  markCapitalDeployed: () => void
  /** Quarter boundary — re-arms the one-shot. Called by the quarter-rollover. */
  resetCapitalForNewQuarter: () => void
}

export const createCapitalSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  CapitalSlice
> = (set) => ({
  capitalDeployedThisQuarter: false,
  markCapitalDeployed: () =>
    set((state) => {
      state.capitalDeployedThisQuarter = true
    }),
  resetCapitalForNewQuarter: () =>
    set((state) => {
      state.capitalDeployedThisQuarter = false
    }),
})
