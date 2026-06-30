/**
 * Module dispatch CI test (Task 10, PLAN.md §14).
 *
 * Asserts the §6 module roster and the dispatch table are kept in lock-step:
 *
 *  1. Every ModuleId enum value has a roster entry in MODULE_ROSTER (8/8).
 *  2. Every ModuleId enum value has a dispatch handler in
 *     MODULE_ABILITY_DISPATCH (TypeScript's `Record<ModuleId, ...>` already
 *     enforces this at compile time; this test catches runtime drift if anyone
 *     ever weakens the type).
 *  3. Each handler executes without throwing when invoked with a stub
 *     AbilityCtx and returns an object whose `meterDeltas` (if any) keys are
 *     valid MeterKey values.
 *
 * Failure messages name the specific ModuleId so authoring drift is obvious.
 */
import { describe, it, expect } from 'vitest'
import { ModuleIdSchema, MeterKeySchema, type ModuleId } from '@schemas/gameState.schema'
import { MODULE_ROSTER } from '@content/modules/moduleRoster'
import {
  MODULE_ABILITY_DISPATCH,
  type AbilityCtx,
  type AbilityResult,
} from '@systems/moduleAbilityEngine'

const ALL_MODULE_IDS: readonly ModuleId[] = ModuleIdSchema.options

const stubCtx: AbilityCtx = {
  now: 0,
  rng: () => 0.5,
}

describe('module roster ↔ dispatch coverage (§6)', () => {
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

  it('MODULE_ABILITY_DISPATCH has a handler for every ModuleId', () => {
    for (const id of ALL_MODULE_IDS) {
      expect(
        typeof MODULE_ABILITY_DISPATCH[id],
        `MODULE_ABILITY_DISPATCH missing handler for ModuleId "${id}"`,
      ).toBe('function')
    }
  })

  it.each(ALL_MODULE_IDS)(
    'dispatch[%s] returns a well-shaped AbilityResult',
    (id) => {
      const handler = MODULE_ABILITY_DISPATCH[id]
      const result: AbilityResult = handler(stubCtx)

      expect(
        result,
        `dispatch[${id}] returned non-object`,
      ).toBeTypeOf('object')
      expect(
        Array.isArray(result.flagsAdded),
        `dispatch[${id}].flagsAdded must be an array`,
      ).toBe(true)
      expect(
        Array.isArray(result.flagsRemoved),
        `dispatch[${id}].flagsRemoved must be an array`,
      ).toBe(true)
      expect(
        typeof result.revealsHiddenTrace,
        `dispatch[${id}].revealsHiddenTrace must be boolean`,
      ).toBe('boolean')
      expect(
        typeof result.ledgerEntry,
        `dispatch[${id}].ledgerEntry must be a non-empty string`,
      ).toBe('string')
      expect(
        result.ledgerEntry.length,
        `dispatch[${id}].ledgerEntry must be non-empty`,
      ).toBeGreaterThan(0)
    },
  )

  it.each(ALL_MODULE_IDS)(
    'dispatch[%s] meterDeltas keys (if any) are valid MeterKey values',
    (id) => {
      const result = MODULE_ABILITY_DISPATCH[id](stubCtx)
      for (const key of Object.keys(result.meterDeltas)) {
        expect(
          MeterKeySchema.safeParse(key).success,
          `dispatch[${id}].meterDeltas contains invalid MeterKey "${key}"`,
        ).toBe(true)
      }
    },
  )
})
