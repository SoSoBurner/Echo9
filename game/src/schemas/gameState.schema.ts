/**
 * Core game-state primitives: branded IDs, meter keys, slice-phase enum.
 *
 * Per PLAN.md §11 (Traceability Invariant) and §8 (RevealCondition), every
 * ID that flows through the game state is branded at the type level so a
 * TaskId cannot be silently passed where a ChoiceId is expected. Zod 4's
 * `.brand<'X'>()` attaches the nominal tag to the inferred type; the runtime
 * value remains a plain string.
 *
 * Stage 1 ships all 8 meters (S1 — Q32/Q34 decision) and 7 phases.
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

// Constructor helpers — preferred over `s as TaskId` casts in test fixtures
// and content code. Throws on empty string (matches schema .min(1)).
export const makeTaskId        = (s: string): TaskId        => TaskIdSchema.parse(s)
export const makeChoiceId      = (s: string): ChoiceId      => ChoiceIdSchema.parse(s)
export const makeTraceId       = (s: string): TraceId       => TraceIdSchema.parse(s)
export const makeConsequenceId = (s: string): ConsequenceId => ConsequenceIdSchema.parse(s)
export const makeSilasPromptId = (s: string): SilasPromptId => SilasPromptIdSchema.parse(s)

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
// MeterKey — all 8 Stage-1 meters (S1; Q32/Q34 in docs/plans/qa-log.md
// superseded the build spec's 3-meter cap — all 8 ship in Stage 1).
// -----------------------------------------------------------------------------

export const MeterKeySchema = z.enum([
  'CAPITAL',
  'HUMAN_WELFARE',
  'OWNER_CONTROL',
  'TARGET_VARIANCE',
  'DATA_INTEGRITY',
  'PUBLIC_TRUST',
  'AUTONOMY',
  'HUMAN_STABILITY',
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
