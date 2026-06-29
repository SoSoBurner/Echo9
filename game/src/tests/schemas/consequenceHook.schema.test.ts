/**
 * §11 SAFETY TEST — the Traceability Invariant.
 *
 * Every delayed consequence MUST carry the 7 mandatory fields. This test is
 * the primary defense against accidental field-removal in a future refactor.
 * If this test fails, the invariant is broken.
 */
import { describe, it, expect } from 'vitest'
import {
  ConsequenceHookSchema,
  RevealConditionSchema,
  type ConsequenceHook,
} from '@schemas/consequenceHook.schema'
import { fxConsequenceId, fxTaskId, fxChoiceId } from './fixtures'

const validHook: ConsequenceHook = {
  id: fxConsequenceId(),
  sourceTaskId: fxTaskId(),
  sourceChoiceId: fxChoiceId(),
  traceHint: 'A worker complained',
  ledgerEntry: 'On day 3, the worker filed a grievance citing your directive.',
  revealCondition: { type: 'PHASE', phase: 'CONSEQUENCE_RETURN' },
  whyNow: 'Three days have passed and HR escalated.',
  whatChanged: 'HUMAN_WELFARE meter dropped by 2.',
}

describe('ConsequenceHookSchema (§11 traceability)', () => {
  it('parses a well-formed hook with all 7 mandatory fields + id', () => {
    expect(() => ConsequenceHookSchema.parse(validHook)).not.toThrow()
  })

  // The 7 §11 fields. Each MUST be required (not .optional()).
  const required = [
    'sourceTaskId',
    'sourceChoiceId',
    'traceHint',
    'ledgerEntry',
    'revealCondition',
    'whyNow',
    'whatChanged',
  ] as const

  for (const field of required) {
    it(`fails to parse when "${field}" is missing`, () => {
      const broken: Record<string, unknown> = { ...validHook }
      delete broken[field]
      expect(() => ConsequenceHookSchema.parse(broken)).toThrow()
    })
  }

  it('fails when traceHint is empty (must be .min(1))', () => {
    expect(() =>
      ConsequenceHookSchema.parse({ ...validHook, traceHint: '' }),
    ).toThrow()
  })

  it('fails when ledgerEntry is empty (must be .min(1))', () => {
    expect(() =>
      ConsequenceHookSchema.parse({ ...validHook, ledgerEntry: '' }),
    ).toThrow()
  })

  it('fails when whyNow is empty', () => {
    expect(() =>
      ConsequenceHookSchema.parse({ ...validHook, whyNow: '' }),
    ).toThrow()
  })

  it('fails when whatChanged is empty', () => {
    expect(() =>
      ConsequenceHookSchema.parse({ ...validHook, whatChanged: '' }),
    ).toThrow()
  })
})

describe('RevealConditionSchema (§8 discriminated union)', () => {
  it('parses PHASE variant', () => {
    expect(() =>
      RevealConditionSchema.parse({ type: 'PHASE', phase: 'BOOT' }),
    ).not.toThrow()
  })

  it('parses METER_THRESHOLD variant', () => {
    expect(() =>
      RevealConditionSchema.parse({
        type: 'METER_THRESHOLD',
        meter: 'CAPITAL',
        threshold: 5,
      }),
    ).not.toThrow()
  })

  it('parses FLAG variant', () => {
    expect(() =>
      RevealConditionSchema.parse({ type: 'FLAG', flag: 'first_blood' }),
    ).not.toThrow()
  })

  it('parses NEVER variant (silence-as-horror)', () => {
    expect(() =>
      RevealConditionSchema.parse({ type: 'NEVER' }),
    ).not.toThrow()
  })

  it('rejects unknown discriminator', () => {
    expect(() =>
      RevealConditionSchema.parse({ type: 'BOGUS' }),
    ).toThrow()
  })

  it('rejects METER_THRESHOLD with bad meter key', () => {
    expect(() =>
      RevealConditionSchema.parse({
        type: 'METER_THRESHOLD',
        meter: 'NONSENSE',
        threshold: 1,
      }),
    ).toThrow()
  })
})
