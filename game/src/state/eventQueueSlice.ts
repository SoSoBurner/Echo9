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
import { makeStageOneAncestryId } from '@schemas/resultTrace.schema'
import { markBeat } from '@ui/debug/BeatTelemetry'
import { END_OF_CONTENT_TERMINAL_FLAG } from '@content/contentBoundary.manifest'
import { END_OF_CONTENT_STORAGE_KEY } from './endOfContentSlice'
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
    // Precompute the terminal condition BEFORE mutating state — the shift and
    // the endOfContentSeen flip MUST land in a single immer producer so no
    // render can observe (queue empty, overlay not shown). Splitting these
    // across two set() calls would surface an inconsistent frame where the
    // ConsequenceReturnPanel unmounts (queue empty) before the EoC overlay
    // mounts (endOfContentSeen still false), and the resolver's dep-array
    // re-fires in that window could redirect the phase.
    const snapshot = get()
    if (!snapshot.pendingFiredHooks[0]) return
    const isTerminal =
      snapshot.pendingFiredHooks.length === 1 &&
      snapshot.flags.has(END_OF_CONTENT_TERMINAL_FLAG)
    set((state) => {
      state.pendingFiredHooks.shift()
      if (isTerminal) state.endOfContentSeen = true
    })
    // localStorage side effect after the atomic state mutation. The only
    // window here is tab-close between set() and setItem — matches the
    // existing risk profile of markEndOfContentSeen() itself (immer runs
    // state + storage in the same synchronous producer).
    if (isTerminal) {
      try {
        localStorage.setItem(END_OF_CONTENT_STORAGE_KEY, 'true')
      } catch {
        // localStorage unavailable (private mode, quota) — state still flips.
      }
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

    // Pre-materialize traces outside set() — pure work, no state mutation.
    // freshTraceId() and Date.now() are non-deterministic but they only
    // matter for identity, not for the §11 invariant.
    const traces = fired.map((hook) => {
      const { playerExplanation } = materialize(hook)
      return {
        id: freshTraceId(),
        sourceTaskId: hook.sourceTaskId,
        sourceChoiceId: hook.sourceChoiceId,
        stageOneAncestryId: makeStageOneAncestryId(
          hook.sourceTaskId,
          hook.sourceChoiceId,
        ),
        timestamp: Date.now(),
        body: playerExplanation,
      }
    })

    // §11 atomicity: ledger append + scheduled splice + pending push all
    // land in ONE immer producer. Previously trace appends ran in a loop
    // BEFORE the atomic splice/push — that opened a window where the ledger
    // held new entries while scheduledConsequences still contained the fired
    // hooks. A dep-array re-fire of evaluateAndEnqueue in that window would
    // re-evaluate the same hooks and duplicate them into both ledger and
    // pending. Bundling everything atomically also means a mid-flow throw
    // cannot leave the hook removed from scheduled but absent from pending.
    set((state) => {
      for (const trace of traces) {
        state.ledger.push(trace)
      }
      for (const hook of fired) {
        const idx = state.scheduledConsequences.findIndex((h) => h.id === hook.id)
        if (idx !== -1) state.scheduledConsequences.splice(idx, 1)
        state.pendingFiredHooks.push(hook)
      }
    })
  },
})
