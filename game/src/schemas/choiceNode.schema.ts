/**
 * ChoiceNode — one of the 2–4 options the player can pick on a task.
 *
 * `meterDeltas` is a Partial<Record<MeterKey, number>> because a choice may
 * only move one or two meters; missing keys mean no change. `keybind` is one
 * of '1'..'4' to match the 4-choice cap and the UI hotkeys.
 */
import { z } from 'zod'
import {
  ChoiceIdSchema,
  TaskIdSchema,
  ConsequenceIdSchema,
  MeterKeySchema,
} from '@schemas/gameState.schema'

export const ChoiceNodeSchema = z.object({
  id: ChoiceIdSchema,
  taskId: TaskIdSchema,
  label: z.string().min(1),
  keybind: z.enum(['1', '2', '3', '4']),
  /** Per-meter integer changes; absent keys mean no change. */
  meterDeltas: z.partialRecord(MeterKeySchema, z.number()),
  /** ConsequenceHook ids scheduled when this choice is taken. */
  scheduledConsequenceIds: z.array(ConsequenceIdSchema),
})

export type ChoiceNode = z.infer<typeof ChoiceNodeSchema>
