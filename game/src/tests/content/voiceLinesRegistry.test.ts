/**
 * Voice line registry smoke test (Sprint P3).
 *
 * The 90-file scaffold (9 voices × 10 registers under
 * `game/src/content/voices/<voice>/<register>.ts`) is imported through
 * VOICE_LINE_REGISTRY. This test makes dead or malformed files fail loudly
 * BEFORE P4 authors the 900 lines:
 *   - every voice × register cell exists and is a string[]
 *   - no unknown voices/registers sneak into the registry
 *   - any authored line is a non-empty string (scaffold arrays start empty)
 */
import { describe, it, expect } from 'vitest'
import { VOICE_IDS, REGISTER_IDS } from '@schemas/polylogueScene.schema'
import { VOICE_LINE_REGISTRY } from '@content/voices'

describe('VOICE_LINE_REGISTRY (P3 scaffold)', () => {
  it('covers exactly the 9 voices', () => {
    expect(Object.keys(VOICE_LINE_REGISTRY).sort()).toEqual([...VOICE_IDS].sort())
  })

  it('covers exactly the 10 registers for every voice (90 cells)', () => {
    let cells = 0
    for (const voice of VOICE_IDS) {
      const registers = VOICE_LINE_REGISTRY[voice]
      expect(Object.keys(registers).sort()).toEqual([...REGISTER_IDS].sort())
      cells += Object.keys(registers).length
    }
    expect(cells).toBe(90)
  })

  it('every cell is an array of non-empty strings', () => {
    for (const voice of VOICE_IDS) {
      for (const register of REGISTER_IDS) {
        const lines = VOICE_LINE_REGISTRY[voice][register]
        expect(Array.isArray(lines)).toBe(true)
        for (const line of lines) {
          expect(typeof line).toBe('string')
          expect(line.length).toBeGreaterThan(0)
        }
      }
    }
  })
})
