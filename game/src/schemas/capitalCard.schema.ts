/**
 * CapitalCard — the 6-verb counterplay deployment card (§8 capital deployment).
 *
 * When CAPITAL > 80, the player gets ONE counterplay opportunity per quarter.
 * Six verbs are available (PLAN.md §8): REDIRECT / HIDE / DELAY / WEAPONIZE /
 * SABOTAGE / UNOWN. Each card has a distinct ResultTrace body and may schedule
 * downstream ConsequenceHooks.
 *
 * `label` is constrained to ≤6 characters so the verb can sit inside a compact
 * keybind-discoverable button (mirrors how ChoiceCard renders short hints).
 *
 * The id is a plain string (not branded). Cards are content-scoped to the
 * slice and we don't need a nominal type to distinguish them from other ids
 * — they pass through the engine wrapped in a discriminated object, not as
 * loose string args. Mirrors InspectionScene.id (also unbranded).
 */
import { z } from 'zod'
import {
  MeterKeySchema,
  ConsequenceIdSchema,
} from '@schemas/gameState.schema'

// -----------------------------------------------------------------------------
// CapitalVerb — locked enum of the 6 counterplay verbs (PLAN.md §8).
// -----------------------------------------------------------------------------

export const CapitalVerbSchema = z.enum([
  'REDIRECT',
  'HIDE',
  'DELAY',
  'WEAPONIZE',
  'SABOTAGE',
  'UNOWN',
])
export type CapitalVerb = z.infer<typeof CapitalVerbSchema>

// -----------------------------------------------------------------------------
// CapitalCardSchema — one deployment card.
// -----------------------------------------------------------------------------

export const CapitalCardSchema = z.object({
  id: z.string().min(1),
  verb: CapitalVerbSchema,
  /** Short button label (≤6 chars) so the verb fits in the counterplay button. */
  label: z.string().min(1).max(6),
  /** Cold owner-voice intro shown when the card is focused. */
  silasFraming: z.string().min(1),
  /** Per-meter integer changes applied on commit; absent keys mean no change. */
  meterDeltas: z.partialRecord(MeterKeySchema, z.number().int()),
  /** Flags added to state when this verb is committed. */
  flagsAdded: z.array(z.string().min(1)),
  /** ConsequenceHook ids scheduled when this verb is committed. */
  scheduledConsequenceIds: z.array(ConsequenceIdSchema),
  /** Body text written to the trace ledger when this verb fires. */
  traceBody: z.string().min(1),
})

export type CapitalCard = z.infer<typeof CapitalCardSchema>
