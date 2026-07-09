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
 *
 * `scrutiny` (S3) IS persisted: the hidden Silas-suspicion variable
 * (consciousness spec §4, Q39/Q42). 0–10, starts 0. NEVER player-facing —
 * no UI file may read the raw number (scrutinyLeakGuard.test.ts enforces
 * this); the tone ladder is consumed via selectSilasEscalationTier and the
 * sole leak is the Sentinel rank-2+ chorus line. `recordScrutinyEvent` is
 * the only mutator and routes through the pure updateScrutiny so tuning
 * (decay/spike/clamp) lives in systems/consciousness/scrutiny.ts alone.
 */
import type { StateCreator } from 'zustand'
import type { SilasPromptId } from '@schemas/gameState.schema'
import {
  updateScrutiny,
  type ScrutinyEvent,
} from '@systems/consciousness/scrutiny'
import type { RootState } from './store'

export type SilasSlice = {
  currentPromptId: SilasPromptId | null
  silasApproval: number
  /** Hidden Silas-suspicion, 0–10. Persisted. Never rendered. */
  scrutiny: number
  setCurrentPrompt: (id: SilasPromptId | null) => void
  setSilasApproval: (value: number) => void
  /** Sole scrutiny mutator — COMPLY decays, DEFY spikes (S3 seam). */
  recordScrutinyEvent: (event: ScrutinyEvent) => void
}

export const createSilasSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  SilasSlice
> = (set) => ({
  currentPromptId: null,
  silasApproval: 100,
  scrutiny: 0,
  setCurrentPrompt: (id) =>
    set((state) => {
      state.currentPromptId = id
    }),
  setSilasApproval: (value) =>
    set((state) => {
      state.silasApproval = Math.max(0, Math.min(100, value))
    }),
  recordScrutinyEvent: (event) =>
    set((state) => {
      state.scrutiny = updateScrutiny(state.scrutiny, event)
    }),
})
