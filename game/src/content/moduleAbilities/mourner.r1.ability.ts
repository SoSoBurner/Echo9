/**
 * MOURNER — rank 1 "Installed" ability stub (Task B2).
 *
 * Shape-first Stage 1 content — plan §9.5. Balance numbers are placeholders
 * that the content author fills in later; B2 only needs schema conformance
 * and registry completeness.
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'

export const MOURNER_R1_ABILITY: ModuleAbility = {
  moduleId: 'MOURNER',
  rank: 1,
  ability: {
    verb: 'READ',
    cost: 1,
    meterDeltas: {},
    flagsSet: [],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 1,
  gating: {},
}
