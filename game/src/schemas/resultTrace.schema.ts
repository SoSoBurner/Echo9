/**
 * ResultTrace — an entry in the immutable ledger.
 *
 * Written when a consequence fires (or a directive resolves). Includes back-
 * pointers to the originating task and choice so the ledger view can render
 * the causal chain.
 */
import { z } from 'zod'
import {
  TraceIdSchema,
  TaskIdSchema,
  ChoiceIdSchema,
} from '@schemas/gameState.schema'

export const ResultTraceSchema = z.object({
  id: TraceIdSchema,
  sourceTaskId: TaskIdSchema,
  sourceChoiceId: ChoiceIdSchema,
  /** Date.now() at write time. */
  timestamp: z.number(),
  body: z.string().min(1),
})

export type ResultTrace = z.infer<typeof ResultTraceSchema>
