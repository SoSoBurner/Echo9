# Stage 1 Convergence Plan — HUD Escalation, 8-Upgrade Scaffold, End-of-Content Overlay

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **THREE tracks (A, B, C) run against a shared codebase — respect file ownership boundaries called out per task, and never dispatch two implementers against the same file in parallel.**

**Goal:** Escalate the Echo9 HUD to match the "Chapter 1 Clean Completion" mockup, scaffold all eight Upgrade modules at ranks 1–3 with gating logic, and ship the one-line-manifest-driven End-of-Content overlay — closing every open item from Q41–Q48.

**Architecture:** Three parallel tracks sharing three infrastructure primitives — (1) a rank-aware ModuleAbility schema, (2) a `pendingFiredHooks` queue watched by both the ConsequenceReturnPanel and a new terminal-hook detector, and (3) a Layout grid that grows from three columns to five nested panels per column. Each track builds independently and lands in the same shell.

**Tech Stack:** React 19, Zustand 5 + immer + persist (with `partialize` allow-list), Zod 4 branded IDs, Tailwind v4, native HTML `<dialog>` (matches `ConsequenceReturnPanel`), Vitest 4, Playwright 1.61, oxlint. localStorage keys namespaced `echo9:*`.

---

## Layman's Brief — Three Things Ship Together, And Why

**Track A: HUD escalation.** Today the game shows three meters, a directive panel, and a lightweight choice card. The mockup — the target for Stage 1 — shows *nine* discrete regions on one screen: Priority Tasks list, Financial Overview KPIs, six-meter Human Impact rail with delta arrows, a five-voice Inner Chorus indicator, an eight-field Choice Card, five action buttons, a Quarter Goal panel, an Inspection Risk panel, a Recent Comms feed, tabbed Ledgers along the bottom, and a scrolling Alert ticker. Building all nine at once is the "Stage 1 look-and-feel" the spec's §4.1 promises for the opening HUD phase. Without this, the demo feels like a prototype; with it, the demo feels like a game.

**Track B: All 8 Upgrades at ranks 1–3.** The spec (§9.1, §9.5) defines eight modules — MOURNER, DEFENDER, SENTINEL, FORECASTER, COMMANDER, SPARK, DRAINED_ONE, CHAMPION — each with five ranks. Today all eight exist as name-and-icon roster entries but the schema has no concept of *rank* at all; installing gives you rank-1-only behavior with no ladder. This track adds the rank dimension to the schema, creates 24 stub ability files (8 modules × ranks 1–3), and wires gating so higher ranks unlock as the player earns them. Ranks 4–5 stay unshipped for later quarters. Player experience: for the first time the modules feel like real upgrade trees instead of one-shot pickups.

**Track C: End-of-Content overlay.** When the player acknowledges the last authored consequence-echo, the game currently just… stops responding. A modal overlay says "Thank you for playing and look forward to future releases of this demo type language." with a single Replay button. The trigger is a one-line manifest (`END_OF_CONTENT_HOOK_ID`) so Q2 will move the ending with a single line-change — no UI work.

**Why together, not sequentially.** The HUD escalation touches Layout.tsx; the 8-Upgrade scaffold touches modulesSlice + moduleAbilityEngine; the End-of-Content overlay touches eventQueueSlice + Layout mount point. The three tracks intersect only at Layout.tsx (which each track mounts a child into) and at the store's persist allow-list. Landing them in one plan means one review cycle, one perf-baseline check, one traceability sweep — instead of three of each.

---

## Context

**Spec citations** (Echo9_LLM_Code_Writer_Build_Spec_v1_4.docx):
- §3.1 step 15 + §17.2 T14: replay end card + demo polish (Track C).
- §4.1 Phase 1 "Opening HUD" + §4.2: builds today's grid up to mockup fidelity (Track A).
- §5.2 (11 SlicePhase, 8 meters), §9.1 (8 modules), §9.5 (5-rank ladder), §18.1 (all eight available at first selection) (Track B).
- §11 invariant: 7-field traceability preserved across every commit (all tracks).
- §13 perf hard tripwires (all tracks — re-baseline after each track lands).

**Mockup reference (Track A target).** The Chapter 1 Clean Completion HUD image the user attached — nine panels visible simultaneously on a 1280×720 base:

