/**
 * SilasPromptPanel — teletype panel for Silas voice (antagonist, right column).
 *
 * Visual: silas-accent border (PLAN.md §7 — border + label only, NOT body text).
 * Body text uses text-fg-primary.
 * sr-only speaker prefix: "Silas:".
 * Enter key to skip teletype (wired via useTeletype skip fn + keydown handler
 * on the panel — contained, not global, since skip is panel-local).
 *
 * prefers-reduced-motion: useTeletype bails to instant reveal.
 *
 * P10 (Q19 Silas ↔ Null boundary): the panel additionally subscribes to
 * `silasFacingText` — Null's SINGLE composed utterance from the last
 * polylogue — and renders it as Null's reply line under the prompt body.
 * It subscribes to silasFacingText ONLY: `polylogueBeats` and
 * `dissentSummary` are HUD-internal (they may name chorus voices) and must
 * never cross into Silas's panel. Enforced by SilasPromptPanel.test.tsx.
 */
import { useEffect, useRef } from 'react'
import type { SilasPrompt } from '@schemas/silasPrompt.schema'
import { useGameStore } from '@state/store'
import { useTeletype } from './useTeletype'

interface SilasPromptPanelProps {
  prompt: SilasPrompt | null
}

export function SilasPromptPanel({ prompt }: SilasPromptPanelProps) {
  const { text, done, skip } = useTeletype(prompt?.body ?? '', 22)
  const panelRef = useRef<HTMLElement>(null)
  // P10: Null's composed reply — the ONLY polylogue slot this panel may read.
  const silasFacingText = useGameStore((s) => s.silasFacingText)

  // Allow Enter to skip teletype when panel is focused or hovered
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter' && !done) {
        skip()
      }
    }
    const el = panelRef.current
    el?.addEventListener('keydown', onKey)
    return () => el?.removeEventListener('keydown', onKey)
  }, [done, skip])

  if (!prompt) return null

  return (
    <aside
      ref={panelRef}
      tabIndex={0}
      aria-label="Silas Vale — owner voice"
      className="
        h-full flex flex-col gap-4 px-5 py-6
        border-l-2 border-silas-accent
        focus:outline-none focus:ring-2 focus:ring-silas-accent
      "
    >
      {/* Panel label */}
      <p className="text-silas-accent text-xs uppercase tracking-widest font-mono">
        Silas Vale
      </p>

      {/* Prompt body — teletype reveal */}
      <p
        className="text-fg-primary text-sm leading-relaxed font-sans"
        aria-live="polite"
        aria-atomic="false"
      >
        <span className="sr-only">Silas: </span>
        {text}
        {!done && (
          <span className="inline-block w-0.5 h-4 bg-silas-accent ml-0.5 align-middle animate-pulse" aria-hidden="true" />
        )}
      </p>

      {/* Null's reply — the single composed line crossing the Q19 boundary.
          Follows the panel's visual language: accent label + fg-primary body,
          with the null-accent tokens marking whose voice this is. */}
      {silasFacingText !== null && (
        <div className="space-y-1">
          <p className="text-null-accent text-xs uppercase tracking-widest font-mono">
            Null
          </p>
          <p className="text-fg-primary text-sm leading-relaxed font-sans">
            <span className="sr-only">Null: </span>
            {silasFacingText}
          </p>
        </div>
      )}

      {/* Skip hint — shown until complete */}
      {!done && (
        <p className="text-fg-secondary text-xs mt-auto" aria-hidden="true">
          Press Enter to skip
        </p>
      )}
    </aside>
  )
}
