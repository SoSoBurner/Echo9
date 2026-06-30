/**
 * VirtualLog tests (Task 13, PLAN.md §10).
 *
 * Acceptance:
 *   - Container has role="list".
 *   - Each rendered row has role="listitem" + aria-setsize == totalCount
 *     + aria-posinset (1-based, ≥ 1).
 *   - At >100 entries it actually renders rows (overscan window) — jsdom
 *     has no real layout, but @tanstack/react-virtual still produces an
 *     initial overscan slice.
 */
import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import React from 'react'
import { VirtualLog } from '@ui/log/VirtualLog'
import {
  makeTraces,
  installVirtualizerStubs,
  restoreVirtualizerStubs,
} from './virtualLogTestHelpers'

// @tanstack/virtual-core reads offsetWidth/offsetHeight from the scroll
// element to determine viewport size. jsdom returns 0 for both, which
// would make the virtualizer skip rendering everything. The shared
// helper patches the prototype getters so the overscan window is
// non-empty in tests, and restoreVirtualizerStubs() puts the original
// descriptors back so jsdom mutations don't leak across files in the
// same Vitest worker. In a real browser these stubs never execute.
beforeAll(installVirtualizerStubs)
afterAll(restoreVirtualizerStubs)

describe('VirtualLog', () => {
  beforeEach(() => {
    cleanup()
  })

  it('renders a role="list" container', () => {
    const { container } = render(
      React.createElement(VirtualLog, { traces: makeTraces(200) }),
    )
    expect(container.querySelector('[role="list"]')).toBeTruthy()
  })

  it('each rendered listitem carries aria-setsize == totalCount', () => {
    const traces = makeTraces(200)
    const { container } = render(
      React.createElement(VirtualLog, { traces }),
    )
    const items = container.querySelectorAll('[role="listitem"]')
    expect(items.length).toBeGreaterThan(0)
    items.forEach((node) => {
      expect(node.getAttribute('aria-setsize')).toBe('200')
    })
  })

  it('each rendered listitem carries aria-posinset >= 1 (1-based)', () => {
    const { container } = render(
      React.createElement(VirtualLog, { traces: makeTraces(200) }),
    )
    const items = container.querySelectorAll('[role="listitem"]')
    expect(items.length).toBeGreaterThan(0)
    items.forEach((node) => {
      const posStr = node.getAttribute('aria-posinset')
      expect(posStr).not.toBeNull()
      const pos = Number(posStr)
      expect(Number.isInteger(pos)).toBe(true)
      expect(pos).toBeGreaterThanOrEqual(1)
      expect(pos).toBeLessThanOrEqual(200)
    })
  })
})
