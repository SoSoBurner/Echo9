/**
 * RightModuleConsole — top-level container for the module region (§6, Task 10).
 *
 * Two states, gated on the size of the `installedModules` map:
 *   - empty:    renders ModuleSelectionGrid (player picks one of 8 modules).
 *   - non-empty: renders ModuleAbilityButton for the FIRST installed module.
 *
 * B3: `installedModules` is a multi-slot capable map, but this console is
 * still single-slot at Stage 1 — it shows the first installed id. Widening
 * to a multi-slot picker is a later UI task; the state layer is already
 * multi-slot ready.
 *
 * Mounted by Layout above SilasPromptPanel inside the `right` grid column so
 * the module console and the owner voice share the same vertical rail without
 * competing for layout area.
 *
 * Imperative focus API: Layout uses registerModuleFocus(fn) so the global M
 * key handler in useKeyboardNav can focus the active ability button. We
 * deliberately avoid forwarding refs because the focusable element only
 * exists in the "installed" state and may unmount/remount over the run.
 */
import { useCallback, useEffect, useRef } from 'react'
import type { ModuleId } from '@schemas/gameState.schema'
import { useGameStore } from '@state/store'
import { ModuleSelectionGrid } from './ModuleSelectionGrid'
import { ModuleAbilityButton } from './ModuleAbilityButton'

interface RightModuleConsoleProps {
  /** Layout registers a focus callback here for global M-key nav. */
  registerModuleFocus?: ((focusFn: () => void) => void) | undefined
}

export function RightModuleConsole({ registerModuleFocus }: RightModuleConsoleProps) {
  const installedModules = useGameStore((s) => s.installedModules)
  // Single-slot UI gate: first installed id, or null if none.
  const installedModuleIds = Object.keys(installedModules) as ModuleId[]
  const firstInstalledId: ModuleId | null = installedModuleIds[0] ?? null
  const abilityButtonRef = useRef<HTMLButtonElement>(null)

  const focusAbility = useCallback(() => {
    abilityButtonRef.current?.focus()
  }, [])

  // Re-register whenever the focus fn identity changes (it doesn't, but be
  // defensive — Layout's handler runs every render of the console).
  useEffect(() => {
    registerModuleFocus?.(focusAbility)
  }, [registerModuleFocus, focusAbility])

  return (
    <aside
      aria-label="Module console"
      className="flex flex-col gap-3 px-4 py-4 border-b border-sealed-dim"
    >
      <p className="text-fg-secondary text-xs uppercase tracking-widest font-mono">
        Module Console
      </p>
      {firstInstalledId === null ? (
        <ModuleSelectionGrid />
      ) : (
        <ModuleAbilityButton moduleId={firstInstalledId} ref={abilityButtonRef} />
      )}
    </aside>
  )
}
