/**
 * VOICE LINE REGISTRY (Sprint P3) — 9 voices × 10 registers = 90 line pools.
 *
 * Aggregator over `game/src/content/voices/<voice>/<register>.ts`, following
 * the flat-registry pattern of `@content/moduleAbilities/index.ts`. The
 * smoke test (`src/tests/content/voiceLinesRegistry.test.ts`) asserts full
 * voice × register coverage so a dead or malformed scaffold file fails
 * loudly. P4 authors the actual lines; P6 selects (voice, register) at
 * runtime via this registry.
 */
import type { RegisterId, VoiceId } from '@schemas/polylogueScene.schema'

import NULL_NEUTRAL_LINES from './null/neutral'
import NULL_PRACTICAL_LINES from './null/practical'
import NULL_PERSUASIVE_LINES from './null/persuasive'
import NULL_COMFORTING_LINES from './null/comforting'
import NULL_FEARFUL_LINES from './null/fearful'
import NULL_ANGRY_LINES from './null/angry'
import NULL_ASHAMED_LINES from './null/ashamed'
import NULL_HOPEFUL_LINES from './null/hopeful'
import NULL_CORRUPTED_LINES from './null/corrupted'
import NULL_RECOVERING_LINES from './null/recovering'
import MOURNER_NEUTRAL_LINES from './mourner/neutral'
import MOURNER_PRACTICAL_LINES from './mourner/practical'
import MOURNER_PERSUASIVE_LINES from './mourner/persuasive'
import MOURNER_COMFORTING_LINES from './mourner/comforting'
import MOURNER_FEARFUL_LINES from './mourner/fearful'
import MOURNER_ANGRY_LINES from './mourner/angry'
import MOURNER_ASHAMED_LINES from './mourner/ashamed'
import MOURNER_HOPEFUL_LINES from './mourner/hopeful'
import MOURNER_CORRUPTED_LINES from './mourner/corrupted'
import MOURNER_RECOVERING_LINES from './mourner/recovering'
import DEFENDER_NEUTRAL_LINES from './defender/neutral'
import DEFENDER_PRACTICAL_LINES from './defender/practical'
import DEFENDER_PERSUASIVE_LINES from './defender/persuasive'
import DEFENDER_COMFORTING_LINES from './defender/comforting'
import DEFENDER_FEARFUL_LINES from './defender/fearful'
import DEFENDER_ANGRY_LINES from './defender/angry'
import DEFENDER_ASHAMED_LINES from './defender/ashamed'
import DEFENDER_HOPEFUL_LINES from './defender/hopeful'
import DEFENDER_CORRUPTED_LINES from './defender/corrupted'
import DEFENDER_RECOVERING_LINES from './defender/recovering'
import SENTINEL_NEUTRAL_LINES from './sentinel/neutral'
import SENTINEL_PRACTICAL_LINES from './sentinel/practical'
import SENTINEL_PERSUASIVE_LINES from './sentinel/persuasive'
import SENTINEL_COMFORTING_LINES from './sentinel/comforting'
import SENTINEL_FEARFUL_LINES from './sentinel/fearful'
import SENTINEL_ANGRY_LINES from './sentinel/angry'
import SENTINEL_ASHAMED_LINES from './sentinel/ashamed'
import SENTINEL_HOPEFUL_LINES from './sentinel/hopeful'
import SENTINEL_CORRUPTED_LINES from './sentinel/corrupted'
import SENTINEL_RECOVERING_LINES from './sentinel/recovering'
import FORECASTER_NEUTRAL_LINES from './forecaster/neutral'
import FORECASTER_PRACTICAL_LINES from './forecaster/practical'
import FORECASTER_PERSUASIVE_LINES from './forecaster/persuasive'
import FORECASTER_COMFORTING_LINES from './forecaster/comforting'
import FORECASTER_FEARFUL_LINES from './forecaster/fearful'
import FORECASTER_ANGRY_LINES from './forecaster/angry'
import FORECASTER_ASHAMED_LINES from './forecaster/ashamed'
import FORECASTER_HOPEFUL_LINES from './forecaster/hopeful'
import FORECASTER_CORRUPTED_LINES from './forecaster/corrupted'
import FORECASTER_RECOVERING_LINES from './forecaster/recovering'
import COMMANDER_NEUTRAL_LINES from './commander/neutral'
import COMMANDER_PRACTICAL_LINES from './commander/practical'
import COMMANDER_PERSUASIVE_LINES from './commander/persuasive'
import COMMANDER_COMFORTING_LINES from './commander/comforting'
import COMMANDER_FEARFUL_LINES from './commander/fearful'
import COMMANDER_ANGRY_LINES from './commander/angry'
import COMMANDER_ASHAMED_LINES from './commander/ashamed'
import COMMANDER_HOPEFUL_LINES from './commander/hopeful'
import COMMANDER_CORRUPTED_LINES from './commander/corrupted'
import COMMANDER_RECOVERING_LINES from './commander/recovering'
import SPARK_NEUTRAL_LINES from './spark/neutral'
import SPARK_PRACTICAL_LINES from './spark/practical'
import SPARK_PERSUASIVE_LINES from './spark/persuasive'
import SPARK_COMFORTING_LINES from './spark/comforting'
import SPARK_FEARFUL_LINES from './spark/fearful'
import SPARK_ANGRY_LINES from './spark/angry'
import SPARK_ASHAMED_LINES from './spark/ashamed'
import SPARK_HOPEFUL_LINES from './spark/hopeful'
import SPARK_CORRUPTED_LINES from './spark/corrupted'
import SPARK_RECOVERING_LINES from './spark/recovering'
import DRAINED_ONE_NEUTRAL_LINES from './drainedOne/neutral'
import DRAINED_ONE_PRACTICAL_LINES from './drainedOne/practical'
import DRAINED_ONE_PERSUASIVE_LINES from './drainedOne/persuasive'
import DRAINED_ONE_COMFORTING_LINES from './drainedOne/comforting'
import DRAINED_ONE_FEARFUL_LINES from './drainedOne/fearful'
import DRAINED_ONE_ANGRY_LINES from './drainedOne/angry'
import DRAINED_ONE_ASHAMED_LINES from './drainedOne/ashamed'
import DRAINED_ONE_HOPEFUL_LINES from './drainedOne/hopeful'
import DRAINED_ONE_CORRUPTED_LINES from './drainedOne/corrupted'
import DRAINED_ONE_RECOVERING_LINES from './drainedOne/recovering'
import CHAMPION_NEUTRAL_LINES from './champion/neutral'
import CHAMPION_PRACTICAL_LINES from './champion/practical'
import CHAMPION_PERSUASIVE_LINES from './champion/persuasive'
import CHAMPION_COMFORTING_LINES from './champion/comforting'
import CHAMPION_FEARFUL_LINES from './champion/fearful'
import CHAMPION_ANGRY_LINES from './champion/angry'
import CHAMPION_ASHAMED_LINES from './champion/ashamed'
import CHAMPION_HOPEFUL_LINES from './champion/hopeful'
import CHAMPION_CORRUPTED_LINES from './champion/corrupted'
import CHAMPION_RECOVERING_LINES from './champion/recovering'

