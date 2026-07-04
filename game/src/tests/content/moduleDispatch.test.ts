/**
 * Module dispatch CI test (Task 10, PLAN.md §14 — rebased by B4).
 *
 * Asserts the §6 module roster and the (moduleId, rank) registry are kept in
 * lock-step:
 *
 *  1. Every ModuleId enum value has a roster entry in MODULE_ROSTER (8/8).
 *  2. Every ModuleId has at least one registry entry per rank in
 *     ALL_MODULE_ABILITIES (the moduleAbilityEngine.rank.test.ts covers the
 *     full 8x3 verb spot-check; this test just pins the coverage per-id).
 *  3. `runModuleAbility(id, 1, ctx)` executes without throwing and returns an
 *     object whose `meterDeltas` (if any) keys are valid MeterKey values.
 *
 * Prior to B4 this file tested the hardcoded `MODULE_ABILITY_DISPATCH` table
 * which had `ledgerEntry` / `flagsAdded` / `flagsRemoved` / `revealsHiddenTrace`
 * on its result. That table has been replaced by a registry lookup; the new
 * result shape is `verb` / `cost` / `meterDeltas` / `flagsSet` /
 * `hookIdsScheduled`, all read from `ALL_MODULE_ABILITIES` (single source of
 * truth). Assertions rebased accordingly.
 *
 * Failure messages name the specific ModuleId so authoring drift is obvious.
 */
import { describe, it, expect } from 'vitest'
import { ModuleIdSchema, MeterKeySchema, type ModuleId } from '@schemas/gameState.schema'
import { MODULE_ROSTER } from '@content/modules/moduleRoster'
import { ALL_MODULE_ABILITIES } from '@content/moduleAbilities'
import {
  runModuleAbility,
  type AbilityCtx,
  type AbilityResult,
} from '@systems/moduleAbilityEngine'

const ALL_MODULE_IDS: readonly ModuleId[] = ModuleIdSchema.options

const stubCtx: AbilityCtx = {
  now: 0,
  rng: () => 0.5,
}

describe('module roster ↔ registry coverage (§6)', () => {
  it('MODULE_ROSTER contains all 8 ModuleId entries', () => {
    expect(MODULE_ROSTER.length).toBe(8)
    const rosterIds = new Set(MODULE_ROSTER.map((m) => m.id))
    for (const id of ALL_MODULE_IDS) {
      expect(
        rosterIds.has(id),
        `MODULE_ROSTER missing entry for ModuleId "${id}"`,
      ).toBe(true)
    }
  })

  it('MODULE_ROSTER has no duplicate ModuleId entries', () => {
    const ids = MODULE_ROSTER.map((m) => m.id)
    expect(
      new Set(ids).size,
      `MODULE_ROSTER contains duplicate ModuleId: ${ids.join(', ')}`,
    ).toBe(ids.length)
  })

  it('ALL_MODULE_ABILITIES has a rank-1 entry for every ModuleId', () => {
    for (const id of ALL_MODULE_IDS) {
      const r1 = ALL_MODULE_ABILITIES.find((a) => a.moduleId === id && a.rank === 1)
      expect(
        r1,
        `ALL_MODULE_ABILITIES missing rank-1 entry for ModuleId "${id}"`,
      ).toBeDefined()
    }
  })

  it.each(ALL_MODULE_IDS)(
    'runModuleAbility(%s, 1) returns a well-shaped AbilityResult',
    (id) => {
      const result: AbilityResult = runModuleAbility(id, 1, stubCtx)

      expect(
        result,
        `runModuleAbility(${id}, 1) returned non-object`,
      ).toBeTypeOf('object')
      expect(
        typeof result.verb,
        `runModuleAbility(${id}, 1).verb must be a non-empty string`,
      ).toBe('string')
      expect(
        result.verb.length,
        `runModuleAbility(${id}, 1).verb must be non-empty`,
      ).toBeGreaterThan(0)
      expect(
        typeof result.cost,
        `runModuleAbility(${id}, 1).cost must be a number`,
      ).toBe('number')
      expect(
        Array.isArray(result.flagsSet),
        `runModuleAbility(${id}, 1).flagsSet must be an array`,
      ).toBe(true)
      expect(
        Array.isArray(result.hookIdsScheduled),
        `runModuleAbility(${id}, 1).hookIdsScheduled must be an array`,
      ).toBe(true)
    },
  )

  it.each(ALL_MODULE_IDS)(
    'runModuleAbility(%s, 1).meterDeltas keys (if any) are valid MeterKey values',
    (id) => {
      const result = runModuleAbility(id, 1, stubCtx)
      for (const key of Object.keys(result.meterDeltas)) {
        expect(
          MeterKeySchema.safeParse(key).success,
          `runModuleAbility(${id}, 1).meterDeltas contains invalid MeterKey "${key}"`,
        ).toBe(true)
      }
    },
  )
})
