import { describe, it, expect } from 'vitest'
import {
  ModuleNodeSchema,
  type ModuleNode,
} from '@schemas/moduleNode.schema'

const valid: ModuleNode = {
  id: 'MOURNER',
  name: 'The Mourner',
  description: 'Lowers HUMAN_WELFARE volatility but increases CAPITAL drift.',
  silasFraming: 'Install this and you will feel less. Better that way.',
}

describe('ModuleNodeSchema', () => {
  it('parses a valid module', () => {
    expect(() => ModuleNodeSchema.parse(valid)).not.toThrow()
  })

  it('rejects unknown module id', () => {
    expect(() =>
      ModuleNodeSchema.parse({ ...valid, id: 'WIZARD' }),
    ).toThrow()
  })

  it('fails when name is empty', () => {
    expect(() => ModuleNodeSchema.parse({ ...valid, name: '' })).toThrow()
  })

  it('fails when silasFraming is empty', () => {
    expect(() =>
      ModuleNodeSchema.parse({ ...valid, silasFraming: '' }),
    ).toThrow()
  })
})
