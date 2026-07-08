/**
 * eventQueueSlice.endOfContent tests — flag-based terminal-boundary detection
 * (C16 rewrite, PLAN.md §11 + Q48 lock).
 *
 * Covers the terminal-boundary extension to `ackFirstPending`: when acking the
 * LAST pending hook AND the `END_OF_CONTENT_TERMINAL_FLAG` (Q1_CLOSED) is set
 * in state, the slice must invoke `markEndOfContentSeen()` so both the
 * in-memory flag and the OWN localStorage key (`echo9:endOfContentSeen`) flip
 * atomically.
 *
 * Pre-C16 the detection was `head.id === END_OF_CONTENT_HOOK_ID`, which pinned
 * the demo boundary to a single W1 optional-consequence hook id. Only players
 * who took that one W1 posture ever saw the overlay. C16 moves the boundary to
 * a flag — Layout sets `Q1_CLOSED` on any Week 12 commit — so every Q1-close
 * posture lands on the overlay regardless of which hook happens to be at the
 * head of the queue.
 *
 * Cases:
 *   1. Without Q1_CLOSED: acking a hook that empties the queue leaves
 *      endOfContentSeen false and own-key null (nothing about the hook id
 *      alone should trigger the overlay).
 *   2. With Q1_CLOSED + tail: acking while a tail remains keeps false.
 *   3. With Q1_CLOSED + empties queue: flips true and persists.
 *   4. Idempotent after terminal ack.
 *   5. Reset scenario: resetEndOfContentSeen() undoes the flip; re-triggerable.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '@state/store'
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import { fxTaskId, fxChoiceId, fxConsequenceId } from '@tests/schemas/fixtures'
import { END_OF_CONTENT_TERMINAL_FLAG } from '@content/contentBoundary.manifest'
import { resetStore } from './testHelpers'

const END_OF_CONTENT_STORAGE_KEY = 'echo9:endOfContentSeen'

/** Build a valid ConsequenceHook with all 7 §11 fields set. */
function makeHook(suffix: string): ConsequenceHook {
  return {
    id: fxConsequenceId(`cons-evq-${suffix}`),
    sourceTaskId: fxTaskId(),
    sourceChoiceId: fxChoiceId(),
    traceHint: `hint-${suffix}`,
    ledgerEntry: `entry-${suffix}`,
    revealCondition: { type: 'PHASE', phase: 'CONSEQUENCE_RETURN' },
    whyNow: `why-${suffix}`,
    whatChanged: `what-${suffix}`,
  }
}

describe('eventQueueSlice — terminal-flag detection in ackFirstPending', () => {
  beforeEach(() => {
    localStorage.clear()
    resetStore()
    useGameStore.setState({ endOfContentSeen: false })
  })

  it('empties the queue WITHOUT the terminal flag: endOfContentSeen stays false', () => {
    useGameStore.getState().enqueueFired([makeHook('a')])

    useGameStore.getState().ackFirstPending()

    expect(useGameStore.getState().endOfContentSeen).toBe(false)
    expect(localStorage.getItem(END_OF_CONTENT_STORAGE_KEY)).toBeNull()
    expect(useGameStore.getState().pendingFiredHooks).toEqual([])
  })

  it('acking with terminal flag set but a tail remaining keeps endOfContentSeen false', () => {
    useGameStore.getState().setFlag(END_OF_CONTENT_TERMINAL_FLAG)
    useGameStore.getState().enqueueFired([makeHook('head'), makeHook('tail')])

    useGameStore.getState().ackFirstPending()

    expect(useGameStore.getState().endOfContentSeen).toBe(false)
    expect(localStorage.getItem(END_OF_CONTENT_STORAGE_KEY)).toBeNull()
    const q = useGameStore.getState().pendingFiredHooks
    expect(q).toHaveLength(1)
  })

  it('acking the last pending hook WITH the terminal flag flips endOfContentSeen true and persists', () => {
    useGameStore.getState().setFlag(END_OF_CONTENT_TERMINAL_FLAG)
    useGameStore.getState().enqueueFired([makeHook('final')])

    useGameStore.getState().ackFirstPending()

    expect(useGameStore.getState().endOfContentSeen).toBe(true)
    expect(localStorage.getItem(END_OF_CONTENT_STORAGE_KEY)).toBe('true')
    expect(useGameStore.getState().pendingFiredHooks).toEqual([])
  })

  it('is idempotent after the terminal flip — an extra ack on the empty queue is a no-op', () => {
    useGameStore.getState().setFlag(END_OF_CONTENT_TERMINAL_FLAG)
    useGameStore.getState().enqueueFired([makeHook('final')])
    useGameStore.getState().ackFirstPending()

    expect(() => useGameStore.getState().ackFirstPending()).not.toThrow()

    expect(useGameStore.getState().endOfContentSeen).toBe(true)
    expect(localStorage.getItem(END_OF_CONTENT_STORAGE_KEY)).toBe('true')
    expect(useGameStore.getState().pendingFiredHooks).toEqual([])
  })

  it('resetEndOfContentSeen() undoes the flip and the terminal path re-triggers on a fresh enqueue+ack', () => {
    useGameStore.getState().setFlag(END_OF_CONTENT_TERMINAL_FLAG)
    useGameStore.getState().enqueueFired([makeHook('first')])
    useGameStore.getState().ackFirstPending()
    expect(useGameStore.getState().endOfContentSeen).toBe(true)

    useGameStore.getState().resetEndOfContentSeen()

    expect(useGameStore.getState().endOfContentSeen).toBe(false)
    expect(localStorage.getItem(END_OF_CONTENT_STORAGE_KEY)).toBeNull()

    // Flag remains set (Q1 stays closed); a fresh enqueue+ack re-triggers.
    useGameStore.getState().enqueueFired([makeHook('second')])
    useGameStore.getState().ackFirstPending()

    expect(useGameStore.getState().endOfContentSeen).toBe(true)
    expect(localStorage.getItem(END_OF_CONTENT_STORAGE_KEY)).toBe('true')
  })
})
