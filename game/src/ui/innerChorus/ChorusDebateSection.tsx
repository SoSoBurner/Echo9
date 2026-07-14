/**
 * ChorusDebateSection — the Q14 hybrid accordion: the inner chorus's
 * deliberation, rendered INSIDE CenterDirectivePanel between the directive
 * body and the choices (Sprint P10).
 *
 * Data: subscribes to `polylogueBeats` (polylogueSlice, landed by the P7
 * commit seam). Beats persist until the next commit, so the section shows
 * the debate behind the PREVIOUS decision while the player weighs the next
 * one. Empty beats (cold boot / fresh run) → renders nothing.
 *
 * Gating (Q14): DIRECTIVE panel maturity ≥ 2. The section owns its own
 * `usePanelState('DIRECTIVE')` read so CenterDirectivePanel stays prop-driven
 * (its S2 contract: "the panel stays store-free") — the store subscription
 * lives here, in the child, same pattern as the left-column panels.
 *
 * Beat format: `[VOICE · REGISTER] line` — the chip reuses S2's ChoiceCard
 * voice-identity chip styling (text-null-accent mono tracking-widest),
 * existing palette tokens only.
 *
 * Motion (PLAN.md §9): beats fade in sequentially by stacking an inline
 * `animationDelay` on the existing `.log-entry-enter` keyframe. Reduced
 * motion collapses the whole reveal to 0 ms via BOTH halves of the existing
 * mechanism:
 *   - the global `prefers-reduced-motion` / `:root[data-motion]` blocks in
 *     index.css collapse the keyframe DURATION (exactly how LogEntry and
 *     AlertCrawler are disabled), and
 *   - `useReducedMotion()` (OS pref OR comfort setting, same gate as
 *     useTeletype) drops the inline DELAY, which the CSS blocks do not
 *     reach. No delay + ~0ms duration = instant, motionless reveal.
 *
 * Accessibility (comfort pillar):
 *   - role="region" aria-label="Chorus deliberation", 240px max-height
 *     scroll area, tabIndex=0 so keyboard users can focus + arrow-scroll it.
 *     No focus trap — it is a plain focusable container (SilasPromptPanel's
 *     idiom, including the focus ring tokens).
 *   - Beats are role="list" / role="listitem" (InnerChorusPanel's idiom).
 */
import { useGameStore } from '@state/store'
import { usePanelState } from '@systems/tutorial/usePanelState'
import { useReducedMotion } from '@systems/comfort/reducedMotion'

/** Per-beat fade-in offset. Kept short: stillness is the horror (§9). */
const BEAT_STAGGER_MS = 90

export function ChorusDebateSection() {
  const { maturity } = usePanelState('DIRECTIVE')
  const beats = useGameStore((s) => s.polylogueBeats)
  const reducedMotion = useReducedMotion()

  // Q14 gate + empty state — render nothing at all.
  if (maturity < 2 || beats.length === 0) return null

  return (
    <div
      role="region"
      aria-label="Chorus deliberation"
      tabIndex={0}
      className="
        max-h-[240px] overflow-y-auto
        border border-sealed-dim px-4 py-3
        focus:outline-none focus:ring-2 focus:ring-null-accent
      "
    >
      <p className="text-fg-secondary text-xs uppercase tracking-widest mb-2">
        Chorus deliberation
      </p>
      <ul role="list" className="list-none p-0 m-0 space-y-2">
        {beats.map((beat, index) => (
          <li
            key={`${index}-${beat.voice}`}
            role="listitem"
            className="log-entry-enter text-sm leading-snug"
            style={
              reducedMotion
                ? undefined
                : {
                    animationDelay: `${index * BEAT_STAGGER_MS}ms`,
                    // Hold the `from` frame (opacity 0) through the delay so
                    // later beats don't flash visible before their fade.
                    animationFillMode: 'backwards',
                  }
            }
          >
            <span className="text-null-accent text-xs font-mono tracking-widest">
              [{beat.voice} · {beat.register.toUpperCase()}]
            </span>{' '}
            <span className="text-fg-primary">{beat.line}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