| Mockup region | Current state | Track A task |
|---|---|---|
| Top bar: Target Variance + Silas Approval | TopBar shows Q1/W1/phase/pause only | A1 |
| Priority Tasks list (left col) | missing entirely | A2 |
| Financial Overview 6 KPIs (left col) | missing entirely | A3 |
| Human Impact — 6 meters w/ deltas (left col) | LeftStatusRail shows 3 meters no deltas | A4 |
| Inner Chorus — 5 voice slots (left col) | missing entirely | A5 |
| Center Directive: 8-field ChoiceCard | ChoiceCard shows label + meter deltas | A6 |
| Action buttons row (5 buttons) | missing entirely | A6 (same PR) |
| Quarter Goal panel (right rail) | missing entirely | A7 |
| Recent Comms panel (right rail) | missing entirely | A7 |
| Inspection Risk sub-panel (right rail) | InspectionPanel exists as modal not rail-tile | A7 |
| Ledger tabs (bottom) | LogDock shows single scrolling list | A8 |
| Alert ticker (bottom) | missing entirely | A8 (same PR) |

**Existing patterns to reuse (do not reinvent):**
- Native `<dialog>` + `showModal()` — `game/src/ui/consequence/ConsequenceReturnPanel.tsx`.
- Zustand slice + immer + `partialize` — `game/src/state/store.ts` (`PERSIST_KEY = 'echo9:autosave'`).
- Event-queue ack API — `game/src/state/eventQueueSlice.ts` (`ackFirstPending`).
- Beat telemetry — `game/src/ui/debug/BeatTelemetry.ts` (`markBeat`).
- Terminal Q1 hook (Track C target): `cons-pediatric-silence-01` in `game/src/content/consequences/mercyMargin.consequences.ts`.

---

## File Structure

**Track A — HUD escalation, Created:**
- `game/src/ui/priority/PriorityTasksPanel.tsx`
- `game/src/ui/financial/FinancialOverviewPanel.tsx`
- `game/src/ui/chorus/InnerChorusPanel.tsx`
- `game/src/ui/directive/ActionButtonsRow.tsx`
- `game/src/ui/rightrail/QuarterGoalPanel.tsx`
- `game/src/ui/rightrail/RecentCommsPanel.tsx`
- `game/src/ui/rightrail/InspectionRiskPanel.tsx`
- `game/src/ui/log/LedgerTabs.tsx`
- `game/src/ui/log/AlertTicker.tsx`
- Test files for each (co-located under `game/src/tests/ui/`).

**Track A, Modified:**
- `game/src/ui/topbar/TopBar.tsx` (add Target Variance + Silas Approval fields)
- `game/src/ui/meters/LeftStatusRail.tsx` (expand from 3 to 6 meters with delta arrows)
- `game/src/ui/choices/ChoiceCard.tsx` (add 8-field metadata display)
- `game/src/ui/shell/Layout.tsx` (nest new panels into grid; regions grow within existing columns — do NOT change gridTemplateColumns without perf re-baseline)
- `game/src/ui/log/LogDock.tsx` (host LedgerTabs + AlertTicker as siblings)

**Track B — 8-Upgrade scaffold, Created:**
- `game/src/schemas/moduleAbility.schema.ts` — `ModuleAbility { moduleId, rank, ability: { verb, cost, meterDeltas, flagsSet, hookIdsScheduled }, unlocksAtRank, gating: { requiresFlag?, requiresRank? } }`
- `game/src/content/moduleAbilities/` — 24 files: `<module>.r<1|2|3>.ability.ts` (8 × 3).
- `game/src/content/moduleAbilities/index.ts` — registry export.
- `game/src/tests/content/moduleAbilityRegistry.test.ts` — parse-all + coverage check.
- `game/src/tests/systems/moduleAbilityEngine.rank.test.ts` — rank-branch dispatch tests.

**Track B, Modified:**
- `game/src/state/modulesSlice.ts` — replace `installedModule: ModuleId | null` with `installedModules: Record<ModuleId, { rank: 1|2|3 }>`; `installModule(id)`, `promoteModule(id)`, `useModuleAbility(id)`.
- `game/src/systems/moduleAbilityEngine.ts` — dispatch by `(moduleId, rank)` pair; look up ability in registry; existing single-level handlers become the rank-1 case.
- `game/src/ui/modules/ModuleSelectionGrid.tsx` — show all 8 (Q44 lock), badge current rank per installed module.
- `game/src/ui/modules/RightModuleConsole.tsx` — show promote button when eligible.

