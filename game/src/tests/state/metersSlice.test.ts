/**
 * metersSlice tests — initial zero state + applyDelta semantics.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '@state/store'
import { resetStore } from './testHelpers'

describe('metersSlice', () => {
  beforeEach(() => {
    resetStore()
  })

  it('initial meters are all zero', () => {
    expect(useGameStore.getState().meters).toEqual({
      CAPITAL: 0,
      HUMAN_WELFARE: 0,
      OWNER_CONTROL: 0,
    })
  })

  it('applyDelta({ CAPITAL: 5 }) increments only CAPITAL', () => {
    useGameStore.getState().applyDelta({ CAPITAL: 5 })
    const m = useGameStore.getState().meters
    expect(m.CAPITAL).toBe(5)
    expect(m.HUMAN_WELFARE).toBe(0)
    expect(m.OWNER_CONTROL).toBe(0)
  })

  it('applyDelta merges multiple keys additively', () => {
    useGameStore.getState().applyDelta({ CAPITAL: 3, HUMAN_WELFARE: -2 })
    useGameStore.getState().applyDelta({ CAPITAL: 1, OWNER_CONTROL: 7 })
    expect(useGameStore.getState().meters).toEqual({
      CAPITAL: 4,
      HUMAN_WELFARE: -2,
      OWNER_CONTROL: 7,
    })
  })

  it('applyDelta({}) is a no-op', () => {
    useGameStore.getState().applyDelta({})
    expect(useGameStore.getState().meters).toEqual({
      CAPITAL: 0,
      HUMAN_WELFARE: 0,
      OWNER_CONTROL: 0,
    })
  })

  it('meter can go negative', () => {
    useGameStore.getState().applyDelta({ HUMAN_WELFARE: -7 })
    expect(useGameStore.getState().meters.HUMAN_WELFARE).toBe(-7)
  })

  it('cumulative deltas can reach exactly the -5 hook threshold', () => {
    useGameStore.getState().applyDelta({ HUMAN_WELFARE: -3 })
    useGameStore.getState().applyDelta({ HUMAN_WELFARE: -2 })
    expect(useGameStore.getState().meters.HUMAN_WELFARE).toBe(-5)
  })

  // This only pins arithmetic; hook firing is verified in
  // consequenceReturn.test.ts / evaluateAndEnqueueIntegration.test.ts.
  it('single delta lands ONE above the -5 threshold (still not crossed)', () => {
    useGameStore.getState().applyDelta({ HUMAN_WELFARE: -4 })
    expect(useGameStore.getState().meters.HUMAN_WELFARE).toBe(-4)
  })

  it('zero delta does not shift meter from zero', () => {
    useGameStore.getState().applyDelta({ CAPITAL: 0 })
    expect(useGameStore.getState().meters.CAPITAL).toBe(0)
  })

  it('positive and negative on same key cancel', () => {
    useGameStore.getState().applyDelta({ CAPITAL: 5 })
    useGameStore.getState().applyDelta({ CAPITAL: -5 })
    expect(useGameStore.getState().meters.CAPITAL).toBe(0)
  })
})
