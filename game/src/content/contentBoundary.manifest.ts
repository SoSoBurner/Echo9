/**
 * END-OF-CONTENT BOUNDARY — single source of truth for "the last authored
 * consequence-hook of the currently shipped demo." Move this one line to
 * move the ending. UI, engine, and persistence all read from here.
 */
import type { ConsequenceId } from '@schemas/gameState.schema'
import { makeConsequenceId } from '@schemas/gameState.schema'

export const END_OF_CONTENT_HOOK_ID: ConsequenceId =
  makeConsequenceId('cons-pediatric-silence-01')