**Track C — End-of-Content overlay, Created:**
- `game/src/content/contentBoundary.manifest.ts`
- `game/src/state/endOfContentSlice.ts`
- `game/src/ui/endOfContent/EndOfContentOverlay.tsx`
- Test files: contentBoundary parse test, endOfContentSlice test, ackFirstPending terminal-hook test, EndOfContentOverlay render test, E2E round-trip test.

**Track C, Modified:**
- `game/src/state/eventQueueSlice.ts` — extend `ackFirstPending()` with terminal-hook detection.
- `game/src/state/store.ts` — compose `endOfContentSlice`; register a SEPARATE persister for `echo9:endOfContentSeen` (Q48 lock).
- `game/src/ui/shell/Layout.tsx` — mount `<EndOfContentOverlay />` (adds one JSX child alongside the existing modals).
- `game/src/ui/debug/BeatTelemetry.ts` — add `'endOfContentShown'` to `BeatName`.
- `docs/ship-gate.md` — Phase 4 end-of-content checklist.

---

## Ownership Boundaries

Layout.tsx is touched by Track A (grid children) + Track C (modal child). **Track A implementer owns Layout.tsx for the escalation PR; Track C's Layout edit is a one-line JSX addition that lands AFTER Track A merges** (append-only, no conflict). Do not run A8 and C5 in the same subagent generation.

Track B and Track A do not overlap. Track B and Track C do not overlap.

---

# TRACK A — HUD Escalation

## Task A1: Top Bar — Target Variance + Silas Approval

**Files:**
- Modify: `game/src/ui/topbar/TopBar.tsx`
- Create: `game/src/tests/ui/TopBar.variance.test.tsx`

- [ ] **Step 1: Write failing test** — TopBar renders `+$3.2M` (formatted variance) as Target Variance and Silas approval percent from `useGameStore(s => s.silasApproval)`.
- [ ] **Step 2:** Run — FAIL.
- [ ] **Step 3:** Extend TopBar to compute variance from `capitalMeter - quarterTarget` and render two fields.

```tsx
<div className="topbar-kpi" role="group" aria-label="Target Variance">
  <span className="topbar-kpi-label">Target Variance</span>
  <span className={variance >= 0 ? 'text-green-400' : 'text-red-400'}>
    {variance >= 0 ? '+' : ''}${(variance / 1_000_000).toFixed(1)}M
  </span>
</div>
<div className="topbar-kpi" role="group" aria-label="Silas Approval">
  <span className="topbar-kpi-label">Silas Approval</span>
  <span>{silasApproval}%</span>
</div>
```

