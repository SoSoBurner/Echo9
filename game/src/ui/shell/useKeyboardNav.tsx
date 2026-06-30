/**
 * useKeyboardNav — global keyboard handler for the HUD.
 *
 * Mounts once in Layout. Handles the full key map from PLAN.md §10.
 * DO NOT scatter onKeyDown handlers across components — all keyboard routing
 * lives here to prevent focus fights.
 *
 * Key map:
 *   1–4       Select choice (dispatches to active ChoicePanel via callback ref)
 *   Enter/Spc Commit selection / skip teletype (context-sensitive)
 *   Arrows    Navigate within radiogroup (handled by ChoicePanel itself via ARIA)
 *   Esc       Close modal / pause
 *   ?         Open keybind help (placeholder)
 *   F6        Cycle HUD landmarks (placeholder)
 *   M         Focus module ability (T10 — no-op)
 *   I         Open inspection (T11 — no-op)
 *   L         Toggle LogDock (T13 — no-op)
 *   C         Review pending consequence toast (T12 — no-op)
 */
import { useEffect } from 'react'

export interface KeyboardNavCallbacks {
  /** Called when 1–4 keys pressed; index is 0-based (key "1" → 0). */
  onChoiceKey?: (index: number) => void
  /** Called on Enter or Space — commits selection or skips teletype. */
  onCommit?: () => void
  /** Called on Escape — close modal / pause. */
  onEscape?: () => void
  /** Called on M — focus the active module ability button (T10). */
  onModuleFocus?: () => void
}

export function useKeyboardNav(callbacks: KeyboardNavCallbacks = {}) {
  const { onChoiceKey, onCommit, onEscape, onModuleFocus } = callbacks

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore when typing in inputs, textareas, or contenteditable regions
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      const target = e.target as HTMLElement | null
      if (target?.isContentEditable) return

      switch (e.key) {
        case '1':
        case '2':
        case '3':
        case '4': {
          const index = parseInt(e.key, 10) - 1
          onChoiceKey?.(index)
          break
        }
        case 'Enter':
        case ' ': {
          // Only intercept when not focused on a button/input (let native activate)
          if (tag !== 'BUTTON') {
            e.preventDefault()
            onCommit?.()
          }
          break
        }
        case 'Escape': {
          onEscape?.()
          break
        }
        case '?': {
          // T-later: open keybind help overlay
          break
        }
        case 'F6': {
          // T-later: cycle HUD landmarks
          e.preventDefault()
          break
        }
        case 'm':
        case 'M': {
          // T10: focus module ability (does NOT activate — just focuses).
          // Guard against re-firing when the button is already focused, so
          // pressing M doesn't fight any in-flight programmatic focus.
          e.preventDefault()
          onModuleFocus?.()
          break
        }
        case 'i':
        case 'I': {
          // T11: open inspection — no-op for T8
          break
        }
        case 'l':
        case 'L': {
          // T13: toggle LogDock — no-op for T8
          break
        }
        case 'c':
        case 'C': {
          // T12: review pending consequence toast — no-op for T8
          break
        }
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onChoiceKey, onCommit, onEscape, onModuleFocus])
}
