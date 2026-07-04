/**
 * FORECASTER — rank 3 "Deep Projection" (Task B5).
 *
 * Still no meter delta by roster contract. Rank 3 pays 2 cost for the
 * deepest trace preview. Downstream consumers can special-case rank in
 * their handler if they want more previews at rank 3; the flag is the
 * same signal.
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'
import { FORECAST_PREVIEWED } from '@systems/gameFlags'

export const FORECASTER_R3_ABILITY: ModuleAbility = {
  moduleId: 'FORECASTER',
  rank: 3,
  ability: {
    verb: 'PROJECT EXTENDED',
    cost: 2,
    meterDeltas: {},
    flagsSet: [FORECAST_PREVIEWED],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 3,
  gating: {},
}
