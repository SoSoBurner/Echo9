/**
 * ModuleSelectionGrid — 2x4 grid of the 8 installable modules (§6, Task 10).
 *
 * Accessibility (WAI-ARIA grid pattern):
 *   - Container: role="grid", aria-label="Select a personality module"
 *   - Rows:      role="row"
 *   - Cells:     role="gridcell" (the cell itself is focusable; no nested
 *                interactive child — avoids double-announcement under SRs)
 *   - Arrow keys move focus left/right/up/down between cells (roving tabindex)
 *   - Home/End:  row-scoped first/last; Ctrl/Cmd+Home/End: grid-global
 *   - Enter/Space activates a cell → opens the inline confirm panel
 *
 * Install protocol — explicit confirmation (§14 acceptance criterion):
 *   1. Activate a cell → confirm panel appears (silasFraming + Confirm/Cancel).
 *   2. Confirm calls installModule(id). Cancel returns to the grid.
 *   3. Single-click install is forbidden — a single Enter must NOT install.
 *
 * B7: the grid offers only UNINSTALLED modules. At install #1 (empty map)
 * that is all 8; at the Week-12 second-install window (installWindowOpen)
 * it is the remaining 7 — "Choose from the remaining seven" per q1-arc
 * §Install beats. Row count derives from the filtered roster length so the
 * roving-tabindex arithmetic stays correct in both states.
 */
import { useCallback, useRef, useState, type KeyboardEvent } from 'react'
import type { ModuleId } from '@schemas/gameState.schema'
import type { ModuleNode } from '@schemas/moduleNode.schema'
import { useGameStore } from '@state/store'
import { MODULE_ROSTER } from '@content/modules/moduleRoster'
import { markBeat } from '@ui/debug/BeatTelemetry'

// Grid shape: 2 cols × as many rows as the offered roster needs, ordered as
// MODULE_ROSTER (8 modules → 4×2 at install #1; 7 → 4 rows of 2+2+2+1 at the
// B7 second-install window). V6: was 4 cols — module names overflowed the
// ~60px cells the 300px right column allows; 2 cols renders every name
// un-clipped. Keyboard nav arithmetic derives from GRID_COLS, so the roving
// tabindex stays correct.
const GRID_COLS = 2

function indexToRC(index: number): { row: number; col: number } {
  return { row: Math.floor(index / GRID_COLS), col: index % GRID_COLS }
}
function rcToIndex(row: number, col: number): number {
  return row * GRID_COLS + col
}

