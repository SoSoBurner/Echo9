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
import { PortraitSlot } from '@ui/portraits/PortraitSlot'
import {
  PORTRAIT_IDS,
  type PortraitId,
} from '@ui/portraits/portraitRegistry'

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
  const silasApproval = useGameStore((s) => s.silasApproval)
  const installedModules = useGameStore((s) => s.installedModules)

  const { voices } = selectInnerChorusVoices({
    silasApproval,
    installedModules,
  })

  return (
    <section
      role="group"
      aria-label="Inner Chorus"
      className="flex flex-col gap-2 px-4 py-4 border-b border-sealed-dim"
    >
      <p className="text-fg-secondary text-xs uppercase tracking-widest">
        Inner Chorus
      </p>
      <ul
        role="list"
        aria-label="Inner Chorus voices"
        className="flex flex-col list-none p-0 m-0"
      >
        {voices.map((voice) => (
          <VoiceRow key={voice.voiceId} voice={voice} />
        ))}
      </ul>
    </section>
  )
}
