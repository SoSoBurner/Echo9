/**
 * CHAMPION — rank 3 "Stronger Action" ability stub (Task B2).
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'

export const CHAMPION_R3_ABILITY: ModuleAbility = {
  moduleId: 'CHAMPION',
  rank: 3,
  ability: {
    verb: 'DEFY EXTENDED',
    cost: 2,
    meterDeltas: { OWNER_CONTROL: -3 },
    flagsSet: [],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 3,
  gating: {},
}
