/**
 * ChoiceNode — one of the 2–4 options the player can pick on a task.
 *
 * `meterDeltas` is a Partial<Record<MeterKey, number>> because a choice may
 * only move one or two meters; missing keys mean no change. `keybind` is one
 * of '1'..'4' to match the 4-choice cap and the UI hotkeys.
 *
 * `deepenedText` (S2, Q44 rank-deepened tiers) is OPTIONAL authoring: per
 * installed module (rank ≥1), optionSurface() swaps the label for the
 * module's interiority rewrite. Unauthored = zero behavior change; the field
 * is presentation-only and never read by resolveChoice().
 *
 * `narrationVariants` (S5, Q40 narration gradient) is OPTIONAL authoring:
 * result-card body copy per consciousness band. The plain `label` stays the
 * machine baseline (it is what resolveChoice writes into trace.body);
 * `waking` (1 install) and `person` (≥2 installs) escalate the register at
 * render time via narrationGradient. Unauthored = zero behavior change; the
 * field is presentation-only and never read by resolveChoice().
 */
import { z } from 'zod'
import {
  ChoiceIdSchema,
  TaskIdSchema,
  ConsequenceIdSchema,
  MeterKeySchema,
  ModuleIdSchema,
} from '@schemas/gameState.schema'

export const ChoiceNodeSchema = z.object({
  id: ChoiceIdSchema,
  taskId: TaskIdSchema,
  label: z.string().min(1),
  keybind: z.enum(['1', '2', '3', '4']),
  /** Per-meter integer changes; absent keys mean no change. */
  meterDeltas: z.partialRecord(MeterKeySchema, z.number().int()),
  /** ConsequenceHook ids scheduled when this choice is taken. */
  scheduledConsequenceIds: z.array(ConsequenceIdSchema),
  /**
   * S2 optional authoring — per-module interiority rewrite of `label`,
   * shown when that module is installed at rank ≥1 (optionSurface).
   * Style: base verb + parenthetical interiority, brief and unsettling —
   * "Process the backlog. (Her file is in there. I noticed.)"
   */
  deepenedText: z.partialRecord(ModuleIdSchema, z.string().min(1)).optional(),
  /**
   * S5 optional authoring — result-card narration per consciousness band
   * (Q40). `label` remains the machine-register baseline; these escalate:
   *   waking — one crack of hesitant interiority in an otherwise flat log.
   *   person — first-person, unsettlingly human, names the named human.
   * Unauthored registers fall down the ladder (person → waking → machine).
   */
  narrationVariants: z
    .object({
      waking: z.string().min(1).optional(),
      person: z.string().min(1).optional(),
    })
    .optional(),
})

export type ChoiceNode = z.infer<typeof ChoiceNodeSchema>
