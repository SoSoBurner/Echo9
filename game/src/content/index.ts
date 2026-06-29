// Central aggregator for all game content modules.
// T9 (Mercy Margin content) populates these arrays.
// The §11 traceability test scans every entry in ALL_CONSEQUENCE_MODULES.

import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import type { ResultTrace } from '@schemas/resultTrace.schema'

export const ALL_CONSEQUENCE_MODULES: readonly ConsequenceHook[] = []
export const ALL_RESULT_TRACES: readonly ResultTrace[] = []