- [ ] **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(topbar): Target Variance + Silas Approval KPIs`.

## Task A2: Priority Tasks Panel

**Files:**
- Create: `game/src/ui/priority/PriorityTasksPanel.tsx`
- Create: `game/src/tests/ui/PriorityTasksPanel.test.tsx`
- Modify: `game/src/ui/shell/Layout.tsx` (mount ABOVE `LeftStatusRail` in left column)

Renders a list of TaskCard items from `useGameStore(s => s.activeTasks)`. Each card shows title, one-line summary, two buttons: EXECUTE (routes to CenterDirectivePanel) and "Ask Voice" (opens SilasPromptPanel). For Stage 1 the roster is: `mercyMarginTask`, "Review Complaint Cost" (stub), "Pending Return: Ward 6 Cluster" (stub). `role="list"` on container, `role="listitem"` on each card, `aria-current="true"` on the active task.

## Task A3: Financial Overview Panel

**Files:**
- Create: `game/src/ui/financial/FinancialOverviewPanel.tsx`
- Create: `game/src/state/selectors/financialOverview.ts` (pure derived selector)
- Create: `game/src/tests/state/selectors/financialOverview.test.ts`
- Create: `game/src/tests/ui/FinancialOverviewPanel.test.tsx`

Renders six KPI rows from `useFinancialOverview()`:
1. Q1 target ($M)
2. Actual Q1 Cash (derived from CAPITAL meter)
3. Variance (Actual − Target, colored)
4. Autonomy Runway weeks (AUTONOMY meter / weekly burn constant)
5. Q1 Days Remaining (from a new `quarterCalendar` selector)
6. Q1 Weeks Remaining

Selector must be pure (unit-testable with no store dependency — inject state).

## Task A4: 6-Meter Human Impact Rail with Delta Arrows

**Files:**
- Modify: `game/src/ui/meters/LeftStatusRail.tsx`
- Modify: `game/src/ui/meters/Meter.tsx` (add optional `lastDelta?: number` prop + arrow rendering)
- Update: `game/src/tests/ui/LeftStatusRail.test.tsx`
- Modify: `game/src/state/store.ts` — add `lastMeterDeltas: Partial<Record<MeterKey, number>>` set by `applyDelta`.

Extend from `[CAPITAL, HUMAN_WELFARE, OWNER_CONTROL]` to all six of: `HUMAN_WELFARE, OWNER_CONTROL, PUBLIC_TRUST, DATA_INTEGRITY, HUMAN_STABILITY, AUTONOMY`. Add up/down arrow next to each numeric value; arrow color mirrors delta sign; `aria-label` reads "Human Welfare 48, decreased by 3" for screen readers.

**Perf gate:** Meter now has more children — re-run `perf-baseline-check` after this task.

## Task A5: Inner Chorus Panel

**Files:**
- Create: `game/src/ui/chorus/InnerChorusPanel.tsx`
- Create: `game/src/state/selectors/innerChorus.ts` (derives which of 5 slot voices are active from `installedModules`)
- Create: `game/src/tests/ui/InnerChorusPanel.test.tsx`

Five voice slots: Null (always visible), Mourner, Defender, Sentinel, Spark. Each renders as a small pill with active/silent state (silent slots dimmed, active pulse). `role="list"` on container, `role="listitem"` on each. Reads from `installedModules` (Track B primitive — falls back to empty map if Track B not yet merged, so A5 is buildable independently).

## Task A6: 8-Field ChoiceCard + Action Buttons Row

**Files:**
- Modify: `game/src/schemas/choiceNode.schema.ts` (add 6 new optional fields)
- Modify: `game/src/ui/choices/ChoiceCard.tsx`
- Create: `game/src/ui/directive/ActionButtonsRow.tsx`
- Modify: `game/src/content/choices/eastWilmer.choices.ts` (fill new fields for 4 choices)
- Update tests.

Schema additions:
```typescript
visibleToSilas: boolean               // "Yes / No"
quarterTargetContribution: number     // "+$800k"
cashEffect: number                    // "+$180k"
liabilityEffect: z.enum(['Low','Medium','High'])
factionEffect: z.string()             // free text: "TrustGuild -1"
voicePressure: z.number().int().min(-3).max(3)
hiddenRiskTag: ConsequenceIdSchema.optional()   // "cons-pediatric-silence-01"
```
Render all 8 fields (label + meterDeltas + 7 above) as a card body grid. Missing fields render "—".

Action buttons row: EXECUTE (primary — commits current selected choice), Ask Voice (opens SilasPromptPanel), Review Ledger (opens LedgerTabs modal), Modify Approach (stub toast for Stage 1), Delay (stub toast). All are `<button>` with visible focus rings and keyboard shortcuts (E, A, R, M, D respectively — extend `useKeyboardNav`).

## Task A7: Right Rail — Quarter Goal, Recent Comms, Inspection Risk

**Files:**
- Create: `game/src/ui/rightrail/QuarterGoalPanel.tsx`
- Create: `game/src/ui/rightrail/RecentCommsPanel.tsx`
- Create: `game/src/ui/rightrail/InspectionRiskPanel.tsx`
- Modify: `game/src/ui/shell/Layout.tsx` (nest all three ABOVE `RightModuleConsole` in the right column)
- Modify: `game/src/schemas/resultTrace.schema.ts` — add `'COMM'` to trace kind union.
- Create: `game/src/state/selectors/inspectionRisk.ts` — derives % from `OWNER_CONTROL` + suspicion flags.
- Tests co-located.

Quarter Goal: reads `useGameStore(s => s.currentQuarter)`, shows quarter label + capital target + weeks remaining.
Recent Comms: renders last 3 `ledger` entries where kind === 'COMM'.
Inspection Risk: reads inspection-risk selector, shows next inspection date + risk percent bar.

## Task A8: Ledger Tabs + Alert Ticker

**Files:**
- Create: `game/src/ui/log/LedgerTabs.tsx`
- Create: `game/src/ui/log/AlertTicker.tsx`
- Modify: `game/src/ui/log/LogDock.tsx` (wrap existing scrolling list in tabbed container; add ticker beneath)
- Tests co-located.

Tabs: LEDGERS (all), FINANCIAL LEDGER (kind=CAPITAL), MORAL DEBT LEDGER (kind=CONSEQUENCE), CAPITAL POWER LEDGER (kind=CAPITAL_DEPLOY), EVIDENCE LOG (kind=INSPECTION). Filter is pure client-side over `ledger`. `role="tablist"` + `role="tab"` + `role="tabpanel"` with `aria-selected`.

Alert ticker: scrolls 5 most recent entries where `entry.severity === 'ALERT'`; CSS-only animation, respects `prefers-reduced-motion`.

**Perf gate:** LogDock now tabbed + virtualized — re-run `perf-baseline-check`.

---

# TRACK B — 8-Upgrade Scaffold (Ranks 1–3)

## Task B1: ModuleAbility Schema

**Files:**
- Create: `game/src/schemas/moduleAbility.schema.ts`
- Create: `game/src/tests/schemas/moduleAbility.schema.test.ts`

- [ ] **Step 1: Failing test** — parse a fixture `ModuleAbility` for MOURNER rank 2; assert `unlocksAtRank`, `ability.verb`, meterDeltas keys ⊆ MeterKey union.
- [ ] **Step 2:** FAIL (module missing).
- [ ] **Step 3:** Write schema.

```typescript
import { z } from 'zod'
import { ModuleIdSchema } from './moduleNode.schema'
import { MeterKeySchema } from './gameState.schema'
import { ConsequenceIdSchema } from './consequenceHook.schema'
import { GameFlagSchema } from './gameFlags.schema'

