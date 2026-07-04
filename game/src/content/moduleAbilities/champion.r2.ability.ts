/**
 * CHAMPION — rank 2 "Sharper Defy" (Task B5).
 *
 * OC -2. Raises CHAMPION_DEFIED so future content can key off the operator
 * having provoked the owner. Prior B2 stub touched HW — fixed per roster
 * ("owner control swings").
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'
import { CHAMPION_DEFIED } from '@systems/gameFlags'

export const CHAMPION_R2_ABILITY: ModuleAbility = {
  moduleId: 'CHAMPION',
  rank: 2,
  ability: {
    verb: 'DEFY SHARPER',
    cost: 1,
    meterDeltas: { OWNER_CONTROL: -2 },
    flagsSet: [CHAMPION_DEFIED],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 2,
  gating: {},
}
