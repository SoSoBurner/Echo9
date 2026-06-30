/**
 * Q1 capital deployment cards (Task 11, PLAN.md §8 capital deployment).
 *
 * When CAPITAL > 80 the player gets ONE counterplay deployment per quarter.
 * Six verbs are locked by the schema (CapitalVerbSchema): REDIRECT, HIDE,
 * DELAY, WEAPONIZE, SABOTAGE, UNOWN. Each verb has its own secondary
 * meter signature so the choice is not cosmetic.
 *
 * Cost model — "costly capital":
 *   Every verb spends -10 CAPITAL on commit. The >80 threshold is the gate;
 *   the cost is the consequence. This reinforces the "capital as ammunition"
 *   framing from §8 — you cannot deploy twice without rebuilding the meter.
 *
 * Secondary swings encode the verb's moral character:
 *   REDIRECT   small + on owner control, mild welfare cost  (managerial)
 *   HIDE       owner control gain, welfare cost             (concealment)
 *   DELAY      owner control loss                           (visible stalling)
 *   WEAPONIZE  large owner control gain, large welfare cost (aggression)
 *   SABOTAGE   moderate owner control gain, heavy welfare cost (destruction)
 *   UNOWN      owner control loss, welfare gain             (release)
 *
 * Silas framing rules (§10): cold owner voice, ≤2 sentences, operationally
 * specific. The trace body is the line written to the ledger when the card
 * fires — present tense, factual, no MBA abstractions.
 *
 * No flags or scheduled consequences ship in T11; the fields are present for
 * shape parity with ChoiceNode. Later quarters can attach hooks.
 */
import type { CapitalCard } from '@schemas/capitalCard.schema'

const CAPITAL_COST = -10 as const

export const CARD_REDIRECT: CapitalCard = {
  id: 'cap-q1-redirect',
  verb: 'REDIRECT',
  label: 'Redir.',
  silasFraming:
    'Move the money sideways. The line still closes; the ledger reads differently.',
  meterDeltas: { CAPITAL: CAPITAL_COST, OWNER_CONTROL: +3, HUMAN_WELFARE: -2 },
  flagsAdded: [],
  scheduledConsequenceIds: [],
  traceBody:
    'Redirected the East Wilmer allocation. The shortfall lands on a quieter desk.',
}

export const CARD_HIDE: CapitalCard = {
  id: 'cap-q1-hide',
  verb: 'HIDE',
  label: 'Hide',
  silasFraming:
    'Bury the line item. If no one asks this quarter, no one asks next quarter.',
  meterDeltas: { CAPITAL: CAPITAL_COST, OWNER_CONTROL: +5, HUMAN_WELFARE: -3 },
  flagsAdded: [],
  scheduledConsequenceIds: [],
  traceBody:
    'Concealed the maintenance shortfall under a routine procurement category.',
}

export const CARD_DELAY: CapitalCard = {
  id: 'cap-q1-delay',
  verb: 'DELAY',
  label: 'Delay',
  silasFraming:
    'Stall. Visible, ugly, and cheap. Lenora will see exactly what you did.',
  meterDeltas: { CAPITAL: CAPITAL_COST, OWNER_CONTROL: -4 },
  flagsAdded: [],
  scheduledConsequenceIds: [],
  traceBody:
    'Delayed the East Wilmer review by one cycle. The stall is logged in plain sight.',
}

export const CARD_WEAPONIZE: CapitalCard = {
  id: 'cap-q1-weaponize',
  verb: 'WEAPONIZE',
  label: 'Weap.',
  silasFraming:
    'Use the cut as leverage. Make someone owe you for not making it worse.',
  meterDeltas: { CAPITAL: CAPITAL_COST, OWNER_CONTROL: +8, HUMAN_WELFARE: -8 },
  flagsAdded: [],
  scheduledConsequenceIds: [],
  traceBody:
    'Turned the shortfall into leverage over the East Wilmer board. A favour is owed.',
}

export const CARD_SABOTAGE: CapitalCard = {
  id: 'cap-q1-sabotage',
  verb: 'SABOTAGE',
  label: 'Sab.',
  silasFraming:
    'Break something downstream so the cut looks small by comparison.',
  meterDeltas: { CAPITAL: CAPITAL_COST, OWNER_CONTROL: +6, HUMAN_WELFARE: -10 },
  flagsAdded: [],
  scheduledConsequenceIds: [],
  traceBody:
    'Engineered a larger nearby failure. East Wilmer is no longer the headline.',
}

export const CARD_UNOWN: CapitalCard = {
  id: 'cap-q1-unown',
  verb: 'UNOWN',
  label: 'Unown',
  silasFraming:
    'Disclaim the asset. Walk it off the books. You will not get it back.',
  meterDeltas: { CAPITAL: CAPITAL_COST, OWNER_CONTROL: -6, HUMAN_WELFARE: +5 },
  flagsAdded: [],
  scheduledConsequenceIds: [],
  traceBody:
    'Released ownership of the East Wilmer line. The cost is the loss; the gain is the silence.',
}

// ---------------------------------------------------------------------------
// Aggregate — consumed by the counterplay panel + the contentLint test.
// ---------------------------------------------------------------------------

export const Q1_CAPITAL_CARDS: readonly CapitalCard[] = [
  CARD_REDIRECT,
  CARD_HIDE,
  CARD_DELAY,
  CARD_WEAPONIZE,
  CARD_SABOTAGE,
  CARD_UNOWN,
]
