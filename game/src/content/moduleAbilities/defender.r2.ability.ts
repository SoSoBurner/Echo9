/**
 * DEFENDER — rank 2 "Clearer Read" ability stub (Task B2).
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'

export const DEFENDER_R2_ABILITY: ModuleAbility = {
  moduleId: 'DEFENDER',
  rank: 2,
  ability: {
    verb: 'HOLD SHARPER',
    cost: 1,
    meterDeltas: { HUMAN_WELFARE: 2 },
    flagsSet: [],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 2,
  gating: {},
}
