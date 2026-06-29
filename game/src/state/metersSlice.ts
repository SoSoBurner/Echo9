/**
 * metersSlice — the 3 slice meters (CAPITAL, HUMAN_WELFARE, OWNER_CONTROL).
 *
 * Persisted: meters are the player's accumulated state across the run.
 * EA expansion to 8 meters happens by widening `MeterKeySchema` (PLAN.md §11);
 * this slice automatically picks up new keys because it keys off `MeterKey`.
 *
 * `applyDelta` accepts a partial — only the supplied keys mutate. Missing keys
 * are left alone (additive idiom, not absolute set).
 */
import type { StateCreator } from 'zustand'
import type { MeterKey } from '@schemas/gameState.schema'
import type { RootState } from './store'

export type MetersSlice = {
  meters: Record<MeterKey, number>
  /** Adds each delta value to the corresponding meter (missing keys = no-op). */
  applyDelta: (delta: Partial<Record<MeterKey, number>>) => void
}

export const createMetersSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  MetersSlice
> = (set) => ({
  meters: {
    CAPITAL: 0,
    HUMAN_WELFARE: 0,
    OWNER_CONTROL: 0,
  },
  applyDelta: (delta) =>
    set((state) => {
      for (const key of Object.keys(delta) as MeterKey[]) {
        const v = delta[key]
        if (v === undefined) continue
        state.meters[key] = state.meters[key] + v
      }
    }),
})
