/**
 * Shared ConsequenceHook fixtures for systems + UI tests.
 *
 * Promoted from the local `phaseHook`/`neverHook` helpers that used to live in
 * evaluateAndEnqueueIntegration.test.ts so that multiple test files (integration
 * drain tests + EventQueueToast UI tests) can share a single hook-shape
 * generator instead of duplicating the seven §11 fields per file.
 *
 * The factories intentionally accept a string suffix so callers can produce
 * multiple distinct hooks in one test (the branded ConsequenceId is derived
 * from the suffix; sourceTaskId/sourceChoiceId keep their canonical defaults).
 */
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import type { SlicePhase } from '@schemas/gameState.schema'
import { fxTaskId, fxChoiceId, fxConsequenceId } from '@tests/schemas/fixtures'

/**
 * A hook whose revealCondition is a PHASE match. Defaults to
 * `'CONSEQUENCE_RETURN'` — the phase at which the ConsequenceReturnPanel
 * surfaces §11 echoes.
 */
export function makePhaseHook(
  idSuffix: string,
  phase: SlicePhase = 'CONSEQUENCE_RETURN',
): ConsequenceHook {
  return {
    id: fxConsequenceId(`cons-int-${idSuffix}`),
    sourceTaskId: fxTaskId(),
    sourceChoiceId: fxChoiceId(),
    traceHint: `hint-${idSuffix}`,
    ledgerEntry: `entry-${idSuffix}`,
    revealCondition: { type: 'PHASE', phase },
    whyNow: `why-${idSuffix}`,
    whatChanged: `what-${idSuffix}`,
  }
}

/**
 * A hook whose revealCondition is NEVER — silence-as-horror. Scheduled but
 * never surfaced to the player; used in engine tests to confirm the queue
 * ignores it during evaluate().
 */
export function makeNeverHook(idSuffix: string): ConsequenceHook {
  return {
    id: fxConsequenceId(`cons-int-${idSuffix}`),
    sourceTaskId: fxTaskId(),
    sourceChoiceId: fxChoiceId(),
    traceHint: `hint-${idSuffix}`,
    ledgerEntry: `entry-${idSuffix}`,
    revealCondition: { type: 'NEVER' },
    whyNow: `why-${idSuffix}`,
    whatChanged: `what-${idSuffix}`,
  }
}
