/**
 * choiceResolver — pure engine core (PLAN.md §3, §13).
 *
 * `resolveChoice()` is deliberately side-effect-free:
 *  - Enables seeded replay (multi-run mastery design, PLAN.md §13).
 *  - Unit-testable without mocking Zustand.
 *  - Enables future "share your run" social feature.
 *
 * Pre-decided deviations from the PLAN.md §13 illustrative signature:
 *
 *  1. `GameState` is a local narrow type alias (only the fields the resolver
 *     reads/writes). The store wrapper at T8/T9 adapts RootState → GameState.
 *
 *  2. A `ctx` parameter (now, traceId) is injected so the function is
 *     deterministic — calling Date.now() or generating a TraceId internally
 *     would break "same inputs → same outputs."
 *
 *  3. `hookCatalog: ReadonlyMap<ConsequenceId, ConsequenceHook>` is a parameter
 *     so the resolver is decoupled from the content registry. Missing IDs throw
 *     loudly (content authoring bug, §11 traceability).
 *
 *  4. `DebugEvent` is defined as a minimal stub here; T16 (DevHUD) will render it.
 */
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import type { ResultTrace } from '@schemas/resultTrace.schema'
import {
  MeterKeySchema,
  type MeterKey,
  type ConsequenceId,
  type TraceId,
} from '@schemas/gameState.schema'

// ---------------------------------------------------------------------------
// GameState — narrow input type; only the fields the resolver touches.
// ---------------------------------------------------------------------------

export type GameState = {
  meters: Record<MeterKey, number>
  scheduledConsequences: ConsequenceHook[]
  ledger: ResultTrace[]
}

// ---------------------------------------------------------------------------
// ResolveChoiceCtx — injected non-deterministic values for purity.
// ---------------------------------------------------------------------------

export type ResolveChoiceCtx = {
  /** Injected timestamp for the ResultTrace (replaces Date.now()). */
  now: number
  /** Injected fresh id for the ResultTrace. */
  traceId: TraceId
}

// ---------------------------------------------------------------------------
// DebugEvent — minimal stub; T16 (DevHUD) will render these.
// ---------------------------------------------------------------------------

export type DebugEvent =
  | { type: 'METER_DELTA'; meter: MeterKey; from: number; to: number; delta: number }
  | { type: 'HOOK_SCHEDULED'; hookId: ConsequenceId }
  | { type: 'TRACE_WRITTEN'; traceId: TraceId }

// ---------------------------------------------------------------------------
// resolveChoice
// ---------------------------------------------------------------------------

/**
 * Resolves a player choice: applies meter deltas, schedules consequence hooks,
 * and writes a ResultTrace to the ledger.
 *
 * @param state        - Current (read-only) game state snapshot.
 * @param choice       - The ChoiceNode the player selected.
 * @param hookCatalog  - Map from ConsequenceId → ConsequenceHook. Throws if
 *                       any id referenced in `choice.scheduledConsequenceIds`
 *                       is absent (content authoring bug).
 * @param ctx          - Injected { now, traceId } for determinism.
 * @returns            - { nextState, trace, scheduled, debugEvents }
 *                       `state` is never mutated.
 */
export function resolveChoice(
  state: GameState,
  choice: ChoiceNode,
  hookCatalog: ReadonlyMap<ConsequenceId, ConsequenceHook>,
  ctx: ResolveChoiceCtx,
): {
  nextState: GameState
  trace: ResultTrace
  scheduled: ConsequenceHook[]
  debugEvents: DebugEvent[]
} {
  const debugEvents: DebugEvent[] = []

  // 1. Apply meter deltas — produce a fresh meters object, never mutate.
  // `Object.entries` widens keys to `string`; validate against MeterKeySchema
  // before indexing into `Record<MeterKey, number>` so a JSON-loaded choice
  // that bypassed Zod (or a content authoring typo like `"MOOD"`) throws loudly
  // instead of silently producing NaN arithmetic downstream.
  const nextMeters: Record<MeterKey, number> = { ...state.meters }
  for (const [key, delta] of Object.entries(choice.meterDeltas)) {
    if (delta === undefined) continue
    const parsed = MeterKeySchema.safeParse(key)
    if (!parsed.success) {
      throw new Error(
        `resolveChoice: unknown meter key "${key}" in choice.meterDeltas. ` +
        `This is a content authoring bug. ` +
        `Choice id: "${choice.id}", Task id: "${choice.taskId}".`,
      )
    }
    const meterKey = parsed.data
    const from = nextMeters[meterKey]
    const to = from + delta
    nextMeters[meterKey] = to
    debugEvents.push({ type: 'METER_DELTA', meter: meterKey, from, to, delta })
  }

  // 2. Resolve hook ids → ConsequenceHook objects. Throw on missing catalog entry.
  const scheduled: ConsequenceHook[] = []
  for (const cid of choice.scheduledConsequenceIds) {
    const hook = hookCatalog.get(cid)
    if (hook === undefined) {
      throw new Error(
        `resolveChoice: ConsequenceId "${cid}" not found in hookCatalog. ` +
        `This is a content authoring bug (§11 traceability). ` +
        `Choice id: "${choice.id}", Task id: "${choice.taskId}".`,
      )
    }
    scheduled.push(hook)
    debugEvents.push({ type: 'HOOK_SCHEDULED', hookId: cid })
  }

  // 3. Build the ResultTrace — body is choice.label per T5 spec (T9 may override).
  const trace: ResultTrace = {
    id: ctx.traceId,
    sourceTaskId: choice.taskId,
    sourceChoiceId: choice.id,
    timestamp: ctx.now,
    body: choice.label,
  }
  debugEvents.push({ type: 'TRACE_WRITTEN', traceId: ctx.traceId })

  // 4. Compose nextState — append, never replace.
  const nextState: GameState = {
    meters: nextMeters,
    scheduledConsequences: [...state.scheduledConsequences, ...scheduled],
    ledger: [...state.ledger, trace],
  }

  return { nextState, trace, scheduled, debugEvents }
}
