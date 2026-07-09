/**
 * TaskNode — a single directive moment in the slice (one Silas prompt + 2-4
 * player choices). The 2..4 bound matches the keybind range '1'..'4' on
 * ChoiceNode.keybind.
 *
 * `moduleVerbOptions` (S2, Q44 rank-deepened tiers) is OPTIONAL authoring:
 * each entry describes a module-tagged EXTRA option that optionSurface()
 * appends when that module is installed at rank ≥2 (capped at +2 on screen).
 * Resolution seam: `choiceId` MUST reference one of this task's authored
 * choices — committing a verb option commits that underlying ChoiceNode, so
 * resolveChoice() and the Layout commit path stay completely untouched. The
 * verb option is a presentation-layer alias with its own label/identity chip,
 * not a new consequence path (Track C authors dedicated choices when a verb
 * needs distinct consequences).
 */
import { z } from 'zod'
import {
  TaskIdSchema,
  SilasPromptIdSchema,
  ChoiceIdSchema,
  SlicePhaseSchema,
  ModuleIdSchema,
} from '@schemas/gameState.schema'

/**
 * One module-authored verb option (S2). `conflictVariant` is the rank-3
 * escalation: where authored, it replaces the plain verb label and flags the
 * option as conflicting with Silas's directive.
 */
export const ModuleVerbOptionSchema = z.object({
  moduleId: ModuleIdSchema,
  /** Short all-caps verb for the identity chip, e.g. 'REVEAL' → [MOURNER · REVEAL]. */
  verb: z.string().min(1),
  /** Player-facing option text at rank 2 (plain verb tier). */
  label: z.string().min(1),
  /** Must reference one of the owning task's authored choices (see doc above). */
  choiceId: ChoiceIdSchema,
  /** Rank-3 tier: replaces `label` and renders the conflict rule line. */
  conflictVariant: z
    .object({
      label: z.string().min(1),
      conflictsWithDirective: z.literal(true),
    })
    .optional(),
})

export type ModuleVerbOption = z.infer<typeof ModuleVerbOptionSchema>

export const TaskNodeSchema = z.object({
  id: TaskIdSchema,
  phase: SlicePhaseSchema,
  silasPromptId: SilasPromptIdSchema,
  directive: z.string().min(1),
  /** 2..4 choices — matches the keybind range. */
  choiceIds: z.array(ChoiceIdSchema).min(2).max(4),
  /** S2 optional authoring — module-tagged extra options (rank ≥2 tier). */
  moduleVerbOptions: z.array(ModuleVerbOptionSchema).optional(),
})

export type TaskNode = z.infer<typeof TaskNodeSchema>
