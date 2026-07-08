/**
 * bootSlice tests — phase initial value + transition actions.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '@state/store'
import { resetStore } from './testHelpers'

describe('bootSlice', () => {
  beforeEach(() => {
    resetStore()
  })

  it('initial phase is BOOT', () => {
    expect(useGameStore.getState().phase).toBe('BOOT')
  })

  it('initialize() advances BOOT → FIRST_DIRECTIVE', () => {
    useGameStore.getState().initialize()
    expect(useGameStore.getState().phase).toBe('FIRST_DIRECTIVE')
  })

  it('initialize() runs the awakening sequence and discloses DIRECTIVE (E1)', () => {
    // Pre-condition: cold boot has no panels disclosed.
    expect(useGameStore.getState().disclosedPanels.size).toBe(0)
    useGameStore.getState().initialize()
    // Post-condition: the awakening beat put DIRECTIVE on screen so the
    // first directive has a container to land in. Any subscriber that
    // reacts to the FIRST_DIRECTIVE phase must observe a disclosed panel.
    expect(useGameStore.getState().disclosedPanels.has('DIRECTIVE')).toBe(true)
  })

  it('setPhase() applies the supplied SlicePhase', () => {
    useGameStore.getState().setPhase('INSPECTION')
    expect(useGameStore.getState().phase).toBe('INSPECTION')
    useGameStore.getState().setPhase('END_OF_SLICE')
    expect(useGameStore.getState().phase).toBe('END_OF_SLICE')
  })
})
