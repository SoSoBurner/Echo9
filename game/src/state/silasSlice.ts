/**
 * silasSlice — the active Silas-Vale prompt line and owner-approval reading.
 *
 * `currentPromptId` is persisted (small): tracks which Silas line is currently
 * spoken so a reload does not desync the owner-voice from the ledger. Null
 * until the first Silas trigger fires.
 *
 * `silasApproval` is transient (NOT persisted): the 0–100 owner-approval
 * reading rendered by the TopBar KPI. Fresh session starts at 100. Later
 * tasks will wire it to real state changes; A1 only needs the field to exist.
 */
import type { StateCreator } from 'zustand'
import type { SilasPromptId } from '@schemas/gameState.schema'
import type { RootState } from './store'

export type SilasSlice = {
  currentPromptId: SilasPromptId | null
  silasApproval: number
  setCurrentPrompt: (id: SilasPromptId | null) => void
  setSilasApproval: (value: number) => void
}

export const createSilasSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  SilasSlice
> = (set) => ({
  currentPromptId: null,
  silasApproval: 100,
  setCurrentPrompt: (id) =>
    set((state) => {
      state.currentPromptId = id
    }),
  setSilasApproval: (value) =>
    set((state) => {
      state.silasApproval = Math.max(0, Math.min(100, value))
    }),
})