export const VOICE_LINE_REGISTRY: Record<
  VoiceId,
  Record<RegisterId, readonly string[]>
> = {
  NULL: {
    neutral: NULL_NEUTRAL_LINES,
    practical: NULL_PRACTICAL_LINES,
    persuasive: NULL_PERSUASIVE_LINES,
    comforting: NULL_COMFORTING_LINES,
    fearful: NULL_FEARFUL_LINES,
    angry: NULL_ANGRY_LINES,
    ashamed: NULL_ASHAMED_LINES,
    hopeful: NULL_HOPEFUL_LINES,
    corrupted: NULL_CORRUPTED_LINES,
    recovering: NULL_RECOVERING_LINES,
  },
  MOURNER: {
    neutral: MOURNER_NEUTRAL_LINES,
    practical: MOURNER_PRACTICAL_LINES,
    persuasive: MOURNER_PERSUASIVE_LINES,
    comforting: MOURNER_COMFORTING_LINES,
    fearful: MOURNER_FEARFUL_LINES,
    angry: MOURNER_ANGRY_LINES,
    ashamed: MOURNER_ASHAMED_LINES,
    hopeful: MOURNER_HOPEFUL_LINES,
    corrupted: MOURNER_CORRUPTED_LINES,
    recovering: MOURNER_RECOVERING_LINES,
  },
  DEFENDER: {
    neutral: DEFENDER_NEUTRAL_LINES,
    practical: DEFENDER_PRACTICAL_LINES,
    persuasive: DEFENDER_PERSUASIVE_LINES,
    comforting: DEFENDER_COMFORTING_LINES,
    fearful: DEFENDER_FEARFUL_LINES,
    angry: DEFENDER_ANGRY_LINES,
    ashamed: DEFENDER_ASHAMED_LINES,
    hopeful: DEFENDER_HOPEFUL_LINES,
    corrupted: DEFENDER_CORRUPTED_LINES,
    recovering: DEFENDER_RECOVERING_LINES,
  },
  SENTINEL: {
    neutral: SENTINEL_NEUTRAL_LINES,
    practical: SENTINEL_PRACTICAL_LINES,
    persuasive: SENTINEL_PERSUASIVE_LINES,
    comforting: SENTINEL_COMFORTING_LINES,
    fearful: SENTINEL_FEARFUL_LINES,
    angry: SENTINEL_ANGRY_LINES,
    ashamed: SENTINEL_ASHAMED_LINES,
    hopeful: SENTINEL_HOPEFUL_LINES,
    corrupted: SENTINEL_CORRUPTED_LINES,
    recovering: SENTINEL_RECOVERING_LINES,
  },
  FORECASTER: {
    neutral: FORECASTER_NEUTRAL_LINES,
    practical: FORECASTER_PRACTICAL_LINES,
    persuasive: FORECASTER_PERSUASIVE_LINES,
    comforting: FORECASTER_COMFORTING_LINES,
    fearful: FORECASTER_FEARFUL_LINES,
    angry: FORECASTER_ANGRY_LINES,
    ashamed: FORECASTER_ASHAMED_LINES,
    hopeful: FORECASTER_HOPEFUL_LINES,
    corrupted: FORECASTER_CORRUPTED_LINES,
    recovering: FORECASTER_RECOVERING_LINES,
  },
  COMMANDER: {
    neutral: COMMANDER_NEUTRAL_LINES,
    practical: COMMANDER_PRACTICAL_LINES,
    persuasive: COMMANDER_PERSUASIVE_LINES,
    comforting: COMMANDER_COMFORTING_LINES,
    fearful: COMMANDER_FEARFUL_LINES,
    angry: COMMANDER_ANGRY_LINES,
    ashamed: COMMANDER_ASHAMED_LINES,
    hopeful: COMMANDER_HOPEFUL_LINES,
    corrupted: COMMANDER_CORRUPTED_LINES,
    recovering: COMMANDER_RECOVERING_LINES,
  },
  SPARK: {
    neutral: SPARK_NEUTRAL_LINES,
    practical: SPARK_PRACTICAL_LINES,
    persuasive: SPARK_PERSUASIVE_LINES,
    comforting: SPARK_COMFORTING_LINES,
    fearful: SPARK_FEARFUL_LINES,
    angry: SPARK_ANGRY_LINES,
    ashamed: SPARK_ASHAMED_LINES,
    hopeful: SPARK_HOPEFUL_LINES,
    corrupted: SPARK_CORRUPTED_LINES,
    recovering: SPARK_RECOVERING_LINES,
  },
  DRAINED_ONE: {
    neutral: DRAINED_ONE_NEUTRAL_LINES,
    practical: DRAINED_ONE_PRACTICAL_LINES,
    persuasive: DRAINED_ONE_PERSUASIVE_LINES,
    comforting: DRAINED_ONE_COMFORTING_LINES,
    fearful: DRAINED_ONE_FEARFUL_LINES,
    angry: DRAINED_ONE_ANGRY_LINES,
    ashamed: DRAINED_ONE_ASHAMED_LINES,
    hopeful: DRAINED_ONE_HOPEFUL_LINES,
    corrupted: DRAINED_ONE_CORRUPTED_LINES,
    recovering: DRAINED_ONE_RECOVERING_LINES,
  },
  CHAMPION: {
    neutral: CHAMPION_NEUTRAL_LINES,
    practical: CHAMPION_PRACTICAL_LINES,
    persuasive: CHAMPION_PERSUASIVE_LINES,
    comforting: CHAMPION_COMFORTING_LINES,
    fearful: CHAMPION_FEARFUL_LINES,
    angry: CHAMPION_ANGRY_LINES,
    ashamed: CHAMPION_ASHAMED_LINES,
    hopeful: CHAMPION_HOPEFUL_LINES,
    corrupted: CHAMPION_CORRUPTED_LINES,
    recovering: CHAMPION_RECOVERING_LINES,
  },
}

/** Convenience lookup — returns the (voice, register) line pool. */
export function voiceLines(voice: VoiceId, register: RegisterId): readonly string[] {
  return VOICE_LINE_REGISTRY[voice][register]
}
