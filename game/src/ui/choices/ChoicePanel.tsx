/**
 * ChoicePanel — radiogroup-patterned choice selector.
 *
 * Accessibility:
 *   - role="radiogroup" on the container (PLAN.md §10 a11y review)
 *   - Arrow keys navigate between choices (roving tabindex)
 *   - Enter/Space on a selected choice commits it
 *   - 1–4 quick-select via global useKeyboardNav (registered via registerKeyboardHandlers)
 *
 * S2: renders DisplayOption[] (optionSurface output) — base options plus up
 * to 2 module-verb extras. Committing ANY option reports the underlying
 * authored ChoiceId, so the Layout → resolveChoice() seam is unchanged.
 */
import React, { useState, useCallback, useRef, useEffect } from 'react'
import type { DisplayOption } from '@systems/consciousness/optionSurface'
import type { ChoiceId } from '@schemas/gameState.schema'
import { ChoiceCard } from './ChoiceCard'

interface ChoicePanelProps {
  options: DisplayOption[]
  onCommit: (id: ChoiceId) => void
  /** Layout registers keyboard select/commit handlers here for global nav. */
  registerKeyboardHandlers?: ((
    selectFn: (index: number) => void,
    commitFn: () => void,
  ) => void) | undefined
}

export function ChoicePanel({ options, onCommit, registerKeyboardHandlers }: ChoicePanelProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const groupRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Array<HTMLElement | null>>([])
  // Track whether user has interacted via keyboard — prevents focus yank on mount
  const userInitiated = useRef(false)

  // Focus the card at the given index after React commits
  function focusCard(index: number) {
    requestAnimationFrame(() => {
      cardRefs.current[index]?.focus()
    })
  }

  const selectIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < options.length) {
        userInitiated.current = true
        setSelectedIndex(index)
        focusCard(index)
      }
    },
    [options.length],
  )

  const commitSelected = useCallback(() => {
    const option = options[selectedIndex]
    if (option) {
      onCommit(option.choiceId)
    }
  }, [options, selectedIndex, onCommit])

  // Register handlers with Layout for global keyboard nav
  useEffect(() => {
    registerKeyboardHandlers?.(selectIndex, commitSelected)
  }, [registerKeyboardHandlers, selectIndex, commitSelected])

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight': {
        e.preventDefault()
        userInitiated.current = true
        setSelectedIndex((prev) => {
          const next = (prev + 1) % options.length
          focusCard(next)
          return next
        })
        break
      }
      case 'ArrowUp':
      case 'ArrowLeft': {
        e.preventDefault()
        userInitiated.current = true
        setSelectedIndex((prev) => {
          const next = (prev - 1 + options.length) % options.length
          focusCard(next)
          return next
        })
        break
      }
      case 'Home': {
        e.preventDefault()
        userInitiated.current = true
        setSelectedIndex(0)
        focusCard(0)
        break
      }
      case 'End': {
        e.preventDefault()
        userInitiated.current = true
        setSelectedIndex(options.length - 1)
        focusCard(options.length - 1)
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
      <p className="text-fg-secondary text-xs uppercase tracking-widest font-mono mb-3">
        Select Response
      </p>
      {options.map((option, index) => (
        <ChoiceCard
          key={option.key}
          ref={(el: HTMLElement | null) => { cardRefs.current[index] = el }}
          option={option}
          index={index}
          selected={index === selectedIndex}
          onSelect={() => setSelectedIndex(index)}
          onCommit={commitSelected}
        />
      ))}
    </div>
  )
}
