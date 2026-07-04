/**
 * DEFENDER — rank 1 "Installed" ability stub (Task B2).
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'

export const DEFENDER_R1_ABILITY: ModuleAbility = {
  moduleId: 'DEFENDER',
  rank: 1,
  ability: {
    verb: 'HOLD',
    cost: 1,
    meterDeltas: {},
    flagsSet: [],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 1,
  gating: {},
}
