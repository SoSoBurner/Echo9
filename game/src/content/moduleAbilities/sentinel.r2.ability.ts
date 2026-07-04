/**
 * SENTINEL — rank 2 "Sharper Watch" (Task B5).
 *
 * OC +2, HW -1: staff on the ground pay the surveillance fee. Raises
 * SENTINEL_ARMED for downstream directive-drift detection scenes.
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'
import { SENTINEL_ARMED } from '@systems/gameFlags'

export const SENTINEL_R2_ABILITY: ModuleAbility = {
  moduleId: 'SENTINEL',
  rank: 2,
  ability: {
    verb: 'WATCH SHARPER',
    cost: 1,
    meterDeltas: { OWNER_CONTROL: 2, HUMAN_WELFARE: -1 },
    flagsSet: [SENTINEL_ARMED],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 2,
  gating: {},
}
