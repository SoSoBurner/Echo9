/**
 * VirtualLog — TanStack-Virtual-backed list for the full-history modal
 * (Task 13, PLAN.md §10 + §11).
 *
 * This file is the lazy-loaded chunk. It MUST NOT be imported eagerly
 * from anywhere — only the dynamic `lazy(() => import('./VirtualLog'))`
 * in LogDock.tsx loads it, and only when `ledger.length > 100`. Keeping
 * @tanstack/react-virtual out of the initial bundle is the entire point
 * of the virtualization gate (PLAN.md §13 perf budget).
 *
 * Accessibility: each rendered row carries
 *   - role="listitem"
 *   - aria-setsize == totalCount
 *   - aria-posinset == virtualRow.index + 1   (1-based per WAI-ARIA)
 * so AT can report position even though the DOM only contains the
 * overscan window. The container has role="list" + aria-label.
 *
 * Row height: estimated at 36px. LogEntry's actual rendered height with
 * 12px text + py-1 + border-l-2 is ~26-32px in jsdom and ~32-36px in a
 * real browser. 36 is a safe upper-bound that keeps the scrollbar
 * geometry honest without over-allocating.
 *
 * jsdom note: @tanstack/virtual-core reads container height via
 * element.offsetWidth/offsetHeight. jsdom returns 0 for both, which
 * would render an empty overscan window. We pass an `initialRect` so
 * the virtualizer bootstraps with a usable viewport for the very first
 * render; the test suite further stubs the offset getters so subsequent
 * ResizeObserver callbacks return a sane size. In a real browser the
 * real layout immediately overrides initialRect within one frame.
 */
import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { ResultTrace } from '@schemas/resultTrace.schema'
import { LogEntry } from './LogEntry'

interface VirtualLogProps {
  traces: ReadonlyArray<ResultTrace>
}

const ESTIMATED_ROW_HEIGHT_PX = 36
/**
 * Bootstrap viewport height — used by useVirtualizer's initialRect
 * before the ResizeObserver fires with the real measurement. In a real
 * browser this is replaced within one frame; in jsdom (which never
 * fires a layout pass) it stays in effect for the test's lifetime and
 * lets the overscan window render the first few rows so AT assertions
 * have something to inspect.
 */
const INITIAL_VIEWPORT = { width: 800, height: 480 }

export function VirtualLog({ traces }: VirtualLogProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const totalCount = traces.length

  const virtualizer = useVirtualizer({
    count: totalCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT_PX,
    overscan: 8,
    initialRect: INITIAL_VIEWPORT,
  })

  const items = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  return (
    <div
      ref={parentRef}
      className="h-full overflow-y-auto"
    >
      <div
        role="list"
        aria-label="Full log history (virtualized)"
        style={{
          height: `${totalSize}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {items.map((virtualRow) => {
          const trace = traces[virtualRow.index]
          if (!trace) return null
          return (
            <div
              key={virtualRow.key}
              role="listitem"
              aria-setsize={totalCount}
              aria-posinset={virtualRow.index + 1}
              data-index={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <LogEntry trace={trace} asListItem={false} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
