/**
 * P7 — polylogueSlice unit tests.
 *
 * The slice holds TRANSIENT per-beat debate state (never persisted — the
 * store.test.ts partition guard stays untouched because partialize was not
 * widened). Three responsibilities pinned here:
 *
 *   1. Cold boot: empty beats, null Silas-facing text, null dissent summary.
 *   2. setPolylogue / clearPolylogue round-trip.
 *   3. runPolylogue — the P7 seam pipeline:
 *      a. AUTHORED branch: task.polylogueSceneId → registry scene's scripted
 *         beats; coalition + Null composition still run over them.
 *      b. ENGINE branch: no sceneId → runVoiceActivation → deliberate →
 *         formCoalitions → composeNullOutput, deterministic per run seed.
 *      c. FAILURE CONTRACT: a dangling polylogueSceneId THROWS loudly
 *         (content bug — never silently skipped) and leaves the slice
 *         untouched (the commit aborts atomically before any resolve-path
 *         mutation); engine exceptions propagate unswallowed.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '@state/store'
import { resetStore } from './testHelpers'
import { mercyMarginTask } from '@content/tasks/q1/week1-mercy-margin.task'
import { queueTriageFollowupTask } from '@content/tasks/q1/week2-queue-triage-followup.task'
import { W01_MERCY_MARGIN_POLYLOGUE } from '@content/polylogueScenes/w01-mercy-margin.polylogue'
import { NULL_VOICE_ID, type PolylogueBeat } from '@schemas/polylogueScene.schema'
import type { TaskNode } from '@schemas/taskNode.schema'

const SAMPLE_BEATS: PolylogueBeat[] = [
  { voice: 'NULL', register: 'neutral', line: 'Course confirmed.' },
  { voice: 'MOURNER', register: 'persuasive', line: 'Say her name first.' },
]

describe('polylogueSlice — cold boot', () => {
  beforeEach(() => {
    resetStore()
  })

  it('starts with empty beats and null texts', () => {
    const state = useGameStore.getState()
    expect(state.polylogueBeats).toEqual([])
    expect(state.silasFacingText).toBeNull()
    expect(state.dissentSummary).toBeNull()
  })

  it('exposes the three slice actions', () => {
    const state = useGameStore.getState()
    expect(typeof state.setPolylogue).toBe('function')
    expect(typeof state.clearPolylogue).toBe('function')
    expect(typeof state.runPolylogue).toBe('function')
  })
})

describe('polylogueSlice — setPolylogue / clearPolylogue', () => {
  beforeEach(() => {
    resetStore()
  })

  it('setPolylogue lands beats + both texts', () => {
    useGameStore.getState().setPolylogue({
      beats: SAMPLE_BEATS,
      silasFacingText: 'I can carry this out.',
      dissentSummary: 'support: NULL · oppose: MOURNER',
    })
    const state = useGameStore.getState()
    expect(state.polylogueBeats).toEqual(SAMPLE_BEATS)
    expect(state.silasFacingText).toBe('I can carry this out.')
    expect(state.dissentSummary).toBe('support: NULL · oppose: MOURNER')
  })

  it('clearPolylogue resets to the cold-boot shape', () => {
    useGameStore.getState().setPolylogue({
      beats: SAMPLE_BEATS,
      silasFacingText: 'x',
      dissentSummary: 'y',
    })
    useGameStore.getState().clearPolylogue()
    const state = useGameStore.getState()
    expect(state.polylogueBeats).toEqual([])
    expect(state.silasFacingText).toBeNull()
    expect(state.dissentSummary).toBeNull()
  })
})

describe('polylogueSlice — runPolylogue (P7 pipeline)', () => {
  beforeEach(() => {
    resetStore()
  })

  it('AUTHORED branch: Week-1 task uses the scripted W01 scene beats', () => {
    useGameStore.getState().runPolylogue(mercyMarginTask, 1)
    const state = useGameStore.getState()
    expect(state.polylogueBeats).toEqual(W01_MERCY_MARGIN_POLYLOGUE.beats)
    expect(state.polylogueBeats.length).toBeGreaterThanOrEqual(3)
    // Coalition + Null composition run over the scripted beats too.
    expect(state.silasFacingText).not.toBeNull()
    expect(state.silasFacingText!.length).toBeGreaterThan(0)
    expect(state.dissentSummary).not.toBeNull()
  })

  it('ENGINE branch: no sceneId → beats from NULL + installed modules', () => {
    useGameStore.setState({
      installedModules: { MOURNER: { rank: 1 } },
      runSeed: 1234,
    })
    useGameStore.getState().runPolylogue(queueTriageFollowupTask, 2)
    const state = useGameStore.getState()
    expect(state.polylogueBeats).toHaveLength(2) // NULL + MOURNER (Q9 pool)
    expect(state.polylogueBeats[0]!.voice).toBe(NULL_VOICE_ID)
    expect(state.polylogueBeats[1]!.voice).toBe('MOURNER')
    expect(state.silasFacingText).not.toBeNull()
    expect(state.dissentSummary).not.toBeNull()
  })

  it('ENGINE branch is deterministic for a fixed run seed (Q43 flavor law)', () => {
    useGameStore.setState({
      installedModules: { MOURNER: { rank: 1 } },
      runSeed: 42,
    })
    useGameStore.getState().runPolylogue(queueTriageFollowupTask, 2)
    const first = useGameStore.getState().polylogueBeats
    const firstText = useGameStore.getState().silasFacingText

    useGameStore.getState().clearPolylogue()
    useGameStore.getState().runPolylogue(queueTriageFollowupTask, 2)
    expect(useGameStore.getState().polylogueBeats).toEqual(first)
    expect(useGameStore.getState().silasFacingText).toBe(firstText)
  })

  it('FAILURE CONTRACT: dangling polylogueSceneId throws loudly and mutates nothing', () => {
    const broken: TaskNode = {
      ...mercyMarginTask,
      polylogueSceneId: 'PLG_DOES_NOT_EXIST',
    }
    expect(() => useGameStore.getState().runPolylogue(broken, 1)).toThrowError(
      /PLG_DOES_NOT_EXIST/,
    )
    // Atomic abort: the slice is untouched — the Layout seam runs BEFORE
    // resolveChoice, so a throw here also aborts the whole commit cleanly.
    const state = useGameStore.getState()
    expect(state.polylogueBeats).toEqual([])
    expect(state.silasFacingText).toBeNull()
    expect(state.dissentSummary).toBeNull()
  })
})
