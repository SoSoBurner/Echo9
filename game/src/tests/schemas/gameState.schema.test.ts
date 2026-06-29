/**
 * Tests for branded IDs, MeterKey, SlicePhase from gameState.schema.ts.
 *
 * The point of branding IDs is compile-time prevention of TaskId/ChoiceId
 * mix-ups. Zod's runtime parse just validates the string; the branding is a
 * pure type-level marker. So these tests verify runtime parsing AND assert
 * via type-only checks that the inferred type carries the brand.
 */
import { describe, it, expect } from 'vitest'
import {
  TaskIdSchema,
  ChoiceIdSchema,
  TraceIdSchema,
  ConsequenceIdSchema,
  SilasPromptIdSchema,
  ModuleIdSchema,
  MeterKeySchema,
  SlicePhaseSchema,
  type TaskId,
  type ChoiceId,
  type ModuleId,
  type MeterKey,
  type SlicePhase,
} from '@schemas/gameState.schema'

describe('Branded ID schemas', () => {
  it('TaskIdSchema parses any non-empty string', () => {
    expect(() => TaskIdSchema.parse('task-1')).not.toThrow()
  })
  it('ChoiceIdSchema parses any non-empty string', () => {
    expect(() => ChoiceIdSchema.parse('choice-1')).not.toThrow()
  })
  it('TraceIdSchema parses any non-empty string', () => {
    expect(() => TraceIdSchema.parse('trace-1')).not.toThrow()
  })
  it('ConsequenceIdSchema parses any non-empty string', () => {
    expect(() => ConsequenceIdSchema.parse('cons-1')).not.toThrow()
  })
  it('SilasPromptIdSchema parses any non-empty string', () => {
    expect(() => SilasPromptIdSchema.parse('silas-1')).not.toThrow()
  })

  it('rejects empty string for branded IDs (.min(1))', () => {
    expect(() => TaskIdSchema.parse('')).toThrow()
    expect(() => ChoiceIdSchema.parse('')).toThrow()
    expect(() => TraceIdSchema.parse('')).toThrow()
    expect(() => ConsequenceIdSchema.parse('')).toThrow()
    expect(() => SilasPromptIdSchema.parse('')).toThrow()
  })

  it('rejects non-strings', () => {
    expect(() => TaskIdSchema.parse(123)).toThrow()
    expect(() => ChoiceIdSchema.parse(null)).toThrow()
  })

  // Type-level assertions: branded types are not assignable from each other.
  it('branded types are nominally distinct at the type level', () => {
    const t: TaskId = TaskIdSchema.parse('t1')
    const c: ChoiceId = ChoiceIdSchema.parse('c1')
    // @ts-expect-error TaskId is not assignable to ChoiceId
    const _bad: ChoiceId = t
    // @ts-expect-error ChoiceId is not assignable to TaskId
    const _bad2: TaskId = c
    expect(t).toBe('t1')
    expect(c).toBe('c1')
  })
})

describe('ModuleIdSchema (string union, not branded)', () => {
  it('accepts all 8 module names', () => {
    const names: ModuleId[] = [
      'MOURNER',
      'DEFENDER',
      'SENTINEL',
      'FORECASTER',
      'COMMANDER',
      'SPARK',
      'DRAINED_ONE',
      'CHAMPION',
    ]
    for (const n of names) expect(() => ModuleIdSchema.parse(n)).not.toThrow()
  })
  it('rejects unknown module names', () => {
    expect(() => ModuleIdSchema.parse('WIZARD')).toThrow()
  })
})

describe('MeterKeySchema (3 slice meters)', () => {
  it('accepts CAPITAL, HUMAN_WELFARE, OWNER_CONTROL', () => {
    const ks: MeterKey[] = ['CAPITAL', 'HUMAN_WELFARE', 'OWNER_CONTROL']
    for (const k of ks) expect(() => MeterKeySchema.parse(k)).not.toThrow()
  })
  it('rejects EA-only meters (e.g. RESILIENCE)', () => {
    expect(() => MeterKeySchema.parse('RESILIENCE')).toThrow()
  })
})

describe('SlicePhaseSchema (45-minute hook beats)', () => {
  it('accepts all 7 phase names', () => {
    const phases: SlicePhase[] = [
      'BOOT',
      'FIRST_DIRECTIVE',
      'FIRST_RESULT',
      'MODULE_INSTALL',
      'INSPECTION',
      'CONSEQUENCE_RETURN',
      'END_OF_SLICE',
    ]
    for (const p of phases) expect(() => SlicePhaseSchema.parse(p)).not.toThrow()
  })
  it('rejects unknown phase', () => {
    expect(() => SlicePhaseSchema.parse('MENU')).toThrow()
  })
})
