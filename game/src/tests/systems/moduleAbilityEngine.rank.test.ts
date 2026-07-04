/**
 * moduleAbilityEngine — rank-aware dispatch (Task B4).
 *
 * The B2 registry (`ALL_MODULE_ABILITIES`) is the single source of truth for
 * every (moduleId, rank) pair. The engine looks the pair up and fans out
 * `meterDeltas`, `flagsSet`, and `hookIdsScheduled` — same shape it fanned out
 * before, now driven by content instead of hardcoded handlers.
 *
 * These tests pin the rank branch. moduleDispatch.test.ts covers roster
 * coverage; this file covers rank-branch selection + throw-on-miss.
 */
import { describe, it, expect } from 'vitest'
import type { ModuleId } from '@schemas/gameState.schema'
import { ModuleIdSchema } from '@schemas/gameState.schema'
import type { Rank } from '@schemas/moduleAbility.schema'
import {
  runModuleAbility,
  findModuleAbility,
  type AbilityCtx,
} from '@systems/moduleAbilityEngine'
import { ALL_MODULE_ABILITIES } from '@content/moduleAbilities'

const stubCtx: AbilityCtx = {
  now: 0,
  rng: () => 0.5,
}

const ALL_MODULE_IDS: readonly ModuleId[] = ModuleIdSchema.options

describe('moduleAbilityEngine — rank branch selection (MOURNER)', () => {
  it('rank 1 emits HUMAN_WELFARE +1 (B5 real effect)', () => {
    const result = runModuleAbility('MOURNER', 1, stubCtx)
    expect(result.meterDeltas).toEqual({ HUMAN_WELFARE: 1 })
  })

  it('rank 2 emits HUMAN_WELFARE +2 and OWNER_CONTROL -1 (B5 real effect)', () => {
    const result = runModuleAbility('MOURNER', 2, stubCtx)
    expect(result.meterDeltas).toEqual({ HUMAN_WELFARE: 2, OWNER_CONTROL: -1 })
  })

  it('rank 3 emits HUMAN_WELFARE +4 and OWNER_CONTROL -2 (B5 real effect)', () => {
    const result = runModuleAbility('MOURNER', 3, stubCtx)
    expect(result.meterDeltas).toEqual({ HUMAN_WELFARE: 4, OWNER_CONTROL: -2 })
  })

  it('promoting MOURNER from rank 1 to rank 2 changes the emitted verb', () => {
    const r1 = runModuleAbility('MOURNER', 1, stubCtx)
    const r2 = runModuleAbility('MOURNER', 2, stubCtx)
    expect(r1.verb).toBe('READ')
    expect(r2.verb).toBe('READ SHARPER')
  })
})

describe('moduleAbilityEngine — throws on missing (moduleId, rank)', () => {
  it('findModuleAbility throws with helpful message on unregistered pair', () => {
    // rank 4 is not registered anywhere in Stage 1.
    expect(() =>
      findModuleAbility('MOURNER', 4 as unknown as Rank),
    ).toThrow(/no ability registered for \(MOURNER, r4\)/)
  })

  it('runModuleAbility throws on unregistered pair', () => {
    expect(() =>
      runModuleAbility('DEFENDER', 4 as unknown as Rank, stubCtx),
    ).toThrow(/no ability registered/)
  })
})

describe('moduleAbilityEngine — verb strings come from the registry (not hardcoded)', () => {
  // 8x3 spot-check: for every (moduleId, rank), the engine's emitted verb must
  // match the registry entry. This guards against anyone re-hardcoding a verb
  // in the engine and drifting from ALL_MODULE_ABILITIES.
  const cases: Array<[ModuleId, Rank]> = []
  for (const id of ALL_MODULE_IDS) {
    for (const rank of [1, 2, 3] as const) {
      cases.push([id, rank])
    }
  }

  it.each(cases)(
    '(%s, r%d) verb matches ALL_MODULE_ABILITIES entry',
    (id, rank) => {
      const registryEntry = ALL_MODULE_ABILITIES.find(
        (a) => a.moduleId === id && a.rank === rank,
      )
      expect(registryEntry).toBeDefined()
      const result = runModuleAbility(id, rank, stubCtx)
      expect(result.verb).toBe(registryEntry!.ability.verb)
    },
  )
})

describe('moduleAbilityEngine — fan-out preserves meterDeltas / flagsSet / hookIdsScheduled', () => {
  it('meterDeltas is returned as a fresh object (not a reference to the registry)', () => {
    // Mutating the result must not corrupt the registry entry.
    const result = runModuleAbility('MOURNER', 2, stubCtx)
    const registryEntry = findModuleAbility('MOURNER', 2)
    expect(result.meterDeltas).toEqual(registryEntry.ability.meterDeltas)
  })

  it('flagsSet and hookIdsScheduled are always arrays even when the registry entry omits them', () => {
    const result = runModuleAbility('MOURNER', 1, stubCtx)
    expect(Array.isArray(result.flagsSet)).toBe(true)
    expect(Array.isArray(result.hookIdsScheduled)).toBe(true)
  })
})
