/**
 * SENTINEL — rank 1 "Installed" (Task B5).
 *
 * Early watch: OC +1. Filing a flag before Silas has to strengthens the
 * operator's procedural standing without visible welfare cost yet.
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'

export const SENTINEL_R1_ABILITY: ModuleAbility = {
  moduleId: 'SENTINEL',
  rank: 1,
  ability: {
    verb: 'WATCH',
    cost: 1,
    meterDeltas: { OWNER_CONTROL: 1 },
    flagsSet: [],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 1,
  gating: {},
}
