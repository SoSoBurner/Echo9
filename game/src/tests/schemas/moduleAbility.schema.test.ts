/**
 * ModuleAbilitySchema tests — Track B1.
 *
 * Every (moduleId, rank) pair resolves to exactly one ability definition. The
 * schema is the enforcement boundary for the upgrade-ladder registry that B2
 * will populate. These tests pin the required shape: rank enum, verb non-empty,
 * meterDeltas keyed by MeterKey, and the four default-{} / default-[] fields.
 *
 * NOTE on meter choice: MeterKeySchema currently ships 3 meters (CAPITAL,
 * HUMAN_WELFARE, OWNER_CONTROL). Track A's A4 task expands it to 8. The
 * fixture uses HUMAN_WELFARE — a currently-shipped meter — so the parse test
 * remains green until A4 lands.
 */
import { describe, it, expect } from 'vitest'
import {
  ModuleAbilitySchema,
  RankSchema,
  type ModuleAbility,
} from '@schemas/moduleAbility.schema'
import { fxConsequenceId } from './fixtures'

const validAbility: ModuleAbility = {
  moduleId: 'MOURNER',
  rank: 2,
  ability: {
    verb: 'Mourn the loss aloud',
    cost: 1,
    meterDeltas: { HUMAN_WELFARE: 2 },
    flagsSet: [],
    hookIdsScheduled: [fxConsequenceId('cons-mourner-r2')],
  },
  unlocksAtRank: 2,
  gating: {},
}

describe('ModuleAbilitySchema', () => {
  it('parses a well-formed MOURNER rank-2 fixture', () => {
    expect(() => ModuleAbilitySchema.parse(validAbility)).not.toThrow()
  })

  it('parses unlocksAtRank as a rank literal (1–3)', () => {
    const parsed = ModuleAbilitySchema.parse(validAbility)
    expect(parsed.unlocksAtRank).toBe(2)
  })

  it('requires ability.verb to be a non-empty string', () => {
    expect(() =>
      ModuleAbilitySchema.parse({
        ...validAbility,
        ability: { ...validAbility.ability, verb: '' },
      }),
    ).toThrow()
  })

  it('accepts meterDeltas keyed by a currently-shipped MeterKey', () => {
    const parsed = ModuleAbilitySchema.parse({
      ...validAbility,
      ability: {
        ...validAbility.ability,
        meterDeltas: { HUMAN_WELFARE: -3, CAPITAL: 1 },
      },
    })
    expect(parsed.ability.meterDeltas.HUMAN_WELFARE).toBe(-3)
    expect(parsed.ability.meterDeltas.CAPITAL).toBe(1)
  })

  it('rejects meterDeltas keyed by a non-MeterKey string', () => {
    expect(() =>
      ModuleAbilitySchema.parse({
        ...validAbility,
        ability: {
          ...validAbility.ability,
          meterDeltas: { NOT_A_METER: 1 },
        },
      }),
    ).toThrow()
  })

  it('applies defaults for meterDeltas / flagsSet / hookIdsScheduled / gating when omitted', () => {
    const parsed = ModuleAbilitySchema.parse({
      moduleId: 'DEFENDER',
      rank: 1,
      ability: {
        verb: 'Hold the line',
        cost: 0,
        // meterDeltas, flagsSet, hookIdsScheduled all omitted
      },
      unlocksAtRank: 1,
      // gating omitted
    })
    expect(parsed.ability.meterDeltas).toEqual({})
    expect(parsed.ability.flagsSet).toEqual([])
    expect(parsed.ability.hookIdsScheduled).toEqual([])
    expect(parsed.gating).toEqual({})
  })

  it('rejects rank 0 (below the 1–3 range)', () => {
    expect(() =>
      ModuleAbilitySchema.parse({ ...validAbility, rank: 0 }),
    ).toThrow()
  })

  it('rejects rank 4 (above the Stage-1 cap of 3)', () => {
    expect(() =>
      ModuleAbilitySchema.parse({ ...validAbility, rank: 4 }),
    ).toThrow()
  })

  it('rejects an unknown moduleId (e.g. FAKE_MODULE)', () => {
    expect(() =>
      ModuleAbilitySchema.parse({ ...validAbility, moduleId: 'FAKE_MODULE' }),
    ).toThrow()
  })
})

describe('RankSchema', () => {
  it('accepts 1, 2, 3', () => {
    expect(() => RankSchema.parse(1)).not.toThrow()
    expect(() => RankSchema.parse(2)).not.toThrow()
    expect(() => RankSchema.parse(3)).not.toThrow()
  })

  it('rejects 0 and 4', () => {
    expect(() => RankSchema.parse(0)).toThrow()
    expect(() => RankSchema.parse(4)).toThrow()
  })
})
