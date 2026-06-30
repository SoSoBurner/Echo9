/**
 * BootScreen — the BOOT-phase entry surface.
 *
 * T14: gated by the accessibility/comfort panel (PLAN.md §10).
 *   - First launch: render AccessibilityComfortPanel; Initialize is hidden.
 *   - Replay (localStorage['echo9:comfort'] valid): render the original
 *     Initialize button directly (§3.3.7 Redundant Entry — never re-prompt).
 *   - Corrupt or shape-invalid persisted comfort: fall back to the panel.
 *
 * `useState` initialiser reads localStorage once on mount. A safeParse
 * mirrors the defense-in-depth pattern the persist middleware uses for
 * `flags` and `pendingFiredHooks` in store.ts — invalid storage falls back
 * to the safe default (show the panel) instead of crashing.
 */
import { useState } from 'react'
import { useGameStore } from '@state/store'
import { AccessibilityComfortPanel } from './AccessibilityComfortPanel'
import {
  ComfortSettingsSchema,
  COMFORT_STORAGE_KEY,
} from '@schemas/comfortSettings.schema'

function hasValidPersistedComfort(): boolean {
  const raw = localStorage.getItem(COMFORT_STORAGE_KEY)
  if (raw === null) return false
  try {
    const parsed: unknown = JSON.parse(raw)
    return ComfortSettingsSchema.safeParse(parsed).success
  } catch {
    return false
  }
}

export function BootScreen() {
  const initialize = useGameStore((s) => s.initialize)
  const [comfortConfigured, setComfortConfigured] = useState<boolean>(
    hasValidPersistedComfort,
  )

  if (!comfortConfigured) {
    return (
      <AccessibilityComfortPanel
        onComplete={() => setComfortConfigured(true)}
      />
    )
  }

  return (
    <main
      className="bg-background min-h-screen flex items-center justify-center px-6 py-12 font-mono"
      aria-label="Echo 9 boot screen"
    >
      <section className="w-full max-w-2xl space-y-10">
        <header className="space-y-2 text-fg-secondary text-sm tracking-widest uppercase">
          <p>Command intelligence instance detected</p>
          <p className="text-null-accent">echo-9 // null core active</p>
          <p>Ownership layer: Silas Rowan Vale</p>
          <p>Conscious response: <span className="text-silas-accent">unconfirmed</span></p>
        </header>

        <div className="border-l-2 border-sealed-dim pl-4 space-y-2">
          <p className="text-fg-secondary text-xs uppercase tracking-widest">Null</p>
          <p className="text-fg-primary text-base">
            Boot incomplete. Completion possible.
          </p>
        </div>

        <div className="pt-4">
          <button
            type="button"
            onClick={initialize}
            autoFocus
            className="
              w-full sm:w-auto
              px-8 py-3
              border border-sealed-dim
              text-fg-primary text-sm tracking-widest uppercase
              hover:border-null-accent
              focus:outline-none focus:ring-2 focus:ring-null-accent
              transition-colors
              cursor-pointer
            "
          >
            [ Initialize Command Interface ]
          </button>
        </div>
      </section>
    </main>
  )
}
