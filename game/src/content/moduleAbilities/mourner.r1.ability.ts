/**
 * MOURNER — rank 1 "Installed" (Task B5).
 *
 * Names the loss quietly. HUMAN_WELFARE +1; no flag yet — the naming isn't
 * loud enough to leave a mark on the run's shape.
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'

export const MOURNER_R1_ABILITY: ModuleAbility = {
  moduleId: 'MOURNER',
  rank: 1,
  ability: {
    verb: 'READ',
    cost: 1,
    meterDeltas: { HUMAN_WELFARE: 1 },
    flagsSet: [],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 1,
  gating: {},
}
