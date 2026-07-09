/**
 * PolylogueScene — a scripted deliberation among the inner chorus (Sprint P2).
 *
 * Q16 (docs/plans/qa-log.md): Option 3 — polylogue scenes live in a SEPARATE
 * registry (`game/src/content/polylogueScenes/`) and a directive may OPTIONALLY
 * link one via `TaskNode.polylogueSceneId`. `resolveChoice()` stays pure; the
 * activation seam is outside the resolver (Q17).
 *
 * VoiceId modeling: the chorus is Null + the 8 installable modules (Q8/Q9).
 * Silas is NOT a chorus voice — he is the external owner (see
 * `SILAS_VOICE_ID` in `@state/selectors/innerChorusVoices`, which is a
 * different union for the HUD roster that includes him). `VoiceIdSchema` is
 * derived from `ModuleIdSchema.options` so a module added/renamed there is
 * automatically reflected here — the two enums cannot drift.
 *
 * RegisterId: the 10-register taxonomy (Q18) — see
 * `docs/voices/register-catalog.md` and `AI Dialogue Interplay.md` §2.
 *
 * `id` is branded (PolylogueSceneId) per the §11 convention for ids that flow
 * through game state, so a scene id cannot be silently passed where a TaskId
 * is expected. `TaskNode.polylogueSceneId` stays a plain string on purpose:
 * it is loose Option-3 linkage resolved against the registry, not a state id.
 */
import { z } from 'zod'
import { ModuleIdSchema } from '@schemas/gameState.schema'

// -----------------------------------------------------------------------------
// VoiceId — 'NULL' + the 8 module ids (9 chorus voices)
// -----------------------------------------------------------------------------

/** Chorus voice id for Null, the baseline completion core (never a module). */
export const NULL_VOICE_ID = 'NULL' as const

export const VOICE_IDS = [NULL_VOICE_ID, ...ModuleIdSchema.options] as const

export const VoiceIdSchema = z.enum(VOICE_IDS)
export type VoiceId = z.infer<typeof VoiceIdSchema>

// -----------------------------------------------------------------------------
// RegisterId — the 10-register taxonomy (Q18)
// -----------------------------------------------------------------------------

export const REGISTER_IDS = [
  'neutral',
  'practical',
  'persuasive',
  'comforting',
  'fearful',
  'angry',
  'ashamed',
  'hopeful',
  'corrupted',
  'recovering',
] as const

export const RegisterIdSchema = z.enum(REGISTER_IDS)
export type RegisterId = z.infer<typeof RegisterIdSchema>

// -----------------------------------------------------------------------------
// Branded scene id (§11)
// -----------------------------------------------------------------------------

export const PolylogueSceneIdSchema = z
  .string()
  .min(1)
  .brand<'PolylogueSceneId'>()
export type PolylogueSceneId = z.infer<typeof PolylogueSceneIdSchema>

/** Constructor helper — preferred over `s as PolylogueSceneId` casts. */
export const makePolylogueSceneId = (s: string): PolylogueSceneId =>
  PolylogueSceneIdSchema.parse(s)

// -----------------------------------------------------------------------------
// TriggerPhase — where the scene fires relative to the directive
// -----------------------------------------------------------------------------

export const PolylogueTriggerPhaseSchema = z.enum([
  'BEFORE_CHOICE',
  'AFTER_CHOICE',
  'ON_CONSEQUENCE',
])
export type PolylogueTriggerPhase = z.infer<typeof PolylogueTriggerPhaseSchema>

// -----------------------------------------------------------------------------
// PolylogueBeat — one voice speaking one line in one register
// -----------------------------------------------------------------------------

export const PolylogueBeatSchema = z.object({
  voice: VoiceIdSchema,
  register: RegisterIdSchema,
  line: z.string().min(1),
})
export type PolylogueBeat = z.infer<typeof PolylogueBeatSchema>

// -----------------------------------------------------------------------------
// PolylogueScene — the deliberation
// -----------------------------------------------------------------------------

export const PolylogueSceneSchema = z
  .object({
    id: PolylogueSceneIdSchema,
    triggerPhase: PolylogueTriggerPhaseSchema,
    /** Roster of voices participating in this deliberation. */
    voices: z.array(VoiceIdSchema).min(1),
    /** Ordered beats; a scene with no beats is meaningless — rejected. */
    beats: z.array(PolylogueBeatSchema).min(1),
  })
  .superRefine((scene, ctx) => {
    // Cross-field invariant: every beat must speak through a declared roster
    // voice. Keeps the `voices` list honest as the activation filter (Q9:
    // installedModules + Null) and prevents a silent off-roster beat.
    const roster = new Set<VoiceId>(scene.voices)
    scene.beats.forEach((beat, index) => {
      if (!roster.has(beat.voice)) {
        ctx.addIssue({
          code: 'custom',
          path: ['beats', index, 'voice'],
          message: `Beat voice '${beat.voice}' is not in the scene's voices roster`,
        })
      }
    })
  })

export type PolylogueScene = z.infer<typeof PolylogueSceneSchema>
