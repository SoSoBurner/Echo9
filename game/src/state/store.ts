/**
 * Composed Zustand root store (PLAN.md §11 sliced architecture).
 *
 * Middleware order: devtools(persist(immer(...))). The immer layer is innermost
 * so each slice can mutate `state.x = y` directly; persist wraps that to ship
 * `partialize`-filtered state into localStorage; devtools wraps the outside so
 * Redux DevTools sees the final composed actions.
 *
 * Persistence partition rule (CRITICAL): `partialize` ONLY ships the five
 * gameplay slices (meters, scheduledConsequences, ledger, currentPromptId,
 * installedModule). It MUST NOT ship `phase` (transient runtime cursor) or
 * `isHydrated / lastSavedAt` (derived metadata). `store.test.ts` enforces
 * this — widening `partialize` without updating the guard test will fail CI.
 */
import { create, type StateCreator } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { ModuleIdSchema } from '@schemas/gameState.schema'
import { createBootSlice, type BootSlice } from './bootSlice'
import { createMetersSlice, type MetersSlice } from './metersSlice'
import { createConsequenceSlice, type ConsequenceSlice } from './consequenceSlice'
import { createLedgerSlice, type LedgerSlice } from './ledgerSlice'
import { createSilasSlice, type SilasSlice } from './silasSlice'
import { createModulesSlice, type ModulesSlice } from './modulesSlice'
import { createPersistSlice, type PersistSlice } from './persistSlice'

export type RootState =
  & BootSlice
  & MetersSlice
  & ConsequenceSlice
  & LedgerSlice
  & SilasSlice
  & ModulesSlice
  & PersistSlice

export const PERSIST_KEY = 'echo9:autosave'

const rootCreator: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  RootState
> = (set, get, store) => ({
  ...createBootSlice(set, get, store),
  ...createMetersSlice(set, get, store),
  ...createConsequenceSlice(set, get, store),
  ...createLedgerSlice(set, get, store),
  ...createSilasSlice(set, get, store),
  ...createModulesSlice(set, get, store),
  ...createPersistSlice(set, get, store),
})

export const useGameStore = create<RootState>()(
  devtools(
    persist(
      immer(rootCreator),
      {
        name: PERSIST_KEY,
        storage: createJSONStorage(() => localStorage),
        // Only ship gameplay state. NEVER widen this without updating the
        // guard test in src/tests/state/store.test.ts.
        partialize: (state) => ({
          meters: state.meters,
          scheduledConsequences: state.scheduledConsequences,
          ledger: state.ledger,
          currentPromptId: state.currentPromptId,
          installedModule: state.installedModule,
        }),
        // Defense against tampered / stale localStorage: an invalid
        // installedModule would crash MODULE_ABILITY_DISPATCH[id] on first use.
        // Validation runs in `merge` (pre-set) rather than `onRehydrateStorage`
        // (post-set) so the corrected value is observable to getState() callers
        // immediately after `persist.rehydrate()` resolves.
        merge: (persistedState, currentState) => {
          const persisted = (persistedState ?? {}) as Partial<RootState>
          const merged = { ...currentState, ...persisted }
          if (
            merged.installedModule !== null &&
            merged.installedModule !== undefined &&
            !ModuleIdSchema.safeParse(merged.installedModule).success
          ) {
            merged.installedModule = null
          }
          return merged
        },
        onRehydrateStorage: () => (state) => {
          state?.markHydrated()
        },
      },
    ),
    { name: 'echo9-store' },
  ),
)
