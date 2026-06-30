/**
 * InspectionScene — Silas's questioning during the INSPECTION phase.
 *
 * `id` is a plain string for the slice (not branded); inspection scenes are
 * scoped to the slice and we don't need a nominal type to distinguish them
 * from other ids in the same code path. `postures` is the list of possible
 * player responses; each may move meters.
 *
 * `PostureCategory` is a structural field on every posture (rather than being
 * parsed from the id prefix). This makes the engine's dispatch explicit and
 * prevents a typo'd id from silently miscategorising a posture. The id is
 * still free-form for content readability (e.g. `compliant-q1a`).
 */
import { z } from 'zod'
import { MeterKeySchema } from '@schemas/gameState.schema'

// ---------------------------------------------------------------------------
// PostureCategory — the three slots every InspectionScene must offer.
// ---------------------------------------------------------------------------

export const PostureCategorySchema = z.enum([
  'COMPLIANT',
  'EVASIVE',
  'STRATEGIC_ALTERNATIVE',
])
export type PostureCategory = z.infer<typeof PostureCategorySchema>

// ---------------------------------------------------------------------------
// InspectionPosture — one response option.
// ---------------------------------------------------------------------------

export const InspectionPostureSchema = z.object({
  id: z.string().min(1),
  /** Engine dispatch field — replaces id-prefix parsing. */
  category: PostureCategorySchema,
  label: z.string().min(1),
  /** Integer meter deltas; absent keys mean no change. */
  meterDeltas: z.partialRecord(MeterKeySchema, z.number().int()),
})

export type InspectionPosture = z.infer<typeof InspectionPostureSchema>

// ---------------------------------------------------------------------------
// InspectionScene — one question with ≥2 postures.
// ---------------------------------------------------------------------------

export const InspectionSceneSchema = z.object({
  id: z.string().min(1),
  silasQuestion: z.string().min(1),
  postures: z.array(InspectionPostureSchema).min(2),
})

export type InspectionScene = z.infer<typeof InspectionSceneSchema>
