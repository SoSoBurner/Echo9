/**
 * InspectionScene — Silas's questioning during the INSPECTION phase.
 *
 * `id` is a plain string for the slice (not branded); inspection scenes are
 * scoped to the slice and we don't need a nominal type to distinguish them
 * from other ids in the same code path. `postures` is the list of possible
 * player responses; each may move meters.
 */
import { z } from 'zod'
import { MeterKeySchema } from '@schemas/gameState.schema'

export const InspectionPostureSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  meterDeltas: z.partialRecord(MeterKeySchema, z.number()),
})

export type InspectionPosture = z.infer<typeof InspectionPostureSchema>

export const InspectionSceneSchema = z.object({
  id: z.string().min(1),
  silasQuestion: z.string().min(1),
  postures: z.array(InspectionPostureSchema).min(2),
})

export type InspectionScene = z.infer<typeof InspectionSceneSchema>
