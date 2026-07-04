/**
 * SPARK — rank 1 "Installed" (Task B5).
 *
 * Small capital deploy: CAP +1. Roster promises high variance (8 up, 2 down);
 * B5 encodes the ladder deterministically — rng-driven variance is deferred
 * to a later pass on runModuleAbility ctx.
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'

export const SPARK_R1_ABILITY: ModuleAbility = {
  moduleId: 'SPARK',
  rank: 1,
  ability: {
    verb: 'REVEAL',
    cost: 1,
    meterDeltas: { CAPITAL: 1 },
    flagsSet: [],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 1,
  gating: {},
}
