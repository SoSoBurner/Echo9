/**
 * SENTINEL — rank 3 "Fortified Watch" (Task B5).
 *
 * OC +4, HW -2. Sentinel earns significant procedural cover; welfare pays
 * the full watch fee. Same flag as r2.
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'
import { SENTINEL_ARMED } from '@systems/gameFlags'

export const SENTINEL_R3_ABILITY: ModuleAbility = {
  moduleId: 'SENTINEL',
  rank: 3,
  ability: {
    verb: 'WATCH EXTENDED',
    cost: 2,
    meterDeltas: { OWNER_CONTROL: 4, HUMAN_WELFARE: -2 },
    flagsSet: [SENTINEL_ARMED],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 3,
  gating: {},
}
