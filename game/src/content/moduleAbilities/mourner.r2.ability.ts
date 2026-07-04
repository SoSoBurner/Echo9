/**
 * MOURNER — rank 2 "Clearer Read" ability stub (Task B2).
 *
 * Rank-2 meter delta is a placeholder on HUMAN_WELFARE; the plan targets
 * DATA_INTEGRITY (added by Track A's meter expansion).
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'

export const MOURNER_R2_ABILITY: ModuleAbility = {
  moduleId: 'MOURNER',
  rank: 2,
  ability: {
    verb: 'READ SHARPER',
    cost: 1,
    meterDeltas: { HUMAN_WELFARE: 2 },
    flagsSet: [],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 2,
  gating: {},
}
