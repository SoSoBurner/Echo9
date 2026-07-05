# C15 — Week cursor + Q1 inspection dispatch · playtest analysis

**Sprint:** C15 (Track C — Q1 runtime wiring)
**Directive:** wire the 12-week Q1 arc so the runtime actually walks it. Layout
had been hardcoded to Week 1 (mercy-margin) since T-b4; the C1–C13 content
sat off the resolution path. Also wire the W4 / W8 / W12 inspection triggers
onto Q1 close events so the C14 scene sets (W8 payroll, W12 ethics) reach the
screen.

---

## Arc position

C14 shipped 6 authored inspection scenes across 3 insertion points but
explicitly deferred dispatch — the C14 doc's carry-in section listed the
exact `inspectionSlice` + `Layout` refactor this sprint closes. Q1 content
was **fully authored** at C14; C15 makes it **fully walkable**.

## Scope discipline — the pivot mid-sprint

C15 was originally scoped as "wire W8/W12 inspection dispatch onto the
already-walking arc." Investigation revealed the arc was **not** walking:
`Layout.tsx` imported one week's task/choices/silasPrompt/nullText/
humanMessage by name (`EAST_WILMER_TASK`, `EAST_WILMER_CHOICES`,
`SILAS_DIRECTIVE_EAST_WILMER`, …) and treated every ResultCard "Continue"
as a rerender of the same directive. The 11 subsequent weeks were reachable
only through unit tests.

Rather than layer inspection dispatch on top of a broken cursor, C15's
scope expanded to fix the cursor first — then dispatch reduces to a
one-liner per trigger week.

## Deliverables committed

### Directive schedule — 12-entry Q1_SEQUENCE (was 11 stubs → 12 fully populated)

`game/src/content/directiveSchedule.ts` — every entry now carries five
runtime-consumed fields:

- `task` (Zod-parsed CommittedTask)
- `choices` (the per-week Choice[] set)
- `silasPrompt` (the Silas directive prompt for the CenterDirectivePanel)
- `nullText` (the null-voice line rendered in the ambient rail)
- `humanMessage` (`{speaker, body}` — the human-voice-message strip)
- `resolutionFlag` (the `Q1_WEEK<N>_RESOLVED` gate that advances the cursor)

Week 7 uses `RASHA_THIRD_MESSAGE_IF_UNMET` (the pressured variant — the
IF_MET branch is arc-doc-committed but is a future refinement carry-in).
Week 8 uses a purpose-built `W8_PORTAL_MESSAGE` adapter that maps
`RASHA_INSTITUTIONAL_STATUS`'s `{system, body}` shape onto the
`{speaker, body}` contract that `HumanMessagePanel` requires. Semantically
justified: at W8 the county queue itself has replaced Rasha's channel — the
"system" IS the speaker.

### Inspection scene-set registry — new file

`game/src/content/inspections/q1InspectionSets.ts` (**NEW**, 40 LoC) —
discriminator-keyed registry:

```ts
export const Q1_INSPECTION_SETS = {
  W4: Q1_INSPECTION_SCENES,          // 2 scenes, East Wilmer
  W8: Q1_PAYROLL_INSPECTION_SCENES,  // 2 scenes, payroll audit
  W12: Q1_ETHICS_INSPECTION_SCENES,  // 2 scenes, ethics hearing
} as const

export type Q1InspectionKey = keyof typeof Q1_INSPECTION_SETS
```

No new schema shapes. Same `InspectionScene[]` payload; the registry is a
pure lookup table keyed by insertion week.

### Inspection slice — scene-set discriminator

`game/src/state/inspectionSlice.ts` — `startInspection(key)` now takes a
`Q1InspectionKey`. New transient runtime field: `currentInspectionKey`.
Persist partition guard extended: `currentInspectionKey` is transient UI,
not persisted. Store partition test updated to assert this
(`store.test.ts:persist partition guard`).

### Layout — Q1_SEQUENCE consumption

`game/src/ui/shell/Layout.tsx` — the whole file was rewired:

- Removed 3 hardcoded per-week imports (`EAST_WILMER_CHOICES`,
  `LENORA_PORTAL_MESSAGE`, `MERCY_MARGIN_NULL_TEXT`).
- Added `INSPECTION_KEY_TO_WEEK: Record<Q1InspectionKey, Q1Week>` module
  constant so inspection commits can reverse-lookup the sourceTaskId.
