/**
 * Core game-state primitives: branded IDs, meter keys, slice-phase enum.
 *
 * Per PLAN.md §11 (Traceability Invariant) and §8 (RevealCondition), every
 * ID that flows through the game state is branded at the type level so a
 * TaskId cannot be silently passed where a ChoiceId is expected. Zod 4's
 * `.brand<'X'>()` attaches the nominal tag to the inferred type; the runtime
 * value remains a plain string.
 *
 * Vertical slice ships 3 meters and 7 phases. EA will expand meters to 8 by
 * extending MeterKeySchema's enum — that is the intended migration path.
 */
import { z } from 'zod'

// -----------------------------------------------------------------------------
// Branded string IDs (§11)
// -----------------------------------------------------------------------------

export const TaskIdSchema = z.string().min(1).brand<'TaskId'>()
export type TaskId = z.infer<typeof TaskIdSchema>

export const ChoiceIdSchema = z.string().min(1).brand<'ChoiceId'>()
export type ChoiceId = z.infer<typeof ChoiceIdSchema>

export const TraceIdSchema = z.string().min(1).brand<'TraceId'>()
export type TraceId = z.infer<typeof TraceIdSchema>

export const ConsequenceIdSchema = z.string().min(1).brand<'ConsequenceId'>()
export type ConsequenceId = z.infer<typeof ConsequenceIdSchema>

export const SilasPromptIdSchema = z.string().min(1).brand<'SilasPromptId'>()
export type SilasPromptId = z.infer<typeof SilasPromptIdSchema>

// -----------------------------------------------------------------------------
// ModuleId — string union (NOT branded), the 8 installable modules (§6)
// -----------------------------------------------------------------------------

export const ModuleIdSchema = z.enum([
  'MOURNER',
  'DEFENDER',
  'SENTINEL',
  'FORECASTER',
  'COMMANDER',
  'SPARK',
  'DRAINED_ONE',
  'CHAMPION',
])
export type ModuleId = z.infer<typeof ModuleIdSchema>

// -----------------------------------------------------------------------------
// MeterKey — slice ships 3 meters; EA expands to 8 by editing this enum.
// -----------------------------------------------------------------------------

export const MeterKeySchema = z.enum([
  'CAPITAL',
  'HUMAN_WELFARE',
  'OWNER_CONTROL',
])
export type MeterKey = z.infer<typeof MeterKeySchema>

// -----------------------------------------------------------------------------
// SlicePhase — the 7 beats of the 45-minute vertical-slice hook (§6).
// -----------------------------------------------------------------------------

export const SlicePhaseSchema = z.enum([
  'BOOT',
  'FIRST_DIRECTIVE',
  'FIRST_RESULT',
  'MODULE_INSTALL',
  'INSPECTION',
  'CONSEQUENCE_RETURN',
  'END_OF_SLICE',
])
export type SlicePhase = z.infer<typeof SlicePhaseSchema>
