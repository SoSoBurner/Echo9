/**
 * consequenceSlice — the scheduled-consequence queue.
 *
 * Persisted: outstanding hooks must survive a reload, or the §11 traceability
 * invariant breaks (a scheduled consequence that vanishes is the bug the
 * invariant tests guard against).
 *
 * Minimal API today: `scheduleHook` appends; `removeHook` removes by id. T9+
 * will layer reveal-condition evaluation on top of this queue.
 */
import type { StateCreator } from 'zustand'
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import type { ConsequenceId } from '@schemas/gameState.schema'
import type { RootState } from './store'

export type ConsequenceSlice = {
  scheduledConsequences: ConsequenceHook[]
  scheduleHook: (hook: ConsequenceHook) => void
  removeHook: (id: ConsequenceId) => void
}

export const createConsequenceSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  ConsequenceSlice
> = (set) => ({
  scheduledConsequences: [],
  scheduleHook: (hook) =>
    set((state) => {
      state.scheduledConsequences.push(hook)
    }),
  removeHook: (id) =>
    set((state) => {
      state.scheduledConsequences = state.scheduledConsequences.filter(
        (h) => h.id !== id,
      )
    }),
})
