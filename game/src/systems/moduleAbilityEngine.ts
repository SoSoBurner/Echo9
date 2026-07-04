/**
 * moduleAbilityEngine — rank-aware dispatch for the 8 installable modules (§6).
 *
 * B4 replaced the old hardcoded `Record<ModuleId, AbilityHandler>` switch with
 * a lookup into `ALL_MODULE_ABILITIES` (B2 registry) by `(moduleId, rank)`.
 * The registry is now the SINGLE SOURCE OF TRUTH for every module's verb,
 * cost, meterDeltas, flagsSet, and hookIdsScheduled at each rank. Adding a
 * new (moduleId, rank) pair means editing the registry — never this file.
 *
 * Purity contract (unchanged from B3):
 *   The engine is a pure function of `(moduleId, rank, ctx)`. `ctx` injects
 *   `now` and `rng` so seeded replay works, unit tests need no mocks, and the
 *   consequence engine can re-run in dry-run mode.
 *
 * Miss semantics:
 *   `findModuleAbility` throws when no registry entry matches — this is a
 *   content bug (24 entries expected; moduleAbilities registry test enforces
 *   the complete 8x3 grid). Callers should not need to handle it at runtime.
 *
 * Callers:
 *   - `modulesSlice.useModuleAbility` reads `installedModules[id].rank` and
 *     invokes `runModuleAbility(id, rank, ctx)`.
 *   - `ModuleAbilityButton` invokes `runModuleAbility` on click and fans the
 *     result into meters/flags/queue slices.
 *
 * B5 (badges + promote button UI) will consume `unlocksAtRank` / `gating` off
 * the same registry to disable un-unlocked verbs — no engine change required.
 */
import type { ModuleId, MeterKey, ConsequenceId } from '@schemas/gameState.schema'
import type { Rank } from '@schemas/moduleAbility.schema'
import type { ModuleAbility } from '@schemas/moduleAbility.schema'
import { ALL_MODULE_ABILITIES } from '@content/moduleAbilities'

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type AbilityCtx = {
  /** Injected timestamp (replaces Date.now()) for deterministic replay. */
  now: number
  /** Injected RNG in [0, 1) — reserved for high-variance modules (§8). */
  rng: () => number
}

/**
 * Result shape emitted by `runModuleAbility`. Fields mirror the registry
 * `ability.*` payload so callers can fan out into their respective slices:
 *   - `meterDeltas` → `applyDelta(...)`
 *   - `flagsSet`    → `setFlag(name)` per entry
 *   - `hookIdsScheduled` → `scheduleConsequence(...)` per entry
 *
 * `verb` and `cost` are surfaced so UI callers (ModuleAbilityButton) can label
 * the button and check affordability without a second registry lookup.
 */
export type AbilityResult = {
  /** Player-visible verb from the registry, e.g. "READ SHARPER". */
  verb: string
  /** Capital / action-point cost the caller must deduct. */
  cost: number
  /** Meter changes to apply. Keys are always valid MeterKey values. */
  meterDeltas: Partial<Record<MeterKey, number>>
  /** Flag names to raise via flagsSlice.setFlag. */
  flagsSet: readonly string[]
  /** Consequence hooks to schedule onto the queue. */
  hookIdsScheduled: readonly ConsequenceId[]
}

// ---------------------------------------------------------------------------
// Registry lookup
// ---------------------------------------------------------------------------

/**
 * Resolves `(moduleId, rank)` to the registry entry. Throws (content bug) if
 * no entry matches. Linear scan is fine at Stage 1 (24 entries); if that ever
 * gets hot we can memoise into a Map keyed by `${moduleId}:${rank}`.
 */
export function findModuleAbility(
  moduleId: ModuleId,
  rank: Rank,
): ModuleAbility {
  const entry = ALL_MODULE_ABILITIES.find(
    (a) => a.moduleId === moduleId && a.rank === rank,
  )
  if (!entry) {
    throw new Error(
      `moduleAbilityEngine: no ability registered for (${moduleId}, r${rank}) — content bug`,
    )
  }
  return entry
}

/**
 * Runs the ability for `(moduleId, rank)` and returns a fresh `AbilityResult`.
 * The `ctx` param is accepted (and typed) so callers can wire deterministic
 * clock/rng today; Stage 1 stubs don't read from it, but future high-variance
 * abilities will (Spark / Champion in later balance passes).
 *
 * The returned `meterDeltas` object is a shallow clone of the registry entry
 * so callers can mutate freely without corrupting the registry.
 */
export function runModuleAbility(
  moduleId: ModuleId,
  rank: Rank,
  _ctx: AbilityCtx,
): AbilityResult {
  const entry = findModuleAbility(moduleId, rank)
  return {
    verb: entry.ability.verb,
    cost: entry.ability.cost,
    meterDeltas: { ...entry.ability.meterDeltas },
    flagsSet: entry.ability.flagsSet,
    hookIdsScheduled: entry.ability.hookIdsScheduled,
  }
}
