/**
 * COMMANDER — rank 1 "Installed" ability stub (Task B2).
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'

export const COMMANDER_R1_ABILITY: ModuleAbility = {
  moduleId: 'COMMANDER',
  rank: 1,
  ability: {
    verb: 'DIRECT',
    cost: 1,
    meterDeltas: {},
    flagsSet: [],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 1,
  gating: {},
}
