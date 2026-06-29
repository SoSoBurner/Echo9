import { describe, it, expect } from 'vitest'
import {
  InspectionSceneSchema,
  type InspectionScene,
} from '@schemas/inspectionScene.schema'

const valid: InspectionScene = {
  id: 'insp-q1',
  silasQuestion: 'Why did you let the worker leave early?',
  postures: [
    { id: 'submit', label: 'Apologize', meterDeltas: { OWNER_CONTROL: 2 } },
    { id: 'defend', label: 'Defend the decision', meterDeltas: { OWNER_CONTROL: -2, HUMAN_WELFARE: 1 } },
  ],
}

describe('InspectionSceneSchema', () => {
  it('parses a valid inspection scene', () => {
    expect(() => InspectionSceneSchema.parse(valid)).not.toThrow()
  })

  it('rejects fewer than 2 postures', () => {
    expect(() =>
      InspectionSceneSchema.parse({
        ...valid,
        postures: [valid.postures[0]!],
      }),
    ).toThrow()
  })

  it('fails when silasQuestion is empty', () => {
    expect(() =>
      InspectionSceneSchema.parse({ ...valid, silasQuestion: '' }),
    ).toThrow()
  })

  it('rejects posture with unknown meter key', () => {
    expect(() =>
      InspectionSceneSchema.parse({
        ...valid,
        postures: [
          { id: 'a', label: 'a', meterDeltas: { RESILIENCE: 1 } },
          { id: 'b', label: 'b', meterDeltas: {} },
        ],
      }),
    ).toThrow()
  })
})
