/**
 * capitalResolver — pure resolver for one CAPITAL deployment (PLAN.md §8).
 *
 * When CAPITAL > 80 the player gets ONE counterplay deployment per quarter.
 * The player picks one of the 6 verbs (REDIRECT / HIDE / DELAY / WEAPONIZE /
 * SABOTAGE / UNOWN) and the resolver:
 *
 *   1. Validates each meterDeltas key (throws on unknown — same JSON-loaded
 *      defence as choiceResolver / inspectionEngine).
 *   2. Schedules every ConsequenceHook id declared on the card, throwing if
 *      the catalog is missing one (matches choiceResolver — content bugs
 *      surface loudly).
 *   3. Builds a ResultTrace from card.traceBody (cards carry their own line,
 *      unlike ChoiceNode where the label IS the trace body).
 *   4. Returns the same {nextState, trace, scheduled, meterDeltas, flagsAdded,
 *      debugEvents} shape so the store wrapper does one uniform fan-out.
 *
 * Pure-engine pattern (§13 resolver-purity contract):
 *   - Snapshot of state + ctx({ now, traceId }).
 *   - No Date.now / Math.random inside.
 *   - Throws on game-logic violations; never silently drops or applies partial.
 */
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import type { ResultTrace } from '@schemas/resultTrace.schema'
import type { CapitalCard } from '@schemas/capitalCard.schema'
import {
  MeterKeySchema,
  type MeterKey,
  type TraceId,
  type TaskId,
  type ChoiceId,
  type ConsequenceId,
} from '@schemas/gameState.schema'

// ---------------------------------------------------------------------------
// CapitalState — narrow input slice the engine reads.
// ---------------------------------------------------------------------------

export type CapitalState = {
  meters: Record<MeterKey, number>
  scheduledConsequences: ConsequenceHook[]
  ledger: ResultTrace[]
  /** Flags carry through unchanged here; the resolver only ADDS new ones. */
  flags: ReadonlySet<string>
}

// ---------------------------------------------------------------------------
// ResolveCapitalCtx — injected non-deterministic values for purity.
// ---------------------------------------------------------------------------

export type ResolveCapitalCtx = {
  now: number
  traceId: TraceId
  /** Source TaskId stamped onto the trace — the directive being countered. */
  sourceTaskId: TaskId
  /** Synthetic choice id stamped onto the trace ('capital-<verb>-<cardId>'). */
  sourceChoiceId: ChoiceId
}

// ---------------------------------------------------------------------------
// DebugEvent — local stub for T16 DevHUD parity with other resolvers.
// ---------------------------------------------------------------------------

export type CapitalDebugEvent =
  | { type: 'METER_DELTA'; meter: MeterKey; from: number; to: number; delta: number }
  | { type: 'TRACE_WRITTEN'; traceId: TraceId }
  | { type: 'HOOK_SCHEDULED'; hookId: ConsequenceId }
  | { type: 'FLAG_ADDED'; flag: string }
  | { type: 'CAPITAL_DEPLOYED'; verb: CapitalCard['verb']; cardId: string }

// ---------------------------------------------------------------------------
// resolveCapital — apply one capital-card commit.
// ---------------------------------------------------------------------------

export function resolveCapital(
  state: CapitalState,
  card: CapitalCard,
  hookCatalog: ReadonlyMap<ConsequenceId, ConsequenceHook>,
  ctx: ResolveCapitalCtx,
): {
  nextState: CapitalState
  trace: ResultTrace
  scheduled: ConsequenceHook[]
  meterDeltas: Partial<Record<MeterKey, number>>
  flagsAdded: readonly string[]
  debugEvents: CapitalDebugEvent[]
} {
  const debugEvents: CapitalDebugEvent[] = []

  // 1. Meter deltas — validate each key (defence against JSON-loaded content
  //    that bypassed Zod parsing), then apply on a fresh meters object.
  const nextMeters: Record<MeterKey, number> = { ...state.meters }
  for (const [key, delta] of Object.entries(card.meterDeltas)) {
    if (delta === undefined) continue
    const parsed = MeterKeySchema.safeParse(key)
    if (!parsed.success) {
      throw new Error(
        `resolveCapital: unknown meter key "${key}" in card.meterDeltas. ` +
        `Card id: "${card.id}", verb: "${card.verb}".`,
      )
    }
    const meterKey = parsed.data
    const from = nextMeters[meterKey]
    const to = from + delta
    nextMeters[meterKey] = to
    debugEvents.push({ type: 'METER_DELTA', meter: meterKey, from, to, delta })
  }

  // 2. Schedule hooks — same throw-on-missing contract as choiceResolver.
  //    Resolving content-bug ids before applying anything (we're still pure)
  //    keeps the caller from having to roll back a partial commit.
  const scheduled: ConsequenceHook[] = []
  for (const cid of card.scheduledConsequenceIds) {
    const hook = hookCatalog.get(cid)
    if (!hook) {
      throw new Error(
        `resolveCapital: consequence id "${cid}" not found in catalog. ` +
        `Card id: "${card.id}", verb: "${card.verb}". ` +
        `This is a content authoring bug — every scheduledConsequenceId must ` +
        `resolve to a ConsequenceHook in ALL_CONSEQUENCE_MODULES.`,
      )
    }
    scheduled.push(hook)
    debugEvents.push({ type: 'HOOK_SCHEDULED', hookId: cid })
  }

  // 3. Flags — fresh Set so caller cannot mutate ours by accident.
  const nextFlags = new Set(state.flags)
  for (const flag of card.flagsAdded) {
    nextFlags.add(flag)
    debugEvents.push({ type: 'FLAG_ADDED', flag })
  }

  // 4. Trace — body comes from the card, not the label (label is the button
  //    text; traceBody is the present-tense ledger line).
  const trace: ResultTrace = {
    id: ctx.traceId,
    sourceTaskId: ctx.sourceTaskId,
    sourceChoiceId: ctx.sourceChoiceId,
    timestamp: ctx.now,
    body: card.traceBody,
  }
  debugEvents.push({ type: 'TRACE_WRITTEN', traceId: ctx.traceId })
  debugEvents.push({ type: 'CAPITAL_DEPLOYED', verb: card.verb, cardId: card.id })

  // 5. Compose nextState — append, never replace.
  const nextState: CapitalState = {
    meters: nextMeters,
    scheduledConsequences: [...state.scheduledConsequences, ...scheduled],
    ledger: [...state.ledger, trace],
    flags: nextFlags,
  }

  return {
    nextState,
    trace,
    scheduled,
    meterDeltas: card.meterDeltas,
    flagsAdded: card.flagsAdded,
    debugEvents,
  }
}
