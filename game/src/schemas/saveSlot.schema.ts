/**
 * SaveSlotV1 — the persisted, versioned save format.
 *
 * `schemaVersion: z.literal(1)` is the migration wedge: future versions will
 * be SaveSlotV2Schema with `z.literal(2)`, and the loader will branch on the
 * literal. Boot transients and UI state are NOT persisted (§11): only
 * meters, scheduled consequences, current phase, and the ledger.
 *
 * `meters` is a full Record<MeterKey, number> (not Partial) because every
 * meter must have a defined value at save time.
 */
import { z } from 'zod'
import {
  MeterKeySchema,
  SlicePhaseSchema,
} from '@schemas/gameState.schema'
import { ConsequenceHookSchema } from '@schemas/consequenceHook.schema'
import { ResultTraceSchema } from '@schemas/resultTrace.schema'

export const SaveSlotV1Schema = z.object({
  schemaVersion: z.literal(1),
  slotName: z.string().min(1),
  /** Date.now() at save time. */
  savedAt: z.number(),
  /** Every meter has a defined value at save time. */
  meters: z.record(MeterKeySchema, z.number()),
  /** Hooks queued but not yet revealed. */
  scheduledConsequences: z.array(ConsequenceHookSchema),
  currentPhase: SlicePhaseSchema,
  /** Immutable ledger of fired consequences and resolved directives. */
  ledger: z.array(ResultTraceSchema),
})

export type SaveSlotV1 = z.infer<typeof SaveSlotV1Schema>
