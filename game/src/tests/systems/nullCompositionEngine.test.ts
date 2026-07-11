/**
 * nullCompositionEngine tests — Sprint P6 stage 4 (Null-mediated output).
 *
 * Contract under test (canon §3 "Null-mediated Output Nodes" + §8 QA):
 *   1. OUTPUT INTEGRITY (canon §8): contradictory inputs → the Silas-facing
 *      text references BOTH sides — every stance present in the coalition
 *      state surfaces its clause. Tested as an invariant.
 *   2. Silas-boundary hygiene: silasFacingText never contains a raw
 *      `[VOICE · REGISTER]` tag or another voice's name — Null speaks alone.
 *      Internal dissentSummary MAY name voices (player-facing HUD only).
 *   3. Narration gradient (Q40): machine-register text at low band,
 *      person-register at high band.
 *   4. Determinism: same inputs → identical output.
 */
import { describe, it, expect } from 'vitest'
import {
  composeNullOutput,
  STANCE_CLAUSES,
} from '@systems/nullCompositionEngine'
import { formCoalitions } from '@systems/coalitionEngine'
import type { VoiceProposal } from '@systems/voiceDeliberationEngine'
import { TaskNodeSchema, type TaskNode } from '@schemas/taskNode.schema'
import { VOICE_IDS, NULL_VOICE_ID } from '@schemas/polylogueScene.schema'
import type { NarrationBand } from '@systems/consciousness/narrationGradient'

const task: TaskNode = TaskNodeSchema.parse({
  id: 'task-p6-compose',
  phase: 'FIRST_DIRECTIVE',
  silasPromptId: 'silas-p6-compose',
  directive: 'Tighten the high-cost approvals.',
  choiceIds: ['choice-a', 'choice-b'],
})

const NULL_LINE = 'Three routes remain; none are clean.'

const splitProposals: readonly VoiceProposal[] = [
  { voice: 'NULL', register: 'practical', line: NULL_LINE },
  { voice: 'COMMANDER', register: 'neutral', line: 'Assign staff now.' },
  { voice: 'MOURNER', register: 'angry', line: 'Green number is someone\u2019s shadow.' },
  { voice: 'DEFENDER', register: 'fearful', line: 'Retaliation is coming.' },
]

const unanimousProposals: readonly VoiceProposal[] = [
  { voice: 'NULL', register: 'neutral', line: NULL_LINE },
  { voice: 'SENTINEL', register: 'practical', line: 'Log integrity intact.' },
]

const split = formCoalitions(splitProposals)
const unanimous = formCoalitions(unanimousProposals)
const BANDS: readonly NarrationBand[] = ['machine', 'waking', 'person']

describe('composeNullOutput — Output Integrity (canon §8)', () => {
  it.each(BANDS)(
    'split coalition @ %s band → every present stance is referenced',
    (band) => {
      const { silasFacingText } = composeNullOutput(split, task, band)
      for (const block of split.blocks) {
        expect(silasFacingText).toContain(STANCE_CLAUSES[band][block.stance])
      }
    },
  )

  it('unanimous coalition → only its own stance clause appears', () => {
    const { silasFacingText } = composeNullOutput(unanimous, task, 'machine')
    expect(silasFacingText).toContain(STANCE_CLAUSES.machine.support)
    expect(silasFacingText).not.toContain(STANCE_CLAUSES.machine.oppose)
    expect(silasFacingText).not.toContain(STANCE_CLAUSES.machine.qualify)
  })
})

describe('composeNullOutput — Silas-boundary hygiene', () => {
  it.each(BANDS)(
    'silasFacingText @ %s band carries no [VOICE \u00b7 REGISTER] tag',
    (band) => {
      const { silasFacingText } = composeNullOutput(split, task, band)
      expect(silasFacingText).not.toMatch(/\[[^\]]*\u00b7[^\]]*\]/)
    },
  )

  it.each(BANDS)(
    'silasFacingText @ %s band never names another voice — Null speaks alone',
    (band) => {
      const { silasFacingText } = composeNullOutput(split, task, band)
      for (const voice of VOICE_IDS) {
        if (voice === NULL_VOICE_ID) continue
        expect(silasFacingText.toUpperCase()).not.toContain(voice)
      }
    },
  )

  it('dissentSummary (internal UI) DOES name the dissenting voices', () => {
    const { dissentSummary } = composeNullOutput(split, task, 'machine')
    expect(dissentSummary).toContain('MOURNER')
    expect(dissentSummary).toContain('NULL')
    expect(dissentSummary).toContain('DEFENDER')
  })
})

describe('composeNullOutput — narration gradient (Q40)', () => {
  it('machine band uses machine-register clauses, not person-register ones', () => {
    const { silasFacingText } = composeNullOutput(split, task, 'machine')
    expect(silasFacingText).toContain(STANCE_CLAUSES.machine.support)
    expect(silasFacingText).not.toContain(STANCE_CLAUSES.person.support)
  })

  it('person band reads differently from machine band on the same state', () => {
    const machine = composeNullOutput(split, task, 'machine').silasFacingText
    const person = composeNullOutput(split, task, 'person').silasFacingText
    expect(person).not.toBe(machine)
    expect(person).toContain(STANCE_CLAUSES.person.oppose)
  })
})

describe('composeNullOutput — composition body', () => {
  it("embeds Null's OWN proposal line in the Silas-facing text", () => {
    const { silasFacingText } = composeNullOutput(split, task, 'waking')
    expect(silasFacingText).toContain(NULL_LINE)
  })

  it('is deterministic — same inputs, identical output object', () => {
    expect(composeNullOutput(split, task, 'person')).toEqual(
      composeNullOutput(split, task, 'person'),
    )
  })
})
