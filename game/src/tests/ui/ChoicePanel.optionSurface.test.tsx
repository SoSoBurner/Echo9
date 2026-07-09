/**
 * ChoicePanel render tests for the S2 option surface (Q44 rank-deepened tiers).
 *
 * The panel now renders DisplayOption[] (from optionSurface) instead of raw
 * ChoiceNode[]. Contract under test:
 *   - base options keep the existing radio semantics (role=radio, badge, label)
 *   - a MODULE_VERB option shows a voice identity chip like [MOURNER · REVEAL]
 *   - a conflict variant additionally shows the "— conflicts with directive —"
 *     rule line
 *   - committing a module-verb option reports the underlying authored ChoiceId
 *     (the seam that keeps resolveChoice() untouched)
 */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import React from 'react'
import { ChoicePanel } from '@ui/choices/ChoicePanel'
import type { DisplayOption } from '@systems/consciousness/optionSurface'
import { makeChoiceId } from '@schemas/gameState.schema'

const BASE_OPTION: DisplayOption = {
  key: 'choice-base-01',
  choiceId: makeChoiceId('choice-base-01'),
  label: 'Reduce by 40%',
  meterDeltas: { CAPITAL: 12 },
  kind: 'BASE',
}

const VERB_OPTION: DisplayOption = {
  key: 'verb:MOURNER:choice-base-01',
  choiceId: makeChoiceId('choice-base-01'),
  label: 'Say her name in the filing.',
  meterDeltas: { CAPITAL: 12 },
  kind: 'MODULE_VERB',
  moduleId: 'MOURNER',
  verb: 'REVEAL',
}

const CONFLICT_OPTION: DisplayOption = {
  key: 'verb:DEFENDER:choice-base-01',
  choiceId: makeChoiceId('choice-base-01'),
  label: 'Refuse the cut entirely.',
  meterDeltas: { CAPITAL: 12 },
  kind: 'MODULE_VERB',
  moduleId: 'DEFENDER',
  verb: 'HOLD',
  conflictsWithDirective: true,
}

describe('ChoicePanel — option surface rendering', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders every option as a radio in the radiogroup', () => {
    render(
      React.createElement(ChoicePanel, {
        options: [BASE_OPTION, VERB_OPTION, CONFLICT_OPTION],
        onCommit: () => {},
      }),
    )
    expect(screen.getByRole('radiogroup', { name: /choose a directive response/i })).toBeTruthy()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('shows the voice identity chip [MOURNER · REVEAL] on a module-verb option', () => {
    render(
      React.createElement(ChoicePanel, {
        options: [BASE_OPTION, VERB_OPTION],
        onCommit: () => {},
      }),
    )
    expect(screen.getByText('[MOURNER · REVEAL]')).toBeInTheDocument()
  })

  it('does not render a chip or conflict rule on base options', () => {
    render(
      React.createElement(ChoicePanel, {
        options: [BASE_OPTION],
        onCommit: () => {},
      }),
    )
    expect(screen.queryByText(/·/)).toBeNull()
    expect(screen.queryByText(/conflicts with directive/i)).toBeNull()
  })

  it('shows the conflict rule line only on conflict variants', () => {
    render(
      React.createElement(ChoicePanel, {
        options: [BASE_OPTION, VERB_OPTION, CONFLICT_OPTION],
        onCommit: () => {},
      }),
    )
    const rules = screen.getAllByText(/— conflicts with directive —/i)
    expect(rules).toHaveLength(1)
  })

  it('committing a module-verb option reports the underlying authored ChoiceId', () => {
    const onCommit = vi.fn()
    render(
      React.createElement(ChoicePanel, {
        options: [BASE_OPTION, VERB_OPTION],
        onCommit,
      }),
    )
    const radios = screen.getAllByRole('radio')
    const verbRadio = radios[1]
    if (!verbRadio) throw new Error('verb radio missing')
    fireEvent.click(verbRadio)
    fireEvent.keyDown(verbRadio, { key: 'Enter' })
    expect(onCommit).toHaveBeenCalledWith(makeChoiceId('choice-base-01'))
  })
})
