/**
 * inspectionSlice — cursor for the INSPECTION phase scene sequence (§8, §12).
 *
 * The INSPECTION phase runs through the scenes of ONE inspection set at a
 * time. C15 introduced a discriminator (`currentInspectionKey`) alongside the
 * cursor so the runtime can render W4 East Wilmer, W8 payroll, or W12 ethics
 * scenes from a single slice — the active scene list is resolved via
 * `Q1_INSPECTION_SETS[currentInspectionKey]`.
 *
 * Not persisted: inspection is a runtime modal interruption inside a phase,
 * not durable session state. If the player reloads mid-inspection, the
 * conservative behaviour is to re-enter the phase from the first scene rather
 * than resume mid-question. The key travels with the cursor under the same
 * rule.
 */
import type { StateCreator } from 'zustand'
import type { RootState } from './store'
import type { Q1InspectionKey } from '@content/inspections/q1InspectionSets'

export type InspectionSlice = {
  /** null = INSPECTION phase not active; >=0 = index into the active scene list. */
  currentInspectionSceneIndex: number | null
  /** null when no inspection active; identifies which Q1 scene set is running. */
  currentInspectionKey: Q1InspectionKey | null
  /** Sets the cursor to 0 (panel opens at the first scene of the given set). */
  startInspection: (key: Q1InspectionKey) => void
  /** Advances to the next scene. Caller passes total scene count for bounds. */
  advanceInspection: (sceneCount: number) => void
  /** Resets the cursor + key to null (panel closes). */
  endInspection: () => void
}

export const createInspectionSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  InspectionSlice
> = (set) => ({
  currentInspectionSceneIndex: null,
  currentInspectionKey: null,
  startInspection: (key) =>
    set((state) => {
      state.currentInspectionSceneIndex = 0
      state.currentInspectionKey = key
    }),
  advanceInspection: (sceneCount) =>
    set((state) => {
      const cur = state.currentInspectionSceneIndex
      if (cur === null) return
      const next = cur + 1
      // Past the last scene → end the phase and clear the key.
      if (next >= sceneCount) {
        state.currentInspectionSceneIndex = null
        state.currentInspectionKey = null
      } else {
        state.currentInspectionSceneIndex = next
      }
    }),
  endInspection: () =>
    set((state) => {
      state.currentInspectionSceneIndex = null
      state.currentInspectionKey = null
    }),
})