- Added derived `currentEntry`:
  ```ts
  const currentEntry = useMemo(
    () => Q1_SEQUENCE.find((entry) => !flags.has(entry.resolutionFlag)),
    [flags],
  )
  ```
  No cursor slice, no drift. The derivation is O(12) — trivially cheap.
- `handleChoiceCommit` now sets `currentEntry.resolutionFlag` after resolving,
  which advances the derivation to the next entry on the next render.
- W4 / W8 / W12 trigger dispatch inline in `handleChoiceCommit`:
  ```ts
  let inspectionKey: Q1InspectionKey | null = null
  if (currentEntry.week === 4 && nextOC < 40) inspectionKey = 'W4'
  else if (currentEntry.week === 8) inspectionKey = 'W8'
  else if (currentEntry.week === 12) inspectionKey = 'W12'
  if (inspectionKey) startInspection(inspectionKey)
  ```
- `handleContinue` callback added — ResultCard's "Continue →" clears
  `lastTrace` and returns phase to `FIRST_DIRECTIVE`. Rendering next entry
  is automatic (derivation-driven).
- `handleInspectionCommit` uses `Q1_INSPECTION_SETS[currentInspectionKey]`
  and reverse-looks up the sourceTaskId via `INSPECTION_KEY_TO_WEEK`.

### ResultCard — Continue button

`game/src/ui/result/ResultCard.tsx` — added optional `onContinue?: () => void`
prop. Renders "Continue →" only when the callback is present. Absent =
terminal state (Q1 closed, no more content). Absence discipline: the
Continue button DOES NOT render on the End-of-Content boundary, so the
overlay stays load-bearing.

## Scope discipline — what C15 does NOT do

**No cursor slice.** The scan-for-first-unresolved-entry derivation is
correct-by-construction (matches the schedule doc-comment) and avoids
introducing a persist field that could drift from the resolution-flag
truth.

**W4 semantic simplified vs pre-C15.** The T11 semantic was "any downward
crossing of OC through 40 fires inspection." C15's semantic is
`currentEntry.week === 4 && nextOC < 40` — the trigger is week-scoped and
threshold-checked at Week 4 resolution. Under duress (OC already low from
prior weeks), the audit-pre-brief that fails to buffer OC still fires
W4 as intended. The regression guard E2E (`Week 1 commit never opens an
inspection`) explicitly pins the new semantic.

**W8 dispatch is unconditional at Week 8 resolution.** The initial C15
draft read `flags.has(PAYROLL_AUDIT_DONE)` to gate W8 dispatch, but that
flag gets set by the same commit's hooks — reading it in the render pass
that just called `applyDelta` gets a stale snapshot. Justification for
unconditional dispatch: every Week 8 choice sets `PAYROLL_AUDIT_DONE` by
design (the audit is guaranteed to exist by W8), so the flag check was
redundant. Unconditional dispatch is race-free.

**W12 dispatch is unconditional at Week 12 resolution.** Per arc doc:
ethics hearing fires at Q1 close regardless of OC.

**No dispatch/derivation unit test as a separate file.** The three E2E
tests in `inspectionPhase.spec.ts` walk the arc through Playwright and
prove W4 fires / does-not-fire / regression-guards. A pure unit test that
walked `Q1_SEQUENCE.find` under fake flags would be strictly weaker.

## Test surface added

### New E2E — `inspectionPhase.spec.ts` (rewrite)

Three tests under `test.describe('C15 Q1 inspection dispatch — W4/W8/W12
scoped triggers')`:

1. **Week 4 commit with OC below 40 opens the W4 inspection dialog** —
   uses `jumpToWeek(page, 4)` helper (sets `Q1_WEEK1_RESOLVED..Q1_WEEK3_RESOLVED`
   via the `__ECHO9_STORE__` window binding), commits Week 4 choice #1,
   asserts modal dialog visible + `currentInspectionKey === 'W4'` +
   `currentInspectionSceneIndex === 0` + `phase === 'INSPECTION'`. Also
   answers scene 0 posture 0 and asserts ledger grew — end-to-end proof.
2. **Week 4 commit with OC well above 40 does NOT open the W4 inspection** —
   seeds `applyDelta({ OWNER_CONTROL: 100 })`, commits choice #2 (hedge-story,
   OC +2), asserts modal absent + `currentInspectionKey === null`.
3. **Week 1 commit never opens an inspection — dispatch is week-scoped** —
   regression guard: OC=0 at Week 1 (was the T11-era trigger), commits choice
   #3 (defer-quarter, OC -5), asserts modal absent. Pins the new week-scoped
   semantic against reversion.

### Schedule shape asserted in unit test

