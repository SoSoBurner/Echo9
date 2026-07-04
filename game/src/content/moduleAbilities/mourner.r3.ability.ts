/**
 * MOURNER — rank 3 "Stronger Action" ability stub (Task B2).
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'

export const MOURNER_R3_ABILITY: ModuleAbility = {
  moduleId: 'MOURNER',
  rank: 3,
  ability: {
    verb: 'READ EXTENDED',
    cost: 2,
    meterDeltas: { HUMAN_WELFARE: 3 },
    flagsSet: [],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 3,
  gating: {},
}
