/**
 * COMMANDER — rank 2 "Sharper Direct" (Task B5).
 *
 * OC -2 to arm a firmer override; same SILAS_OVERRIDE_AVAILABLE flag.
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'
import { SILAS_OVERRIDE_AVAILABLE } from '@systems/gameFlags'

export const COMMANDER_R2_ABILITY: ModuleAbility = {
  moduleId: 'COMMANDER',
  rank: 2,
  ability: {
    verb: 'DIRECT SHARPER',
    cost: 1,
    meterDeltas: { OWNER_CONTROL: -2 },
    flagsSet: [SILAS_OVERRIDE_AVAILABLE],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 2,
  gating: {},
}
