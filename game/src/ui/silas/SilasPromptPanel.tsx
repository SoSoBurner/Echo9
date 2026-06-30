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
 */
import { useEffect, useRef } from 'react'
import type { SilasPrompt } from '@schemas/silasPrompt.schema'
import { useTeletype } from './useTeletype'

interface SilasPromptPanelProps {
  prompt: SilasPrompt | null
}

export function SilasPromptPanel({ prompt }: SilasPromptPanelProps) {
  const { text, done, skip } = useTeletype(prompt?.body ?? '', 22)
  const panelRef = useRef<HTMLElement>(null)

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

      {/* Skip hint — shown until complete */}
      {!done && (
        <p className="text-fg-secondary text-xs mt-auto" aria-hidden="true">
          Press Enter to skip
        </p>
      )}
    </aside>
  )
}