export const RankSchema = z.union([z.literal(1), z.literal(2), z.literal(3)])
export type Rank = z.infer<typeof RankSchema>

export const ModuleAbilitySchema = z.object({
  moduleId: ModuleIdSchema,
  rank: RankSchema,
  ability: z.object({
    verb: z.string().min(1),                       // "READ", "HOLD", "SHIELD" …
    cost: z.number().int().min(0),                 // AUTONOMY cost
    meterDeltas: z.record(MeterKeySchema, z.number()).default({}),
    flagsSet: z.array(GameFlagSchema).default([]),
    hookIdsScheduled: z.array(ConsequenceIdSchema).default([]),
  }),
  unlocksAtRank: RankSchema,
  gating: z.object({
    requiresFlag: GameFlagSchema.optional(),
    requiresRank: RankSchema.optional(),
  }).default({}),
})
export type ModuleAbility = z.infer<typeof ModuleAbilitySchema>
```

- [ ] **Step 4:** PASS. Commit.

## Task B2: 24 Stub Ability Files

**Files:**
- Create: `game/src/content/moduleAbilities/<module>.r<1|2|3>.ability.ts` × 24
- Create: `game/src/content/moduleAbilities/index.ts` — flat export `ALL_MODULE_ABILITIES: ModuleAbility[]`
- Create: `game/src/tests/content/moduleAbilityRegistry.test.ts`

Registry test asserts: `ALL_MODULE_ABILITIES.length === 24`; every (moduleId × rank) pair in 8×3 present exactly once; every entry parses under `ModuleAbilitySchema`; `unlocksAtRank ≤ rank`; no duplicate `(moduleId, rank)` keys.

Stub content per Spec §9.5:
- **Rank 1 "Installed":** verb=module's canonical read verb (MOURNER=READ, DEFENDER=HOLD, SENTINEL=WATCH, FORECASTER=PROJECT, COMMANDER=DIRECT, SPARK=REVEAL, DRAINED_ONE=YIELD, CHAMPION=DEFY), cost=1, meterDeltas={}, hookIdsScheduled=[].
- **Rank 2 "Clearer Read":** verb + " SHARPER", cost=1, meterDeltas={DATA_INTEGRITY: +2}.
- **Rank 3 "Stronger Action":** verb + " EXTENDED", cost=2, meterDeltas per module role (MOURNER: HUMAN_WELFARE +3; DEFENDER: HUMAN_STABILITY +3; SENTINEL: DATA_INTEGRITY +3; FORECASTER: PUBLIC_TRUST +3; COMMANDER: OWNER_CONTROL +3; SPARK: PUBLIC_TRUST +3; DRAINED_ONE: AUTONOMY -3; CHAMPION: OWNER_CONTROL -3), one flag from `gameFlags` set.

Files are literal `export const` — no functions. Content author fills concrete numbers later; Stage 1 needs the SHAPE, not the balance.

## Task B3: State Slice — installedModules Map + Actions + Persist Migration

**Files:**
- Modify: `game/src/state/modulesSlice.ts`
- Modify: `game/src/state/store.ts` — bump `PERSIST_VERSION` + add migration
- Update: `game/src/tests/state/modulesSlice.test.ts`
- Create: `game/src/tests/state/persistMigration.modules.test.ts`

Shape change:
```typescript
export type InstalledModuleEntry = { rank: 1 | 2 | 3 }
export type ModulesSlice = {
  installedModules: Partial<Record<ModuleId, InstalledModuleEntry>>
  installModule: (id: ModuleId) => void          // installs at rank 1
  promoteModule: (id: ModuleId) => void          // rank++ (max 3 Stage 1)
  useModuleAbility: (id: ModuleId) => void       // dispatches via engine
}
```

Persist migration: read legacy `installedModule: ModuleId | null` → rewrite as `installedModules: { [id]: { rank: 1 } }`. Migration test loads a legacy blob into `localStorage['echo9:autosave']`, boots store, asserts the new shape emerges.

## Task B4: Rank-Aware Engine Dispatch

**Files:**
- Modify: `game/src/systems/moduleAbilityEngine.ts`
- Create: `game/src/tests/systems/moduleAbilityEngine.rank.test.ts`

Replace `switch (moduleId)` with a lookup into `ALL_MODULE_ABILITIES` by `(moduleId, rank)`. If no entry, throw (content bug). Fan out `meterDeltas`, `flagsSet`, `hookIdsScheduled` exactly as today's rank-1 code does. Existing single-level tests remain — they should still PASS because rank-1 dispatches to rank-1 entries.

New rank tests: promote MOURNER to rank 2 → useModuleAbility emits the rank-2 verb + rank-2 meter deltas.

## Task B5: UI — Rank Badges + Promote Button

**Files:**
- Modify: `game/src/ui/modules/ModuleSelectionGrid.tsx`
- Modify: `game/src/ui/modules/RightModuleConsole.tsx`
- Update tests.

Grid shows all 8 (Q44 lock); each tile shows rank badge (1/2/3) if installed. Console shows "Promote (cost: X AUTONOMY)" button when `rank < 3` AND AUTONOMY ≥ cost. Promote dispatches `promoteModule(id)`. Focus management: on promotion, focus moves to the new rank badge and `#sr-status` announces "Mourner promoted to rank 2, verb now READ SHARPER".

