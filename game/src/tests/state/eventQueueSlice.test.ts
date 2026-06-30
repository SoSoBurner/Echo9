/**
 * eventQueueSlice tests (Task 12, PLAN.md §8 / §11).
 *
 * The slice is a 1-element-at-a-time queue of fired ConsequenceHooks ready to
 * be shown to the player via the ConsequenceReturnPanel. Tests cover:
 *
 *   1. enqueueFired pushes hooks in order (FIFO).
 *   2. ackFirstPending removes the head, leaving the rest intact.
 *   3. clearPending empties the queue.
 *   4. Initial state is an empty array.
 *
 * Persistence (the queue must survive reload to honour §11) is covered in
 * store.test.ts's partition guard, not here.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '@state/store'
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import { fxTaskId, fxChoiceId, fxConsequenceId } from '@tests/schemas/fixtures'
import { resetStore } from './testHelpers'

function makeHook(idSuffix: string): ConsequenceHook {
  return {
    id: fxConsequenceId(`cons-evq-${idSuffix}`),
    sourceTaskId: fxTaskId(),
    sourceChoiceId: fxChoiceId(),
    traceHint: `hint-${idSuffix}`,
    ledgerEntry: `entry-${idSuffix}`,
    revealCondition: { type: 'PHASE', phase: 'CONSEQUENCE_RETURN' },
    whyNow: `why-${idSuffix}`,
    whatChanged: `what-${idSuffix}`,
  }
}

describe('eventQueueSlice', () => {
  beforeEach(() => {
    resetStore()
  })

  it('starts with an empty pendingFiredHooks array', () => {
    expect(useGameStore.getState().pendingFiredHooks).toEqual([])
  })

  it('enqueueFired appends hooks in order', () => {
    const a = makeHook('a')
    const b = makeHook('b')
    useGameStore.getState().enqueueFired([a, b])
    const q = useGameStore.getState().pendingFiredHooks
    expect(q).toHaveLength(2)
    expect(q[0]?.id).toBe(a.id)
    expect(q[1]?.id).toBe(b.id)
  })

  it('enqueueFired with successive calls preserves overall FIFO order', () => {
    const a = makeHook('a')
    const b = makeHook('b')
    const c = makeHook('c')
    useGameStore.getState().enqueueFired([a])
    useGameStore.getState().enqueueFired([b, c])
    const q = useGameStore.getState().pendingFiredHooks
    expect(q.map((h) => h.id)).toEqual([a.id, b.id, c.id])
  })

  it('ackFirstPending removes the head, leaves remainder intact', () => {
    const a = makeHook('a')
    const b = makeHook('b')
    useGameStore.getState().enqueueFired([a, b])
    useGameStore.getState().ackFirstPending()
    const q = useGameStore.getState().pendingFiredHooks
    expect(q).toHaveLength(1)
    expect(q[0]?.id).toBe(b.id)
  })

  it('ackFirstPending on an empty queue is a no-op', () => {
    expect(() => useGameStore.getState().ackFirstPending()).not.toThrow()
    expect(useGameStore.getState().pendingFiredHooks).toEqual([])
  })

  it('clearPending empties the queue', () => {
    useGameStore.getState().enqueueFired([makeHook('a'), makeHook('b')])
    useGameStore.getState().clearPending()
    expect(useGameStore.getState().pendingFiredHooks).toEqual([])
  })
})
