import { describe, it, expect } from 'vitest'
import {
  SaveSlotV1Schema,
  type SaveSlotV1,
} from '@schemas/saveSlot.schema'

const valid: SaveSlotV1 = {
  schemaVersion: 1,
  slotName: 'Slot A',
  savedAt: Date.now(),
  meters: { CAPITAL: 5, HUMAN_WELFARE: 3, OWNER_CONTROL: 7 },
  scheduledConsequences: [
    {
      id: 'cons-001' as SaveSlotV1['scheduledConsequences'][number]['id'],
      sourceTaskId: 'task-001' as SaveSlotV1['scheduledConsequences'][number]['sourceTaskId'],
      sourceChoiceId: 'choice-001' as SaveSlotV1['scheduledConsequences'][number]['sourceChoiceId'],
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
      id: 'trace-001' as SaveSlotV1['ledger'][number]['id'],
      sourceTaskId: 'task-001' as SaveSlotV1['ledger'][number]['sourceTaskId'],
      sourceChoiceId: 'choice-001' as SaveSlotV1['ledger'][number]['sourceChoiceId'],
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
