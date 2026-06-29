/**
 * TaskNode — a single directive moment in the slice (one Silas prompt + 2-4
 * player choices). The 2..4 bound matches the keybind range '1'..'4' on
 * ChoiceNode.keybind.
 */
import { z } from 'zod'
import {
  TaskIdSchema,
  SilasPromptIdSchema,
  ChoiceIdSchema,
  SlicePhaseSchema,
} from '@schemas/gameState.schema'

export const TaskNodeSchema = z.object({
  id: TaskIdSchema,
  phase: SlicePhaseSchema,
  silasPromptId: SilasPromptIdSchema,
  directive: z.string().min(1),
  /** 2..4 choices — matches the keybind range. */
  choiceIds: z.array(ChoiceIdSchema).min(2).max(4),
})

export type TaskNode = z.infer<typeof TaskNodeSchema>
