/**
 * MOURNER — rank 3 "Loud" (Task B5).
 *
 * Sustained naming: HW +4, OC -2. Big HW swing paid for with real control
 * loss. Same flag as r2 — the run only needs the "named" fact once.
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'
import { MOURNER_NAMED_ONCE } from '@systems/gameFlags'

export const MOURNER_R3_ABILITY: ModuleAbility = {
  moduleId: 'MOURNER',
  rank: 3,
  ability: {
    verb: 'READ EXTENDED',
    cost: 2,
    meterDeltas: { HUMAN_WELFARE: 4, OWNER_CONTROL: -2 },
    flagsSet: [MOURNER_NAMED_ONCE],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 3,
  gating: {},
}
