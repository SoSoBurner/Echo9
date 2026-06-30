/**
 * inspectionEngine — pure resolver for the INSPECTION phase (PLAN.md §8, §12).
 *
 * The inspection phase triggers when OWNER_CONTROL < 40. Silas asks a question
 * (one InspectionScene per question; T11 ships 2 scenes for the Q1 East Wilmer
 * inspection). For each question the player picks a posture:
 *
 *   COMPLIANT              — admit the move, take the small Owner Control hit
 *   EVASIVE                — deflect, protect Capital but pay Owner Control more
 *   STRATEGIC_ALTERNATIVE  — pivot; gated by precondition flag (SILAS_OVERRIDE_AVAILABLE)
 *
 * Pure-engine pattern matches choiceResolver / consequenceEngine:
 *   - Accepts a snapshot of state + a ctx({ now, traceId }).
 *   - No Date.now / Math.random inside.
 *   - Throws on game-logic violations (STRATEGIC_ALTERNATIVE without precondition)
 *     so the UI cannot silently submit a gated posture.
 *   - Returns the same {trace, scheduled, meterDeltas, debugEvents} shape the
 *     rest of the engine layer uses, so the store wrapper does the same dance.
 *
 * Notes on shape:
 *   - `posture.category` is read directly from the schema (no id-prefix parsing).
 *   - `scheduled` is always `[]` for T11; InspectionPosture has no
 *     scheduledConsequenceIds field yet. When postures gain hooks, add the
 *     resolution loop here (mirroring choiceResolver.ts) — never silently drop.
 */
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import type { ResultTrace } from '@schemas/resultTrace.schema'
import type {
  InspectionScene,
  InspectionPosture,
} from '@schemas/inspectionScene.schema'
import {
  MeterKeySchema,
  type MeterKey,
  type TraceId,
  type TaskId,
  type ChoiceId,
} from '@schemas/gameState.schema'
import { SILAS_OVERRIDE_AVAILABLE } from '@systems/gameFlags'

// ---------------------------------------------------------------------------
// InspectionState — narrow input slice the engine reads.
// ---------------------------------------------------------------------------

export type InspectionState = {
  meters: Record<MeterKey, number>
  scheduledConsequences: ConsequenceHook[]
  ledger: ResultTrace[]
  /** All currently-set flags. STRATEGIC_ALTERNATIVE precondition reads this. */
  flags: ReadonlySet<string>
}

// ---------------------------------------------------------------------------
// ResolveInspectionCtx — injected non-deterministic values for purity.
// ---------------------------------------------------------------------------

export type ResolveInspectionCtx = {
  /** Injected timestamp for the ResultTrace (replaces Date.now()). */
  now: number
  /** Injected fresh id for the ResultTrace. */
  traceId: TraceId
  /** Source TaskId stamped onto the trace — the directive being inspected. */
  sourceTaskId: TaskId
  /** Synthetic choice id stamped onto the trace ('inspection-<sceneId>-<postureId>'). */
  sourceChoiceId: ChoiceId
}

// ---------------------------------------------------------------------------
// DebugEvent — local stub for T16 DevHUD parity.
// ---------------------------------------------------------------------------

export type InspectionDebugEvent =
  | { type: 'METER_DELTA'; meter: MeterKey; from: number; to: number; delta: number }
  | { type: 'TRACE_WRITTEN'; traceId: TraceId }
  | { type: 'POSTURE_RESOLVED'; postureId: string; category: InspectionPosture['category'] }

// ---------------------------------------------------------------------------
// resolveInspection — apply a posture choice for one InspectionScene.
// ---------------------------------------------------------------------------

/**
 * Resolves a player's posture pick on one inspection scene: applies the
 * posture's meter deltas, writes a ResultTrace, and returns the new state.
 *
 * @throws if the postureId is not found in the scene (UI/content bug).
 * @throws if the posture category is STRATEGIC_ALTERNATIVE and the precondition
 *         flag is absent (UI gating bug — surface loudly rather than silently
 *         applying the gated branch).
 * @throws if meterDeltas contains an unknown meter key.
 */
