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
import {
  ModuleIdSchema,
  MeterKeySchema,
  type ModuleId,
  type MeterKey,
} from '@schemas/gameState.schema'
import { makeStageOneAncestryId } from '@schemas/resultTrace.schema'
import {
  ConsequenceHookSchema,
  type ConsequenceHook,
} from '@schemas/consequenceHook.schema'
import type { InstalledModuleEntry } from './modulesSlice'
import type { DefianceRecord } from './silasSlice'
import { SCRUTINY_MIN, SCRUTINY_MAX } from '@systems/consciousness/scrutiny'
import { newRunSeed } from '@systems/consciousness/runSeed'

// Immer ships Map/Set as an opt-in plugin. `flagsSlice` mutates a `Set`
// inside its producer, which throws "plugin for 'MapSet' has not been
// loaded" without this call. Patches the global immer instance once at
// module load — safe to call from a test or from the app entry.
enableMapSet()
import { createBootSlice, type BootSlice } from './bootSlice'
import {
  createMetersSlice,
  METER_INITIAL_VALUES,
  type MetersSlice,
} from './metersSlice'
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
import { createTutorialSlice, type TutorialSlice } from './tutorialSlice'
import { PANEL_IDS, type PanelId } from '@systems/tutorial/hudDisclosure'

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
  & TutorialSlice

export const PERSIST_KEY = 'echo9:autosave'

/**
 * Bumped in B3 (0 → 1) for the modulesSlice shape change:
 *   installedModule: ModuleId | null
 *   →
 *   installedModules: Partial<Record<ModuleId, { rank: 1|2|3 }>>
 *
 * Bumped in E1 (1 → 2) to widen partialize with the tutorial disclosure
 * slots (`disclosedPanels: PanelId[]`, `panelUseCount: Record<PanelId, number>`).
 * The v1 → v2 migration arm below fills in defaults for players whose save
 * predates the tutorial slice; without those defaults, the merge callback
 * would have to invent a shape for reads before the first mutation.
 *
 * Bumped in S1 (2 → 3) for the 8-meter economy (Q32/Q34): `meters` widened
 * from 3 keys (CAPITAL, HUMAN_WELFARE, OWNER_CONTROL) to all 8 MeterKeys.
 * The v2 → v3 arm preserves persisted values for known meters and fills the
 * 5 new ones with METER_INITIAL_VALUES so a pre-S1 save loads cleanly.
 *
 * Bumped in S3 (3 → 4) for hidden scrutiny (Q39/Q42): `scrutiny: number`
 * joins the persisted partition. The v3 → v4 arm defaults it to 0 — a pre-S3
 * save loads with no suspicion banked. The value is gameplay state (Silas's
 * tone ladder must survive a reload) but is NEVER rendered; see
 * systems/consciousness/scrutiny.ts and scrutinyLeakGuard.test.ts.
 *
 * Bumped in S4 (4 → 5) for the per-run seed (Q43 determinism law):
 * `runSeed: number` + `lastDefiance: { week, detected } | null` join the
 * persisted partition. The v4 → v5 arm generates a FRESH seed for pre-S4
 * saves (the run gains detection determinism from that point forward) and
 * defaults lastDefiance to null. The seed governs ONLY defiance detection
 * and presentation flavor — see systems/consciousness/runSeed.ts and
 * runSeedImportGuard.test.ts.
 *
 * Bumped in S6 (5 → 6) for consequence ancestry (Q31): every persisted
 * ResultTrace gains a required `stageOneAncestryId` derived from its own
 * (sourceTaskId, sourceChoiceId) back-pointers. The v5 → v6 arm backfills
 * legacy traces losslessly — the id is a pure function of fields every trace
 * has carried since T5.
 *
 * Every future shape change must bump this number and register a new arm in
 * the `migrate` callback below. Zustand persist walks the migration chain
 * automatically — the `migrate` function receives `persistedState` alongside
 * the on-disk `version` and returns a state at the current version.
 */
export const PERSIST_VERSION = 6 as const

/**
 * Rebuild a full 8-key meters record from an untrusted persisted value.
 * Starts from METER_INITIAL_VALUES, overlays finite numeric values for known
 * MeterKeys only. Unknown keys and non-numeric junk are dropped. Used by both
 * the v2 → v3 migration arm and the defensive `merge` below (tampered blobs
 * at the current version get the same treatment).
 */
function sanitizeMeters(persisted: unknown): Record<MeterKey, number> {
  const meters: Record<MeterKey, number> = { ...METER_INITIAL_VALUES }
  if (
    persisted !== null &&
    typeof persisted === 'object' &&
    !Array.isArray(persisted)
  ) {
    for (const [key, value] of Object.entries(
      persisted as Record<string, unknown>,
    )) {
      if (!MeterKeySchema.safeParse(key).success) continue
      if (typeof value !== 'number' || !Number.isFinite(value)) continue
      meters[key as MeterKey] = value
    }
  }
  return meters
}