export function ModuleSelectionGrid() {
  const installModule = useGameStore((s) => s.installModule)
  const installedModules = useGameStore((s) => s.installedModules)

  // B7: offer only uninstalled modules. Cheap per-render filter — 8 entries.
  const roster = MODULE_ROSTER.filter((mod) => !installedModules[mod.id])
  const gridRows = Math.ceil(roster.length / GRID_COLS)

  const [focusedIndex, setFocusedIndex] = useState(0)
  const [pendingModule, setPendingModule] = useState<ModuleNode | null>(null)
  const cellRefs = useRef<Array<HTMLDivElement | null>>([])

  const focusCell = useCallback((index: number) => {
    requestAnimationFrame(() => {
      cellRefs.current[index]?.focus()
    })
  }, [])

  const openConfirm = useCallback((mod: ModuleNode) => {
    setPendingModule(mod)
  }, [])

  const cancelConfirm = useCallback(() => {
    setPendingModule(null)
    // Return focus to the cell that opened the confirm.
    focusCell(focusedIndex)
  }, [focusedIndex, focusCell])

  const confirmInstall = useCallback(
    (id: ModuleId) => {
      markBeat('moduleInstall')
      installModule(id)
      // Grid unmounts after install — no need to clear pendingModule.
    },
    [installModule],
  )

  function handleGridKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    // While the confirm panel is open, grid arrow keys are inactive.
    if (pendingModule !== null) return

    const { row, col } = indexToRC(focusedIndex)
    let nextIndex: number | null = null

    switch (e.key) {
      case 'ArrowRight': {
        const nextCol = (col + 1) % GRID_COLS
        nextIndex = rcToIndex(row, nextCol)
        break
      }
      case 'ArrowLeft': {
        const nextCol = (col - 1 + GRID_COLS) % GRID_COLS
        nextIndex = rcToIndex(row, nextCol)
        break
      }
      case 'ArrowDown': {
        const nextRow = (row + 1) % gridRows
        nextIndex = rcToIndex(nextRow, col)
        break
      }
      case 'ArrowUp': {
        const nextRow = (row - 1 + gridRows) % gridRows
        nextIndex = rcToIndex(nextRow, col)
        break
      }
      case 'Home': {
        // WAI-ARIA APG grid pattern: Home = first cell of current row;
        // Ctrl+Home (or Cmd+Home on macOS) = grid-global first cell.
        nextIndex = (e.ctrlKey || e.metaKey) ? 0 : rcToIndex(row, 0)
        break
      }
      case 'End': {
        // WAI-ARIA APG grid pattern: End = last cell of current row;
        // Ctrl+End (or Cmd+End on macOS) = grid-global last cell. Row-End is
        // clamped so a partial last row (7-module B7 window) still lands on
        // its real last cell instead of a hole.
        nextIndex = (e.ctrlKey || e.metaKey)
          ? roster.length - 1
          : Math.min(rcToIndex(row, GRID_COLS - 1), roster.length - 1)
        break
      }
      default:
        return
    }

    if (nextIndex !== null && nextIndex < roster.length) {
      e.preventDefault()
      setFocusedIndex(nextIndex)
      focusCell(nextIndex)
    }
  }

  // ── Confirm panel takes over when a module is pending ─────────────────────
  if (pendingModule) {
    return (
      <section
        aria-label={`Confirm install: ${pendingModule.name}`}
        className="flex flex-col gap-4 px-4 py-4 border border-silas-accent"
      >
        <p className="text-silas-accent text-xs uppercase tracking-widest font-mono">
          Silas Vale
        </p>
        <p className="text-fg-primary text-sm leading-relaxed">
          {pendingModule.silasFraming}
        </p>
        <p className="text-fg-secondary text-xs">
          {pendingModule.description}
        </p>

        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => confirmInstall(pendingModule.id)}
            className="
              flex-1 px-3 py-2
              bg-silas-accent text-background
              text-xs font-mono uppercase tracking-widest
              border border-silas-accent
              focus:outline-none focus:ring-2 focus:ring-null-accent
              hover:opacity-90
            "
          >
            Confirm install
          </button>
          <button
            type="button"
            onClick={cancelConfirm}
            className="
              flex-1 px-3 py-2
              bg-background text-fg-primary
              text-xs font-mono uppercase tracking-widest
              border border-sealed-dim
              hover:border-fg-secondary
              focus:outline-none focus:ring-2 focus:ring-null-accent
            "
          >
            Cancel
          </button>
        </div>
      </section>
    )
  }

  // ── Default state: the 2×4 grid ───────────────────────────────────────────
  return (
    <div
      role="grid"
      aria-label="Select a personality module"
      className="grid grid-cols-2 gap-2 px-3 py-3"
      onKeyDown={handleGridKeyDown}
    >
      <p className="col-span-2 text-fg-secondary text-xs uppercase tracking-widest font-mono mb-1">
        Install a Module
      </p>
      {Array.from({ length: gridRows }, (_, rowIdx) => (
        <div role="row" key={`row-${rowIdx}`} className="contents">
          {Array.from({ length: GRID_COLS }, (_, colIdx) => {
            const index = rcToIndex(rowIdx, colIdx)
            const mod = roster[index]
            if (!mod) return null
            const isFocused = index === focusedIndex
            return (
              <div
                role="gridcell"
                key={mod.id}
                ref={(el) => { cellRefs.current[index] = el }}
                tabIndex={isFocused ? 0 : -1}
                onFocus={() => setFocusedIndex(index)}
                onClick={() => openConfirm(mod)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openConfirm(mod)
                  }
                }}
                aria-label={`${mod.name} — ${mod.description}`}
                className={[
                  'flex flex-col gap-1 px-3 py-2 cursor-pointer',
                  'border focus:outline-none focus:ring-2 focus:ring-null-accent',
                  isFocused
                    ? 'border-null-accent bg-background'
                    : 'border-sealed-dim hover:border-fg-secondary bg-background',
                ].join(' ')}
              >
                <span
                  className="text-fg-primary text-xs font-mono uppercase tracking-wider truncate"
                >
                  {mod.name}
                </span>
                <span className="text-fg-secondary text-[10px] leading-tight line-clamp-2">
                  {mod.description}
                </span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
