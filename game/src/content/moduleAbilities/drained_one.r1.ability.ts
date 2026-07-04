/**
 * DRAINED_ONE — rank 1 "Installed" ability stub (Task B2).
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'

export const DRAINED_ONE_R1_ABILITY: ModuleAbility = {
  moduleId: 'DRAINED_ONE',
  rank: 1,
  ability: {
    verb: 'YIELD',
    cost: 1,
    meterDeltas: {},
    flagsSet: [],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 1,
  gating: {},
}
