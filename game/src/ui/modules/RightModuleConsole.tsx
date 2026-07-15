/**
 * RightModuleConsole — top-level container for the module region (§6, Task 10).
 *
 * Three states, gated on the `installedModules` map + the B7 install window:
 *   - empty:      renders ModuleSelectionGrid (install #1 — pick one of 8).
 *   - one installed + installWindowOpen (Week-12 climax reached, Q44):
 *                 renders the installed module's ModuleAbilityButton with the
 *                 authored ceremony line and the ModuleSelectionGrid (filtered
 *                 to the remaining 7) below it — the door for install #2
 *                 (q1-arc §Install beats, "Install #2 — Week 12 climax
 *                 ceremony"). The window self-closes at 2 installs.
 *   - otherwise:  renders ModuleAbilityButton for the FIRST installed module.
 *
 * B3: `installedModules` is a multi-slot capable map, but this console's
 * ability display is still first-slot at Stage 1. Widening to a multi-slot
 * ability picker is a later UI task; the state layer is already multi-slot
 * ready.
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
import { installWindowOpen } from '@systems/moduleInstallWindow'
import {
  narrationBand,
  selectNarration,
} from '@systems/consciousness/narrationGradient'
import { SECOND_INSTALL_CEREMONY } from '@content/modules/installCeremony'
import { ModuleSelectionGrid } from './ModuleSelectionGrid'
import { ModuleAbilityButton } from './ModuleAbilityButton'

interface RightModuleConsoleProps {
  /** Layout registers a focus callback here for global M-key nav. */
  registerModuleFocus?: ((focusFn: () => void) => void) | undefined
}

export function RightModuleConsole({ registerModuleFocus }: RightModuleConsoleProps) {
  const installedModules = useGameStore((s) => s.installedModules)
  const flags = useGameStore((s) => s.flags)
  // First-slot ability display: first installed id, or null if none.
  const installedModuleIds = Object.keys(installedModules) as ModuleId[]
  const firstInstalledId: ModuleId | null = installedModuleIds[0] ?? null
  // B7 second-install window: exactly 1 installed AND Week-12 climax reached.
  const windowOpen = installWindowOpen({ installedModules, flags })
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
      {/* V6: ruled header — matches the mockup's hairline under panel titles. */}
      <p className="text-fg-secondary text-xs uppercase tracking-widest font-mono border-b border-sealed-dim pb-2">
        Module Console
      </p>
      {firstInstalledId === null ? (
        <ModuleSelectionGrid />
      ) : (
        <>
          <ModuleAbilityButton moduleId={firstInstalledId} ref={abilityButtonRef} />
          {windowOpen && (
            <>
              {/*
                B7 ceremony line — the arc doc's one authored invitation for
                install #2, riding the S5 narration gradient. At the window
                the install count is 1, so this renders the WAKING register.
              */}
              <p className="text-fg-primary text-xs leading-relaxed italic">
                {selectNarration(
                  SECOND_INSTALL_CEREMONY,
                  narrationBand(installedModuleIds.length),
                )}
              </p>
              <ModuleSelectionGrid />
            </>
          )}
        </>
      )}
    </aside>
  )
}
