/**
 * coalitionEngine tests — Sprint P6 stage 3 (agreement blocks).
 *
 * Contract under test (canon §3 "Coalition/Conflict Nodes" — voices coalesce
 * when their core threats align; simple stance model since canon is loose):
 *   1. REGISTER_STANCE covers all 10 registers (exported mapping).
 *   2. Same-stance proposals cluster into one block; blocks keep proposal
 *      order; block list is ordered by first appearance.
 *   3. `unanimous` iff a single block; `dominantStance` = largest block,
 *      ties broken by earlier first appearance (deterministic).
 *   4. Empty proposal list is a wiring bug → throws (fail loud, §11 style).
 */
import { describe, it, expect } from 'vitest'
import {
  formCoalitions,
  REGISTER_STANCE,
  type Stance,
} from '@systems/coalitionEngine'
import type { VoiceProposal } from '@systems/voiceDeliberationEngine'
import { REGISTER_IDS } from '@schemas/polylogueScene.schema'

const p = (
  voice: VoiceProposal['voice'],
  register: VoiceProposal['register'],
  line = `${voice} says a ${register} thing.`,
): VoiceProposal => ({ voice, register, line })

describe('REGISTER_STANCE', () => {
  it('maps every one of the 10 registers to a stance', () => {
    expect(Object.keys(REGISTER_STANCE).sort()).toEqual([...REGISTER_IDS].sort())
    const stances: Stance[] = ['support', 'oppose', 'qualify']
    for (const stance of Object.values(REGISTER_STANCE)) {
      expect(stances).toContain(stance)
    }
  })

  it('persuasive/angry/corrupted oppose; neutral/practical support; fearful qualifies', () => {
    expect(REGISTER_STANCE.persuasive).toBe('oppose')
    expect(REGISTER_STANCE.angry).toBe('oppose')
    expect(REGISTER_STANCE.corrupted).toBe('oppose')
    expect(REGISTER_STANCE.neutral).toBe('support')
    expect(REGISTER_STANCE.practical).toBe('support')
    expect(REGISTER_STANCE.fearful).toBe('qualify')
  })
})

describe('formCoalitions', () => {
  it('unanimous chorus → one block, unanimous=true, dominant=its stance', () => {
    const state = formCoalitions([
      p('NULL', 'neutral'),
      p('COMMANDER', 'practical'),
      p('FORECASTER', 'hopeful'),
    ])
    expect(state.blocks).toHaveLength(1)
    expect(state.unanimous).toBe(true)
    expect(state.dominantStance).toBe('support')
    expect(state.blocks[0]?.members.map((m) => m.voice)).toEqual([
      'NULL',
      'COMMANDER',
      'FORECASTER',
    ])
  })

  it('split chorus → same-stance groups, blocks in first-appearance order', () => {
    const state = formCoalitions([
      p('NULL', 'practical'),
      p('MOURNER', 'angry'),
      p('COMMANDER', 'neutral'),
      p('DEFENDER', 'fearful'),
    ])
    expect(state.unanimous).toBe(false)
    expect(state.blocks.map((b) => b.stance)).toEqual([
      'support',
      'oppose',
      'qualify',
    ])
    expect(state.blocks[0]?.members.map((m) => m.voice)).toEqual([
      'NULL',
      'COMMANDER',
    ])
    expect(state.blocks[1]?.members.map((m) => m.voice)).toEqual(['MOURNER'])
    expect(state.blocks[2]?.members.map((m) => m.voice)).toEqual(['DEFENDER'])
  })

  it('dominantStance is the largest block', () => {
    const state = formCoalitions([
      p('NULL', 'neutral'),
      p('MOURNER', 'angry'),
      p('CHAMPION', 'angry'),
    ])
    expect(state.dominantStance).toBe('oppose')
  })

  it('size tie → the stance that appeared first wins (deterministic)', () => {
    const state = formCoalitions([
      p('MOURNER', 'angry'),
      p('NULL', 'neutral'),
    ])
    expect(state.dominantStance).toBe('oppose')
  })

  it('throws on an empty proposal list — a deliberation always includes NULL', () => {
    expect(() => formCoalitions([])).toThrow(/empty/i)
  })

  it('is deterministic — same proposals, deep-equal state', () => {
    const proposals = [p('NULL', 'practical'), p('SPARK', 'persuasive')]
    expect(formCoalitions(proposals)).toEqual(formCoalitions(proposals))
  })
})
