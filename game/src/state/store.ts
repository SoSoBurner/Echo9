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
 * installedModules, flags, capitalDeployedThisQuarter, pendingFiredHooks). It
 * MUST NOT ship `phase` (transient runtime cursor) or `isHydrated /
 * lastSavedAt` (derived metadata). `store.test.ts` enforces this — widening
 * `partialize` without updating the guard test will fail CI.
 *
 * Persist version history (B3):
 *   v0 → v1: legacy `installedModule: ModuleId | null` slot was replaced by
 *   `installedModules: Partial<Record<ModuleId, { rank: 1|2|3 }>>`. The
 *   `migrate` hook below rewrites the shape at boot time; every subsequent
 *   version bump adds a new arm to that hook. Do NOT delete old arms — a
 *   player who reloads after a long absence still boots via them.
 */
import { create, type StateCreator } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet } from 'immer'
import { ModuleIdSchema, type ModuleId } from '@schemas/gameState.schema'
import {
  ConsequenceHookSchema,
  type ConsequenceHook,
} from '@schemas/consequenceHook.schema'
import type { InstalledModuleEntry } from './modulesSlice'

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
import { createEndOfContentSlice, type EndOfContentSlice } from './endOfContentSlice'

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
  & EndOfContentSlice

export const PERSIST_KEY = 'echo9:autosave'

/**
 * Bumped in B3 (0 → 1) for the modulesSlice shape change:
 *   installedModule: ModuleId | null
 *   →
 *   installedModules: Partial<Record<ModuleId, { rank: 1|2|3 }>>
 *
 * Every future shape change must bump this number and register a new arm in
 * the `migrate` callback below. Zustand persist walks the migration chain
 * automatically — the `migrate` function receives `persistedState` alongside
 * the on-disk `version` and returns a state at the current version.
 */
export const PERSIST_VERSION = 1 as const

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
  ...createEndOfContentSlice(set, get, store),
})

export const useGameStore = create<RootState>()(
  devtools(
    persist(
      immer(rootCreator),
      {
        name: PERSIST_KEY,
        version: PERSIST_VERSION,
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
          installedModules: state.installedModules,
          flags: Array.from(state.flags),
          capitalDeployedThisQuarter: state.capitalDeployedThisQuarter,
          // T12: pending consequences must survive reload — without this,
          // the §11 traceability invariant ("every delayed consequence
          // returns") leaks across reloads when the player closes the tab
          // between fire and ack.
          pendingFiredHooks: state.pendingFiredHooks,
        }),

        // Migration chain. v0 → v1 rewrites `installedModule: ModuleId | null`
        // into `installedModules: Partial<Record<ModuleId, { rank: 1|2|3 }>>`.
        // Every future shape change adds a new arm here and bumps
        // PERSIST_VERSION. Do NOT delete old arms — a player who reloads after
        // a long absence still boots via them.
        //
        // NOTE: migrate runs BEFORE merge; whatever we return is passed to
        // merge as `persistedState`. So merge continues to validate the new
        // `installedModules` map shape; migrate is only responsible for the
        // one-time shape rewrite.
        migrate: (persistedState, version) => {
          const raw = (persistedState ?? {}) as Record<string, unknown>
          let state = raw
          if (version < 1) {
            const { installedModule, ...rest } = state as {
              installedModule?: unknown
            } & Record<string, unknown>
            const installedModules: Partial<
              Record<ModuleId, InstalledModuleEntry>
            > = {}
            if (
              typeof installedModule === 'string' &&
              ModuleIdSchema.safeParse(installedModule).success
            ) {
              installedModules[installedModule as ModuleId] = { rank: 1 }
            }
            state = { ...rest, installedModules }
          }
          return state
        },

        // Defense against tampered / stale localStorage: an invalid entry in
        // `installedModules` would crash the runModuleAbility(id, rank, ctx)
        // registry lookup on first use. Validation runs in `merge` (pre-set)
        // rather than
        // `onRehydrateStorage` (post-set) so the corrected value is observable
        // to getState() callers immediately after `persist.rehydrate()`
        // resolves.
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
          > & {
            flags?: unknown
            pendingFiredHooks?: unknown
            installedModules?: unknown
          }
          const {
            flags: persistedFlags,
            pendingFiredHooks: persistedHooks,
            installedModules: persistedModules,
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
          // Validate the installedModules map key-by-key. Any key that isn't a
          // known ModuleId is dropped; any entry whose rank isn't 1|2|3 is
          // dropped. A non-object value falls back to currentState's map.
          const safeModules: Partial<
            Record<ModuleId, InstalledModuleEntry>
          > = {}
          if (
            persistedModules !== null &&
            typeof persistedModules === 'object' &&
            !Array.isArray(persistedModules)
          ) {
            for (const [key, value] of Object.entries(
              persistedModules as Record<string, unknown>,
            )) {
              if (!ModuleIdSchema.safeParse(key).success) continue
              if (
                value === null ||
                typeof value !== 'object' ||
                Array.isArray(value)
              ) continue
              const rank = (value as { rank?: unknown }).rank
              if (rank !== 1 && rank !== 2 && rank !== 3) continue
              safeModules[key as ModuleId] = { rank }
            }
          } else if (persistedModules === undefined) {
            // No installedModules key in the persisted blob — keep the
            // currentState default (empty map).
            Object.assign(safeModules, currentState.installedModules)
          }
          const merged: RootState = {
            ...currentState,
            ...persistedRest,
            flags: flagsSet,
            pendingFiredHooks: safeHooks,
            installedModules: safeModules,
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
