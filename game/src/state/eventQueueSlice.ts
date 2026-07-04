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
import { markBeat } from '@ui/debug/BeatTelemetry'
import { END_OF_CONTENT_HOOK_ID } from '@content/contentBoundary.manifest'
import type { RootState } from './store'

export type EventQueueSlice = {
  /** Fired hooks awaiting player ack, in fire-order (FIFO). */
  pendingFiredHooks: ConsequenceHook[]
  /** Append fired hooks to the queue. */
  enqueueFired: (hooks: ConsequenceHook[]) => void
  /**
   * Remove the head of the queue (called by the panel's Acknowledge button).
   * If the acked hook is the content-boundary terminal, flips endOfContentSeen
   * via markEndOfContentSeen().
   */
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
  ackFirstPending: () => {
    const head = get().pendingFiredHooks[0]
    if (!head) return
    const queueLenBefore = get().pendingFiredHooks.length
    set((state) => {
      state.pendingFiredHooks.shift()
    })
    // Terminal-hook detection: when acking the LAST pending hook AND that hook
    // is the shipped demo's end-of-content boundary, flip the flag through the
    // slice action so its dedicated localStorage key updates atomically with
    // the state mutation.
    if (head.id === END_OF_CONTENT_HOOK_ID && queueLenBefore === 1) {
      get().markEndOfContentSeen()
    }
  },
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
    markBeat('firstEchoFired')

    // Trace append is intentionally a separate slice action — the ledger is
    // a cosmetic player-facing audit log; losing a trace entry on a mid-
    // sequence crash is acceptable. The queue is NOT: removing a hook from
    // `scheduledConsequences` without also pushing it onto `pendingFiredHooks`
    // would leak the §11 invariant (a delayed consequence vanishing without
    // ever surfacing). So the remove+push pair below MUST happen in a single
    // atomic immer producer.
    for (const hook of fired) {
      const { playerExplanation } = materialize(hook)
      live.appendTrace({
        id: freshTraceId(),
        sourceTaskId: hook.sourceTaskId,
        sourceChoiceId: hook.sourceChoiceId,
        timestamp: Date.now(),
        body: playerExplanation,
      })
    }
    // Atomic: remove-from-scheduled and push-to-pending land in ONE set()
    // so the §11 invariant cannot leak between dispatches. If the React tree
    // throws between the two halves of a split mutation, the hook would be
    // gone from scheduledConsequences but absent from pendingFiredHooks too.
    set((state) => {
      for (const hook of fired) {
        const idx = state.scheduledConsequences.findIndex((h) => h.id === hook.id)
        if (idx !== -1) state.scheduledConsequences.splice(idx, 1)
        state.pendingFiredHooks.push(hook)
      }
    })
  },
})
