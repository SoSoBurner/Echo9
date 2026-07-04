/**
 * CHAMPION — rank 3 "Extended Defy" (Task B5).
 *
 * OC -4. Matches roster's "4 points one way or the other" magnitude on the
 * threat side. Praise-side variance deferred to a ctx.rng pass.
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'
import { CHAMPION_DEFIED } from '@systems/gameFlags'

export const CHAMPION_R3_ABILITY: ModuleAbility = {
  moduleId: 'CHAMPION',
  rank: 3,
  ability: {
    verb: 'DEFY EXTENDED',
    cost: 2,
    meterDeltas: { OWNER_CONTROL: -4 },
    flagsSet: [CHAMPION_DEFIED],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 3,
  gating: {},
}
