/**
 * COMMANDER — rank 2 "Clearer Read" ability stub (Task B2).
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'

export const COMMANDER_R2_ABILITY: ModuleAbility = {
  moduleId: 'COMMANDER',
  rank: 2,
  ability: {
    verb: 'DIRECT SHARPER',
    cost: 1,
    meterDeltas: { HUMAN_WELFARE: 2 },
    flagsSet: [],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 2,
  gating: {},
}
