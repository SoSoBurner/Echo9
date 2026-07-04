/**
 * ModuleAbility — the rank-aware ability definition for the 8 Upgrade modules.
 * Each installed module has a current rank (1–3 for Stage 1, up to 5 in later
 * quarters). Every (moduleId, rank) pair resolves to exactly one ability
 * definition; the engine dispatches by looking up (moduleId, currentRank) in
 * the ALL_MODULE_ABILITIES registry (built in B2).
 *
 * Stage 1 tops at rank 3. Ranks 4–5 will land in later quarters — RankSchema
 * will widen when they do; the engine dispatch and stored `installedModules`
 * rank values will follow (B3/B4).
 *
 * Flags note: at time of writing, game flags are bare `as const` string
 * literals in `@systems/gameFlags` (no Zod enum, no `GameFlagSchema`). We
 * therefore fall back to `z.string().min(1)` for `flagsSet` and gating
 * `requiresFlag`. When flags are formalized as a Zod enum, swap this out and
 * the (moduleId, rank) registry will get compile-time flag-name checking.
 */
import { z } from 'zod'
import {
  ModuleIdSchema,
  MeterKeySchema,
  ConsequenceIdSchema,
} from '@schemas/gameState.schema'

// -----------------------------------------------------------------------------
// RankSchema — Stage 1 caps at 3. Widen when ranks 4–5 land.
// -----------------------------------------------------------------------------

export const RankSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
])
export type Rank = z.infer<typeof RankSchema>

// -----------------------------------------------------------------------------
// GameFlagSchema (local fallback) — bare non-empty string until game flags
// are formalized as a Zod enum. Falls back to z.string() until game flags are
// formalized as a Zod enum.
// -----------------------------------------------------------------------------

const GameFlagSchema = z.string().min(1)

// -----------------------------------------------------------------------------
// ModuleAbilitySchema — the (moduleId, rank) dispatch record.
// -----------------------------------------------------------------------------

export const ModuleAbilitySchema = z.object({
  moduleId: ModuleIdSchema,
  rank: RankSchema,
  ability: z.object({
    /** Player-visible verb, e.g. "Mourn the loss aloud". */
    verb: z.string().min(1),
    /** Capital or action-point cost to fire the ability. */
    cost: z.number().int().min(0),
    /** Meter changes applied on fire. Keys must be shipped MeterKey values. */
    meterDeltas: z.partialRecord(MeterKeySchema, z.number().int()).default({}),
    /** Cross-engine flags this ability raises on fire. */
    flagsSet: z.array(GameFlagSchema).default([]),
    /** Consequence hooks scheduled onto the queue on fire (§11). */
    hookIdsScheduled: z.array(ConsequenceIdSchema).default([]),
  }),
  /** The minimum rank at which this ability becomes available. */
  unlocksAtRank: RankSchema,
  /** Optional gating conditions the engine checks before allowing dispatch. */
  gating: z.object({
    requiresFlag: GameFlagSchema.optional(),
    requiresRank: RankSchema.optional(),
  }).default({}),
})

export type ModuleAbility = z.infer<typeof ModuleAbilitySchema>