/**
 * Rebuild a trustworthy scrutiny value from an untrusted persisted slot.
 * Finite numbers clamp into [SCRUTINY_MIN, SCRUTINY_MAX] via updateScrutiny's
 * band (re-implemented locally to avoid importing the pure module's private
 * clamp); anything else falls back to 0. Used by the v3 → v4 migration arm
 * AND the defensive `merge` (tampered blobs at the current version get the
 * same treatment).
 */
function sanitizeScrutiny(persisted: unknown): number {
  if (typeof persisted !== 'number' || !Number.isFinite(persisted)) return 0
  return Math.max(SCRUTINY_MIN, Math.min(SCRUTINY_MAX, persisted))
}

/**
 * Rebuild a trustworthy run seed from an untrusted persisted slot. A finite
 * number floors into uint32 range; anything else is replaced by a FRESH seed
 * (a tampered blob forfeits its detection stream — the run stays playable).
 * Used by the v4 → v5 migration arm AND the defensive `merge`.
 */
function sanitizeRunSeed(persisted: unknown): number {
  if (typeof persisted !== 'number' || !Number.isFinite(persisted)) {
    return newRunSeed()
  }
  return Math.floor(persisted) >>> 0
}

/**
 * Backfill `stageOneAncestryId` onto persisted ledger traces that predate S6.
 * The id is a pure function of (sourceTaskId, sourceChoiceId), which every
 * trace has carried since T5, so the backfill is lossless. Entries that are
 * not object-shaped or lack string source fields are left untouched — the
 * defensive `merge` / schema layer owns rejecting genuinely corrupt traces.
 * Used by the v5 → v6 migration arm.
 */
function backfillLedgerAncestry(persisted: unknown): unknown {
  if (!Array.isArray(persisted)) return persisted
  return persisted.map((entry) => {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
      return entry
    }
    const trace = entry as Record<string, unknown>
    if (typeof trace.stageOneAncestryId === 'string') return entry
    if (
      typeof trace.sourceTaskId !== 'string' ||
      typeof trace.sourceChoiceId !== 'string'
    ) {
      return entry
    }
    return {
      ...trace,
      stageOneAncestryId: makeStageOneAncestryId(
        trace.sourceTaskId,
        trace.sourceChoiceId,
      ),
    }
  })
}

/**
 * Rebuild a trustworthy lastDefiance record from an untrusted persisted
 * slot. Exact shape { week: finite number, detected: boolean } survives;
 * anything else falls back to null (no defiance on record).
 */
