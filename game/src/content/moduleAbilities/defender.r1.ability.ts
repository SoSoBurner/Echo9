/**
 * DEFENDER — rank 1 "Installed" (Task B5).
 *
 * Holds the East Wilmer line item; CAPITAL +1. No welfare cost at r1 — the
 * defense is still procedural, not visible on the ground.
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'

export const DEFENDER_R1_ABILITY: ModuleAbility = {
  moduleId: 'DEFENDER',
  rank: 1,
  ability: {
    verb: 'HOLD',
    cost: 1,
    meterDeltas: { CAPITAL: 1 },
    flagsSet: [],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 1,
  gating: {},
}
