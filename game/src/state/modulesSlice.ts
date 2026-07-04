/**
 * modulesSlice — installed personality modules with rank (§6, Tasks B3/B4).
 *
 * Shape (as of B3):
 *   installedModules: Partial<Record<ModuleId, { rank: 1 | 2 | 3 }>>
 *
 * Multiple modules may live in the map concurrently — the map SHAPE supports
 * multi-slot even if the current UI (RightModuleConsole) is still single-slot
 * gated on `Object.keys(installedModules).length`. Widening the UI to multi-
 * slot is a later task; the state layer is already ready.
 *
 * Persisted: the map is part of the player's run state — a reload must not
 * reset which modules are installed or what rank they hold. `partialize` in
 * store.ts ships `installedModules`; the guard test in store.test.ts pins the
 * partialize shape. Legacy v0 `installedModule: ModuleId | null` blobs are
 * migrated to the new map shape by the persist `migrate` hook in store.ts.
 *
 * Actions:
 *   installModule(id):    installs at rank 1. Idempotent — re-installing an
 *                         already-present id is a no-op (rank is NOT reset).
 *                         This matters because a promoted MOURNER re-picked in
 *                         the install grid must not collapse back to rank 1.
 *   promoteModule(id):    rank++ up to a max of 3 (Stage 1 cap). No-op if the
 *                         id is not installed or is already at 3. Stage 2 will
 *                         widen the cap when Rank 4/5 abilities ship — search
 *                         for `STAGE_1_MAX_RANK` when that lands.
 *   useModuleAbility(id): dispatches the module's rank-appropriate ability via
 *                         moduleAbilityEngine. B3 stubs this — it reads the
 *                         installed rank and returns without side effects if
 *                         the module isn't installed. B4 will wire the real
 *                         rank-aware dispatch (verb/cost/meter deltas).
 */
import type { StateCreator } from 'zustand'
import type { ModuleId } from '@schemas/gameState.schema'
import type { RootState } from './store'

// Stage 1 rank ceiling. Stage 2 will bump this to 5 when Rank 4/5 abilities
// ship; search for this constant to find every clamp site.
const STAGE_1_MAX_RANK = 3 as const

export type InstalledModuleEntry = { rank: 1 | 2 | 3 }

export type ModulesSlice = {
  installedModules: Partial<Record<ModuleId, InstalledModuleEntry>>
  installModule: (id: ModuleId) => void
  promoteModule: (id: ModuleId) => void
  useModuleAbility: (id: ModuleId) => void
}

export const createModulesSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  ModulesSlice
> = (set, get) => ({
  installedModules: {},

  installModule: (id) =>
    set((state) => {
      // Idempotent: if the module is already installed, DO NOT reset its rank.
      if (state.installedModules[id]) return
      state.installedModules[id] = { rank: 1 }
    }),

  promoteModule: (id) =>
    set((state) => {
      const entry = state.installedModules[id]
      if (!entry) return
      if (entry.rank >= STAGE_1_MAX_RANK) return
      // Cast: we've just checked rank < 3, so rank+1 is 2|3 — safe to widen.
      entry.rank = (entry.rank + 1) as InstalledModuleEntry['rank']
    }),

  useModuleAbility: (id) => {
    // B3 stub: read the installed rank and no-op if the module isn't present.
    // B4 will replace this body with a rank-aware dispatch that reads
    // ALL_MODULE_ABILITIES[(id, rank)] and applies meterDeltas / flagsSet /
    // hookIdsScheduled through the appropriate slices.
    const entry = get().installedModules[id]
    if (!entry) return
    // TODO(B4): dispatch via moduleAbilityEngine using entry.rank.
    void entry
  },
})
