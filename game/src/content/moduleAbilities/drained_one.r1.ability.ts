/**
 * DRAINED_ONE — rank 1 "Installed" (Task B5).
 *
 * HW -1 to open a sealed trace. Roster: "Welfare pays." No flag at r1.
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'

export const DRAINED_ONE_R1_ABILITY: ModuleAbility = {
  moduleId: 'DRAINED_ONE',
  rank: 1,
  ability: {
    verb: 'YIELD',
    cost: 1,
    meterDeltas: { HUMAN_WELFARE: -1 },
    flagsSet: [],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 1,
  gating: {},
}
