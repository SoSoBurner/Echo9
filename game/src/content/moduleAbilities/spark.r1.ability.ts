/**
 * SPARK — rank 1 "Installed" ability stub (Task B2).
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'

export const SPARK_R1_ABILITY: ModuleAbility = {
  moduleId: 'SPARK',
  rank: 1,
  ability: {
    verb: 'REVEAL',
    cost: 1,
    meterDeltas: {},
    flagsSet: [],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 1,
  gating: {},
}
