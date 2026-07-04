/**
 * COMMANDER — rank 3 "Stronger Action" ability stub (Task B2).
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'

export const COMMANDER_R3_ABILITY: ModuleAbility = {
  moduleId: 'COMMANDER',
  rank: 3,
  ability: {
    verb: 'DIRECT EXTENDED',
    cost: 2,
    meterDeltas: { OWNER_CONTROL: 3 },
    flagsSet: [],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 3,
  gating: {},
}
