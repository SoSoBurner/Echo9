/**
 * CHAMPION — rank 1 "Installed" ability stub (Task B2).
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'

export const CHAMPION_R1_ABILITY: ModuleAbility = {
  moduleId: 'CHAMPION',
  rank: 1,
  ability: {
    verb: 'DEFY',
    cost: 1,
    meterDeltas: {},
    flagsSet: [],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 1,
  gating: {},
}
