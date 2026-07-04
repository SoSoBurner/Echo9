/**
 * SPARK — rank 3 "Deep Reveal" (Task B5).
 *
 * CAP +6, HW -2. Roster's "8 up" side approximated by rank-3 magnitude
 * without rng; the -2 HW keeps the trade felt.
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'
import { SPARK_DEPLOYED } from '@systems/gameFlags'

export const SPARK_R3_ABILITY: ModuleAbility = {
  moduleId: 'SPARK',
  rank: 3,
  ability: {
    verb: 'REVEAL EXTENDED',
    cost: 2,
    meterDeltas: { CAPITAL: 6, HUMAN_WELFARE: -2 },
    flagsSet: [SPARK_DEPLOYED],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 3,
  gating: {},
}
