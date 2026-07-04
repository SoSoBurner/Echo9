/**
 * CHAMPION — rank 1 "Installed" (Task B5).
 *
 * OC -1 for mild defiance. Roster: owner control swings; B5 encodes the
 * negative side (threat) deterministically. Praise-side variance deferred
 * until runModuleAbility ctx.rng is consumed by the resolver pass.
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'

export const CHAMPION_R1_ABILITY: ModuleAbility = {
  moduleId: 'CHAMPION',
  rank: 1,
  ability: {
    verb: 'DEFY',
    cost: 1,
    meterDeltas: { OWNER_CONTROL: -1 },
    flagsSet: [],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 1,
  gating: {},
}
