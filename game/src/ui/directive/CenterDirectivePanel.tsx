/**
 * CenterDirectivePanel — orchestrates Null compression, human message,
 * and ChoicePanel for the center column of the HUD.
 *
 * Receives mock (T8) or real (T9+) data via props.
 * The onChoiceCommit callback is a Layout-level callback, easily swapped in T9.
 */
import type { TaskNode } from '@schemas/taskNode.schema'
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import type { ChoiceId } from '@schemas/gameState.schema'
import { NullCompression } from './NullCompression'
import { HumanMessage } from './HumanMessage'
import { ChoicePanel } from '@ui/choices/ChoicePanel'

interface CenterDirectivePanelProps {
  task: TaskNode
  choices: ChoiceNode[]
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
  nullText,
  humanMessage,
  onChoiceCommit,
  registerKeyboardHandlers,
}: CenterDirectivePanelProps) {
  return (
    <section className="space-y-6" aria-label="Directive panel">
      {/* Directive heading */}
      <div className="space-y-1">
        <p className="text-fg-secondary text-xs uppercase tracking-widest">Directive</p>
        <h1 className="text-fg-primary text-lg font-mono leading-snug">{task.directive}</h1>
      </div>

      {/* Null observation */}
      <NullCompression text={nullText} />

      {/* Human message */}
      <HumanMessage speaker={humanMessage.speaker} body={humanMessage.body} />

      {/* Choices */}
      <ChoicePanel
        choices={choices}
        onCommit={onChoiceCommit}
        registerKeyboardHandlers={registerKeyboardHandlers}
      />
    </section>
  )
}
