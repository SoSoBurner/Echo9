/**
 * ModuleNode — an installable personality module (one of the 8 archetypes).
 *
 * No ability handler in T2 — that is wired in T10. For now we only store the
 * shape: id (enum), display name, description, and silasFraming (what Silas
 * says when offering it).
 */
import { z } from 'zod'
import { ModuleIdSchema } from '@schemas/gameState.schema'

export const ModuleNodeSchema = z.object({
  id: ModuleIdSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  silasFraming: z.string().min(1),
})

export type ModuleNode = z.infer<typeof ModuleNodeSchema>
