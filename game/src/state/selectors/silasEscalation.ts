/**
 * silasEscalation selector (S3).
 *
 * The ONLY sanctioned path from the hidden scrutiny value toward the UI.
 * UI components subscribe to this selector and receive the 0–3 tone tier —
 * they never see (or import anything named after) the raw number. The
 * anti-leak guard (src/tests/ui/scrutinyLeakGuard.test.ts) scans ui/** for
 * the token and this file's name is deliberately scrutiny-free so sanctioned
 * consumers stay clean under that scan.
 *
 * Tier semantics (systems/consciousness/scrutiny.ts):
 *   0 warm-busy-tired founder · 1 curt · 2 suspicious · 3 threatens removal.
 */
import {
  escalationTier,
  type EscalationTier,
} from '@systems/consciousness/scrutiny'

/** Structural input keeps the selector testable without a store. */
export function selectSilasEscalationTier(state: {
  scrutiny: number
}): EscalationTier {
  return escalationTier(state.scrutiny)
}

export type { EscalationTier }
