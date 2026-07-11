/**
 * voiceActivationEngine tests — Sprint P6 stage 1 (activation pool + order).
 *
 * Contract under test (Q9, canon §3 step 3):
 *   1. Pool = NULL + installed module ids ONLY — never uninstalled modules.
 *   2. NULL is always present and always FIRST (it mediates, canon §3 step 5).
 *   3. Task relevance: modules named by the task's `moduleVerbOptions` speak
 *      before non-relevant installed modules (threat-first ordering, §3.4).
 *   4. Within a relevance group: rank desc, then install (insertion) order.
 *   5. A verb option naming an UNINSTALLED module never activates it.
 */
import { describe, it, expect } from 'vitest'
import { runVoiceActivation } from '@systems/voiceActivationEngine'
import type { InstalledModuleRanks } from '@systems/voiceActivationEngine'
import { TaskNodeSchema, type TaskNode } from '@schemas/taskNode.schema'
import { makeChoiceId } from '@schemas/gameState.schema'

function makeTask(
  moduleVerbOptions?: TaskNode['moduleVerbOptions'],
): TaskNode {
  return TaskNodeSchema.parse({
    id: 'task-p6-fixture',
    phase: 'FIRST_DIRECTIVE',
    silasPromptId: 'silas-p6-fixture',
    directive: 'Tighten the high-cost approvals before Friday.',
    choiceIds: ['choice-a', 'choice-b'],
    ...(moduleVerbOptions ? { moduleVerbOptions } : {}),
  })
}

const MOURNER_VERB = {
  moduleId: 'MOURNER' as const,
  verb: 'REVEAL',
  label: 'Reveal the person behind the file number.',
  choiceId: makeChoiceId('choice-a'),
}

describe('runVoiceActivation', () => {
  it('activates only NULL when nothing is installed', () => {
    expect(runVoiceActivation({}, makeTask())).toEqual(['NULL'])
  })

  it('pool is NULL + installed ids only (Q9) — uninstalled modules excluded', () => {
    const installed: InstalledModuleRanks = {
      MOURNER: { rank: 1 },
      SENTINEL: { rank: 1 },
    }
    const active = runVoiceActivation(installed, makeTask())
    expect([...active].sort()).toEqual(['MOURNER', 'NULL', 'SENTINEL'])
    expect(active).not.toContain('CHAMPION')
  })

  it('NULL is always first', () => {
    const installed: InstalledModuleRanks = {
      COMMANDER: { rank: 3 },
      SPARK: { rank: 3 },
    }
    expect(runVoiceActivation(installed, makeTask())[0]).toBe('NULL')
  })

  it('orders installed voices by rank desc', () => {
    const installed: InstalledModuleRanks = {
      MOURNER: { rank: 1 },
      SENTINEL: { rank: 3 },
      DEFENDER: { rank: 2 },
    }
    expect(runVoiceActivation(installed, makeTask())).toEqual([
      'NULL',
      'SENTINEL',
      'DEFENDER',
      'MOURNER',
    ])
  })

  it('breaks rank ties by install (insertion) order', () => {
    const installed: InstalledModuleRanks = {
      SPARK: { rank: 2 },
      MOURNER: { rank: 2 },
    }
    expect(runVoiceActivation(installed, makeTask())).toEqual([
      'NULL',
      'SPARK',
      'MOURNER',
    ])
  })

  it('task-relevant modules (verb options) speak before higher-ranked bystanders', () => {
    const installed: InstalledModuleRanks = {
      SENTINEL: { rank: 3 },
      MOURNER: { rank: 1 },
    }
    const task = makeTask([MOURNER_VERB])
    expect(runVoiceActivation(installed, task)).toEqual([
      'NULL',
      'MOURNER',
      'SENTINEL',
    ])
  })

  it('a verb option for an uninstalled module does not activate it', () => {
    const installed: InstalledModuleRanks = { SENTINEL: { rank: 1 } }
    const task = makeTask([MOURNER_VERB])
    expect(runVoiceActivation(installed, task)).toEqual(['NULL', 'SENTINEL'])
  })

  it('is deterministic — same inputs, same output', () => {
    const installed: InstalledModuleRanks = {
      DEFENDER: { rank: 2 },
      FORECASTER: { rank: 2 },
    }
    const task = makeTask()
    expect(runVoiceActivation(installed, task)).toEqual(
      runVoiceActivation(installed, task),
    )
  })
})
