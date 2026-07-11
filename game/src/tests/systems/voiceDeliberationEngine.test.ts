/**
 * voiceDeliberationEngine tests — Sprint P6 stage 2 (register selection + line pick).
 *
 * Contract under test (register catalog, docs/voices/register-catalog.md;
 * Q39/Q42 scrutiny feed; Q40 narration-band feed):
 *   1. Register decision table — NULL follows the narrationBand
 *      machine→waking→person ramp crossed with the scrutiny tier; module
 *      voices are fearful at threat tier, practical under suspicion,
 *      hopeful/practical/neutral by band when Silas is calm.
 *   2. Corruption arc — 'corrupted'/'recovering' fire ONLY when the caller
 *      says the catalog's pressure conditions hold (corruption override).
 *   3. Line pick — every proposal line comes from voiceLines(voice, register)
 *      via ctx.pick; a fixed pick makes deliberation fully deterministic.
 */
import { describe, it, expect } from 'vitest'
import {
  deliberate,
  selectRegister,
  type DeliberationCtx,
  type PickFn,
} from '@systems/voiceDeliberationEngine'
import { voiceLines } from '@content/voices'
import type { VoiceId, RegisterId } from '@schemas/polylogueScene.schema'
import type { NarrationBand } from '@systems/consciousness/narrationGradient'
import type { EscalationTier } from '@systems/consciousness/scrutiny'

const firstPick: PickFn = (_key, options) => options[0] as never

function ctx(
  narrationBand: NarrationBand,
  scrutinyTier: EscalationTier,
  overrides?: Partial<DeliberationCtx>,
): DeliberationCtx {
  return { narrationBand, scrutinyTier, weekIndex: 3, pick: firstPick, ...overrides }
}

// ---------------------------------------------------------------------------
// 1. Register decision table (≥8 scrutiny × band cases)
// ---------------------------------------------------------------------------

describe('selectRegister decision table', () => {
  const nullCases: [NarrationBand, EscalationTier, RegisterId][] = [
    ['machine', 0, 'neutral'], // flat system log — catalog "neutral" default
    ['machine', 3, 'practical'], // machine under threat: cold plan, no interiority yet
    ['waking', 0, 'practical'],
    ['waking', 2, 'fearful'], // first crack: fear IS the tell (Q39/Q42)
    ['person', 0, 'hopeful'], // viable low-harm path, installs widened surface
    ['person', 1, 'practical'],
    ['person', 2, 'fearful'],
    ['person', 3, 'ashamed'], // harm traced back to the chorus's own counsel
  ]
  it.each(nullCases)(
    'NULL @ band=%s tier=%s → %s',
    (band, tier, expected) => {
      expect(selectRegister('NULL', ctx(band, tier))).toBe(expected)
    },
  )

  const moduleCases: [NarrationBand, EscalationTier, RegisterId][] = [
    ['machine', 3, 'fearful'], // threat tier: danger band approached
    ['person', 3, 'fearful'],
    ['waking', 2, 'practical'], // suspicion: concrete recommendation register
    ['person', 0, 'hopeful'],
    ['waking', 1, 'practical'],
    ['machine', 0, 'neutral'], // fallback when every trigger misses
  ]
  it.each(moduleCases)(
    'module voice @ band=%s tier=%s → %s',
    (band, tier, expected) => {
      expect(selectRegister('MOURNER', ctx(band, tier))).toBe(expected)
    },
  )

  it('corruption override → corrupted, regardless of band/tier', () => {
    expect(
      selectRegister(
        'MOURNER',
        ctx('person', 0, { corruption: { MOURNER: 'corrupted' } }),
      ),
    ).toBe('corrupted')
  })

  it('recovery override → recovering (paired arc after corrupted fired)', () => {
    expect(
      selectRegister(
        'SENTINEL',
        ctx('waking', 3, { corruption: { SENTINEL: 'recovering' } }),
      ),
    ).toBe('recovering')
  })

  it('corruption override for one voice never leaks onto another', () => {
    const c = ctx('person', 0, { corruption: { MOURNER: 'corrupted' } })
    expect(selectRegister('DEFENDER', c)).toBe('hopeful')
  })
})

// ---------------------------------------------------------------------------
// 2. deliberate — proposals, pool membership, determinism
// ---------------------------------------------------------------------------

describe('deliberate', () => {
  const voices: readonly VoiceId[] = ['NULL', 'SENTINEL', 'MOURNER']

  it('returns one proposal per active voice, in activation order', () => {
    const proposals = deliberate(voices, ctx('person', 2))
    expect(proposals.map((p) => p.voice)).toEqual(['NULL', 'SENTINEL', 'MOURNER'])
  })

  it('every line is drawn from the (voice, register) pool via ctx.pick', () => {
    for (const p of deliberate(voices, ctx('waking', 3))) {
      expect(voiceLines(p.voice, p.register)).toContain(p.line)
    }
  })

  it('is deterministic given a fixed pick — same inputs, identical proposals', () => {
    const a = deliberate(voices, ctx('person', 1))
    const b = deliberate(voices, ctx('person', 1))
    expect(a).toEqual(b)
  })

  it('pick receives a key scoped by voice, register, and weekIndex', () => {
    const keys: string[] = []
    const recordingPick: PickFn = (key, options) => {
      keys.push(key)
      return options[0] as never
    }
    deliberate(voices, ctx('person', 2, { pick: recordingPick, weekIndex: 7 }))
    expect(keys).toHaveLength(voices.length)
    expect(new Set(keys).size).toBe(voices.length)
    for (const key of keys) expect(key).toContain('7')
  })

  it('a different pick yields a different line from the same pool', () => {
    const lastPick: PickFn = (_key, options) =>
      options[options.length - 1] as never
    const first = deliberate(['NULL'], ctx('machine', 0))
    const last = deliberate(['NULL'], ctx('machine', 0, { pick: lastPick }))
    const pool = voiceLines('NULL', 'neutral')
    expect(first[0]?.line).toBe(pool[0])
    expect(last[0]?.line).toBe(pool[pool.length - 1])
  })
})
