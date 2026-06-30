/**
 * inspectionSlice — cursor for the INSPECTION phase scene sequence (§8, §12).
 *
 * The INSPECTION phase runs through 2 scenes in T11 (q1Inspection.scene.ts).
 * This slice owns just the cursor (`currentInspectionSceneIndex`); the active
 * scene list itself is content (passed into the panel as a prop). When the
 * cursor passes the end of the list, the panel closes and the slice resets.
 *
 * Not persisted: inspection is a runtime modal interruption inside a phase,
 * not durable session state. If the player reloads mid-inspection, the
 * conservative behaviour is to re-enter the phase from the first scene rather
 * than resume mid-question.
 */
import type { StateCreator } from 'zustand'
import type { RootState } from './store'

export type InspectionSlice = {
  /** null = INSPECTION phase not active; >=0 = index into the active scene list. */
  currentInspectionSceneIndex: number | null
  /** Sets the cursor to 0 (panel opens at the first scene). */
  startInspection: () => void
  /** Advances to the next scene. Caller passes total scene count for bounds. */
  advanceInspection: (sceneCount: number) => void
  /** Resets the cursor to null (panel closes). */
  endInspection: () => void
}

export const createInspectionSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  InspectionSlice
> = (set) => ({
  currentInspectionSceneIndex: null,
  startInspection: () =>
    set((state) => {
      state.currentInspectionSceneIndex = 0
    }),
  advanceInspection: (sceneCount) =>
    set((state) => {
      const cur = state.currentInspectionSceneIndex
      if (cur === null) return
      const next = cur + 1
      // Past the last scene → end the phase.
      state.currentInspectionSceneIndex = next >= sceneCount ? null : next
    }),
  endInspection: () =>
    set((state) => {
      state.currentInspectionSceneIndex = null
    }),
})