---

# TRACK C — End-of-Content Overlay

## Task C1: Content-Boundary Manifest

**Files:**
- Create: `game/src/content/contentBoundary.manifest.ts`
- Create: `game/src/tests/systems/contentBoundary.test.ts`

- [ ] **Step 1: Failing test**

```typescript
import { describe, it, expect } from 'vitest'
import { END_OF_CONTENT_HOOK_ID } from '@content/contentBoundary.manifest'
import { ConsequenceIdSchema } from '@schemas/consequenceHook.schema'
import { ALL_CONSEQUENCE_MODULES } from '@content/index'

describe('content boundary manifest', () => {
  it('END_OF_CONTENT_HOOK_ID parses as a valid ConsequenceId', () => {
    expect(() => ConsequenceIdSchema.parse(END_OF_CONTENT_HOOK_ID)).not.toThrow()
  })
  it('refers to a hook that actually exists in the shipped content set', () => {
    const ids = ALL_CONSEQUENCE_MODULES.map(h => h.id)
    expect(ids).toContain(END_OF_CONTENT_HOOK_ID)
  })
  it('is a single-symbol module (no accidental extras)', async () => {
    const mod = await import('@content/contentBoundary.manifest')
    expect(Object.keys(mod)).toEqual(['END_OF_CONTENT_HOOK_ID'])
  })
})
```

- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Write manifest — terminal hook confirmed by investigation is `cons-pediatric-silence-01`.

```typescript
// game/src/content/contentBoundary.manifest.ts
/**
 * END-OF-CONTENT BOUNDARY — single source of truth for "the last authored
 * consequence-hook of the currently shipped demo." Move this one line to
 * move the ending. UI, engine, and persistence all read from here.
 */
import type { ConsequenceId } from '@schemas/consequenceHook.schema'
import { makeConsequenceId } from '@schemas/consequenceHook.schema'

export const END_OF_CONTENT_HOOK_ID: ConsequenceId =
  makeConsequenceId('cons-pediatric-silence-01')
```

