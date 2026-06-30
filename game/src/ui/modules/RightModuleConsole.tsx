/**
 * RightModuleConsole — top-level container for the module region (§6, Task 10).
 *
 * Two states, gated on the persisted `installedModule` slot:
 *   - null:    renders ModuleSelectionGrid (player picks one of 8 modules).
 *   - present: renders ModuleAbilityButton for the installed module.
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
import { useGameStore } from '@state/store'
import { ModuleSelectionGrid } from './ModuleSelectionGrid'
import { ModuleAbilityButton } from './ModuleAbilityButton'

interface RightModuleConsoleProps {
  /** Layout registers a focus callback here for global M-key nav. */
  registerModuleFocus?: ((focusFn: () => void) => void) | undefined
}

export function RightModuleConsole({ registerModuleFocus }: RightModuleConsoleProps) {
  const installedModule = useGameStore((s) => s.installedModule)
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
      {installedModule === null ? (
        <ModuleSelectionGrid />
      ) : (
        <ModuleAbilityButton moduleId={installedModule} ref={abilityButtonRef} />
      )}
    </aside>
  )
}
