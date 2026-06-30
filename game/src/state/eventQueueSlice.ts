/**
 * eventQueueSlice — the queue of fired ConsequenceHooks awaiting player review
 * (PLAN.md §8, §11; Task 12).
 *
 * Per §8 ("consequenceEngine.evaluate(state) runs at every phase transition"),
 * Layout calls `evaluateAndEnqueue()` from a useEffect whose dep array reacts
 * to anything that can change a revealCondition match (phase, meters, flags).
 * For each hook that fires, evaluateAndEnqueue():
 *   1. Removes it from scheduledConsequences (single source of truth).
 *   2. Materializes its 7 §11 fields into a ResultTrace body and appends to
 *      the ledger (the player-facing audit log).
 *   3. Pushes it onto pendingFiredHooks (this slice's queue).
 *
 * The ConsequenceReturnPanel reads `pendingFiredHooks[0]` and offers an
 * "Acknowledge" button that calls `ackFirstPending()`. The toast announces
 * count + key-hint while the queue is non-empty.
 *
 * Persistence (CRITICAL, §11 invariant):
 *   - This slice IS persisted via the partialize allow-list in store.ts.
 *   - Without persistence, a player who closes the tab between "consequence
 *     fired" and "player ack'd" loses the echo silently — and the §11
 *     invariant ("every delayed consequence returns") would leak across
 *     reloads. The guard test in store.test.ts pins the partialize shape.
 *
 * evaluateAndEnqueue lives here (rather than in store.ts) because it is the
 * only consumer of the queue's mutation API; keeping enqueue + the wrapper in
 * the same file keeps the slice cohesive.
 */
import type { StateCreator } from 'zustand'
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import {
  evaluate,
  materialize,
  type EvalState,
} from '@systems/consequenceEngine'
import { makeTraceId, type TraceId } from '@schemas/gameState.schema'
import type { RootState } from './store'

export type EventQueueSlice = {
  /** Fired hooks awaiting player ack, in fire-order (FIFO). */
  pendingFiredHooks: ConsequenceHook[]
  /** Append fired hooks to the queue. */
  enqueueFired: (hooks: ConsequenceHook[]) => void
  /** Remove the head of the queue (called by the panel's Acknowledge button). */
  ackFirstPending: () => void
  /** Empty the queue entirely (testing / quarter-rollover utility). */
  clearPending: () => void
  /**
   * Evaluate the scheduled-consequence queue against the current snapshot
   * and, for each fired hook: remove from scheduled, append a ResultTrace to
   * the ledger, push the hook onto pendingFiredHooks. Side-effectful glue
   * around the pure consequenceEngine.
   */
  evaluateAndEnqueue: () => void
}

// crypto.randomUUID() is secure-context only — plain-HTTP staging would throw.
// Mirrors freshTraceId() in Layout.tsx; kept local to avoid creating a new
// shared util file for a single duplication. If a third caller appears (T13+),
// hoist to @systems/ids.ts.
function freshTraceId(): TraceId {
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
  return makeTraceId(id)
}

export const createEventQueueSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  EventQueueSlice
> = (set, get) => ({
  pendingFiredHooks: [],
  enqueueFired: (hooks) =>
    set((state) => {
      for (const h of hooks) state.pendingFiredHooks.push(h)
    }),
  ackFirstPending: () =>
    set((state) => {
      state.pendingFiredHooks.shift()
    }),
  clearPending: () =>
    set((state) => {
      state.pendingFiredHooks = []
    }),
  evaluateAndEnqueue: () => {
    // Build the EvalState view the pure engine expects.
    const live = get()
    const evalState: EvalState = {
      phase: live.phase,
      meters: live.meters,
      flags: live.flags,
      scheduledConsequences: live.scheduledConsequences,
    }
    const { fired } = evaluate(evalState)
    if (fired.length === 0) return

    // For each fired hook: materialize → trace → ledger → remove → enqueue.
    // All three slice mutations land via the existing slice actions so any
    // future cross-cutting middleware (devtools, undo) sees a coherent
    // sequence of named actions rather than one opaque bulk write.
    for (const hook of fired) {
      const { playerExplanation } = materialize(hook)
      live.appendTrace({
        id: freshTraceId(),
        sourceTaskId: hook.sourceTaskId,
        sourceChoiceId: hook.sourceChoiceId,
        timestamp: Date.now(),
        body: playerExplanation,
      })
      live.removeHook(hook.id)
    }
    // Single set() for the queue avoids N intermediate re-renders.
    set((state) => {
      for (const hook of fired) state.pendingFiredHooks.push(hook)
    })
  },
})
