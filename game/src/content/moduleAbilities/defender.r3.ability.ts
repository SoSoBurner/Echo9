/**
 * DEFENDER — rank 3 "Fortified" (Task B5).
 *
 * Sustained defense: CAPITAL +4, HW -2. The trade the operator makes to
 * protect the East Wilmer line — capital wins, welfare pays.
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'
import { DEFENDER_HELD_LINE } from '@systems/gameFlags'

export const DEFENDER_R3_ABILITY: ModuleAbility = {
  moduleId: 'DEFENDER',
  rank: 3,
  ability: {
    verb: 'HOLD EXTENDED',
    cost: 2,
    meterDeltas: { CAPITAL: 4, HUMAN_WELFARE: -2 },
    flagsSet: [DEFENDER_HELD_LINE],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 3,
  gating: {},
}
