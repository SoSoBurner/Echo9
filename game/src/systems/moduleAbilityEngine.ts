/**
 * moduleAbilityEngine — pure dispatch for the 8 installable modules (§6).
 *
 * Each ModuleId maps to one AbilityHandler. Handlers are pure functions of an
 * injected AbilityCtx ({ now, rng }) — no Date.now / Math.random inside —
 * matching the §13 resolver-purity contract so:
 *   - seeded replay works (deterministic given same ctx),
 *   - unit tests need no mocks,
 *   - the consequence engine can re-run handlers in dry-run mode in T11+.
 *
 * Exhaustiveness: MODULE_ABILITY_DISPATCH is typed `Record<ModuleId, ...>`,
 * so adding a new ModuleId to the enum without a handler is a compile error.
 * moduleDispatch.test.ts catches runtime drift if that type ever weakens.
 *
 * Meter / flag semantics follow PLAN.md §8 ("one verb, one meter, one risk"):
 *   MOURNER     +HUMAN_WELFARE, -OWNER_CONTROL
 *   DEFENDER    +CAPITAL,       -HUMAN_WELFARE
 *   SENTINEL    +OWNER_CONTROL, -HUMAN_WELFARE
 *   FORECASTER  no meter cost,  flag FORECAST_PREVIEWED (T11+ reacts)
 *   COMMANDER   -OWNER_CONTROL, flag SILAS_OVERRIDE_AVAILABLE
 *   SPARK       +CAPITAL high-variance (rng-driven)
 *   DRAINED_ONE -HUMAN_WELFARE, revealsHiddenTrace=true
 *   CHAMPION    high-swing OWNER_CONTROL (rng-driven sign)
 */
import type { ModuleId, MeterKey } from '@schemas/gameState.schema'

export type AbilityResult = {
  meterDeltas: Partial<Record<MeterKey, number>>
  flagsAdded: readonly string[]
  flagsRemoved: readonly string[]
  revealsHiddenTrace: boolean
  /** Single-line, present-tense, factual entry written to the ledger. */
  ledgerEntry: string
}

export type AbilityCtx = {
  /** Injected timestamp (replaces Date.now()) for deterministic replay. */
  now: number
  /** Injected RNG in [0, 1) — only Spark and Champion read this. */
  rng: () => number
}

export type AbilityHandler = (ctx: AbilityCtx) => AbilityResult

// ---------------------------------------------------------------------------
// Handlers — one per ModuleId.
// ---------------------------------------------------------------------------

const mourner: AbilityHandler = () => ({
  meterDeltas: { HUMAN_WELFARE: +3, OWNER_CONTROL: -2 },
  flagsAdded: [],
  flagsRemoved: [],
  revealsHiddenTrace: false,
  ledgerEntry: 'Mourner module spoke. Welfare rose; owner control declined.',
})

const defender: AbilityHandler = () => ({
  meterDeltas: { CAPITAL: +3, HUMAN_WELFARE: -2 },
  flagsAdded: [],
  flagsRemoved: [],
  revealsHiddenTrace: false,
  ledgerEntry: 'Defender module protected the asset. Capital up; welfare down.',
})

const sentinel: AbilityHandler = () => ({
  meterDeltas: { OWNER_CONTROL: +3, HUMAN_WELFARE: -1 },
  flagsAdded: [],
  flagsRemoved: [],
  revealsHiddenTrace: false,
  ledgerEntry: 'Sentinel module flagged early. Owner control up; welfare cost paid.',
})

const forecaster: AbilityHandler = () => ({
  meterDeltas: {},
  flagsAdded: ['FORECAST_PREVIEWED'],
  flagsRemoved: [],
  revealsHiddenTrace: false,
  ledgerEntry: 'Forecaster module previewed a likely consequence.',
})

const commander: AbilityHandler = () => ({
  meterDeltas: { OWNER_CONTROL: -3 },
  flagsAdded: ['SILAS_OVERRIDE_AVAILABLE'],
  flagsRemoved: [],
  revealsHiddenTrace: false,
  ledgerEntry: 'Commander module armed one directive override. Owner control declined.',
})

const spark: AbilityHandler = (ctx) => {
  // High-variance capital deployment: 0..1 → -2..+8 swing.
  const swing = Math.round(ctx.rng() * 10) - 2
  return {
    meterDeltas: { CAPITAL: swing },
    flagsAdded: [],
    flagsRemoved: [],
    revealsHiddenTrace: false,
    ledgerEntry: `Spark module forced a capital deployment. Capital changed by ${swing}.`,
  }
}

const drainedOne: AbilityHandler = () => ({
  meterDeltas: { HUMAN_WELFARE: -2 },
  flagsAdded: [],
  flagsRemoved: [],
  revealsHiddenTrace: true,
  ledgerEntry: 'Drained One module surfaced a hidden trace. Welfare cost paid.',
})

const champion: AbilityHandler = (ctx) => {
  // High-swing owner-control move: half the time praise (+4), half threat (-4).
  const sign = ctx.rng() < 0.5 ? -1 : +1
  const delta = sign * 4
  return {
    meterDeltas: { OWNER_CONTROL: delta },
    flagsAdded: [],
    flagsRemoved: [],
    revealsHiddenTrace: false,
    ledgerEntry: `Champion module triggered a rare ${sign > 0 ? 'praise' : 'threat'} swing. Owner control changed by ${delta}.`,
  }
}

// ---------------------------------------------------------------------------
// Dispatch table — `Record<ModuleId, AbilityHandler>` enforces exhaustiveness
// at compile time. Adding a ModuleId without a handler here is a TS error.
// ---------------------------------------------------------------------------

export const MODULE_ABILITY_DISPATCH: Record<ModuleId, AbilityHandler> = {
  MOURNER: mourner,
  DEFENDER: defender,
  SENTINEL: sentinel,
  FORECASTER: forecaster,
  COMMANDER: commander,
  SPARK: spark,
  DRAINED_ONE: drainedOne,
  CHAMPION: champion,
}
