/**
 * ChoicePanel — radiogroup-patterned choice selector.
 *
 * Accessibility:
 *   - role="radiogroup" on the container (PLAN.md §10 a11y review)
 *   - Arrow keys navigate between choices (roving tabindex)
 *   - Enter/Space on a selected choice commits it
 *   - 1–4 quick-select via global useKeyboardNav (registered via registerKeyboardHandlers)
 *
 * For T8 the onCommit callback console.logs the ChoiceId. T9 will wire resolveChoice.
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import type { ChoiceId } from '@schemas/gameState.schema'
import { ChoiceCard } from './ChoiceCard'

interface ChoicePanelProps {
  choices: ChoiceNode[]
  onCommit: (id: ChoiceId) => void
  /** Layout registers keyboard select/commit handlers here for global nav. */
  registerKeyboardHandlers?: ((
    selectFn: (index: number) => void,
    commitFn: () => void,
  ) => void) | undefined
}

export function ChoicePanel({ choices, onCommit, registerKeyboardHandlers }: ChoicePanelProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const groupRef = useRef<HTMLDivElement>(null)

  const selectIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < choices.length) {
        setSelectedIndex(index)
      }
    },
    [choices.length],
  )

  const commitSelected = useCallback(() => {
    const choice = choices[selectedIndex]
    if (choice) {
      onCommit(choice.id)
    }
  }, [choices, selectedIndex, onCommit])

  // Register handlers with Layout for global keyboard nav
  useEffect(() => {
    registerKeyboardHandlers?.(selectIndex, commitSelected)
  }, [registerKeyboardHandlers, selectIndex, commitSelected])

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight': {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, choices.length - 1))
        break
      }
      case 'ArrowUp':
      case 'ArrowLeft': {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
        break
      }
      case 'Home': {
        e.preventDefault()
        setSelectedIndex(0)
        break
      }
      case 'End': {
        e.preventDefault()
        setSelectedIndex(choices.length - 1)
        break
      }
      default:
        break
    }
  }

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Choose a directive response"
      className="space-y-2"
      onKeyDown={handleKeyDown}
    >
      <p className="text-fg-secondary text-xs uppercase tracking-widest mb-3">
        Select Response
      </p>
      {choices.map((choice, index) => (
        <ChoiceCard
          key={choice.id}
          choice={choice}
          index={index}
          selected={index === selectedIndex}
          onSelect={() => setSelectedIndex(index)}
          onCommit={commitSelected}
        />
      ))}
    </div>
  )
}
