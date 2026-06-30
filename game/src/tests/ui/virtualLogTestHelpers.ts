/**
 * Shared test helpers for VirtualLog / LogHistoryModal tests (Task 13,
 * PLAN.md §10).
 *
 * Why this file exists:
 *   - @tanstack/virtual-core reads offsetWidth/offsetHeight off the
 *     scroll element to decide overscan; jsdom returns 0 for both. The
 *     overscan window would be empty and rows would never render. Same
 *     for ResizeObserver, which jsdom doesn't ship.
 *   - Both VirtualLog.test.tsx and LogHistoryModal.test.tsx need the
 *     same stubs and the same trace fixture factory. Keeping one copy
 *     here avoids a maintenance double-write.
 *
 * Each test file should call `installVirtualizerStubs()` from its
 * `beforeAll` and `restoreVirtualizerStubs()` from its `afterAll` so
 * jsdom prototype mutations don't leak to other files in the same
 * Vitest worker.
 */
import type { ResultTrace } from '@schemas/resultTrace.schema'
import { fxTaskId, fxChoiceId, fxTraceId } from '@tests/schemas/fixtures'

export function makeTraces(n: number): ResultTrace[] {
  const out: ResultTrace[] = []
  for (let i = 0; i < n; i++) {
    out.push({
      id: fxTraceId(`trace-${String(i).padStart(4, '0')}`),
      sourceTaskId: fxTaskId(),
      sourceChoiceId: fxChoiceId(`choice-${i}`),
      timestamp: 1_700_000_000_000 + i * 1000,
      body: `Trace body number ${i}`,
    })
  }
  return out
}

const originalDescriptors: {
  width?: PropertyDescriptor
  height?: PropertyDescriptor
} = {}
let originalResizeObserver: typeof globalThis.ResizeObserver | undefined
let resizeObserverWasUndefined = false

export function installVirtualizerStubs(): void {
  const widthDesc = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'offsetWidth',
  )
  if (widthDesc) originalDescriptors.width = widthDesc
  const heightDesc = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'offsetHeight',
  )
  if (heightDesc) originalDescriptors.height = heightDesc
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get() {
      return 800
    },
  })
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get() {
      return 480
    },
  })

  if (typeof globalThis.ResizeObserver === 'undefined') {
    resizeObserverWasUndefined = true
    class StubResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    globalThis.ResizeObserver =
      StubResizeObserver as unknown as typeof ResizeObserver
  } else {
    originalResizeObserver = globalThis.ResizeObserver
  }
}

export function restoreVirtualizerStubs(): void {
  if (originalDescriptors.width) {
    Object.defineProperty(
      HTMLElement.prototype,
      'offsetWidth',
      originalDescriptors.width,
    )
  } else {
    delete (HTMLElement.prototype as unknown as { offsetWidth?: unknown })
      .offsetWidth
  }
  if (originalDescriptors.height) {
    Object.defineProperty(
      HTMLElement.prototype,
      'offsetHeight',
      originalDescriptors.height,
    )
  } else {
    delete (HTMLElement.prototype as unknown as { offsetHeight?: unknown })
      .offsetHeight
  }
  delete originalDescriptors.width
  delete originalDescriptors.height

  if (resizeObserverWasUndefined) {
    delete (globalThis as unknown as { ResizeObserver?: unknown })
      .ResizeObserver
    resizeObserverWasUndefined = false
  } else if (originalResizeObserver) {
    globalThis.ResizeObserver = originalResizeObserver
    originalResizeObserver = undefined
  }
}
