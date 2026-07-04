/**
 * FORECASTER — rank 1 "Installed" ability stub (Task B2).
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'

export const FORECASTER_R1_ABILITY: ModuleAbility = {
  moduleId: 'FORECASTER',
  rank: 1,
  ability: {
    verb: 'PROJECT',
    cost: 1,
    meterDeltas: {},
    flagsSet: [],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 1,
  gating: {},
}
