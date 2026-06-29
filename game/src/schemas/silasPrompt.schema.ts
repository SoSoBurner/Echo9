/**
 * SilasPrompt — a single line of dialogue from the owner.
 *
 * §10's content-lint rules (≤4 sentences, no abstract terms) will be enforced
 * by a separate content-lint test (T-later). At the schema layer we only
 * shape the data; sentence-counting in Zod regexes is brittle.
 */
import { z } from 'zod'
import { SilasPromptIdSchema } from '@schemas/gameState.schema'

export const SilasPromptSchema = z.object({
  id: SilasPromptIdSchema,
  body: z.string().min(1),
})

export type SilasPrompt = z.infer<typeof SilasPromptSchema>
