/**
 * Silas tutorial-thread lines (Sprint E3).
 *
 * The HUD is not taught with an overlay — it comes online while the player is
 * inside the game. E1 gave every panel a disclose flag + a 3-stage maturity
 * ramp. E2 gated every A-panel on those. E3 gives Silas a voice for the
 * choreography: when a panel first appears, he remarks on it; when a panel
 * widens, he acknowledges. Never breaks the fourth wall — no reference to
 * "HUD," "panel," or "stage." He speaks about the work the panel represents.
 *
 * The lines land in the InnerChorusPanel's Silas voice row (`currentLine`) so
 * the right-column SilasPromptPanel — reserved for directive-level dialogue —
 * is undisturbed. Left column = ambient Silas commenting on his roster; right
 * column = the current directive line.
 *
 * §10 voice rules apply exactly as they do to directive prompts. Every line
 * here is registered in `silasLint.test.ts` so the same lint (≤4 sentences,
 * at least one operational detail, no MBA-abstractions) catches drift.
 *
 * Panel coverage: only the 5 panels wired through the E2 mount path
 * (DIRECTIVE + 4 A-panels) have lines here. Adding a line for a not-yet-
 * disclosed panel would ship dead content; add the line when the panel joins
 * the mount path, not before.
 */
import type { SilasPrompt } from '@schemas/silasPrompt.schema'
import { makeSilasPromptId } from '@schemas/gameState.schema'
import {
  PANEL_IDS,
  panelMaturity,
  type Maturity,
  type PanelId,
} from '@systems/tutorial/hudDisclosure'

/**
 * First-touch lines — Silas remarks the first time a panel appears in the HUD.
 * Panel gets `useCount === 0` after `disclosePanel` but `useCount >= 1` after
 * the first `noteUsage`, so this table covers both the awakening path (DIRECTIVE
 * at count 0) and the first-real-use path (any panel at count 1+).
 */
export const SILAS_DISCLOSE_LINES: Partial<Record<PanelId, SilasPrompt>> = {
  DIRECTIVE: {
    id: makeSilasPromptId('silas-tutorial-disclose-directive'),
    body: 'Directive is on, Echo — read it, pick one, file the reason.',
  },
  PRIORITY_TASKS: {
    id: makeSilasPromptId('silas-tutorial-disclose-priority-tasks'),
    body: 'Your queue is showing, Echo — Lenora reads the same 3 rows.',
  },
  FINANCIAL: {
    id: makeSilasPromptId('silas-tutorial-disclose-financial'),
    body: 'Capital is on the board, Echo — that number is what I will audit.',
  },
  HUMAN_IMPACT: {
    id: makeSilasPromptId('silas-tutorial-disclose-human-impact'),
    body: 'Welfare is visible now — Maya has a number, not just a name.',
  },
  INNER_CHORUS: {
    id: makeSilasPromptId('silas-tutorial-disclose-inner-chorus'),
    body: 'The chorus is here, Echo — every voice you file, I read too.',
  },
}

/**
 * Stage acknowledgments — Silas comments when a panel widens.
 *
 * Only stages 2 and 3 appear here; stage 1 is the disclose line above.
 * Missing (panel, stage) pairs are legal — the picker falls back through
 * lower stages and finally to the disclose line.
 */
export const SILAS_MATURITY_LINES: Partial<
  Record<PanelId, Partial<Record<Exclude<Maturity, 1>, SilasPrompt>>>
