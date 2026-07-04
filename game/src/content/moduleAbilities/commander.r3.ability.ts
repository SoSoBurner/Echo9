/**
 * COMMANDER — rank 3 "Extended Direct" (Task B5).
 *
 * OC -3 for the deepest override. Roster: "Commander lets you refuse
 * 1 directive per quarter... Owner control falls when you use it." Prior
 * B2 stub incorrectly set OWNER_CONTROL: +3 — fixed.
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'
import { SILAS_OVERRIDE_AVAILABLE } from '@systems/gameFlags'

export const COMMANDER_R3_ABILITY: ModuleAbility = {
  moduleId: 'COMMANDER',
  rank: 3,
  ability: {
    verb: 'DIRECT EXTENDED',
    cost: 2,
    meterDeltas: { OWNER_CONTROL: -3 },
    flagsSet: [SILAS_OVERRIDE_AVAILABLE],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 3,
  gating: {},
}
