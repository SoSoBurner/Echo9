/**
 * consequenceSlice tests — queue append + remove by id.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '@state/store'
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import {
  fxTaskId,
  fxChoiceId,
  fxConsequenceId,
} from '@tests/schemas/fixtures'
import { resetStore } from './testHelpers'

function makeHook(id = 'cons-001'): ConsequenceHook {
  return {
    id: fxConsequenceId(id),
    sourceTaskId: fxTaskId(),
    sourceChoiceId: fxChoiceId(),
    traceHint: 'A small wrongness in the books.',
    ledgerEntry: 'Three weeks later the audit found the discrepancy.',
    revealCondition: { type: 'PHASE', phase: 'CONSEQUENCE_RETURN' },
    whyNow: 'The auditor visits on this exact cadence.',
    whatChanged: 'The shortfall is now visible to the owner.',
  }
}

describe('consequenceSlice', () => {
  beforeEach(() => {
    resetStore()
  })

  it('initial queue is empty', () => {
    expect(useGameStore.getState().scheduledConsequences).toEqual([])
  })

  it('scheduleHook appends to the queue', () => {
    const h1 = makeHook('cons-a')
    const h2 = makeHook('cons-b')
    useGameStore.getState().scheduleHook(h1)
    useGameStore.getState().scheduleHook(h2)
    const q = useGameStore.getState().scheduledConsequences
    expect(q).toHaveLength(2)
    expect(q[0]?.id).toBe(h1.id)
    expect(q[1]?.id).toBe(h2.id)
  })

  it('removeHook removes by id and leaves others intact', () => {
    const h1 = makeHook('cons-a')
    const h2 = makeHook('cons-b')
    const h3 = makeHook('cons-c')
    useGameStore.getState().scheduleHook(h1)
    useGameStore.getState().scheduleHook(h2)
    useGameStore.getState().scheduleHook(h3)
    useGameStore.getState().removeHook(h2.id)
    const q = useGameStore.getState().scheduledConsequences
    expect(q).toHaveLength(2)
    expect(q.map((h) => h.id)).toEqual([h1.id, h3.id])
  })

  it('removeHook on an unknown id is a no-op', () => {
    const h1 = makeHook('cons-a')
    useGameStore.getState().scheduleHook(h1)
    useGameStore.getState().removeHook(fxConsequenceId('cons-zzz'))
    expect(useGameStore.getState().scheduledConsequences).toHaveLength(1)
  })
})
