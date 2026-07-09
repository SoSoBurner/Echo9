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
import { PANEL_IDS, type PanelId } from '@systems/tutorial/hudDisclosure'
import {
  SILAS_DISCLOSE_LINES,
  SILAS_MATURITY_LINES,
} from '@content/silasPrompts/tutorialAwakening'

/**
 * Test helper: build a zeroed panelUseCount record for the E3-input path so
 * tests can override just the panels they care about. Keeps every test's
 * synthetic input total (no missing PanelId keys), which mirrors the way the
 * real tutorialSlice constructs its cold-boot record.
 */
function useCounts(overrides: Partial<Record<PanelId, number>> = {}): Record<PanelId, number> {
  const out = {} as Record<PanelId, number>
  for (const id of PANEL_IDS) out[id] = overrides[id] ?? 0
  return out
}

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

  // -------------------------------------------------------------------------
  // E3: Silas' currentLine derives from disclosedPanels + panelUseCount when
  // those inputs are supplied. Cold boot (no disclosures) falls back to
  // 'Listening.' — the A5 resting placeholder — which is what the omitted
  // fields test above already covers.
  // -------------------------------------------------------------------------
  describe('E3 tutorial-narration threading', () => {
    it('falls back to "Listening." when no panels are disclosed even if E3 inputs are supplied', () => {
      const out = selectInnerChorusVoices({
        silasApproval: 100,
        installedModules: {},
        disclosedPanels: new Set(),
        panelUseCount: useCounts(),
      })
      expect(out.voices[0]?.currentLine).toBe('Listening.')
    })

    it('surfaces the DIRECTIVE disclose line at cold boot when only DIRECTIVE is disclosed', () => {
      const out = selectInnerChorusVoices({
        silasApproval: 100,
        installedModules: {},
        disclosedPanels: new Set(['DIRECTIVE']),
        panelUseCount: useCounts(),
      })
      expect(out.voices[0]?.currentLine).toBe(SILAS_DISCLOSE_LINES.DIRECTIVE?.body)
    })

    it('surfaces the INNER_CHORUS disclose line when INNER_CHORUS is the most-recently-disclosed panel at stage 1', () => {
      const out = selectInnerChorusVoices({
        silasApproval: 100,
        installedModules: {},
        disclosedPanels: new Set(['DIRECTIVE', 'PRIORITY_TASKS', 'INNER_CHORUS']),
        panelUseCount: useCounts({ DIRECTIVE: 2, PRIORITY_TASKS: 1 }),
      })
      expect(out.voices[0]?.currentLine).toBe(SILAS_DISCLOSE_LINES.INNER_CHORUS?.body)
    })

    it('promotes to a stage-2 maturity line once a panel crosses the 3-use threshold', () => {
      const out = selectInnerChorusVoices({
        silasApproval: 100,
        installedModules: {},
        disclosedPanels: new Set(['DIRECTIVE']),
        panelUseCount: useCounts({ DIRECTIVE: 3 }),
      })
      expect(out.voices[0]?.currentLine).toBe(SILAS_MATURITY_LINES.DIRECTIVE?.[2]?.body)
    })

    it('promotes to a stage-3 line once a panel crosses the 6-use threshold', () => {
      const out = selectInnerChorusVoices({
        silasApproval: 100,
        installedModules: {},
        disclosedPanels: new Set(['FINANCIAL']),
        panelUseCount: useCounts({ FINANCIAL: 6 }),
      })
      expect(out.voices[0]?.currentLine).toBe(SILAS_MATURITY_LINES.FINANCIAL?.[3]?.body)
    })

    it('prefers a higher-stage line on a later-disclosed panel over a lower stage on an earlier one', () => {
      // DIRECTIVE at stage 2, HUMAN_IMPACT freshly disclosed at stage 1.
      // Rule: higher stages win globally — DIRECTIVE stage-2 line surfaces.
      const out = selectInnerChorusVoices({
        silasApproval: 100,
        installedModules: {},
        disclosedPanels: new Set(['DIRECTIVE', 'HUMAN_IMPACT']),
        panelUseCount: useCounts({ DIRECTIVE: 3, HUMAN_IMPACT: 0 }),
      })
      expect(out.voices[0]?.currentLine).toBe(SILAS_MATURITY_LINES.DIRECTIVE?.[2]?.body)
    })

    it('breaks stage-ties by walking PANEL_IDS in reverse — most-recently-disclosed panel wins', () => {
      // Both at stage 1; INNER_CHORUS is later in PANEL_IDS, so its disclose
      // line wins over PRIORITY_TASKS'.
      const out = selectInnerChorusVoices({
        silasApproval: 100,
        installedModules: {},
        disclosedPanels: new Set(['PRIORITY_TASKS', 'INNER_CHORUS']),
        panelUseCount: useCounts(),
      })
      expect(out.voices[0]?.currentLine).toBe(SILAS_DISCLOSE_LINES.INNER_CHORUS?.body)
    })
  })
})
