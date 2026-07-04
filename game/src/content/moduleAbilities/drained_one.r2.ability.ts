/**
 * DRAINED_ONE — rank 2 "Deeper Yield" (Task B5).
 *
 * HW -2 to open a sharper trace. Prior B2 stub incorrectly set +2 — fixed
 * per roster ("Welfare pays"). Raises DRAINED_ONE_YIELDED.
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'
import { DRAINED_ONE_YIELDED } from '@systems/gameFlags'

export const DRAINED_ONE_R2_ABILITY: ModuleAbility = {
  moduleId: 'DRAINED_ONE',
  rank: 2,
  ability: {
    verb: 'YIELD SHARPER',
    cost: 1,
    meterDeltas: { HUMAN_WELFARE: -2 },
    flagsSet: [DRAINED_ONE_YIELDED],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 2,
  gating: {},
}
