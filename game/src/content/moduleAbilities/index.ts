/**
 * MODULE ABILITY REGISTRY — flat export of all 8 modules × ranks 1-3 (Task B2).
 *
 * Downstream (Task B4) resolves (moduleId, rank) → ModuleAbility by lookup.
 * Registry test enforces: exactly 24 entries, no duplicate (moduleId, rank),
 * every (module × rank) pair present, every entry parses under schema,
 * unlocksAtRank ≤ rank.
 */
import type { ModuleAbility } from '@schemas/moduleAbility.schema'

import { MOURNER_R1_ABILITY } from './mourner.r1.ability'
import { MOURNER_R2_ABILITY } from './mourner.r2.ability'
import { MOURNER_R3_ABILITY } from './mourner.r3.ability'
import { DEFENDER_R1_ABILITY } from './defender.r1.ability'
import { DEFENDER_R2_ABILITY } from './defender.r2.ability'
import { DEFENDER_R3_ABILITY } from './defender.r3.ability'
import { SENTINEL_R1_ABILITY } from './sentinel.r1.ability'
import { SENTINEL_R2_ABILITY } from './sentinel.r2.ability'
import { SENTINEL_R3_ABILITY } from './sentinel.r3.ability'
import { FORECASTER_R1_ABILITY } from './forecaster.r1.ability'
import { FORECASTER_R2_ABILITY } from './forecaster.r2.ability'
import { FORECASTER_R3_ABILITY } from './forecaster.r3.ability'
import { COMMANDER_R1_ABILITY } from './commander.r1.ability'
import { COMMANDER_R2_ABILITY } from './commander.r2.ability'
import { COMMANDER_R3_ABILITY } from './commander.r3.ability'
import { SPARK_R1_ABILITY } from './spark.r1.ability'
import { SPARK_R2_ABILITY } from './spark.r2.ability'
import { SPARK_R3_ABILITY } from './spark.r3.ability'
import { DRAINED_ONE_R1_ABILITY } from './drained_one.r1.ability'
import { DRAINED_ONE_R2_ABILITY } from './drained_one.r2.ability'
import { DRAINED_ONE_R3_ABILITY } from './drained_one.r3.ability'
import { CHAMPION_R1_ABILITY } from './champion.r1.ability'
import { CHAMPION_R2_ABILITY } from './champion.r2.ability'
import { CHAMPION_R3_ABILITY } from './champion.r3.ability'

export const ALL_MODULE_ABILITIES: readonly ModuleAbility[] = [
  MOURNER_R1_ABILITY,
  MOURNER_R2_ABILITY,
  MOURNER_R3_ABILITY,
  DEFENDER_R1_ABILITY,
  DEFENDER_R2_ABILITY,
  DEFENDER_R3_ABILITY,
  SENTINEL_R1_ABILITY,
  SENTINEL_R2_ABILITY,
  SENTINEL_R3_ABILITY,
  FORECASTER_R1_ABILITY,
  FORECASTER_R2_ABILITY,
  FORECASTER_R3_ABILITY,
  COMMANDER_R1_ABILITY,
  COMMANDER_R2_ABILITY,
  COMMANDER_R3_ABILITY,
  SPARK_R1_ABILITY,
  SPARK_R2_ABILITY,
  SPARK_R3_ABILITY,
  DRAINED_ONE_R1_ABILITY,
  DRAINED_ONE_R2_ABILITY,
  DRAINED_ONE_R3_ABILITY,
  CHAMPION_R1_ABILITY,
  CHAMPION_R2_ABILITY,
  CHAMPION_R3_ABILITY,
] as const
