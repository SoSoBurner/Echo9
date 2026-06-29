/**
 * ConsequenceHook — §11 Traceability Invariant.
 *
 * Every delayed consequence carries the 7 mandatory fields below. None are
 * optional. The Zod schema is the enforcement boundary; any code path that
 * skips this validation breaks the invariant. CI verifies the safety test in
 * consequenceHook.schema.test.ts.
 */
import { z } from 'zod'
import {
  ConsequenceIdSchema,
  TaskIdSchema,
  ChoiceIdSchema,
  MeterKeySchema,
  SlicePhaseSchema,
} from '@schemas/gameState.schema'

// -----------------------------------------------------------------------------
// RevealCondition (§8) — discriminated union with 4 variants.
// NEVER = silence-as-horror: schedule the hook but never reveal it to the
// player. The ledger entry still exists for any debug/postmortem view.
// -----------------------------------------------------------------------------

export const RevealConditionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('PHASE'),
    phase: SlicePhaseSchema,
  }),
  z.object({
    type: z.literal('METER_THRESHOLD'),
    meter: MeterKeySchema,
    threshold: z.number(),
  }),
  z.object({
    type: z.literal('FLAG'),
    flag: z.string().min(1),
  }),
  z.object({
    type: z.literal('NEVER'),
  }),
])

export type RevealCondition = z.infer<typeof RevealConditionSchema>

// -----------------------------------------------------------------------------
// ConsequenceHook — the 7 §11 fields + id for dedup/serialization.
// -----------------------------------------------------------------------------

export const ConsequenceHookSchema = z.object({
  /** Hook's own id (for queue dedup + save serialization). */
  id: ConsequenceIdSchema,
  /** §11 field 1: which task generated this consequence. */
  sourceTaskId: TaskIdSchema,
  /** §11 field 2: which choice the player made on that task. */
  sourceChoiceId: ChoiceIdSchema,
  /** §11 field 3: short player-visible hint when the hook reveals. */
  traceHint: z.string().min(1),
  /** §11 field 4: long-form ledger text written when the hook fires. */
  ledgerEntry: z.string().min(1),
  /** §11 field 5: when the hook is allowed to surface (or NEVER). */
  revealCondition: RevealConditionSchema,
  /** §11 field 6: narrative justification for why this hits now. */
  whyNow: z.string().min(1),
  /** §11 field 7: concrete world-state change this consequence enacts. */
  whatChanged: z.string().min(1),
})

export type ConsequenceHook = z.infer<typeof ConsequenceHookSchema>
