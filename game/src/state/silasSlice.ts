/**
 * silasSlice — the active Silas-Vale prompt line.
 *
 * Persisted (small): tracks which Silas line is currently spoken so a reload
 * does not desync the owner-voice from the ledger. Null until the first Silas
 * trigger fires.
 */
import type { StateCreator } from 'zustand'
import type { SilasPromptId } from '@schemas/gameState.schema'
import type { RootState } from './store'

export type SilasSlice = {
  currentPromptId: SilasPromptId | null
  setCurrentPrompt: (id: SilasPromptId | null) => void
}

export const createSilasSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  SilasSlice
> = (set) => ({
  currentPromptId: null,
  setCurrentPrompt: (id) =>
    set((state) => {
      state.currentPromptId = id
    }),
})
