/**
 * FORECASTER — rank 1 "Installed" (Task B5).
 *
 * Trace preview only — no meter delta by roster contract. Raises
 * FORECAST_PREVIEWED so future consequence-preview UI can read the flag
 * and expose one queued trace.
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'
import { FORECAST_PREVIEWED } from '@systems/gameFlags'

export const FORECASTER_R1_ABILITY: ModuleAbility = {
  moduleId: 'FORECASTER',
  rank: 1,
  ability: {
    verb: 'PROJECT',
    cost: 1,
    meterDeltas: {},
    flagsSet: [FORECAST_PREVIEWED],
    hookIdsScheduled: [],
  },
  unlocksAtRank: 1,
  gating: {},
}
