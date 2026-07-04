/**
 * DRAINED_ONE — rank 3 "Stronger Action" ability stub (Task B2).
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'

export const DRAINED_ONE_R3_ABILITY: ModuleAbility = {
  moduleId: 'DRAINED_ONE',
  rank: 3,
  ability: {
    verb: 'YIELD EXTENDED',
    cost: 2,
    meterDeltas: { CAPITAL: -3 },
    flagsSet: [],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 3,
  gating: {},
}
