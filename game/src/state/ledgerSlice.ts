/**
 * ledgerSlice — the written trace ledger.
 *
 * Persisted: the ledger is the player-visible record of every consequence that
 * has fired. It is append-only at runtime (T5 enforces the resolver writes
 * exactly one ResultTrace per fired choice/consequence; PLAN.md §11).
 */
import type { StateCreator } from 'zustand'
import type { ResultTrace } from '@schemas/resultTrace.schema'
import type { RootState } from './store'

export type LedgerSlice = {
  ledger: ResultTrace[]
  appendTrace: (trace: ResultTrace) => void
}

export const createLedgerSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  LedgerSlice
> = (set) => ({
  ledger: [],
  appendTrace: (trace) =>
    set((state) => {
      state.ledger.push(trace)
    }),
})
