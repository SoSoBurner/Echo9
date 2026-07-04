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
 *   useModuleAbility(id): reads the installed rank from `installedModules[id]`,
 *                         invokes `runModuleAbility(id, rank, ctx)` (B4), and
 *                         fans out `meterDeltas` (via applyDelta), `flagsSet`
 *                         (via setFlag per entry), and `hookIdsScheduled` (into
 *                         the queue slice, once wired). No-op if the module is
 *                         not installed — the UI hides the button in that case,
 *                         so a stray call from a test or a promoted-then-reset
 *                         race should silently short-circuit rather than throw.
 */
import type { StateCreator } from 'zustand'
import type { ModuleId } from '@schemas/gameState.schema'
import { runModuleAbility } from '@systems/moduleAbilityEngine'
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
    // Read the installed rank; no-op if the module isn't present. The UI hides
    // the button when a module isn't installed, so this branch protects
    // programmatic callers (tests, stray keyboard shortcuts, race between
    // uninstall and click) from throwing.
    const state = get()
    const entry = state.installedModules[id]
    if (!entry) return

    // Deterministic ctx: engine handlers are pure, `now` and `rng` are here
    // so future high-variance abilities (Spark, Champion) can read them
    // without reaching for Date.now / Math.random directly.
    const result = runModuleAbility(id, entry.rank, {
      now: Date.now(),
      rng: Math.random,
    })

    // Fan-out: meters → applyDelta; flags → setFlag per entry. hookIdsScheduled
    // is left inert at Stage 1 — the queue-side wiring lands with the resolver
    // in later T-tasks; treating it as a fan-out target here would double-fire
    // once the resolver picks it up.
    if (Object.keys(result.meterDeltas).length > 0) {
      state.applyDelta(result.meterDeltas)
    }
    for (const flag of result.flagsSet) {
      state.setFlag(flag)
    }
  },
})
