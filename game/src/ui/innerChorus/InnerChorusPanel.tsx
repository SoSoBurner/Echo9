/**
 * InnerChorusPanel — left-column voice-roster panel (Task A5, Stage 1).
 *
 * Renders one row per active voice (Silas + installed modules), each with:
 *   - portrait slot (data-portrait-id="silas" or "module-<lowercased-id>")
 *   - voice name
 *   - current placeholder line
 *   - tone attribute for V5 styling (nascent | established | dominant)
 *
 * State wiring:
 *   Narrow scalar subscriptions (silasApproval + installedModules) compose the
 *   selector input at the call site. The installedModules subscription reads
 *   the map reference directly; Zustand's default strict-equality is fine here
 *   because installModule/promoteModule mutate via immer producing new refs.
 *
 * Portrait slots are `<div>`s with a `data-portrait-id` attribute so V4 can
 * drop generated WebPs in behind them by CSS `background-image` without a
 * component refactor. Until V2/V4 ship, the slot is a gradient placeholder.
 *
 * Accessibility (PLAN.md §10):
 *   - Section is role="group" with aria-label "Inner Chorus".
 *   - Rows use the role="list" / role="listitem" idiom.
 *   - Each row exposes `data-tone` so screen readers get the visible label +
 *     name pair; tone is purely visual and not spoken.
 */
import { useGameStore } from '@state/store'
import {
  selectInnerChorusVoices,
  type InnerChorusVoice,
} from '@state/selectors/innerChorusVoices'
import { selectSilasEscalationTier } from '@state/selectors/silasEscalation'
import { PortraitSlot } from '@ui/portraits/PortraitSlot'
import {
  PORTRAIT_IDS,
  type PortraitId,
} from '@ui/portraits/portraitRegistry'
import { usePanelState } from '@systems/tutorial/usePanelState'

interface RowProps {
  voice: InnerChorusVoice
}

/**
 * Narrow the selector's free-string `portraitId` to the closed PortraitId union
 * before handing it to PortraitSlot. If a future selector emits an id the
 * registry doesn't know about, fall back to the neutral `null` slot rather
 * than crash — the ring/silhouette still communicates "voice present" and the
 * missing metadata surfaces in dev via the placeholder caption.
 */
function toPortraitId(raw: string): PortraitId {
  return (PORTRAIT_IDS as readonly string[]).includes(raw) ? (raw as PortraitId) : 'null'
}

function VoiceRow({ voice }: RowProps) {
  return (
    <li
      role="listitem"
      data-tone={voice.tone}
      className="flex items-center gap-3 py-2"
    >
      <PortraitSlot portraitId={toPortraitId(voice.portraitId)} size="sm" />
      <div className="flex flex-col min-w-0">
        <span className="text-fg-primary text-xs uppercase tracking-widest font-mono truncate">
          {voice.name}
        </span>
        <span className="text-fg-secondary text-[10px] font-mono truncate">
          {voice.currentLine}
        </span>
      </div>
    </li>
  )
}

export function InnerChorusPanel() {
  // E2 disclosure gate. Maturity ramp per plan:
  //   stage 1 — Silas silhouette only
  //   stage 2 — Silas + at most one installed upgrade
  //   stage 3 — full roster (Silas + every installed upgrade)
  const { disclosed, maturity } = usePanelState('INNER_CHORUS')

  const silasApproval = useGameStore((s) => s.silasApproval)
  const installedModules = useGameStore((s) => s.installedModules)
  // E3: threading the tutorial-narration inputs so Silas's row can surface a
  // one-line acknowledgment when panels first appear and when they widen.
  // Both are narrow scalar subscriptions — Zustand's default strict equality
  // is fine because both slices produce new refs via immer.
  const disclosedPanels = useGameStore((s) => s.disclosedPanels)
  const panelUseCount = useGameStore((s) => s.panelUseCount)
  // S3: Silas's tone tier (0–3). Derived subscription — the panel never sees
  // the underlying hidden value, only the ladder step. Feeds the Sentinel-peek
  // gate inside the selector (the sole sanctioned leak, Q42).
  const silasEscalationTier = useGameStore(selectSilasEscalationTier)
  // P10: one-line dissent digest from the last polylogue. HUD-internal — it
  // may name chorus voices (unlike silasFacingText, which crosses the Q19
  // boundary into Silas's panel). Null until a debate lands.
  const dissentSummary = useGameStore((s) => s.dissentSummary)

  const { voices } = selectInnerChorusVoices({
    silasApproval,
    installedModules,
    disclosedPanels,
    panelUseCount,
    silasEscalationTier,
  })

  if (!disclosed) return null

  const visibleVoices =
    maturity === 1 ? voices.slice(0, 1) : maturity === 2 ? voices.slice(0, 2) : voices

  return (
    <section
      role="group"
      aria-label="Inner Chorus"
      className="flex flex-col gap-2 px-4 py-3 border-b border-sealed-dim"
    >
      {/* V6: ruled header — matches the mockup's hairline under every
          left-column panel title. */}
      <p className="text-fg-secondary text-xs uppercase tracking-widest font-mono border-b border-sealed-dim pb-2">
        Inner Chorus
      </p>
      <ul
        role="list"
        aria-label="Inner Chorus voices"
        className="flex flex-col list-none p-0 m-0"
      >
        {visibleVoices.map((voice) => (
          <VoiceRow key={voice.voiceId} voice={voice} />
        ))}
      </ul>
      {/* P10 — one-line dissent digest under the roster. Existing tokens,
          single truncated line so the panel never grows past its slot. */}
      {dissentSummary !== null && (
        <p className="text-fg-secondary text-[10px] font-mono truncate">
          {dissentSummary}
        </p>
      )}
    </section>
  )
}
