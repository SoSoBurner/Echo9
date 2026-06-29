/**
 * metersSlice tests — initial zero state + applyDelta semantics.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore, PERSIST_KEY } from '@state/store'

describe('metersSlice', () => {
  beforeEach(() => {
    localStorage.removeItem(PERSIST_KEY)
    useGameStore.setState({
      meters: { CAPITAL: 0, HUMAN_WELFARE: 0, OWNER_CONTROL: 0 },
    })
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
})
