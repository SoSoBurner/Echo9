/**
 * CenterDirectivePanel — orchestrates Null compression, human message,
 * and ChoicePanel for the center column of the HUD.
 *
 * Receives mock (T8) or real (T9+) data via props.
 * The onChoiceCommit callback is a Layout-level callback, easily swapped in T9.
 *
 * S2: the raw authored choices are passed through optionSurface() with the
 * installed-module rank map (also a prop — the panel stays store-free) to
 * produce the DisplayOption[] the ChoicePanel renders. With no modules
 * installed the surface is the base choices verbatim.
 */
import { useMemo } from 'react'
import type { TaskNode } from '@schemas/taskNode.schema'
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import type { ChoiceId } from '@schemas/gameState.schema'
import {
  optionSurface,
  type InstalledModuleMap,
} from '@systems/consciousness/optionSurface'
import { NullCompression } from './NullCompression'
import { HumanMessage } from './HumanMessage'
import { ChoicePanel } from '@ui/choices/ChoicePanel'
import { ChorusDebateSection } from '@ui/innerChorus/ChorusDebateSection'

interface CenterDirectivePanelProps {
  task: TaskNode
  choices: ChoiceNode[]
  /** Installed-module rank map (modulesSlice shape) — drives optionSurface. */
  installedModules?: InstalledModuleMap | undefined
  nullText: string
  humanMessage: { speaker: string; body: string }
  onChoiceCommit: (id: ChoiceId) => void
  /** Forwards keyboard select/commit registration from ChoicePanel to Layout. */
  registerKeyboardHandlers?: ((
    selectFn: (index: number) => void,
    commitFn: () => void,
  ) => void) | undefined
}

export function CenterDirectivePanel({
  task,
  choices,
  installedModules,
  nullText,
  humanMessage,
  onChoiceCommit,
  registerKeyboardHandlers,
}: CenterDirectivePanelProps) {
  const options = useMemo(
    () => optionSurface(task, choices, installedModules ?? {}),
    [task, choices, installedModules],
  )

  return (
    <section className="space-y-6" aria-label="Directive panel">
      {/* Directive heading */}
      <div className="space-y-1">
        <p className="text-fg-secondary text-xs uppercase tracking-widest font-mono">Directive</p>
        {/* V6: display-scale headline — the mockup gives the directive title
            clear typographic dominance over panel labels and body copy. */}
        <h1 className="text-fg-primary text-2xl font-mono leading-snug">{task.directive}</h1>
      </div>

      {/* Null observation */}
      <NullCompression text={nullText} />

      {/* Human message */}
      <HumanMessage speaker={humanMessage.speaker} body={humanMessage.body} />

      {/* P10 (Q14 hybrid accordion) — chorus deliberation between directive
          body and choices. The section gates itself (DIRECTIVE maturity ≥2,
          empty-beats → null) and owns its own store subscription, so this
          panel's props stay store-free. */}
      <ChorusDebateSection />

      {/* Choices — S2 option surface (base + module-verb extras) */}
      <ChoicePanel
        options={options}
        onCommit={onChoiceCommit}
        registerKeyboardHandlers={registerKeyboardHandlers}
      />
    </section>
  )
}
