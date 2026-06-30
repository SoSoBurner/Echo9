/**
 * modulesSlice — currently installed personality module (§6, Task 10).
 *
 * Persisted: the slice's installed module is part of the player's run state —
 * a reload must not reset which module is active. `partialize` in store.ts
 * ships `installedModule` along with the other gameplay slices. The guard test
 * in `src/tests/state/store.test.ts` enforces that partialize shape, so this
 * key is explicitly listed there.
 *
 * Single-slot today (one module installed at a time). Multi-slot expansion
 * (e.g. 2 modules concurrent in EA) would replace `installedModule` with
 * `installedModules: ModuleId[]` — touching this slice and the install UI only.
 */
import type { StateCreator } from 'zustand'
import type { ModuleId } from '@schemas/gameState.schema'
import type { RootState } from './store'

export type ModulesSlice = {
  installedModule: ModuleId | null
  installModule: (id: ModuleId) => void
  uninstallModule: () => void
}

export const createModulesSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  ModulesSlice
> = (set) => ({
  installedModule: null,
  installModule: (id) =>
    set((state) => {
      state.installedModule = id
    }),
  uninstallModule: () =>
    set((state) => {
      state.installedModule = null
    }),
})
