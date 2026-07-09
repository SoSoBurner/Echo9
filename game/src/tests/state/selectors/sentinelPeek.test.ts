/**
 * S3 — Sentinel peek gating in the Inner Chorus roster (Q42).
 *
 * The SOLE UI leak of hidden scrutiny: when SENTINEL is installed at rank ≥2
 * AND Silas's escalation tier is ≥2, the Sentinel's chorus row surfaces the
 * one authored in-fiction line. Every other combination renders the module's
 * normal placeholder line.
 */
import { describe, it, expect } from 'vitest'
import { selectInnerChorusVoices } from '@state/selectors/innerChorusVoices'
import { SENTINEL_SCRUTINY_LINE } from '@systems/consciousness/scrutiny'
import type { EscalationTier } from '@systems/consciousness/scrutiny'
import type { ModuleId } from '@schemas/gameState.schema'
import type { InstalledModuleEntry } from '@state/modulesSlice'

function voices(
  installedModules: Partial<Record<ModuleId, InstalledModuleEntry>>,
  tier: EscalationTier,
) {
  return selectInnerChorusVoices({
    silasApproval: 100,
    installedModules,
    silasEscalationTier: tier,
  }).voices
}

function sentinelLine(
  installedModules: Partial<Record<ModuleId, InstalledModuleEntry>>,
  tier: EscalationTier,
): string | undefined {
  return voices(installedModules, tier).find((v) => v.voiceId === 'SENTINEL')
    ?.currentLine
}

describe('Inner Chorus — Sentinel peek (sole scrutiny leak)', () => {
  it('no Sentinel row at all when SENTINEL is not installed, whatever the tier', () => {
    expect(sentinelLine({}, 3)).toBeUndefined()
    expect(sentinelLine({ MOURNER: { rank: 3 } }, 3)).toBeUndefined()
  })

  it('rank 1 SENTINEL never surfaces the line, even at tier 3', () => {
    const line = sentinelLine({ SENTINEL: { rank: 1 } }, 3)
    expect(line).toBeDefined()
    expect(line).not.toBe(SENTINEL_SCRUTINY_LINE)
  })

  it('rank 2 SENTINEL below tier 2 keeps the normal placeholder line', () => {
    for (const tier of [0, 1] as const) {
      const line = sentinelLine({ SENTINEL: { rank: 2 } }, tier)
      expect(line).toBeDefined()
      expect(line).not.toBe(SENTINEL_SCRUTINY_LINE)
    }
  })

  it('rank 2 SENTINEL at tier ≥2 surfaces the one in-fiction line', () => {
    expect(sentinelLine({ SENTINEL: { rank: 2 } }, 2)).toBe(SENTINEL_SCRUTINY_LINE)
    expect(sentinelLine({ SENTINEL: { rank: 2 } }, 3)).toBe(SENTINEL_SCRUTINY_LINE)
    expect(sentinelLine({ SENTINEL: { rank: 3 } }, 2)).toBe(SENTINEL_SCRUTINY_LINE)
  })

  it('the peek never touches any OTHER voice row', () => {
    const list = voices({ SENTINEL: { rank: 3 }, MOURNER: { rank: 3 } }, 3)
    const mourner = list.find((v) => v.voiceId === 'MOURNER')
    expect(mourner).toBeDefined()
    expect(mourner?.currentLine).not.toBe(SENTINEL_SCRUTINY_LINE)
    const silas = list.find((v) => v.voiceId === 'SILAS')
    expect(silas?.currentLine).not.toBe(SENTINEL_SCRUTINY_LINE)
  })

  it('omitting silasEscalationTier (legacy callers) behaves as tier 0 — no leak', () => {
    const { voices: list } = selectInnerChorusVoices({
      silasApproval: 100,
      installedModules: { SENTINEL: { rank: 3 } },
    })
    const line = list.find((v) => v.voiceId === 'SENTINEL')?.currentLine
    expect(line).toBeDefined()
    expect(line).not.toBe(SENTINEL_SCRUTINY_LINE)
  })
})
