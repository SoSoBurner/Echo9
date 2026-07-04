/**
 * SENTINEL — rank 1 "Installed" ability stub (Task B2).
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'

export const SENTINEL_R1_ABILITY: ModuleAbility = {
  moduleId: 'SENTINEL',
  rank: 1,
  ability: {
    verb: 'WATCH',
    cost: 1,
    meterDeltas: {},
    flagsSet: [],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 1,
  gating: {},
}
