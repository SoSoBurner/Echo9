/**
 * Shared test fixtures for schema tests.
 *
 * Use these factory helpers in place of `'task-001' as TaskNode['id']`-style
 * casts. They route through the branded-ID parsers, so test bodies stay free
 * of `as` casts on ID values while still producing properly branded types.
 *
 * Each factory accepts an optional string and defaults to a stable canonical
 * value, so tests can call `fxTaskId()` for the common case and
 * `fxTaskId('task-007')` when they need a specific id.
 */
import {
  makeTaskId,
  makeChoiceId,
  makeTraceId,
  makeConsequenceId,
  makeSilasPromptId,
} from '@schemas/gameState.schema'
import type {
  TaskId,
  ChoiceId,
  TraceId,
  ConsequenceId,
  SilasPromptId,
} from '@schemas/gameState.schema'

export const fxTaskId        = (s = 'task-001'):  TaskId        => makeTaskId(s)
export const fxChoiceId      = (s = 'choice-001'): ChoiceId      => makeChoiceId(s)
export const fxTraceId       = (s = 'trace-001'): TraceId       => makeTraceId(s)
export const fxConsequenceId = (s = 'cons-001'):  ConsequenceId => makeConsequenceId(s)
export const fxSilasPromptId = (s = 'silas-001'): SilasPromptId => makeSilasPromptId(s)
