/**
 * PriorityTasksPanel tests (Task A2, Stage 1).
 *
 * Acceptance (plan §A2):
 *   1. Renders the Stage 1 three-item roster (Mercy Margin + 2 stubs).
 *   2. Container is role="list" with aria-label "Priority Tasks".
 *   3. Each card is role="listitem".
 *   4. Each card exposes EXECUTE and Ask Voice buttons.
 *   5. Mercy Margin (the active task) carries aria-current="true".
 *   6. Non-active cards do NOT carry aria-current.
 *   7. EXECUTE click invokes the Stage-1 handler (dev-only console.info marker).
 *   8. Ask Voice click invokes the Stage-1 handler (dev-only console.info marker).
 *
 * The panel reads state via `useGameStore(selectActiveTasks)`; the selector
 * hardcodes the Stage-1 roster so no store setup is required.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import React from 'react'
import { PriorityTasksPanel } from '@ui/priority/PriorityTasksPanel'
import { mercyMarginTask } from '@content/tasks/q1/week1-mercy-margin.task'

describe('PriorityTasksPanel', () => {
  beforeEach(() => {
    cleanup()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders a role="list" container labeled "Priority Tasks"', () => {
    render(React.createElement(PriorityTasksPanel))
    const list = screen.getByRole('list', { name: /priority tasks/i })
    expect(list).toBeInTheDocument()
  })

  it('renders three listitem cards (Stage 1 roster)', () => {
    render(React.createElement(PriorityTasksPanel))
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
  })

  it('shows the Stage 1 task titles', () => {
    render(React.createElement(PriorityTasksPanel))
    expect(screen.getByText('Mercy Margin')).toBeInTheDocument()
    expect(screen.getByText('Review Complaint Cost')).toBeInTheDocument()
    expect(screen.getByText('Pending Return: Ward 6 Cluster')).toBeInTheDocument()
  })

  it('marks Mercy Margin as the active task with aria-current="true"', () => {
    render(React.createElement(PriorityTasksPanel))
    const items = screen.getAllByRole('listitem')
    // First item is Mercy Margin (mercyMarginTask.id).
    expect(items[0]?.getAttribute('aria-current')).toBe('true')
    // Sanity: the aria-current card is the Mercy Margin card.
    expect(items[0]?.textContent).toContain('Mercy Margin')
  })

  it('does not carry aria-current on stub cards', () => {
    render(React.createElement(PriorityTasksPanel))
    const items = screen.getAllByRole('listitem')
    expect(items[1]?.getAttribute('aria-current')).toBeNull()
    expect(items[2]?.getAttribute('aria-current')).toBeNull()
  })

  it('renders EXECUTE and Ask Voice buttons on every card', () => {
    render(React.createElement(PriorityTasksPanel))
    expect(screen.getAllByRole('button', { name: /execute/i })).toHaveLength(3)
    expect(screen.getAllByRole('button', { name: /ask voice/i })).toHaveLength(3)
  })

  it('clicking EXECUTE fires the Stage-1 marker (dev console.info)', () => {
    // The marker is guarded by import.meta.env.DEV; vitest runs with DEV=true,
    // so console.info is called. Prod builds tree-shake the branch.
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    render(React.createElement(PriorityTasksPanel))
    const executeButtons = screen.getAllByRole('button', { name: /execute/i })
    fireEvent.click(executeButtons[0]!)
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining(mercyMarginTask.id),
    )
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining('EXECUTE'),
    )
  })

  it('clicking Ask Voice fires the Stage-1 marker (dev console.info)', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    render(React.createElement(PriorityTasksPanel))
    const askVoiceButtons = screen.getAllByRole('button', { name: /ask voice/i })
    fireEvent.click(askVoiceButtons[0]!)
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining(mercyMarginTask.id),
    )
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining('Ask Voice'),
    )
  })
})
