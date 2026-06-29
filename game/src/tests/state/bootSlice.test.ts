/**
 * bootSlice tests — phase initial value + transition actions.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore, PERSIST_KEY } from '@state/store'

describe('bootSlice', () => {
  beforeEach(() => {
    localStorage.removeItem(PERSIST_KEY)
    useGameStore.setState({
      phase: 'BOOT',
    })
  })

  it('initial phase is BOOT', () => {
    expect(useGameStore.getState().phase).toBe('BOOT')
  })

  it('initialize() advances BOOT → FIRST_DIRECTIVE', () => {
    useGameStore.getState().initialize()
    expect(useGameStore.getState().phase).toBe('FIRST_DIRECTIVE')
  })

  it('setPhase() applies the supplied SlicePhase', () => {
    useGameStore.getState().setPhase('INSPECTION')
    expect(useGameStore.getState().phase).toBe('INSPECTION')
    useGameStore.getState().setPhase('END_OF_SLICE')
    expect(useGameStore.getState().phase).toBe('END_OF_SLICE')
  })
})
