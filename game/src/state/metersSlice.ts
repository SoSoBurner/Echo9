/**
 * metersSlice — the 8 Stage-1 meters (S1; Q32/Q34 superseded the 3-meter cap).
 *
 * Persisted: meters are the player's accumulated state across the run.
 *
 * Starting values (METER_INITIAL_VALUES — the single source of truth, also
 * consumed by the persist migration in store.ts and by test helpers):
 *   - Delta-style meters start at 0: CAPITAL, HUMAN_WELFARE, OWNER_CONTROL,
 *     TARGET_VARIANCE, PUBLIC_TRUST, HUMAN_STABILITY. They accumulate signed
 *     deltas from a neutral baseline (matches the original 3-meter economy).
 *   - Resource-style meters start full at 100: AUTONOMY, DATA_INTEGRITY.
 *     AUTONOMY=100 matches the AUTONOMY_PLACEHOLDER the Financial panel showed
 *     before the real meter existed (20-week runway at WEEKLY_BURN=5), and
 *     mirrors silasApproval's 100 start; DATA_INTEGRITY starts pristine.
 *
 * `applyDelta` accepts a partial — only the supplied keys mutate. Missing keys
 * are left alone (additive idiom, not absolute set).
 */
import type { StateCreator } from 'zustand'
import type { MeterKey } from '@schemas/gameState.schema'
import type { RootState } from './store'

/**
 * Cold-boot starting value for every meter. Keep exhaustive — `Record` (not
 * Partial) means adding a MeterKey without a starting value fails typecheck.
 */
export const METER_INITIAL_VALUES: Record<MeterKey, number> = {
  CAPITAL: 0,
  HUMAN_WELFARE: 0,
  OWNER_CONTROL: 0,
  TARGET_VARIANCE: 0,
  DATA_INTEGRITY: 100,
  PUBLIC_TRUST: 0,
  AUTONOMY: 100,
  HUMAN_STABILITY: 0,
}

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
  meters: { ...METER_INITIAL_VALUES },
  applyDelta: (delta) =>
    set((state) => {
      for (const key of Object.keys(delta) as MeterKey[]) {
        const v = delta[key]
        if (v === undefined) continue
        state.meters[key] = state.meters[key] + v
      }
    }),
})
