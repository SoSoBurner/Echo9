/**
 * COMMANDER — rank 1 "Installed" (Task B5).
 *
 * OC -1 to arm the override. Raises SILAS_OVERRIDE_AVAILABLE — read by
 * inspectionEngine for the STRATEGIC_ALTERNATIVE posture (existing gate,
 * @systems/gameFlags.ts and @systems/inspectionEngine.ts).
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'
import { SILAS_OVERRIDE_AVAILABLE } from '@systems/gameFlags'

export const COMMANDER_R1_ABILITY: ModuleAbility = {
  moduleId: 'COMMANDER',
  rank: 1,
  ability: {
    verb: 'DIRECT',
    cost: 1,
    meterDeltas: { OWNER_CONTROL: -1 },
    flagsSet: [SILAS_OVERRIDE_AVAILABLE],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 1,
  gating: {},
}