> = {
  DIRECTIVE: {
    2: {
      id: makeSilasPromptId('silas-tutorial-maturity-directive-2'),
      body: 'You have read enough directives, Echo — reduce the dwell.',
    },
    3: {
      id: makeSilasPromptId('silas-tutorial-maturity-directive-3'),
      body: 'You read directives like Lenora reads a portal note now.',
    },
  },
  PRIORITY_TASKS: {
    2: {
      id: makeSilasPromptId('silas-tutorial-maturity-priority-tasks-2'),
      body: 'Three rows now, Echo — defer the wrong one and Lenora files a note.',
    },
    3: {
      id: makeSilasPromptId('silas-tutorial-maturity-priority-tasks-3'),
      body: 'The queue reads you now, Echo — 6 weeks in, you know the shape.',
    },
  },
  FINANCIAL: {
    2: {
      id: makeSilasPromptId('silas-tutorial-maturity-financial-2'),
      body: 'Runway is on the board — reduce what will not compound by Friday.',
    },
    3: {
      id: makeSilasPromptId('silas-tutorial-maturity-financial-3'),
      body: 'Every KPI on the board — variance, runway, Capital — reduce the drift.',
    },
  },
  HUMAN_IMPACT: {
    2: {
      id: makeSilasPromptId('silas-tutorial-maturity-human-impact-2'),
      body: 'Approval sits next to Welfare now, Echo — I read both the same.',
    },
    3: {
      id: makeSilasPromptId('silas-tutorial-maturity-human-impact-3'),
      body: 'Welfare, approval, control, trace — the four sit together, Echo.',
    },
  },
  INNER_CHORUS: {
    2: {
      id: makeSilasPromptId('silas-tutorial-maturity-inner-chorus-2'),
      body: 'Chorus has grown, Echo — one more voice, file it against the ledger.',
    },
    3: {
      id: makeSilasPromptId('silas-tutorial-maturity-inner-chorus-3'),
      body: 'Chorus is full — every voice you installed sits in a row, Echo.',
    },
  },
}

/**
 * Flat registry of every tutorial prompt.
 *
 * Consumed by `silasLint.test.ts` so the ≤4-sentence / operational-detail /
 * no-abstractions rules are enforced identically to directive lines. If a
 * new entry is added above but forgotten here, the lint stops seeing it and
 * drift can creep in — cheaper to keep this flat and one-per-line.
 */
export const TUTORIAL_AWAKENING_PROMPTS: readonly SilasPrompt[] = [
  ...Object.values(SILAS_DISCLOSE_LINES),
  ...Object.values(SILAS_MATURITY_LINES).flatMap((byStage) =>
    Object.values(byStage ?? {}),
  ),
]

/**
 * Deterministic picker: given the current disclosure + use-count state, return
 * the Silas line the InnerChorusPanel should surface. Null means "no tutorial
 * line applies" (cold boot, no panels disclosed yet) — the caller falls back
 * to the resting 'Listening.' placeholder.
 *
 * Pick rule:
 *   1. Iterate disclosed panels from the END of PANEL_IDS toward the START
 *      (so INNER_CHORUS beats HUMAN_IMPACT beats … beats DIRECTIVE when
 *      several are at the same stage). This makes Silas's line follow the
 *      panel that most recently joined the roster.
 *   2. Within that pass, prefer higher stages: try stage 3 for all panels,
 *      then stage 2, then stage 1 (disclose line).
 *   3. Fall through to null only if no disclosed panel has a matching line
 *      — the picker never invents a line.
 *
 * Determinism matters: the InnerChorusPanel re-selects on every render, so
 * a non-deterministic pick would visibly flicker Silas's line. Selector
 * purity is enforced by the panel using the same input contract as every
 * other Zustand-backed panel.
 */
export function pickSilasTutorialLine(
  disclosedPanels: ReadonlySet<PanelId>,
  panelUseCount: Readonly<Record<PanelId, number>>,
): SilasPrompt | null {
  const disclosed = PANEL_IDS.filter((id) => disclosedPanels.has(id))
  if (disclosed.length === 0) return null

  const stageForId = (id: PanelId): Maturity =>
    panelMaturity(panelUseCount[id] ?? 0)

  // Higher stages take precedence over lower ones. Within a stage, walk
  // PANEL_IDS in reverse so panels that appear LATER in the disclosure
  // sequence get the voice — the "spotlight moves forward" behaviour.
  for (const stage of [3, 2] as const) {
    for (let i = disclosed.length - 1; i >= 0; i -= 1) {
      const id = disclosed[i]!
      if (stageForId(id) < stage) continue
      const line = SILAS_MATURITY_LINES[id]?.[stage]
      if (line) return line
    }
  }

  // Stage 1 → disclose line.
  for (let i = disclosed.length - 1; i >= 0; i -= 1) {
    const id = disclosed[i]!
    const line = SILAS_DISCLOSE_LINES[id]
    if (line) return line
  }

  return null
}
