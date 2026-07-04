/**
 * MOURNER — rank 2 "Named" (Task B5).
 *
 * Silas hears Lenora Pike's name spoken. HW +2 in exchange for OC -1 —
 * the operator loses procedural cover when the loss is named aloud. Raises
 * MOURNER_NAMED_ONCE for downstream content to react against.
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'
import { MOURNER_NAMED_ONCE } from '@systems/gameFlags'

export const MOURNER_R2_ABILITY: ModuleAbility = {
  moduleId: 'MOURNER',
  rank: 2,
  ability: {
    verb: 'READ SHARPER',
    cost: 1,
    meterDeltas: { HUMAN_WELFARE: 2, OWNER_CONTROL: -1 },
    flagsSet: [MOURNER_NAMED_ONCE],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 2,
  gating: {},
}