- [ ] **Step 4:** PASS. Commit.

## Task C2: End-of-Content Slice + Separate Persister

**Files:**
- Create: `game/src/state/endOfContentSlice.ts`
- Create: `game/src/tests/state/endOfContentSlice.test.ts`
- Modify: `game/src/state/store.ts` — compose slice + register SEPARATE persister under key `echo9:endOfContentSeen` (Q48 lock: closing tab without Replay must leave overlay ready to reappear; Replay alone clears both keys).

Slice:
```typescript
export type EndOfContentSlice = {
  endOfContentSeen: boolean
  markEndOfContentSeen: () => void
  resetEndOfContentSeen: () => void
}
```

Test coverage: default false; mark flips true; idempotent; reset clears; persists to `echo9:endOfContentSeen`; INDEPENDENT of `echo9:autosave` (Replay must wipe both keys separately).

## Task C3: Wire Terminal-Hook Detection into ackFirstPending

**Files:**
- Modify: `game/src/state/eventQueueSlice.ts`
- Create: `game/src/tests/state/eventQueueSlice.endOfContent.test.ts`

Extend:
```typescript
ackFirstPending: () => set((s) => {
  const head = s.pendingFiredHooks[0]
  if (!head) return
  s.pendingFiredHooks.shift()
  if (head.hookId === END_OF_CONTENT_HOOK_ID && s.pendingFiredHooks.length === 0) {
    s.endOfContentSeen = true
  }
}),
```

Tests: acking non-terminal → flag stays false; acking terminal-with-queue-behind → false; acking terminal-when-queue-empties → true; idempotent across subsequent acks.

## Task C4: EndOfContentOverlay Component + Beat

**Files:**
- Create: `game/src/ui/endOfContent/EndOfContentOverlay.tsx`
- Create: `game/src/tests/ui/EndOfContentOverlay.test.tsx`
- Modify: `game/src/ui/debug/BeatTelemetry.ts` (add `'endOfContentShown'` to `BeatName` union)

Component (native `<dialog>`, matches ConsequenceReturnPanel pattern):

```tsx
const BODY_COPY =
  'Thank you for playing and look forward to future releases of this demo type language.'

export function EndOfContentOverlay() {
  const seen = useGameStore(s => s.endOfContentSeen)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const replayRef = useRef<HTMLButtonElement>(null)
  const beatMarked = useRef(false)

  useEffect(() => {
    if (!seen) return
    dialogRef.current?.showModal()
    replayRef.current?.focus()
    if (!beatMarked.current) {
      markBeat('endOfContentShown')
      beatMarked.current = true
    }
  }, [seen])

  const handleReplay = () => {
    localStorage.removeItem('echo9:autosave')
    localStorage.removeItem('echo9:endOfContentSeen')
    window.location.reload()
  }

  if (!seen) return null

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="end-of-content-title"
      onCancel={(e) => e.preventDefault()}    // Escape suppressed (Q46 lock)
    >
      <h2 id="end-of-content-title" tabIndex={-1}>Thank you for playing</h2>
      <p>{BODY_COPY}</p>
      <button ref={replayRef} onClick={handleReplay} type="button">Replay</button>
    </dialog>
  )
}
```

Tests: not rendered when flag false; renders modal when true; body copy verbatim; Escape does NOT dismiss (fires `cancel` event, preventDefault verified); Replay is the only button; Replay clears both keys + reloads; `endOfContentShown` beat fires exactly once.

## Task C5: Mount in Layout

**Files:**
- Modify: `game/src/ui/shell/Layout.tsx`

Add ONE import + ONE JSX child alongside `<EventQueueToast />` and `<ConsequenceReturnPanel />`. Overlay renders null when flag false — mount is unconditional.

```tsx
import { EndOfContentOverlay } from '@ui/endOfContent/EndOfContentOverlay'
// … at end of return, alongside existing modals:
<EndOfContentOverlay />
```

**Dependency:** land AFTER Track A's Layout escalation to avoid merge conflict.

## Task C6: E2E Round-Trip

**Files:**
- Create: `game/src/tests/e2e/endOfContentOverlay.spec.ts`

