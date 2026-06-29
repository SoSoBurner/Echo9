import { create } from 'zustand'

export type SlicePhase =
  | 'BOOT'
  | 'FIRST_DIRECTIVE'
  | 'FIRST_CHOICE'
  | 'FIRST_RESULT'
  | 'MODULE_INSTALL'
  | 'MODULE_USE'
  | 'INSPECTION_WARNING'
  | 'INSPECTION'
  | 'CAPITAL_DEPLOYMENT'
  | 'CONSEQUENCE_RETURN'
  | 'REPLAY_END'

interface GameStore {
  phase: SlicePhase
  initialize: () => void
}

export const useGameState = create<GameStore>((set) => ({
  phase: 'BOOT',
  initialize: () => set({ phase: 'FIRST_DIRECTIVE' }),
}))
