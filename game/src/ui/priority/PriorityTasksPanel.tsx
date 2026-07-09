/**
 * PriorityTasksPanel — left-column task roster (Task A2, Stage 1).
 *
 * Renders three TaskCard items sourced from the `selectActiveTasks` selector:
 *   1. Mercy Margin (real task; aria-current="true" by default)
 *   2. Review Complaint Cost (Stage 1 stub)
 *   3. Pending Return: Ward 6 Cluster (Stage 1 stub)
 *
 * Each card exposes two buttons:
 *   - EXECUTE — Stage 1: no-op console.info marker. The real action-dispatch
 *     wiring is owned by Task A6 (CenterDirectivePanel-focus routing). Panel
 *     is already mounted in the center column, so there is no existing
 *     "focus directive" store action to reuse.
 *   - Ask Voice — Stage 1: same rule. SilasPromptPanel is already mounted in
 *     the right column with a hardcoded prompt; there is no "open Silas"
 *     action yet. A6 will replace both handlers.
 *
 * Accessibility (PLAN.md §10):
 *   - Container is role="list" with aria-label="Priority Tasks"
 *   - Each card is role="listitem"
 *   - Active task carries aria-current="true"
 *   - Buttons are native <button> with visible focus rings
 */
import { useGameStore } from '@state/store'
import { selectActiveTasks, type ActiveTask } from '@state/selectors/activeTasks'
import { usePanelState } from '@systems/tutorial/usePanelState'

interface TaskCardProps {
  task: ActiveTask
  onExecute: (task: ActiveTask) => void
  onAskVoice: (task: ActiveTask) => void
}

function TaskCard({ task, onExecute, onAskVoice }: TaskCardProps) {
  return (
    <li
      role="listitem"
      aria-current={task.isActive ? 'true' : undefined}
      className={`
        flex flex-col gap-2 rounded-sm border px-3 py-2
        ${task.isActive ? 'border-fg-primary bg-panel-highlight' : 'border-sealed-dim'}
      `}
    >
      <p className="text-fg-primary text-sm font-mono leading-tight">{task.title}</p>
      <p className="text-fg-secondary text-xs leading-snug">{task.summary}</p>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => onExecute(task)}
          className="
            px-2 py-1 text-xs uppercase tracking-wide font-mono
            border border-fg-secondary text-fg-primary
            hover:bg-panel-highlight
            focus:outline-none focus:ring-2 focus:ring-fg-primary
          "
        >
          Execute
        </button>
        <button
          type="button"
          onClick={() => onAskVoice(task)}
          className="
            px-2 py-1 text-xs uppercase tracking-wide font-mono
            border border-silas-accent text-silas-accent
            hover:bg-panel-highlight
            focus:outline-none focus:ring-2 focus:ring-silas-accent
          "
        >
          Ask Voice
        </button>
      </div>
    </li>
  )
}

export function PriorityTasksPanel() {
  // E2 disclosure gate — hidden until the awakening sequence or a later
  // `noteUsage('PRIORITY_TASKS')` discloses it.
  const { disclosed, maturity } = usePanelState('PRIORITY_TASKS')

  // Selector returns the Stage 1 roster; wrapped in useGameStore so a future
  // task can move the roster into a real slice without changing this call.
  const tasks = useGameStore(selectActiveTasks)

  if (!disclosed) return null

  // Maturity ramp per plan E2:
  //   stage 1 — single row (the first / active task only)
  //   stage 2 — up to 3 rows
  //   stage 3 — all rows (Stage 1 authored roster caps at 3 today anyway)
  const visibleTasks =
    maturity === 1 ? tasks.slice(0, 1) : maturity === 2 ? tasks.slice(0, 3) : tasks

  // Stage 1: EXECUTE and Ask Voice are no-ops with a dev-only marker. A6 owns
  // the real dispatch wiring (CenterDirectivePanel focus + SilasPromptPanel
  // open). Marker is dev-only so prod builds tree-shake the string literal.
  function onExecute(task: ActiveTask) {
    if (import.meta.env.DEV) {
      console.info(`[PriorityTasksPanel] EXECUTE ${task.id} — A6 will wire directive focus.`)
    }
  }
  function onAskVoice(task: ActiveTask) {
    if (import.meta.env.DEV) {
      console.info(`[PriorityTasksPanel] Ask Voice ${task.id} — A6 will wire Silas open.`)
    }
  }

  return (
    <section
      aria-label="Priority Tasks"
      className="flex flex-col gap-3 px-4 py-4 border-b border-sealed-dim"
    >
      <p className="text-fg-secondary text-xs uppercase tracking-widest">Priority Tasks</p>
      <ul role="list" aria-label="Priority Tasks" className="flex flex-col gap-2 list-none p-0 m-0">
        {visibleTasks.map((task) => (
          <TaskCard key={task.id} task={task} onExecute={onExecute} onAskVoice={onAskVoice} />
        ))}
      </ul>
    </section>
  )
}
