/**
 * MODULE ABILITY REGISTRY — parse-all + full coverage (Task B2).
 *
 * Enforces the shape contract for 8 modules × ranks 1-3 = 24 abilities:
 *  - exactly 24 entries
 *  - every (moduleId × rank) pair present exactly once (no dupes, no gaps)
 *  - every entry parses cleanly under ModuleAbilitySchema
 *  - unlocksAtRank ≤ rank (an ability can't require a higher rank than its own)
 *
 * Downstream (B4) dispatch relies on this being a total function over 8×3.
 */
import { describe, expect, it } from 'vitest'
import { ModuleIdSchema } from '@schemas/gameState.schema'
import { ModuleAbilitySchema, type Rank } from '@schemas/moduleAbility.schema'
import { ALL_MODULE_ABILITIES } from '@content/moduleAbilities'

const ALL_MODULE_IDS = ModuleIdSchema.options
const ALL_RANKS: readonly Rank[] = [1, 2, 3]

describe('moduleAbility registry', () => {
  it('contains exactly 24 entries (8 modules × 3 ranks)', () => {
    expect(ALL_MODULE_ABILITIES).toHaveLength(24)
  })

  it('parses every entry under ModuleAbilitySchema', () => {
    for (const entry of ALL_MODULE_ABILITIES) {
      expect(() => ModuleAbilitySchema.parse(entry)).not.toThrow()
    }
  })

  it('has every (moduleId × rank) pair present exactly once', () => {
    const seen = new Map<string, number>()
    for (const entry of ALL_MODULE_ABILITIES) {
      const key = `${entry.moduleId}:${entry.rank}`
      seen.set(key, (seen.get(key) ?? 0) + 1)
    }

    for (const moduleId of ALL_MODULE_IDS) {
      for (const rank of ALL_RANKS) {
        const key = `${moduleId}:${rank}`
        expect(seen.get(key), `missing (${key})`).toBe(1)
      }
    }
  })

  it('has no duplicate (moduleId, rank) keys', () => {
    const keys = ALL_MODULE_ABILITIES.map((a) => `${a.moduleId}:${a.rank}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('never has unlocksAtRank greater than the entry rank', () => {
    for (const entry of ALL_MODULE_ABILITIES) {
      expect(
        entry.unlocksAtRank,
        `${entry.moduleId} r${entry.rank} unlocksAtRank`,
      ).toBeLessThanOrEqual(entry.rank)
    }
  })
})
