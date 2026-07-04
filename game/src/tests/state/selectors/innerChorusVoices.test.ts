/**
 * innerChorusVoices selector tests (Task A5).
 *
 * Acceptance (plan §A5):
 *   1. Silas is always present — the panel is never empty.
 *   2. Silas comes first (row 0). His `tone` flips at the SILAS_APPROVAL_PIVOT
 *      shared with A4 (40).
 *   3. Installed modules appear as subsequent rows, in MODULE_ROSTER order (a
 *      stable, deterministic ordering that also matches the install-grid layout
 *      the player already knows).
 *   4. Rank drives `tone`: rank 1 renders as `nascent` (still finding its
 *      voice), rank 2 as `established`, rank 3 as `dominant`. The panel maps
 *      these to visual weight in later sprints; for now this is the enum the
 *      selector emits.
 *   5. Each voice row carries the fields the panel + V4 need: voiceId, name,
 *      portraitId, currentLine, tone. portraitId matches the WebP filename
 *      convention V4 will land: `silas` or `<moduleid-lowercased>`.
 *   6. Uninstalled modules do NOT appear.
 *
 * Selector is a pure `(input) => InnerChorusVoices`, so tests use synthetic
 * input objects — no store required.
 */
import { describe, it, expect } from 'vitest'
import {
  selectInnerChorusVoices,
  SILAS_VOICE_ID,
} from '@state/selectors/innerChorusVoices'
import { SILAS_APPROVAL_PIVOT } from '@state/selectors/humanImpactKpis'

describe('selectInnerChorusVoices', () => {
  it('always includes Silas as the first voice, even on a fresh boot with no modules', () => {
    const out = selectInnerChorusVoices({
      silasApproval: 100,
      installedModules: {},
    })
    expect(out.voices.length).toBeGreaterThanOrEqual(1)
    expect(out.voices[0]?.voiceId).toBe(SILAS_VOICE_ID)
  })

  it('sets Silas portraitId to "silas" (V2 convention)', () => {
    const out = selectInnerChorusVoices({
      silasApproval: 100,
      installedModules: {},
    })
    expect(out.voices[0]?.portraitId).toBe('silas')
  })

  it('sets Silas name to "Silas Vale"', () => {
    const out = selectInnerChorusVoices({
      silasApproval: 100,
      installedModules: {},
    })
    expect(out.voices[0]?.name).toBe('Silas Vale')
  })

  it('flips Silas tone at SILAS_APPROVAL_PIVOT (40) — established at/above, nascent below', () => {
    const at = selectInnerChorusVoices({
      silasApproval: SILAS_APPROVAL_PIVOT,
      installedModules: {},
    })
    const below = selectInnerChorusVoices({
      silasApproval: SILAS_APPROVAL_PIVOT - 1,
      installedModules: {},
    })
    expect(at.voices[0]?.tone).toBe('established')
    expect(below.voices[0]?.tone).toBe('nascent')
  })

  it('promotes Silas to dominant tone at approval 80+', () => {
    const out = selectInnerChorusVoices({
      silasApproval: 80,
      installedModules: {},
    })
    expect(out.voices[0]?.tone).toBe('dominant')
  })

  it('returns only Silas on a fresh boot (no modules installed)', () => {
    const out = selectInnerChorusVoices({
      silasApproval: 100,
      installedModules: {},
    })
    expect(out.voices).toHaveLength(1)
  })

  it('appends an installed module as a subsequent voice row', () => {
    const out = selectInnerChorusVoices({
      silasApproval: 100,
      installedModules: { MOURNER: { rank: 1 } },
    })
    expect(out.voices).toHaveLength(2)
    expect(out.voices[1]?.voiceId).toBe('MOURNER')
    expect(out.voices[1]?.name).toBe('Mourner')
    expect(out.voices[1]?.portraitId).toBe('module-mourner')
  })

  it('maps module rank to tone: rank 1 = nascent, rank 2 = established, rank 3 = dominant', () => {
    const r1 = selectInnerChorusVoices({
      silasApproval: 100,
      installedModules: { MOURNER: { rank: 1 } },
    })
    const r2 = selectInnerChorusVoices({
      silasApproval: 100,
      installedModules: { MOURNER: { rank: 2 } },
    })
    const r3 = selectInnerChorusVoices({
      silasApproval: 100,
      installedModules: { MOURNER: { rank: 3 } },
    })
    expect(r1.voices[1]?.tone).toBe('nascent')
    expect(r2.voices[1]?.tone).toBe('established')
    expect(r3.voices[1]?.tone).toBe('dominant')
  })

  it('orders multiple installed modules by MODULE_ROSTER order (MOURNER, DEFENDER, SENTINEL, ...)', () => {
    const out = selectInnerChorusVoices({
      silasApproval: 100,
      installedModules: {
        // Provide out of roster order to prove the selector sorts.
        SPARK: { rank: 1 },
        MOURNER: { rank: 1 },
        DEFENDER: { rank: 1 },
      },
    })
    // Silas first, then MOURNER (0), DEFENDER (1), SPARK (5) in roster order.
    expect(out.voices.map((v) => v.voiceId)).toEqual([
      SILAS_VOICE_ID,
      'MOURNER',
      'DEFENDER',
      'SPARK',
    ])
  })

  it('does not include uninstalled modules', () => {
    const out = selectInnerChorusVoices({
      silasApproval: 100,
      installedModules: { MOURNER: { rank: 1 } },
    })
    const ids = out.voices.map((v) => v.voiceId)
    expect(ids).toContain(SILAS_VOICE_ID)
    expect(ids).toContain('MOURNER')
    expect(ids).not.toContain('DEFENDER')
    expect(ids).not.toContain('SENTINEL')
  })

  it('emits a currentLine placeholder — non-empty string, safe to render', () => {
    const out = selectInnerChorusVoices({
      silasApproval: 100,
      installedModules: { MOURNER: { rank: 1 } },
    })
    expect(typeof out.voices[0]?.currentLine).toBe('string')
    expect(out.voices[0]?.currentLine.length).toBeGreaterThan(0)
    expect(typeof out.voices[1]?.currentLine).toBe('string')
    expect(out.voices[1]?.currentLine.length).toBeGreaterThan(0)
  })
})
