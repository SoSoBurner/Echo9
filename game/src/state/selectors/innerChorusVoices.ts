/**
 * innerChorusVoices selector (Task A5).
 *
 * Produces the voice roster consumed by InnerChorusPanel (left column,
 * below HumanImpactPanel):
 *
 *   Row 0: Silas Vale — always present, tone reflects silasApproval.
 *   Row N: one row per installed module, in MODULE_ROSTER order, tone from rank.
 *
 * Fresh boot → only Silas (single row). As the player installs modules the
 * chorus grows; as ranks climb the tone shifts nascent → established → dominant.
 * The Panel + V2/V4 will render `portraitId` as an image slot; A5 emits the id
 * so V4's batch WebP generation drops files under exactly this path convention:
 *   `game/src/assets/portraits/silas.webp`
 *   `game/src/assets/portraits/module-mourner.webp` … module-champion.webp
 *
 * Design note: portraitId is intentionally a *string*, not the ModuleId, so
 * the Silas row (which is not a module) fits the same shape. This lets the
 * panel loop over `voices` without a special case for Silas.
 *
 * The `tone` enum (`nascent | established | dominant`) is the Inner Chorus
 * analogue of A4's `positive | negative`: it's the panel's coloring/weight
 * axis. Reusing SILAS_APPROVAL_PIVOT keeps A4 + A5 flipping colors at the
 * same threshold (40) so the two panels feel like one instrument, not two
 * unrelated dials. The `dominant` tier above 80 gives Silas headroom to
 * "grow into" a stronger presence as the player earns approval.
 *
 * Selector is a pure `(input) => InnerChorusVoices`, so tests use synthetic
 * input objects — no store required.
 */
import type { ModuleId } from '@schemas/gameState.schema'
import { MODULE_ROSTER } from '@content/modules/moduleRoster'
import type { InstalledModuleEntry } from '@state/modulesSlice'
import { SILAS_APPROVAL_PIVOT } from '@state/selectors/humanImpactKpis'

/** Voice id for Silas — a sentinel string used to distinguish him from ModuleId. */
export const SILAS_VOICE_ID = 'SILAS' as const

/** Silas approval threshold that promotes his tone from `established` to `dominant`. */
export const SILAS_DOMINANT_PIVOT = 80

export type InnerChorusTone = 'nascent' | 'established' | 'dominant'

export type InnerChorusVoiceId = typeof SILAS_VOICE_ID | ModuleId

export interface InnerChorusVoice {
  voiceId: InnerChorusVoiceId
  name: string
  /** WebP filename stem; V4 will materialize matching files. */
  portraitId: string
  /** Placeholder line rendered until content authoring fills it. */
  currentLine: string
  tone: InnerChorusTone
}

export interface InnerChorusVoices {
  voices: InnerChorusVoice[]
}

export interface InnerChorusVoicesInput {
  silasApproval: number
  installedModules: Partial<Record<ModuleId, InstalledModuleEntry>>
}

function silasTone(approval: number): InnerChorusTone {
  if (approval >= SILAS_DOMINANT_PIVOT) return 'dominant'
  if (approval >= SILAS_APPROVAL_PIVOT) return 'established'
  return 'nascent'
}

function moduleTone(rank: 1 | 2 | 3): InnerChorusTone {
  if (rank === 3) return 'dominant'
  if (rank === 2) return 'established'
  return 'nascent'
}

export function selectInnerChorusVoices(
  input: InnerChorusVoicesInput,
): InnerChorusVoices {
  const voices: InnerChorusVoice[] = [
    {
      voiceId: SILAS_VOICE_ID,
      name: 'Silas Vale',
      portraitId: 'silas',
      currentLine: 'Listening.',
      tone: silasTone(input.silasApproval),
    },
  ]

  // Iterate MODULE_ROSTER (not Object.keys) so ordering is stable and matches
  // the install-grid — the player's visual anchor for the module set.
  for (const node of MODULE_ROSTER) {
    const entry = input.installedModules[node.id]
    if (!entry) continue
    voices.push({
      voiceId: node.id,
      name: node.name,
      portraitId: `module-${node.id.toLowerCase()}`,
      // Placeholder line pulls from the ModuleNode's silasFraming so even before
      // content authors write chorus lines the row is not blank. First 60 chars
      // keep the row visually consistent across modules.
      currentLine:
        node.silasFraming.length > 60
          ? `${node.silasFraming.slice(0, 60)}\u2026`
          : node.silasFraming,
      tone: moduleTone(entry.rank),
    })
  }

  return { voices }
}