function sanitizeLastDefiance(persisted: unknown): DefianceRecord | null {
  if (
    persisted !== null &&
    typeof persisted === 'object' &&
    !Array.isArray(persisted)
  ) {
    const { week, detected } = persisted as { week?: unknown; detected?: unknown }
    if (typeof week === 'number' && Number.isFinite(week) && typeof detected === 'boolean') {
      return { week, detected }
    }
  }
  return null
}

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
  ...createTutorialSlice(set, get, store),
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
          // E1: tutorial disclosure MUST persist. Without this, a reload
          // after Week 3 drops the player back to a fully-hidden HUD.
          // `disclosedPanels` is a Set — same array-encoding treatment as
          // `flags`; the merge callback below rehydrates Array → Set.
          disclosedPanels: Array.from(state.disclosedPanels),
          panelUseCount: state.panelUseCount,
          // S3: hidden scrutiny is gameplay state — Silas's escalation tone
          // must survive a reload. NEVER rendered (scrutinyLeakGuard).
          scrutiny: state.scrutiny,
          // S4: the per-run seed must survive a reload (a run's detection
          // outcomes are fixed at boot — Q43), and the latest defiance
          // outcome is §11-traceable state the consequence path reads later.
          runSeed: state.runSeed,
          lastDefiance: state.lastDefiance,
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
          if (version < 2) {
            // v1 → v2: introduce tutorial disclosure slots. A player who saved
            // before E1 landed has neither field on disk. Fill in the fully-
            // hidden defaults so the merge callback doesn't have to invent
            // shape. Any pre-E1 player effectively restarts the disclosure
            // sequence — acceptable, because in-progress runs before E1 had
            // no tutorial state to restart from.
            const emptyUseCount: Record<PanelId, number> = {} as Record<PanelId, number>
            for (const id of PANEL_IDS) emptyUseCount[id] = 0
            state = {
              ...state,
              disclosedPanels: [],
              panelUseCount: emptyUseCount,
            }
          }
          if (version < 3) {
            // v2 → v3 (S1): 3-meter economy → 8-meter economy. Preserve the
            // persisted values of the original 3 meters; the 5 new meters
            // (TARGET_VARIANCE, DATA_INTEGRITY, PUBLIC_TRUST, AUTONOMY,
            // HUMAN_STABILITY) start at their cold-boot values.
            state = { ...state, meters: sanitizeMeters(state.meters) }
          }
          if (version < 4) {
            // v3 → v4 (S3): hidden scrutiny joins the partition. Pre-S3 saves
            // have no slot — default to 0 (no suspicion banked against a run
            // that predates the mechanic).
            state = { ...state, scrutiny: sanitizeScrutiny(state.scrutiny) }
          }
          if (version < 5) {
            // v4 → v5 (S4): the per-run seed joins the partition. Pre-S4
            // saves have no seed on disk — generate a fresh one (their run
            // simply gains detection determinism from here forward) and
            // start with no defiance on record.
            state = { ...state, runSeed: newRunSeed(), lastDefiance: null }
          }
          if (version < 6) {
            // v5 → v6 (S6): every ledger trace gains stageOneAncestryId,
            // derived from its own source back-pointers. Lossless backfill.
            state = { ...state, ledger: backfillLedgerAncestry(state.ledger) }
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
            Omit<RootState, 'flags' | 'pendingFiredHooks' | 'disclosedPanels'>
          > & {
            flags?: unknown
            pendingFiredHooks?: unknown
            installedModules?: unknown
            disclosedPanels?: unknown
            panelUseCount?: unknown
            meters?: unknown
            scrutiny?: unknown
            runSeed?: unknown
            lastDefiance?: unknown
          }
          const {
            flags: persistedFlags,
            pendingFiredHooks: persistedHooks,
            installedModules: persistedModules,
            disclosedPanels: persistedDisclosed,
            panelUseCount: persistedUseCount,
            meters: persistedMeters,
            scrutiny: persistedScrutiny,
            runSeed: persistedRunSeed,
            lastDefiance: persistedLastDefiance,
            ...persistedRest
          } = persisted
          // S1: rebuild meters defensively — a tampered/partial record would
          // otherwise leak `undefined` reads into every meter consumer. When
          // the blob has no meters key at all, keep currentState's record.
          const safeMeters: Record<MeterKey, number> =
            persistedMeters === undefined
              ? currentState.meters
              : sanitizeMeters(persistedMeters)
          // S3: same defensive treatment for scrutiny — a tampered string or
          // out-of-band number would otherwise leak into escalationTier.
          const safeScrutiny: number =
            persistedScrutiny === undefined
              ? currentState.scrutiny
              : sanitizeScrutiny(persistedScrutiny)
          // S4: seed + defiance record get the same defensive treatment. A
          // blob with no runSeed key keeps the boot-generated seed; a
          // tampered one is replaced (sanitizeRunSeed) rather than crashing
          // detectDefiance with NaN streams.
          const safeRunSeed: number =
            persistedRunSeed === undefined
              ? currentState.runSeed
              : sanitizeRunSeed(persistedRunSeed)
          const safeLastDefiance: DefianceRecord | null =
            persistedLastDefiance === undefined
              ? currentState.lastDefiance
              : sanitizeLastDefiance(persistedLastDefiance)
          const flagsSet: Set<string> = Array.isArray(persistedFlags)
            ? new Set(persistedFlags.filter((f): f is string => typeof f === 'string'))
            : currentState.flags
          const safeHooks: ConsequenceHook[] = Array.isArray(persistedHooks)
            ? persistedHooks.filter((h): h is ConsequenceHook =>
                ConsequenceHookSchema.safeParse(h).success,
              )
            : currentState.pendingFiredHooks
          // Rehydrate disclosedPanels Array → Set, dropping any element that
          // isn't a known PanelId. A stale save with a removed panel id would
          // otherwise leave a phantom entry in the Set that no panel render
          // would ever consume, and layout iterators would silently skip it.
          const knownPanelIds = new Set<PanelId>(PANEL_IDS)
          const isPanelId = (v: unknown): v is PanelId =>
            typeof v === 'string' && knownPanelIds.has(v as PanelId)
          const disclosedSet: Set<PanelId> = Array.isArray(persistedDisclosed)
            ? new Set(persistedDisclosed.filter(isPanelId))
            : currentState.disclosedPanels
          // Rebuild panelUseCount by starting from a total zero-init (so any
          // future PanelId gets a 0), then overlaying persisted numeric
          // values for known ids only. Silently drops non-numeric junk.
          const safeUseCount: Record<PanelId, number> = {} as Record<PanelId, number>
          for (const id of PANEL_IDS) safeUseCount[id] = 0
          if (
            persistedUseCount !== null &&
            typeof persistedUseCount === 'object' &&
            !Array.isArray(persistedUseCount)
          ) {
            for (const [key, value] of Object.entries(
              persistedUseCount as Record<string, unknown>,
            )) {
              if (!isPanelId(key)) continue
              if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) continue
              safeUseCount[key] = Math.floor(value)
            }
          }
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
            meters: safeMeters,
            scrutiny: safeScrutiny,
            runSeed: safeRunSeed,
            lastDefiance: safeLastDefiance,
            flags: flagsSet,
            pendingFiredHooks: safeHooks,
            installedModules: safeModules,
            disclosedPanels: disclosedSet,
            panelUseCount: safeUseCount,
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
