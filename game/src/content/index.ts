// Central aggregator for all game content modules.
// T9 (Mercy Margin content) populates these arrays.
// The §11 traceability test scans every entry in ALL_CONSEQUENCE_MODULES.

import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import type { ResultTrace } from '@schemas/resultTrace.schema'
import { MERCY_MARGIN_HOOKS } from '@content/consequences/mercyMargin.consequences'

// ---------------------------------------------------------------------------
// Hook registry (§11 — every delayed consequence has the 7 mandatory fields)
// ---------------------------------------------------------------------------

export const ALL_CONSEQUENCE_MODULES: readonly ConsequenceHook[] = [
  ...MERCY_MARGIN_HOOKS,
]

// ---------------------------------------------------------------------------
// ResultTrace registry — traces are WRITTEN by the resolver at runtime when
// the player commits a choice (T5 / Layout). The registry here is for any
// authored "seed" traces. T9 ships none; the array is intentionally empty so
// the traceabilityInvariant cross-reference test continues to pass.
// ---------------------------------------------------------------------------

export const ALL_RESULT_TRACES: readonly ResultTrace[] = []
