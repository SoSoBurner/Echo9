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

/**
 * StageOneAncestryId — stable, choice-derived lineage key (Q31).
 *
 * Format: `s1:<taskId>:<choiceId>`. Deterministic from the trace's own source
 * fields, so it can be backfilled from any legacy trace. Stage 4/5 content
 * resolves a late consequence back to the exact Stage-1 decision through this
 * key — never through display text.
 */
export const StageOneAncestryIdSchema = z
  .string()
  .regex(/^s1:.+:.+$/)
  .brand<'StageOneAncestryId'>()

export type StageOneAncestryId = z.infer<typeof StageOneAncestryIdSchema>

export function makeStageOneAncestryId(
  taskId: string,
  choiceId: string,
): StageOneAncestryId {
  return `s1:${taskId}:${choiceId}` as StageOneAncestryId
}

export const ResultTraceSchema = z.object({
  id: TraceIdSchema,
  sourceTaskId: TaskIdSchema,
  sourceChoiceId: ChoiceIdSchema,
  /** Lineage key derived from (sourceTaskId, sourceChoiceId). See above. */
  stageOneAncestryId: StageOneAncestryIdSchema,
  /** Date.now() at write time. */
  timestamp: z.number(),
  body: z.string().min(1),
})

export type ResultTrace = z.infer<typeof ResultTraceSchema>
