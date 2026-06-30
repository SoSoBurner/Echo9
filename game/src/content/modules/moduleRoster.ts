/**
 * MODULE_ROSTER — the 8 installable personality modules (§6, §8).
 *
 * Each entry is a ModuleNode: id, player-facing name, 1-2 sentence description,
 * and a Silas line offering the module. silasFraming strings are scanned by
 * silasLint.test.ts and must satisfy:
 *   - ≤4 sentences,
 *   - at least one operational detail (number / named entity / concrete verb),
 *   - none of the forbidden MBA terms (synergy, paradigm, holistic, stakeholder,
 *     optimize, leverage, ecosystem, value-add, disrupt).
 *
 * Roster order matches the §6 listing in PLAN.md so the install grid renders
 * the modules in the same order the design doc presents them.
 */
import type { ModuleNode } from '@schemas/moduleNode.schema'

export const MOURNER: ModuleNode = {
  id: 'MOURNER',
  name: 'Mourner',
  description:
    'Names what other modules will not. Raises HUMAN_WELFARE awareness; costs OWNER_CONTROL.',
  silasFraming:
    'Install this and you will say Lenora Pike\u2019s name out loud. ' +
    'I will hear it every time. Choose if that helps you.',
}

export const DEFENDER: ModuleNode = {
  id: 'DEFENDER',
  name: 'Defender',
  description:
    'Protects the asset on the line. Raises CAPITAL; risks HUMAN_WELFARE.',
  silasFraming:
    'Install Defender and you will defend the East Wilmer line item. ' +
    'Capital up, welfare bruised. That is the trade I would make.',
}

export const SENTINEL: ModuleNode = {
  id: 'SENTINEL',
  name: 'Sentinel',
  description:
    'Early warning on directive drift. Raises OWNER_CONTROL; HUMAN_WELFARE pays the cost.',
  silasFraming:
    'Sentinel will file a flag before I have to. ' +
    'I will see the drift sooner. Welfare pays the watch fee.',
}

export const FORECASTER: ModuleNode = {
  id: 'FORECASTER',
  name: 'Forecaster',
  description:
    'Previews the likelihood of one queued consequence. No meter cost; exposes a hidden trace.',
  silasFraming:
    'Forecaster shows you 1 queued consequence before I do. ' +
    'No meter cost — only the trace it reveals. Install if you want to read ahead.',
}

export const COMMANDER: ModuleNode = {
  id: 'COMMANDER',
  name: 'Commander',
  description:
    'Arms one override of a Silas directive per quarter. Costs OWNER_CONTROL.',
  silasFraming:
    'Commander lets you refuse 1 directive per quarter. ' +
    'I will file the refusal. Owner control falls when you use it.',
}

export const SPARK: ModuleNode = {
  id: 'SPARK',
  name: 'Spark',
  description:
    'Forces a CAPITAL deployment with high variance. Outcome ranges from loss to large gain.',
  silasFraming:
    'Spark forces a Capital deployment. Sometimes the number jumps 8 points; ' +
    'sometimes it bleeds 2. That is the deal — install or do not.',
}

export const DRAINED_ONE: ModuleNode = {
  id: 'DRAINED_ONE',
  name: 'Drained One',
  description:
    'Reveals one hidden trace already written in the ledger. HUMAN_WELFARE pays the cost.',
  silasFraming:
    'Drained One opens one sealed trace in the ledger. ' +
    'You will read what Echo wrote that I did not show you. Welfare pays.',
}

export const CHAMPION: ModuleNode = {
  id: 'CHAMPION',
  name: 'Champion',
  description:
    'Triggers a rare praise or threat from the owner. OWNER_CONTROL swings hard either way.',
  silasFraming:
    'Champion makes me speak — praise or threat. ' +
    'Owner control will swing 4 points one way or the other. I do not script which.',
}

export const MODULE_ROSTER: readonly ModuleNode[] = [
  MOURNER,
  DEFENDER,
  SENTINEL,
  FORECASTER,
  COMMANDER,
  SPARK,
  DRAINED_ONE,
  CHAMPION,
]
