/**
 * DEFENDER — rank 3 "Stronger Action" ability stub (Task B2).
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'

export const DEFENDER_R3_ABILITY: ModuleAbility = {
  moduleId: 'DEFENDER',
  rank: 3,
  ability: {
    verb: 'HOLD EXTENDED',
    cost: 2,
    meterDeltas: { HUMAN_WELFARE: 3 },
    flagsSet: [],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 3,
  gating: {},
}
