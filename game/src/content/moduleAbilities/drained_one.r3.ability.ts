/**
 * DRAINED_ONE — rank 3 "Extended Yield" (Task B5).
 *
 * HW -3 to open the deepest sealed trace. Prior B2 stub charged CAPITAL —
 * fixed per roster ("HUMAN_WELFARE pays"). Raises DRAINED_ONE_YIELDED.
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'
import { DRAINED_ONE_YIELDED } from '@systems/gameFlags'

export const DRAINED_ONE_R3_ABILITY: ModuleAbility = {
  moduleId: 'DRAINED_ONE',
  rank: 3,
  ability: {
    verb: 'YIELD EXTENDED',
    cost: 2,
    meterDeltas: { HUMAN_WELFARE: -3 },
    flagsSet: [DRAINED_ONE_YIELDED],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 3,
  gating: {},
}
