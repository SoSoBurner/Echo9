/**
 * polylogueSlice — Sprint P7 transient polylogue debate state + the seam
 * pipeline action.
 *
 * NOT PERSISTED (deliberate): beats, Silas-facing text, and the dissent
 * summary are per-beat UI state recomputed at every choice commit —
 * `partialize` in store.ts is NOT widened, so the store.test.ts partition
 * guard stays byte-identical. A reload simply boots with an empty debate
 * until the next commit.
 *
 * `runPolylogue` is the P7 pipeline, invoked from Layout.handleChoiceCommit
 * BEFORE resolveChoice() (Q17: the activation seam lives OUTSIDE the pure
 * resolver). It lives HERE, not in Layout, because the flavor pick reads the
 * run seed (Q43: seed touches presentation flavor only) and no ui/** file
 * may import runSeed.ts — runSeedImportGuard.test.ts allowlists this slice
 * explicitly, mirroring the silasSlice detection seam.
 *
 * Branching (Q16 Option 3 linkage):
 *   - task.polylogueSceneId present → the AUTHORED registry scene's scripted
 *     beats replace activation + deliberation; coalition + Null composition
 *     still run over them so silasFacingText/dissentSummary always exist.
 *   - otherwise → the four-engine chain: runVoiceActivation (Q9 pool:
 *     installedModules + Null) → deliberate (band/tier/week/pick ctx) →
 *     formCoalitions → composeNullOutput.
 *
 * FAILURE CONTRACT (silent-failure-hunter, §11 fail-loud):
 *   - A dangling polylogueSceneId THROWS — a task pointing at a scene the
 *     registry doesn't know is a content bug and must never silently fall
 *     back to the engine chain.
 *   - Engine exceptions PROPAGATE unswallowed. Because the seam runs before
 *     resolveChoice and set() fires only after every engine succeeded, a
 *     throw aborts the whole commit atomically — no partial debate state,
 *     no half-resolved week.
 */
import type { StateCreator } from 'zustand'
import type { TaskNode } from '@schemas/taskNode.schema'
import type { PolylogueBeat } from '@schemas/polylogueScene.schema'
import { findPolylogueScene } from '@content/polylogueScenes'
import { runVoiceActivation } from '@systems/voiceActivationEngine'
import { deliberate, type PickFn } from '@systems/voiceDeliberationEngine'
import { formCoalitions } from '@systems/coalitionEngine'
import { composeNullOutput } from '@systems/nullCompositionEngine'
import { narrationBand } from '@systems/consciousness/narrationGradient'
import { escalationTier } from '@systems/consciousness/scrutiny'
import { pickFlavor } from '@systems/consciousness/runSeed'
import type { RootState } from './store'

export type PolyloguePayload = {
  beats: PolylogueBeat[]
  silasFacingText: string
  dissentSummary: string
}

export type PolylogueSlice = {
  /** Ordered debate beats from the last commit. Transient — never persisted. */
  polylogueBeats: PolylogueBeat[]
  /** Null's single composed utterance across the Silas boundary (Q19). */
  silasFacingText: string | null
  /** Internal debate digest for the player-facing HUD — may name voices. */
  dissentSummary: string | null
  /** Land a computed debate. P10's ChorusDebateSection reads these slots. */
  setPolylogue: (payload: PolyloguePayload) => void
  /** Reset to the cold-boot shape (no debate on screen). */
  clearPolylogue: () => void
  /**
   * P7 seam pipeline — authored scene or engine chain, then coalition +
   * Null composition, then setPolylogue. Throws on content/wiring bugs
   * (see FAILURE CONTRACT above).
   */
  runPolylogue: (task: TaskNode, weekIndex: number) => void
}

export const createPolylogueSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  PolylogueSlice
> = (set, get) => ({
  polylogueBeats: [],
  silasFacingText: null,
  dissentSummary: null,

  setPolylogue: ({ beats, silasFacingText, dissentSummary }) =>
    set((state) => {
      state.polylogueBeats = beats
      state.silasFacingText = silasFacingText
      state.dissentSummary = dissentSummary
    }),

  clearPolylogue: () =>
    set((state) => {
      state.polylogueBeats = []
      state.silasFacingText = null
      state.dissentSummary = null
    }),

  runPolylogue: (task, weekIndex) => {
    const { installedModules, scrutiny, runSeed, setPolylogue } = get()
    const band = narrationBand(Object.keys(installedModules).length)

    let beats: PolylogueBeat[]
    if (task.polylogueSceneId !== undefined) {
      // AUTHORED branch — the lookup MUST resolve. A dangling id is a
      // content bug: fail loud, never silently skip to the engine chain.
      const scene = findPolylogueScene(task.polylogueSceneId)
      if (scene === undefined) {
        throw new Error(
          `runPolylogue: task "${task.id}" references unknown polylogueSceneId ` +
            `"${task.polylogueSceneId}" — content bug (registry: @content/polylogueScenes).`,
        )
      }
      beats = [...scene.beats]
    } else {
      // ENGINE branch — Q9 pool (installedModules + Null), register table
      // driven by the consciousness ramp + Silas escalation ladder, line
      // picks seeded by the run seed (Q43: flavor only).
      const activeVoices = runVoiceActivation(installedModules, task)
      const pick: PickFn = (key, options) => pickFlavor(runSeed, key, options)
      beats = deliberate(activeVoices, {
        narrationBand: band,
        scrutinyTier: escalationTier(scrutiny),
        weekIndex,
        pick,
      })
    }

    // Stages 3–4 run for BOTH branches: beats are VoiceProposal-shaped, so
    // scripted scenes get the same coalition + Null-mediated output law.
    const coalition = formCoalitions(beats)
    const { silasFacingText, dissentSummary } = composeNullOutput(
      coalition,
      task,
      band,
    )

    setPolylogue({ beats, silasFacingText, dissentSummary })
  },
})
