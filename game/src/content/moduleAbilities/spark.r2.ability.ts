/**
 * SPARK — rank 2 "Sharper Reveal" (Task B5).
 *
 * CAP +3, HW -1. Encodes the "sometimes it bleeds" side of the deal in the
 * HW hit while still net-positive on capital. Raises SPARK_DEPLOYED.
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'
import { SPARK_DEPLOYED } from '@systems/gameFlags'

export const SPARK_R2_ABILITY: ModuleAbility = {
  moduleId: 'SPARK',
  rank: 2,
  ability: {
    verb: 'REVEAL SHARPER',
    cost: 1,
    meterDeltas: { CAPITAL: 3, HUMAN_WELFARE: -1 },
    flagsSet: [SPARK_DEPLOYED],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 2,
  gating: {},
}
