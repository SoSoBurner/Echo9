/**
 * DEFENDER — rank 2 "Held" (Task B5).
 *
 * The hold becomes visible: CAPITAL +2, HW -1 as the bruise starts to show.
 * Raises DEFENDER_HELD_LINE for downstream inspection/directive reactions.
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'
import { DEFENDER_HELD_LINE } from '@systems/gameFlags'

export const DEFENDER_R2_ABILITY: ModuleAbility = {
  moduleId: 'DEFENDER',
  rank: 2,
  ability: {
    verb: 'HOLD SHARPER',
    cost: 1,
    meterDeltas: { CAPITAL: 2, HUMAN_WELFARE: -1 },
    flagsSet: [DEFENDER_HELD_LINE],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 2,
  gating: {},
}
