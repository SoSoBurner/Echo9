/**
 * tutorialSlice — actions test.
 *
 * Pins the cold-boot shape (nothing disclosed, all counts zero) plus the two
 * mutation actions. `noteUsage` has the composite behaviour of both revealing
 * a panel and incrementing its count — that composition is the one bit of
 * behaviour that can silently rot, so it gets its own test.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '@state/store'
import { PANEL_IDS } from '@systems/tutorial/hudDisclosure'
import { resetStore } from './testHelpers'

describe('tutorialSlice', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('cold-boot shape', () => {
    it('starts with zero panels disclosed', () => {
      const { disclosedPanels } = useGameStore.getState()
      expect(disclosedPanels.size).toBe(0)
    })

    it('starts every panel at use count 0', () => {
      const { panelUseCount } = useGameStore.getState()
      for (const id of PANEL_IDS) {
        expect(panelUseCount[id]).toBe(0)
      }
    })
  })

  describe('disclosePanel', () => {
    it('reveals a panel without touching its use count', () => {
      useGameStore.getState().disclosePanel('DIRECTIVE')
      const { disclosedPanels, panelUseCount } = useGameStore.getState()
      expect(disclosedPanels.has('DIRECTIVE')).toBe(true)
      expect(panelUseCount['DIRECTIVE']).toBe(0)
    })

    it('is idempotent (double-disclose stays at one entry)', () => {
      useGameStore.getState().disclosePanel('SILAS')
      useGameStore.getState().disclosePanel('SILAS')
      expect(useGameStore.getState().disclosedPanels.size).toBe(1)
    })
  })

  describe('noteUsage', () => {
    it('increments the use count', () => {
      useGameStore.getState().noteUsage('FINANCIAL')
      useGameStore.getState().noteUsage('FINANCIAL')
      useGameStore.getState().noteUsage('FINANCIAL')
      expect(useGameStore.getState().panelUseCount['FINANCIAL']).toBe(3)
    })

    it('auto-discloses on first use (matches "first use → stage 1")', () => {
      // Cold-boot invariant: FINANCIAL not disclosed → noteUsage reveals it.
      // Without this behaviour, a caller would have to disclosePanel()+noteUsage()
      // in tandem at every use site, and forgetting one would leave the panel
      // invisible but counting up — hostile silent failure.
      expect(useGameStore.getState().disclosedPanels.has('FINANCIAL')).toBe(false)
      useGameStore.getState().noteUsage('FINANCIAL')
      expect(useGameStore.getState().disclosedPanels.has('FINANCIAL')).toBe(true)
    })

    it('does not disturb other panels', () => {
      useGameStore.getState().noteUsage('DIRECTIVE')
      const { panelUseCount } = useGameStore.getState()
      expect(panelUseCount['DIRECTIVE']).toBe(1)
      expect(panelUseCount['FINANCIAL']).toBe(0)
      expect(panelUseCount['SILAS']).toBe(0)
    })
  })
})