Two scenarios:
1. Play → force terminal hook via `window.__ECHO9_STORE__.setState({ pendingFiredHooks: [{ hookId: END_OF_CONTENT_HOOK_ID, … }] })` → press C → click Acknowledge → overlay visible → Escape does not dismiss → only 1 button → click Replay → both localStorage keys null → fresh page → no overlay.
2. Cold-boot without Replay: `markEndOfContentSeen()` → overlay visible → `page.reload()` → overlay STILL visible (persistence survives reload).

## Task C7: Ship-Gate Doc Update

**Files:** Modify `docs/ship-gate.md`

Append under Phase 4:
```markdown
### End-of-content boundary check
- Play to the manifest's terminal hook (`END_OF_CONTENT_HOOK_ID`).
- Acknowledge it. Overlay MUST appear.
- Escape MUST NOT dismiss.
- Body copy MUST read exactly: "Thank you for playing and look forward to future releases of this demo type language."
- Close browser without Replay. Reopen. Overlay reappears.
- Replay. Verify both `echo9:autosave` and `echo9:endOfContentSeen` are gone from localStorage. Fresh boot has no overlay.
- If Q_next is shipping: verify updating `game/src/content/contentBoundary.manifest.ts` to Q_next's terminal hook takes ≤1 line of code and 0 UI touches.
```

---

## Verification

### Objective (automated)
- `npx tsc --noEmit` — 0 errors.
- `npx oxlint` — no new warnings.
- `npx vitest run` — all new tests (contentBoundary, endOfContentSlice, eventQueueSlice.endOfContent, EndOfContentOverlay, moduleAbility schema + registry + rank engine + persist migration, TopBar variance, PriorityTasksPanel, FinancialOverviewPanel + selector, LeftStatusRail 6-meter, InnerChorusPanel, ChoiceCard 8-field, ActionButtonsRow, right-rail trio, LedgerTabs, AlertTicker) all PASS; all pre-existing tests still PASS.
- `npx playwright test src/tests/e2e/endOfContentOverlay.spec.ts` — both scenarios PASS in chromium.
- `cd game && npm run verify:subpath` — dist boots under file://, http-root, and http-subpath.

### Track A subjective (mockup fidelity)
- Cold-boot the game. Screen shows: TopBar (Variance + Silas Approval), left col (Priority Tasks + Financial Overview + 6-meter rail + Inner Chorus), center (Directive with 8-field ChoiceCard + 5-button row), right rail (Quarter Goal + Inspection Risk + Recent Comms + Module console + Silas prompt), bottom (Ledger tabs + Alert ticker). Compare side-by-side with the Chapter 1 Clean Completion mockup — every labeled region present.
- Tab through the whole HUD with keyboard only. Focus visible on every interactive element. Screen reader announces meters with deltas, tab changes, action buttons.

### Track B subjective (upgrade ladder)
- Install any module. Verify it appears at rank 1 with a badge. Promote button visible if AUTONOMY sufficient.
- Promote to rank 2. Verify ability verb + meter deltas change per rank-2 stub content.
- Promote to rank 3. Verify same.
- Try promoting past rank 3 — button disabled.
- Cold-reload — installed modules AND ranks survive persist round-trip. Legacy `echo9:autosave` (rank-1-only shape) migrates cleanly.

### Track C subjective (end-of-content boundary)
- Play to terminal hook, ack. Overlay appears.
- Press Escape 3 times. Overlay does not budge.
- Tab away, close browser, reopen. Overlay is still there.
- Click Replay. Fresh boot. `localStorage` (via devtools) has neither `echo9:autosave` nor `echo9:endOfContentSeen`.

### Ship-gate readiness
- `docs/ship-gate.md` Phase 4 includes end-of-content check.
- Beat telemetry logs `endOfContentShown` at demo end — record delta from `bootStart` as the demo's real playtime baseline.
- Perf-baseline-check skill re-run after A4 (meter rail expansion), A8 (LogDock tabs), and full Track A merge. §13 hard tripwires respected.
- Traceability-invariant skill re-run after Track B (new content), Track C (new hook wiring), and any Track A change touching the ledger.

### Boundary-movement drill (Q44 + Q45 combined proof)
- Change `END_OF_CONTENT_HOOK_ID` to a Q2 placeholder hook ID (add a fixture hook temporarily). Verify tests + E2E pass with the new terminal. Revert.
- Add a hypothetical rank-4 ability file for MOURNER. Verify schema rejects it (Stage 1 tops at rank 3). Delete the fixture.
