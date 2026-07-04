/**
 * FORECASTER — rank 2 "Clearer Read" ability stub (Task B2).
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'

export const FORECASTER_R2_ABILITY: ModuleAbility = {
  moduleId: 'FORECASTER',
  rank: 2,
  ability: {
    verb: 'PROJECT SHARPER',
    cost: 1,
    meterDeltas: { HUMAN_WELFARE: 2 },
    flagsSet: [],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 2,
  gating: {},
}
