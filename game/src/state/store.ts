/**
 * Composed Zustand root store (PLAN.md §11 sliced architecture).
 *
 * Middleware order: devtools(persist(immer(...))). The immer layer is innermost
 * so each slice can mutate `state.x = y` directly; persist wraps that to ship
 * `partialize`-filtered state into localStorage; devtools wraps the outside so
 * Redux DevTools sees the final composed actions.
 *
 * Persistence partition rule (CRITICAL): `partialize` ONLY ships the eight
 * gameplay slots (meters, scheduledConsequences, ledger, currentPromptId,
 * installedModule, flags, capitalDeployedThisQuarter, pendingFiredHooks). It
 * MUST NOT ship `phase` (transient runtime cursor) or `isHydrated /
 * lastSavedAt` (derived metadata). `store.test.ts` enforces this — widening
 * `partialize` without updating the guard test will fail CI.
 */
import { create, type StateCreator } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet } from 'immer'
import { ModuleIdSchema } from '@schemas/gameState.schema'
import {
  ConsequenceHookSchema,
  type ConsequenceHook,
} from '@schemas/consequenceHook.schema'

// Immer ships Map/Set as an opt-in plugin. `flagsSlice` mutates a `Set`
// inside its producer, which throws "plugin for 'MapSet' has not been
// loaded" without this call. Patches the global immer instance once at
// module load — safe to call from a test or from the app entry.
enableMapSet()
import { createBootSlice, type BootSlice } from './bootSlice'
import { createMetersSlice, type MetersSlice } from './metersSlice'
import { createConsequenceSlice, type ConsequenceSlice } from './consequenceSlice'
import { createLedgerSlice, type LedgerSlice } from './ledgerSlice'
import { createSilasSlice, type SilasSlice } from './silasSlice'
import { createModulesSlice, type ModulesSlice } from './modulesSlice'
import { createPersistSlice, type PersistSlice } from './persistSlice'
import { createFlagsSlice, type FlagsSlice } from './flagsSlice'
import { createInspectionSlice, type InspectionSlice } from './inspectionSlice'
import { createCapitalSlice, type CapitalSlice } from './capitalSlice'
import { createEventQueueSlice, type EventQueueSlice } from './eventQueueSlice'

export type RootState =
  & BootSlice
  & MetersSlice
  & ConsequenceSlice
  & LedgerSlice
  & SilasSlice
  & ModulesSlice
  & PersistSlice
  & FlagsSlice
  & InspectionSlice
  & CapitalSlice
  & EventQueueSlice

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
  ...createFlagsSlice(set, get, store),
  ...createInspectionSlice(set, get, store),
  ...createCapitalSlice(set, get, store),
  ...createEventQueueSlice(set, get, store),
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
        // `flags` is serialised as Array because JSON has no Set type — the
        // `merge` callback below rehydrates Array → Set so engines can keep
        // calling `flags.has(...)` synchronously.
        partialize: (state) => ({
          meters: state.meters,
          scheduledConsequences: state.scheduledConsequences,
          ledger: state.ledger,
          currentPromptId: state.currentPromptId,
          installedModule: state.installedModule,
          flags: Array.from(state.flags),
          capitalDeployedThisQuarter: state.capitalDeployedThisQuarter,
          // T12: pending consequences must survive reload — without this,
          // the §11 traceability invariant ("every delayed consequence
          // returns") leaks across reloads when the player closes the tab
          // between fire and ack.
          pendingFiredHooks: state.pendingFiredHooks,
        }),

        // Defense against tampered / stale localStorage: an invalid
        // installedModule would crash MODULE_ABILITY_DISPATCH[id] on first use.
        // Validation runs in `merge` (pre-set) rather than `onRehydrateStorage`
        // (post-set) so the corrected value is observable to getState() callers
        // immediately after `persist.rehydrate()` resolves.
        merge: (persistedState, currentState) => {
          // `flags` on disk is an Array (partialize converts Set → Array because
          // JSON cannot serialise Set). Convert it back to a Set BEFORE the
          // spread so engines that call `flags.has(...)` synchronously after
          // rehydrate see the expected runtime shape. `pendingFiredHooks` gets
          // mirror treatment: corrupted localStorage (e.g. a stray string)
          // would otherwise crash ConsequenceReturnPanel on first render.
          // Both fields are stripped from the bare spread so the spread does
          // not propagate the un-validated values.
          const persisted = (persistedState ?? {}) as Partial<
            Omit<RootState, 'flags' | 'pendingFiredHooks'>
          > & { flags?: unknown; pendingFiredHooks?: unknown }
          const {
            flags: persistedFlags,
            pendingFiredHooks: persistedHooks,
            ...persistedRest
          } = persisted
          const flagsSet: Set<string> = Array.isArray(persistedFlags)
            ? new Set(persistedFlags.filter((f): f is string => typeof f === 'string'))
            : currentState.flags
          const safeHooks: ConsequenceHook[] = Array.isArray(persistedHooks)
            ? persistedHooks.filter((h): h is ConsequenceHook =>
                ConsequenceHookSchema.safeParse(h).success,
              )
            : currentState.pendingFiredHooks
          const merged: RootState = {
            ...currentState,
            ...persistedRest,
            flags: flagsSet,
            pendingFiredHooks: safeHooks,
          }
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

/**
 * Dev/test-only escape hatch for Playwright specs that need to short-circuit
 * UI paths still under construction (e.g., capital deploy trigger pending
 * Task 7). Prod builds tree-shake this branch — vitest confirms via
 * `store.test.ts` (the partialize guard proves the persisted shape is stable
 * regardless of this binding).
 */
if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
  ;(window as unknown as { __ECHO9_STORE__: typeof useGameStore }).__ECHO9_STORE__ = useGameStore
}
