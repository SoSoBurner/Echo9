/**
 * modulesSlice — installedModules rank map (Task B3).
 *
 * Contract:
 *   installedModules: Partial<Record<ModuleId, { rank: 1|2|3 }>>
 *   installModule(id):    installs at rank 1 (idempotent — reinstall keeps rank 1)
 *   promoteModule(id):    rank++ (max 3 Stage 1; no-op past 3)
 *   useModuleAbility(id): dispatches to moduleAbilityEngine (rank-aware in B4)
 *
 * The engine call itself is stubbed for B3 — this test focuses on shape and
 * mutation semantics. B4 will layer rank-aware dispatch on top.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '@state/store'
import { resetStore } from './testHelpers'

describe('modulesSlice — installedModules map shape', () => {
  beforeEach(() => {
    resetStore()
  })

  it('starts with an empty installedModules map', () => {
    expect(useGameStore.getState().installedModules).toEqual({})
  })

  it('installModule adds an entry at rank 1', () => {
    useGameStore.getState().installModule('MOURNER')
    expect(useGameStore.getState().installedModules).toEqual({
      MOURNER: { rank: 1 },
    })
  })

  it('installModule is idempotent — reinstalling the same id keeps rank at 1', () => {
    useGameStore.getState().installModule('MOURNER')
    useGameStore.getState().installModule('MOURNER')
    expect(useGameStore.getState().installedModules).toEqual({
      MOURNER: { rank: 1 },
    })
  })

  it('installModule does not overwrite an existing promoted rank', () => {
    useGameStore.getState().installModule('MOURNER')
    useGameStore.getState().promoteModule('MOURNER')
    // Re-installing MOURNER after it has been promoted MUST NOT reset rank.
    useGameStore.getState().installModule('MOURNER')
    expect(useGameStore.getState().installedModules.MOURNER?.rank).toBe(2)
  })

  it('installModule can hold multiple modules concurrently', () => {
    // The map shape is multi-slot capable even if the current UI is single-slot.
    useGameStore.getState().installModule('MOURNER')
    useGameStore.getState().installModule('DEFENDER')
    const installed = useGameStore.getState().installedModules
    expect(installed.MOURNER).toEqual({ rank: 1 })
    expect(installed.DEFENDER).toEqual({ rank: 1 })
  })
})

describe('modulesSlice — promoteModule', () => {
  beforeEach(() => {
    resetStore()
  })

  it('promotes rank 1 → 2', () => {
    useGameStore.getState().installModule('MOURNER')
    useGameStore.getState().promoteModule('MOURNER')
    expect(useGameStore.getState().installedModules.MOURNER?.rank).toBe(2)
  })

  it('promotes rank 2 → 3', () => {
    useGameStore.getState().installModule('MOURNER')
    useGameStore.getState().promoteModule('MOURNER')
    useGameStore.getState().promoteModule('MOURNER')
    expect(useGameStore.getState().installedModules.MOURNER?.rank).toBe(3)
  })

  it('caps at rank 3 (Stage 1) — further promotions are no-ops', () => {
    useGameStore.getState().installModule('MOURNER')
    useGameStore.getState().promoteModule('MOURNER')
    useGameStore.getState().promoteModule('MOURNER')
    useGameStore.getState().promoteModule('MOURNER') // would be rank 4
    useGameStore.getState().promoteModule('MOURNER') // still guarded
    expect(useGameStore.getState().installedModules.MOURNER?.rank).toBe(3)
  })

  it('is a no-op when the module is not installed', () => {
    useGameStore.getState().promoteModule('MOURNER')
    expect(useGameStore.getState().installedModules).toEqual({})
  })
})

describe('modulesSlice — useModuleAbility', () => {
  beforeEach(() => {
    resetStore()
  })

  it('is a function on the store', () => {
    expect(typeof useGameStore.getState().useModuleAbility).toBe('function')
  })

  it('is a no-op when the module is not installed (does not throw)', () => {
    // B3 stubs engine call; the shape contract is: no throw when id missing.
    expect(() => useGameStore.getState().useModuleAbility('MOURNER')).not.toThrow()
  })

  it('does not throw when the module IS installed', () => {
    useGameStore.getState().installModule('MOURNER')
    expect(() => useGameStore.getState().useModuleAbility('MOURNER')).not.toThrow()
  })
})
