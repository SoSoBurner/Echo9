/**
 * PolylogueScene schema tests (Sprint P2).
 *
 * Q16 (qa-log): Option 3 — polylogue scenes live in a SEPARATE registry with
 * optional linkage from TaskNode via `polylogueSceneId?`. These tests pin:
 *   1. the canonical W01 fixture parses under strict compliance,
 *   2. bad register / unknown voice / empty beats are rejected,
 *   3. beats may only speak through voices declared in the scene roster,
 *   4. TaskNode accepts (and ignores) the optional polylogueSceneId with zero
 *      behavior change when absent.
 */
import { describe, it, expect } from 'vitest'
import {
  PolylogueSceneSchema,
  PolylogueBeatSchema,
  VoiceIdSchema,
  RegisterIdSchema,
  REGISTER_IDS,
  VOICE_IDS,
} from '@schemas/polylogueScene.schema'
import { ModuleIdSchema } from '@schemas/gameState.schema'
import { TaskNodeSchema } from '@schemas/taskNode.schema'
import { W01_MERCY_MARGIN_POLYLOGUE } from '@content/polylogueScenes/w01-mercy-margin.polylogue'
import { ALL_POLYLOGUE_SCENES } from '@content/polylogueScenes'

// A minimal known-good scene literal (independent of the content fixture) so
// rejection tests don't couple to authored content.
const valid = {
  id: 'PLG_TEST_SCENE',
  triggerPhase: 'BEFORE_CHOICE',
  voices: ['NULL', 'MOURNER', 'COMMANDER'],
  beats: [
    { voice: 'NULL', register: 'neutral', line: 'Three routes remain; none are clean.' },
    { voice: 'MOURNER', register: 'persuasive', line: 'They need to remember her name.' },
    { voice: 'COMMANDER', register: 'practical', line: 'Assign staff now; delay is our enemy.' },
  ],
}

describe('VoiceIdSchema', () => {
  it('accepts NULL plus all 8 module ids (9 voices)', () => {
    expect(VOICE_IDS).toHaveLength(9)
    expect(() => VoiceIdSchema.parse('NULL')).not.toThrow()
    for (const moduleId of ModuleIdSchema.options) {
      expect(() => VoiceIdSchema.parse(moduleId)).not.toThrow()
    }
  })

  it('rejects voices outside the chorus (e.g. SILAS)', () => {
    expect(() => VoiceIdSchema.parse('SILAS')).toThrow()
    expect(() => VoiceIdSchema.parse('null')).toThrow()
  })
})

describe('RegisterIdSchema', () => {
  it('accepts exactly the 10 registers (Q18)', () => {
    expect(REGISTER_IDS).toHaveLength(10)
    for (const register of REGISTER_IDS) {
      expect(() => RegisterIdSchema.parse(register)).not.toThrow()
    }
  })

  it('rejects unknown registers', () => {
    expect(() => RegisterIdSchema.parse('sarcastic')).toThrow()
    expect(() => RegisterIdSchema.parse('Neutral')).toThrow()
  })
})

describe('PolylogueSceneSchema', () => {
  it('parses the W01_MERCY_MARGIN_POLYLOGUE fixture (strict compliance)', () => {
    const parsed = PolylogueSceneSchema.parse(W01_MERCY_MARGIN_POLYLOGUE)
    expect(parsed.beats.length).toBeGreaterThanOrEqual(3)
    expect(parsed.beats.length).toBeLessThanOrEqual(4)
    expect(parsed.triggerPhase).toBe('BEFORE_CHOICE')
    // Every beat speaks through a declared roster voice.
    for (const beat of parsed.beats) {
      expect(parsed.voices).toContain(beat.voice)
    }
  })

  it('registry exposes the fixture and every entry parses', () => {
    expect(ALL_POLYLOGUE_SCENES.length).toBeGreaterThanOrEqual(1)
    for (const scene of ALL_POLYLOGUE_SCENES) {
      expect(() => PolylogueSceneSchema.parse(scene)).not.toThrow()
    }
    expect(ALL_POLYLOGUE_SCENES.some((s) => s.id === W01_MERCY_MARGIN_POLYLOGUE.id)).toBe(true)
  })

  it('parses the minimal valid scene', () => {
    expect(() => PolylogueSceneSchema.parse(valid)).not.toThrow()
  })

  it('rejects a bad register on a beat', () => {
    expect(() =>
      PolylogueSceneSchema.parse({
        ...valid,
        beats: [{ voice: 'NULL', register: 'smug', line: 'x' }],
      }),
    ).toThrow()
  })

  it('rejects an unknown voice on a beat', () => {
    expect(() =>
      PolylogueSceneSchema.parse({
        ...valid,
        beats: [{ voice: 'SILAS', register: 'neutral', line: 'x' }],
      }),
    ).toThrow()
  })

  it('rejects empty beats', () => {
    expect(() => PolylogueSceneSchema.parse({ ...valid, beats: [] })).toThrow()
  })

  it('rejects an empty voices roster', () => {
    expect(() => PolylogueSceneSchema.parse({ ...valid, voices: [] })).toThrow()
  })

  it('rejects a beat whose voice is not in the scene roster', () => {
    expect(() =>
      PolylogueSceneSchema.parse({
        ...valid,
        voices: ['NULL'],
        beats: [{ voice: 'CHAMPION', register: 'angry', line: 'And who consented to that?' }],
      }),
    ).toThrow()
  })

  it('rejects an empty line and an empty id', () => {
    expect(() =>
      PolylogueSceneSchema.parse({
        ...valid,
        beats: [{ voice: 'NULL', register: 'neutral', line: '' }],
      }),
    ).toThrow()
    expect(() => PolylogueSceneSchema.parse({ ...valid, id: '' })).toThrow()
  })

  it('rejects an invalid triggerPhase', () => {
    expect(() =>
      PolylogueSceneSchema.parse({ ...valid, triggerPhase: 'DURING_CHOICE' }),
    ).toThrow()
  })
})

describe('PolylogueBeatSchema', () => {
  it('parses a single valid beat', () => {
    expect(() =>
      PolylogueBeatSchema.parse({ voice: 'DRAINED_ONE', register: 'recovering', line: 'Quiet means too tired to shout.' }),
    ).not.toThrow()
  })
})

describe('TaskNode optional polylogueSceneId linkage (Q16 Option 3)', () => {
  const baseTask = {
    id: 'task-plg-link',
    phase: 'FIRST_DIRECTIVE',
    silasPromptId: 'silas-plg-link',
    directive: 'Do the thing.',
    choiceIds: ['c1', 'c2'],
  }

  it('parses unchanged when polylogueSceneId is absent (zero behavior change)', () => {
    const parsed = TaskNodeSchema.parse(baseTask)
    expect(parsed.polylogueSceneId).toBeUndefined()
    expect('polylogueSceneId' in parsed).toBe(false)
  })

  it('accepts an optional polylogueSceneId string', () => {
    const parsed = TaskNodeSchema.parse({
      ...baseTask,
      polylogueSceneId: 'PLG_W01_MERCY_MARGIN',
    })
    expect(parsed.polylogueSceneId).toBe('PLG_W01_MERCY_MARGIN')
  })

  it('rejects an empty polylogueSceneId', () => {
    expect(() =>
      TaskNodeSchema.parse({ ...baseTask, polylogueSceneId: '' }),
    ).toThrow()
  })
})
