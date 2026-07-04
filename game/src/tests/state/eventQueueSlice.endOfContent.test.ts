/**
 * eventQueueSlice.endOfContent tests (Task C3, PLAN.md §11 + Q48 lock).
 *
 * Covers the terminal-hook detection extension to `ackFirstPending`: when the
 * acked hook's id === END_OF_CONTENT_HOOK_ID AND that ack empties the queue,
 * the slice must invoke `markEndOfContentSeen()` so both the in-memory flag
 * and the OWN localStorage key (`echo9:endOfContentSeen`) flip atomically.
 *
 * Five cases:
 *   1. Non-terminal hook: flag stays false, own-key stays null.
 *   2. Terminal hook with tail: flag stays false while queue not yet empty.
 *   3. Terminal hook empties queue: flag flips true and own-key becomes 'true'.
 *   4. Idempotent after terminal: extra ack on empty queue is a no-op.
 *   5. Reset scenario: resetEndOfContentSeen() undoes the flip; re-triggerable.
 *
 * Uses the `resetStore()` helper and clears localStorage in beforeEach so the
 * OWN persister key state is deterministic per test.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '@state/store'
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import { fxTaskId, fxChoiceId, fxConsequenceId } from '@tests/schemas/fixtures'
import { END_OF_CONTENT_HOOK_ID } from '@content/contentBoundary.manifest'
import { resetStore } from './testHelpers'

const END_OF_CONTENT_STORAGE_KEY = 'echo9:endOfContentSeen'

/** Build a valid ConsequenceHook with the given id (all 7 §11 fields set). */
function makeHookWithId(id: ConsequenceHook['id'], suffix: string): ConsequenceHook {
  return {
    id,
    sourceTaskId: fxTaskId(),
    sourceChoiceId: fxChoiceId(),
    traceHint: `hint-${suffix}`,
    ledgerEntry: `entry-${suffix}`,
    revealCondition: { type: 'PHASE', phase: 'CONSEQUENCE_RETURN' },
    whyNow: `why-${suffix}`,
    whatChanged: `what-${suffix}`,
  }
}

/** The shipped terminal hook (id === END_OF_CONTENT_HOOK_ID). */
function makeTerminalHook(): ConsequenceHook {
  return makeHookWithId(END_OF_CONTENT_HOOK_ID, 'terminal')
}

/** Any distinct non-terminal ConsequenceId. */
function makeNonTerminalHook(suffix = 'nonterm'): ConsequenceHook {
  return makeHookWithId(fxConsequenceId(`cons-evq-${suffix}`), suffix)
}

describe('eventQueueSlice — terminal-hook detection in ackFirstPending', () => {
  beforeEach(() => {
    localStorage.clear()
    resetStore()
    // resetStore() does not touch the endOfContent slot; reset it explicitly
    // so cases start from a known false baseline.
    useGameStore.setState({ endOfContentSeen: false })
  })

  it('acking a non-terminal hook leaves endOfContentSeen false and own-key null', () => {
    const hook = makeNonTerminalHook('a')
    useGameStore.getState().enqueueFired([hook])

    useGameStore.getState().ackFirstPending()

    expect(useGameStore.getState().endOfContentSeen).toBe(false)
    expect(localStorage.getItem(END_OF_CONTENT_STORAGE_KEY)).toBeNull()
    expect(useGameStore.getState().pendingFiredHooks).toEqual([])
  })

  it('acking the terminal hook while a tail remains keeps endOfContentSeen false', () => {
    const terminal = makeTerminalHook()
    const tail = makeNonTerminalHook('tail')
    useGameStore.getState().enqueueFired([terminal, tail])

    useGameStore.getState().ackFirstPending()

    expect(useGameStore.getState().endOfContentSeen).toBe(false)
    expect(localStorage.getItem(END_OF_CONTENT_STORAGE_KEY)).toBeNull()
    // Tail is still queued.
    const q = useGameStore.getState().pendingFiredHooks
    expect(q).toHaveLength(1)
    expect(q[0]?.id).toBe(tail.id)
  })

  it('acking the terminal hook when it is the only pending item flips endOfContentSeen true and persists', () => {
    useGameStore.getState().enqueueFired([makeTerminalHook()])

    useGameStore.getState().ackFirstPending()

    expect(useGameStore.getState().endOfContentSeen).toBe(true)
    expect(localStorage.getItem(END_OF_CONTENT_STORAGE_KEY)).toBe('true')
    expect(useGameStore.getState().pendingFiredHooks).toEqual([])
  })

  it('is idempotent after the terminal flip — an extra ack on the empty queue is a no-op', () => {
    useGameStore.getState().enqueueFired([makeTerminalHook()])
    useGameStore.getState().ackFirstPending()

    expect(() => useGameStore.getState().ackFirstPending()).not.toThrow()

    expect(useGameStore.getState().endOfContentSeen).toBe(true)
    expect(localStorage.getItem(END_OF_CONTENT_STORAGE_KEY)).toBe('true')
    expect(useGameStore.getState().pendingFiredHooks).toEqual([])
  })

  it('resetEndOfContentSeen() undoes the flip and the terminal path re-triggers on a fresh enqueue+ack', () => {
    useGameStore.getState().enqueueFired([makeTerminalHook()])
    useGameStore.getState().ackFirstPending()
    expect(useGameStore.getState().endOfContentSeen).toBe(true)

    useGameStore.getState().resetEndOfContentSeen()

    expect(useGameStore.getState().endOfContentSeen).toBe(false)
    expect(localStorage.getItem(END_OF_CONTENT_STORAGE_KEY)).toBeNull()

    // Re-enqueue the terminal hook and ack again — the flag flips true again.
    useGameStore.getState().enqueueFired([makeTerminalHook()])
    useGameStore.getState().ackFirstPending()

    expect(useGameStore.getState().endOfContentSeen).toBe(true)
    expect(localStorage.getItem(END_OF_CONTENT_STORAGE_KEY)).toBe('true')
  })
})
