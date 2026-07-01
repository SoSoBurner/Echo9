/**
 * silasSlice tests — currentPromptId set/clear via setCurrentPrompt.
 *
 * The slice exposes a single mutator: setCurrentPrompt(id | null). null is the
 * "clear" state — there is no separate clearPromptId.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '@state/store'
import { makeSilasPromptId } from '@schemas/gameState.schema'
import { resetStore } from './testHelpers'

describe('silasSlice', () => {
  beforeEach(() => {
    resetStore()
  })

  it('initial currentPromptId is null', () => {
    expect(useGameStore.getState().currentPromptId).toBeNull()
  })

  it('setCurrentPrompt(id) writes the id into currentPromptId', () => {
    const id = makeSilasPromptId('silas-boot-01')
    useGameStore.getState().setCurrentPrompt(id)
    expect(useGameStore.getState().currentPromptId).toBe(id)
  })

  it('setCurrentPrompt(null) clears currentPromptId back to null', () => {
    const id = makeSilasPromptId('silas-boot-01')
    useGameStore.getState().setCurrentPrompt(id)
    expect(useGameStore.getState().currentPromptId).toBe(id)

    useGameStore.getState().setCurrentPrompt(null)
    expect(useGameStore.getState().currentPromptId).toBeNull()
  })

  it('setCurrentPrompt(id) twice with the same id is idempotent', () => {
    const id = makeSilasPromptId('silas-boot-01')
    useGameStore.getState().setCurrentPrompt(id)
    const first = useGameStore.getState().currentPromptId
    useGameStore.getState().setCurrentPrompt(id)
    const second = useGameStore.getState().currentPromptId
    expect(first).toBe(id)
    expect(second).toBe(id)
    // Same branded string value (referential equality holds for primitives).
    expect(first === second).toBe(true)
  })
})