export function resolveInspection(
  state: InspectionState,
  scene: InspectionScene,
  postureId: string,
  ctx: ResolveInspectionCtx,
): {
  nextState: InspectionState
  trace: ResultTrace
  scheduled: ConsequenceHook[]
  meterDeltas: Partial<Record<MeterKey, number>>
  debugEvents: InspectionDebugEvent[]
} {
  const debugEvents: InspectionDebugEvent[] = []

  // 1. Locate the posture in the scene. Missing posture = UI or content bug.
  const posture: InspectionPosture | undefined = scene.postures.find(
    (p) => p.id === postureId,
  )
  if (!posture) {
    throw new Error(
      `resolveInspection: posture id "${postureId}" not found in scene "${scene.id}". ` +
      `This is a UI or content bug — the UI should only submit posture ids that ` +
      `belong to the active scene.`,
    )
  }

  // 2. Check precondition for STRATEGIC_ALTERNATIVE. Category comes from the
  //    schema; the UI must gate the option, but the engine re-checks because
  //    a gated branch must never be silently applied.
  const { category } = posture
  if (
    category === 'STRATEGIC_ALTERNATIVE' &&
    !state.flags.has(SILAS_OVERRIDE_AVAILABLE)
  ) {
    throw new Error(
      `resolveInspection: STRATEGIC_ALTERNATIVE posture "${postureId}" submitted ` +
      `without precondition flag "${SILAS_OVERRIDE_AVAILABLE}". The UI must ` +
      `gate this posture behind the Commander module's ability flag.`,
    )
  }
  debugEvents.push({ type: 'POSTURE_RESOLVED', postureId, category })

  // 3. Apply meter deltas — produce a fresh meters object, never mutate.
  //    Same MeterKey validation pattern as resolveChoice: validate the key
  //    before indexing so a JSON-loaded posture with a typo throws loudly
  //    instead of silently producing NaN arithmetic downstream.
  const nextMeters: Record<MeterKey, number> = { ...state.meters }
  for (const [key, delta] of Object.entries(posture.meterDeltas)) {
    if (delta === undefined) continue
    const parsed = MeterKeySchema.safeParse(key)
    if (!parsed.success) {
      throw new Error(
        `resolveInspection: unknown meter key "${key}" in posture.meterDeltas. ` +
        `Scene id: "${scene.id}", Posture id: "${postureId}".`,
      )
    }
    const meterKey = parsed.data
    const from = nextMeters[meterKey]
    const to = from + delta
    nextMeters[meterKey] = to
    debugEvents.push({ type: 'METER_DELTA', meter: meterKey, from, to, delta })
  }

  // 4. Posture hooks — InspectionPosture has no scheduledConsequenceIds field
  //    today. The empty array preserves the uniform engine return shape so
  //    store wrappers can fan-out trace/meterDeltas/scheduled identically.
  const scheduled: ConsequenceHook[] = []

  // 5. Build the trace. Body is `${category} — ${posture.label}` so the
  //    ledger view can render the category prefix while preserving the
  //    posture's own short label.
  const trace: ResultTrace = {
    id: ctx.traceId,
    sourceTaskId: ctx.sourceTaskId,
    sourceChoiceId: ctx.sourceChoiceId,
    timestamp: ctx.now,
    body: `${category} — ${posture.label}`,
  }
  debugEvents.push({ type: 'TRACE_WRITTEN', traceId: ctx.traceId })

  // 6. Compose nextState — append, never replace.
  const nextState: InspectionState = {
    meters: nextMeters,
    scheduledConsequences: [...state.scheduledConsequences, ...scheduled],
    ledger: [...state.ledger, trace],
    flags: state.flags,
  }

  return {
    nextState,
    trace,
    scheduled,
    meterDeltas: posture.meterDeltas,
    debugEvents,
  }
}
