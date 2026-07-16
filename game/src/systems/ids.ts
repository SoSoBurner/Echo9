/**
 * ids — fresh, branded identifier factories.
 *
 * `freshTraceId()` is the sole source of new TraceId values in the app.
 * Previously duplicated across Layout.tsx, eventQueueSlice.ts, and
 * ModuleAbilityButton.tsx (with a bespoke helper each); consolidated here
 * once the third caller appeared, per the local TODO in eventQueueSlice.
 *
 * crypto.randomUUID() is secure-context only — plain-HTTP staging (itch's
 * preview, some file:// hosts) would throw. The Date+Math.random fallback
 * is not cryptographically random, but TraceIds only need identity, not
 * unpredictability: they collide only if two traces materialize inside the
 * same millisecond AND the 10-char random tail matches, which is well below
 * a §11 concern.
 */
import { makeTraceId, type TraceId } from '@schemas/gameState.schema'

export function freshTraceId(): TraceId {
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
  return makeTraceId(id)
}