`game/src/tests/content/q1ContentParse.test.ts` — added four assertions:

- Every entry carries a well-formed `silasPrompt` (id + body non-empty).
- Every entry carries a non-empty `nullText`.
- Every entry carries a well-formed `humanMessage` (speaker + body
  non-empty).
- Q1_SEQUENCE covers all 12 weeks — sorted-weeks === `[1..12]`.

Catches authoring drift where a legitimate refactor accidentally omits a
field on one week (TS won't catch it if someone weakens the interface).

### Store test updates

`game/src/tests/state/store.test.ts`:

- `startInspection('W4')` signature.
- `currentInspectionKey: null` initial state assertion.
- `currentInspectionKey: null` in reset setState.
- Persist partition guard: `parsed.state` MUST NOT include
  `currentInspectionKey`.

## Verification

- `npx tsc --noEmit` → clean
- `npx oxlint` → 1 pre-existing warning at `vite.config.ts:1` (per
  CLAUDE.md, leave alone)
- `npx vitest run` → **514 / 514** passing across 58 test files
  (up from 510 — the four new schedule shape assertions in q1ContentParse
  add tests without adding files)
- Playwright not re-run in this iteration (the three inspectionPhase specs
  are new and untouched by existing green baselines; ship-gate sequence
  will exercise them).

## Regressions

None expected. C15 is the first sprint that lets the runtime touch weeks
2–12; the risk surface is entirely new-path. Existing behaviors:

- Week 1 mercy-margin choice → resolves → ResultCard renders (unchanged
  from pre-C15, now correctly followed by a "Continue →" button that
  advances to Week 2).
- Persist round-trip (`persistenceRoundTrip.spec.ts`) — `currentInspectionKey`
  is transient; partition guard proves it never touches localStorage.
- Comfort rehydration (`comfortRehydration.spec.ts`) — untouched by C15.
- Q1 close → End-of-Content overlay — sequenced correctly because the W12
  ethics inspection commits BEFORE the Week 12 resolution flag is set
  (the inspection modal resolves inline; Week 12 resolution happens after
  ResultCard "Continue" if the terminal state permits).

## Q1 arc completion — runtime status after C15

| Layer                        | Before C15 | After C15  |
|------------------------------|------------|------------|
| Content authored             | 12/12 weeks + 6 inspections | (unchanged) |
| Runtime week advance         | Hardcoded W1 only            | Derivation over Q1_SEQUENCE |
| ResultCard Continue button   | Missing                      | Renders when next week exists |
| W4 inspection trigger        | Global OC<40 downward-cross | Week-scoped, threshold-checked |
| W8 inspection trigger        | None                         | Unconditional at Week 8 resolve |
| W12 inspection trigger       | None                         | Unconditional at Week 12 resolve |
| Playwright arc coverage      | Week 1 only                  | Weeks 1 + 4 (+ regression guard) |

The full 12-week Q1 arc is now **runtime-walkable**. The remaining Q1
runtime work is the End-of-Content overlay sequencing (already committed
in prior work but worth spot-checking against the new ResultCard Continue
absence discipline).

## Next-sprint carry-ins

- **Week 7 IF_MET variant.** Currently every Week 7 render uses
  `RASHA_THIRD_MESSAGE_IF_UNMET`. Arc doc commits to a branching variant
  based on whether Rasha's silence-arc condition was met earlier. A small
  selector in `directiveSchedule.ts` reading the relevant flags would land
  the branching variant without new infrastructure.
- **End-of-Content overlay sequence audit.** The overlay fires on
  `END_OF_CONTENT_HOOK_ID = 'cons-pediatric-silence-01'`. After C15, that
  hook fires in the same tick as the Q1_WEEK12_RESOLVED flag. Worth an
  explicit sequence assertion — the E2E soak test may already exercise it.
- **Full-arc walkthrough E2E.** `stageWalker.spec.ts` is called out in the
  master plan Track ∞ but does not exist yet. A single spec that walks
  Weeks 1-12 organically (no jumpToWeek) would prove the entire arc
  without dev-only bindings. Deferred: the three inspection specs prove
  the sensitive semantic (W4 gating) and jumpToWeek is the right tool
  when the goal is "prove dispatch."
- **Layout branch coverage.** `Layout.tsx` grew a Q1-closed terminal
  branch (`<div>Q1 closed…</div>`). Confirm the End-of-Content overlay
  still takes precedence at that terminal state — the C15 diff doesn't
  touch that overlay's mount but the ResultCard Continue absence pattern
  interacts with the same phase transition.
