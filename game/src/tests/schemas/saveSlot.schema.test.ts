import { describe, it, expect } from 'vitest'
import {
  SaveSlotV1Schema,
  type SaveSlotV1,
} from '@schemas/saveSlot.schema'
import {
  fxTaskId,
  fxChoiceId,
  fxTraceId,
  fxConsequenceId,
} from './fixtures'

const valid: SaveSlotV1 = {
  schemaVersion: 1,
  slotName: 'Slot A',
  savedAt: Date.now(),
  meters: { CAPITAL: 5, HUMAN_WELFARE: 3, OWNER_CONTROL: 7 },
  scheduledConsequences: [
    {
      id: fxConsequenceId(),
      sourceTaskId: fxTaskId(),
      sourceChoiceId: fxChoiceId(),
      traceHint: 'A consequence is pending.',
      ledgerEntry: 'Pending: the worker has not yet retaliated.',
      revealCondition: { type: 'PHASE', phase: 'CONSEQUENCE_RETURN' },
      whyNow: 'They are waiting for inspection day.',
      whatChanged: 'Nothing visible yet.',
    },
  ],
  currentPhase: 'INSPECTION',
  ledger: [
    {
      id: fxTraceId(),
      sourceTaskId: fxTaskId(),
      sourceChoiceId: fxChoiceId(),
      timestamp: Date.now(),
      body: 'You pushed the workers.',
    },
  ],
}

describe('SaveSlotV1Schema', () => {
  it('parses a valid v1 save slot', () => {
    expect(() => SaveSlotV1Schema.parse(valid)).not.toThrow()
  })

  it('rejects schemaVersion other than 1', () => {
    expect(() =>
      SaveSlotV1Schema.parse({ ...valid, schemaVersion: 2 }),
    ).toThrow()
    expect(() =>
      SaveSlotV1Schema.parse({ ...valid, schemaVersion: 0 }),
    ).toThrow()
  })

  it('rejects missing meter key', () => {
    expect(() =>
      SaveSlotV1Schema.parse({
        ...valid,
        meters: { CAPITAL: 1, HUMAN_WELFARE: 1 } as Record<string, number>,
      }),
    ).toThrow()
  })

  it('parsed meters object contains all 3 meter keys', () => {
    const result = SaveSlotV1Schema.parse(valid)
    expect(Object.keys(result.meters)).toHaveLength(3)
    expect(result.meters).toHaveProperty('CAPITAL')
    expect(result.meters).toHaveProperty('HUMAN_WELFARE')
    expect(result.meters).toHaveProperty('OWNER_CONTROL')
  })

  it('accepts empty scheduledConsequences and empty ledger', () => {
    expect(() =>
      SaveSlotV1Schema.parse({
        ...valid,
        scheduledConsequences: [],
        ledger: [],
      }),
    ).not.toThrow()
  })

  it('rejects unknown phase', () => {
    expect(() =>
      SaveSlotV1Schema.parse({ ...valid, currentPhase: 'CREDITS' }),
    ).toThrow()
  })
})
