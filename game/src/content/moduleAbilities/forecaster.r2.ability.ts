/**
 * FORECASTER — rank 2 "Sharper Read" (Task B5).
 *
 * Still no meter delta — reveal-density is the rank differentiator (rank 2+
 * consumers of FORECAST_PREVIEWED will expose more traces per fire). Flag
 * stays idempotent so multiple fires don't duplicate.
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'
import { FORECAST_PREVIEWED } from '@systems/gameFlags'

export const FORECASTER_R2_ABILITY: ModuleAbility = {
  moduleId: 'FORECASTER',
  rank: 2,
  ability: {
    verb: 'PROJECT SHARPER',
    cost: 1,
    meterDeltas: {},
    flagsSet: [FORECAST_PREVIEWED],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 2,
  gating: {},
}
