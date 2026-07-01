# Echo9 Automation Backlog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land all unimplemented automations and docs surfaced in the 2026-06-30 session: project CLAUDE.md, two MCP servers, two user-invocable skills, two hooks, and two project-local subagents.

**Architecture:** Each task is an independent file create or single-key settings.json patch — no cross-task code dependencies. CLAUDE.md and hooks land first because they protect every later task from PLAN.md edits and lint regressions. MCP servers land second so the skills can rely on context7 lookups. Skills and subagents land last.

**Tech Stack:** Markdown (CLAUDE.md, SKILL.md, agent.md), JSON (settings.json), `claude mcp add` CLI, optional Node test fixtures for skill smoke tests. No application code is touched.

---

## File Structure

| File | Responsibility | Status |
|---|---|---|
| `Echo9/CLAUDE.md` | Project context: layout, commands, oxlint-not-ESLint, PLAN.md lock, perf gate, SDD cycle, "don'ts" | create |
| `Echo9/.claude/settings.json` | Permissions allowlist + new Hooks block | modify (preserve existing `permissions.allow`) |
| `Echo9/.claude/skills/content-author/SKILL.md` | User-invocable `/content-author` skill: scaffold + validate a Zod-schema content file | create |
| `Echo9/.claude/skills/content-author/references/schemas.md` | Quick reference for all 11 content schemas with required fields | create |
| `Echo9/.claude/skills/perf-baseline-check/SKILL.md` | Re-run §13 perf gates and diff `game/docs/perf-baseline.md` | create |
| `Echo9/.claude/agents/content-schema-reviewer.md` | Reviews content files for cross-reference integrity (meter IDs, taskIds, dispatch entries) | create |
| `Echo9/.claude/agents/a11y-reviewer.md` | Reviews `game/src/ui/**` against WCAG 2.2 AA, delegates to `a11y-architect` | create |
| `Echo9/.mcp.json` | Team-shared MCP server registry (context7, playwright) | create |

`PLAN.md` and all `game/src/**` files are read-only for this plan.

---

## Task 1: Create project-level CLAUDE.md

**Files:**
- Create: `Echo9/CLAUDE.md`

- [ ] **Step 1: Verify the file does not already exist**

Run: `ls /c/Users/CEO/Echo9/CLAUDE.md 2>&1`
Expected: `ls: cannot access '/c/Users/CEO/Echo9/CLAUDE.md': No such file or directory`

- [ ] **Step 2: Write the file**

Use the Write tool to create `C:\Users\CEO\Echo9\CLAUDE.md` with this exact content:

```markdown
# Echo9 — Claude Working Notes

React 19 + Vite 8 + TypeScript narrative game. Client-only, no backend.

## Layout

- Repo root: `Echo9/` — `PLAN.md`, art assets, this file.
- App code: `Echo9/game/` — **run all npm/npx from here**.
- `PLAN.md` is the locked 18-section design contract. **Do not edit without explicit authorization.**
- `.remember/now.md` is the session-state checkpoint buffer — read on resume, append on stop.

## Commands (run from `game/`)

```bash
npm run dev          # vite dev server
npm run build        # scripts/build.mjs wrapper; --report for bundle viz
npm run test:run     # vitest single-shot
npm run test:e2e     # playwright (mercyMarginSlice + soakTest)
npm run test:soak    # SOAK_ITERATIONS=500 for release gate
npx oxlint           # lint — NOT ESLint
npx tsc --noEmit     # typecheck
```

Verification trinity before declaring done: `tsc --noEmit` → `oxlint` → `vitest run`.

## Stack quirks

- Lint is **oxlint** (`.oxlintrc.json`). Never propose ESLint configs.
- TS ~6 / Vite 8 / Vitest 4 / React 19 / Zustand 5 / Zod 4 / Immer 11 / Tailwind v4 — bleeding-edge majors; prefer `context7` MCP for API lookups over memory.
- Persist middleware writes `echo9:autosave` to localStorage. Comfort settings under `echo9:comfort`.
- Pre-existing oxlint warning on `vite.config.ts:1` (triple-slash) — leave it alone.

## Perf gate (PLAN.md §13)

Baselines in `game/docs/perf-baseline.md`. Re-verify on any state/render change. DevHUD (`game/src/ui/debug/DevHUD.tsx`) is dev-only, tree-shaken from prod.

## Review cycle

Default to **superpowers:subagent-driven-development**: implementer → spec-reviewer → code-quality-reviewer → fix loop. Spec gate runs before code quality.

## Gotchas

- Never `Read` a `local_agent` task `.output` file — it is a JSONL transcript symlink that will overflow context. Use the Agent tool result.
- Don't push to `origin/main` without explicit user request.
- Don't run npm/npx from `Echo9/` — it has no package.json. Always `cd game/` (or use absolute paths).
- No database, no backend — don't recommend DB mocks or migrations.
```

- [ ] **Step 3: Verify the file parses as markdown and includes required sections**

Run: `grep -E '^## (Layout|Commands|Stack quirks|Perf gate|Review cycle|Gotchas)' /c/Users/CEO/Echo9/CLAUDE.md | wc -l`
Expected: `6`

- [ ] **Step 4: Commit**

```bash
cd /c/Users/CEO/Echo9 && git add CLAUDE.md && git commit -m "docs: add project CLAUDE.md with commands, quirks, gotchas"
```

---

## Task 2: Add PostToolUse hook for typecheck + lint

**Files:**
- Modify: `Echo9/.claude/settings.json` (add `hooks.PostToolUse`)

- [ ] **Step 1: Read current settings.json**

Run: `cat /c/Users/CEO/Echo9/.claude/settings.json`
Expected: a JSON object with `permissions.allow` only (no `hooks` key yet).

- [ ] **Step 2: Patch settings.json to add the hook**

Use the Edit tool to change the file. Find:

```json
  "permissions": {
```

Replace with:

```json
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'case \"$CLAUDE_FILE_PATH\" in *.ts|*.tsx) cd \"$(dirname \"$(dirname \"$CLAUDE_FILE_PATH\")\")\" && npx oxlint \"$CLAUDE_FILE_PATH\" 2>&1 | tail -20 && npx tsc --noEmit 2>&1 | tail -20 ;; esac'"
          }
        ]
      }
    ]
  },
  "permissions": {
```

- [ ] **Step 3: Verify JSON is valid**

Run: `jq '.hooks.PostToolUse[0].matcher' /c/Users/CEO/Echo9/.claude/settings.json`
Expected: `"Edit|Write"`

- [ ] **Step 4: Manual smoke test (no commit yet — test next task too)**

In a new Claude session, open `game/src/state/store.ts` and edit a comment. Confirm the hook output appears in the tool result.

---

## Task 3: Add PreToolUse guard for PLAN.md

**Files:**
- Modify: `Echo9/.claude/settings.json` (add `hooks.PreToolUse`)

- [ ] **Step 1: Read current settings.json**

Run: `cat /c/Users/CEO/Echo9/.claude/settings.json | jq '.hooks'`
Expected: object with `PostToolUse` only.

- [ ] **Step 2: Patch settings.json to add the guard**

Use the Edit tool. Find:

```json
  "hooks": {
    "PostToolUse": [
```

Replace with:

```json
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'case \"$CLAUDE_FILE_PATH\" in */PLAN.md) echo \"BLOCKED: PLAN.md is the locked design contract. Re-prompt the user for explicit authorization before editing.\" >&2; exit 2 ;; esac'"
          }
        ]
      }
    ],
    "PostToolUse": [
```

- [ ] **Step 3: Verify JSON is valid and both hooks exist**

Run: `jq '.hooks | keys' /c/Users/CEO/Echo9/.claude/settings.json`
Expected: `["PostToolUse","PreToolUse"]`

- [ ] **Step 4: Smoke test the guard**

In a new Claude session: attempt to Edit `/c/Users/CEO/Echo9/PLAN.md`. Confirm tool call is blocked with the BLOCKED message.

- [ ] **Step 5: Commit both hooks**

```bash
cd /c/Users/CEO/Echo9 && git add .claude/settings.json && git commit -m "chore(claude): add PostToolUse typecheck+lint and PreToolUse PLAN.md guard"
```

---

## Task 4: Register context7 MCP server

**Files:**
- Create: `Echo9/.mcp.json`

- [ ] **Step 1: Confirm no existing .mcp.json**

Run: `ls /c/Users/CEO/Echo9/.mcp.json 2>&1`
Expected: `ls: cannot access ...: No such file or directory`

- [ ] **Step 2: Create .mcp.json**

Use the Write tool to create `C:\Users\CEO\Echo9\.mcp.json` with:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

- [ ] **Step 3: Verify JSON parses**

Run: `jq '.mcpServers.context7.command' /c/Users/CEO/Echo9/.mcp.json`
Expected: `"npx"`

- [ ] **Step 4: Verify Claude can load it**

Restart the Claude session in the Echo9 working dir. Run `/mcp` and confirm `context7` appears as connected.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/CEO/Echo9 && git add .mcp.json && git commit -m "chore(claude): register context7 MCP server"
```

---

## Task 5: Register Playwright MCP server

**Files:**
- Modify: `Echo9/.mcp.json`

- [ ] **Step 1: Read current .mcp.json**

Run: `cat /c/Users/CEO/Echo9/.mcp.json`
Expected: object with one `context7` entry.

- [ ] **Step 2: Add playwright entry**

Use the Edit tool. Find:

```json
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
```

Replace with:

```json
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"]
    }
```

- [ ] **Step 3: Verify both entries exist**

Run: `jq '.mcpServers | keys' /c/Users/CEO/Echo9/.mcp.json`
Expected: `["context7","playwright"]`

- [ ] **Step 4: Smoke test**

Restart the Claude session. Run `/mcp`. Confirm both `context7` and `playwright` appear as connected.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/CEO/Echo9 && git add .mcp.json && git commit -m "chore(claude): register playwright MCP server"
```

---

## Task 6: Create `content-author` skill

**Files:**
- Create: `Echo9/.claude/skills/content-author/SKILL.md`
- Create: `Echo9/.claude/skills/content-author/references/schemas.md`

- [ ] **Step 1: Write the smoke-test assertion first**

Document the success criterion in the skill itself (no separate test file — skills are validated by use). The skill MUST produce a content file that satisfies `npm run test:run game/src/tests/content/q1ContentParse.test.ts`.

- [ ] **Step 2: Write the schema reference**

Use the Write tool to create `C:\Users\CEO\Echo9\.claude\skills\content-author\references\schemas.md`:

```markdown
# Echo9 Content Schemas

All content lives in `game/src/content/`. Each file must validate against a Zod schema in `game/src/schemas/`.

## Schema files and their content type

| Schema | Content file pattern | Key required fields |
|---|---|---|
| `taskNode.schema.ts` | `content/tasks/*.task.ts` | `id`, `title`, `prompt`, `choices[]`, `silasPrompts[]` |
| `choiceNode.schema.ts` | inline in task `choices[]` | `id`, `keybind`, `label`, `meterDeltas`, `hooksFired` |
| `consequenceHook.schema.ts` | `content/hooks/*.hook.ts` | `id`, `sourceTask`, `sourceChoice`, `revealCondition`, `whyNow`, `whatChanged`, `ledger`, `trace` |
| `moduleNode.schema.ts` | `content/modules/*.module.ts` | `id`, `name`, `voice`, `abilities[]` |
| `inspectionScene.schema.ts` | `content/inspections/*.scene.ts` | `id`, `setting`, `postureCategory`, `prompts[]` |
| `capitalCard.schema.ts` | `content/capitalDeployments/*.cards.ts` | `id`, `name`, `cost`, `effect`, `keywords[]` |
| `gameState.schema.ts` | runtime only | n/a — derived |
| `comfortSettings.schema.ts` | localStorage `echo9:comfort` | `textSize`, `motion`, `contrast`, `voicePrefix`, `narrationPace`, `pauseOnBlur` |
| `saveSlot.schema.ts` | localStorage `echo9:autosave` | n/a — derived |
| `silasPrompt.schema.ts` | inline in task `silasPrompts[]` | `id`, `text`, `triggerCondition` |
| `resultTrace.schema.ts` | runtime ledger | n/a — derived |

## Cross-reference rules

- `consequenceHook.revealCondition.meter` MUST be a real `MeterId` from `game/src/state/store.ts`.
- `consequenceHook.sourceTask` MUST resolve to an existing `taskNode.id`.
- `consequenceHook.sourceChoice` MUST resolve to a `choiceNode.id` under that task.
- `moduleNode.abilities[].dispatchKey` MUST have a matching entry in the dispatch table at `game/src/systems/moduleAbilityEngine.ts`.

## Validation gate

The `q1ContentParse.test.ts` test loads every content file through its schema. A new file passes only when:

1. All Zod-required fields are present and well-typed.
2. All cross-references resolve.
3. The `npm run test:run game/src/tests/content/q1ContentParse.test.ts` exit code is 0.
```

- [ ] **Step 3: Write the skill manifest**

Use the Write tool to create `C:\Users\CEO\Echo9\.claude\skills\content-author\SKILL.md`:

```markdown
---
name: content-author
description: Scaffold and validate a new Echo9 content file (task, hook, module, inspection scene, or capital card) against its Zod schema, then run the q1ContentParse test to confirm cross-references resolve.
disable-model-invocation: true
---

# content-author

User-invoked via `/content-author <kind>`. Walks the author through creating a single content file end-to-end.

## Usage

```
/content-author task
/content-author hook
/content-author module
/content-author inspection
/content-author capital
```

## Workflow

1. **Read the schema** for the requested kind from `game/src/schemas/<kind>.schema.ts`.
2. **Read the reference** at `references/schemas.md` for required-field and cross-reference rules.
3. **Ask the author** (via AskUserQuestion only — see global rules) for:
   - The new content's `id` (kebab-case).
   - For tasks: title, prompt, and up to 4 choices (label + keybind + meterDelta vector).
   - For hooks: which task + choice fires it, which meter threshold reveals it, and the 7 §11 fields (whyNow, whatChanged, trace, ledger, sourceTask, sourceChoice, reveal).
   - For modules: name, voice prefix, ability list with dispatchKey + meterCost.
   - For inspections: setting, posture category, list of prompts.
   - For capital cards: name, cost, effect, keywords.
4. **Generate the file** under the correct path (`game/src/content/<kind>s/<id>.<kind>.ts`).
5. **Validate** by running `cd game && npx vitest run src/tests/content/q1ContentParse.test.ts` and reporting pass/fail.
6. **If fail**: surface the Zod error path + line and offer two paths via AskUserQuestion: (a) retry the field, (b) abandon the draft and roll back.

## Success criterion

The created file passes `npm run test:run` for the q1ContentParse test, AND all cross-references (meter IDs, taskIds, dispatchKeys) resolve to existing identifiers.

## Anti-patterns

- Do NOT invent new `MeterId`s. The set is fixed in `game/src/state/store.ts`.
- Do NOT auto-fix Zod errors by guessing. Ask the author.
- Do NOT modify existing content files. This skill creates new files only.
```

- [ ] **Step 4: Verify files exist and skill is parseable**

Run: `ls /c/Users/CEO/Echo9/.claude/skills/content-author/ && head -5 /c/Users/CEO/Echo9/.claude/skills/content-author/SKILL.md`
Expected: 2 files listed, frontmatter `name: content-author` visible.

- [ ] **Step 5: Smoke test by invoking the skill in a new session**

Run `/content-author task`. Confirm the skill loads, reads the task schema, and asks the first author question via AskUserQuestion.

- [ ] **Step 6: Commit**

```bash
cd /c/Users/CEO/Echo9 && git add .claude/skills/content-author/ && git commit -m "feat(claude): add content-author skill for scaffolding Echo9 content files"
```

---

## Task 7: Create `perf-baseline-check` skill

**Files:**
- Create: `Echo9/.claude/skills/perf-baseline-check/SKILL.md`

- [ ] **Step 1: Confirm baseline doc exists**

Run: `head -20 /c/Users/CEO/Echo9/game/docs/perf-baseline.md`
Expected: file with §13 budget values (gzip, choice p95, save p95, save bytes, heap, FPS).

- [ ] **Step 2: Write the skill**

Use the Write tool to create `C:\Users\CEO\Echo9\.claude\skills\perf-baseline-check\SKILL.md`:

```markdown
---
name: perf-baseline-check
description: Re-run the §13 performance budgets (build size, choice p95, save p95, save bytes, heap, FPS, soak heap drift) and diff results against game/docs/perf-baseline.md. Surface any budget regression with a one-line summary per metric.
---

# perf-baseline-check

Verifies PLAN.md §13 perf budgets after a meaningful state, render, or persist change.

## When to invoke

- After any change to `game/src/state/`, `game/src/systems/`, or `game/src/ui/shell/Layout.tsx`.
- Before claiming a vertical-slice task complete.
- Before any release-candidate tag.

## Budgets (from PLAN.md §13)

| Metric | Budget | Source |
|---|---|---|
| Prod gzip size | < 275 KB | `npm run build` output |
| Choice commit p95 | < 16 ms | DevHUD `devMetrics.choiceP95` |
| Save serialize p95 | < 50 ms | DevHUD `devMetrics.saveP95` |
| Save bytes | < 500 KB | `JSON.stringify(getSnapshot()).length` |
| Heap (steady-state) | < 150 MB | `performance.memory.usedJSHeapSize` |
| FPS | > 50 | DevHUD `devMetrics.fps` |
| Long tasks | 0 steady-state | DevHUD `devMetrics.longTasks` |
| Soak heap drift (500 iter) | < 5 MB | `npm run test:soak` |
| Soak save p95 | < 250 ms | `npm run test:soak` |

## Procedure

1. Run `cd game && npm run build` and parse gzip size from the rollup-visualizer JSON.
2. Run `cd game && npm run dev` in the background; open the DevHUD via `?devhud=1` query param.
3. Sample `devMetrics` after 30 seconds of idle + 10 choice commits + 5 save round-trips.
4. Run `cd game && SOAK_ITERATIONS=500 npm run test:soak`.
5. Diff every metric against `game/docs/perf-baseline.md`. For each regression: produce a one-line entry of the form `METRIC: BUDGET (prev: PREV, now: NOW, delta: ΔX)`.
6. Report PASS if all budgets hold; FAIL listing only the regressed metrics.

## Output format

```
PASS — 9/9 budgets hold (vs 2026-06-30 baseline)
```

or

```
FAIL — 2/9 budgets regressed:
  choice_p95: 16ms (prev: 0.4ms, now: 18.2ms, delta: +17.8ms)
  heap_steady: 150MB (prev: 22MB, now: 161MB, delta: +139MB)
```

## Do not

- Do NOT update `game/docs/perf-baseline.md` automatically. Baselines are author-locked; updating them requires explicit user authorization via AskUserQuestion.
- Do NOT skip the soak run for any change touching persist middleware or the ledger.
```

- [ ] **Step 3: Verify the skill parses**

Run: `head -4 /c/Users/CEO/Echo9/.claude/skills/perf-baseline-check/SKILL.md`
Expected: frontmatter with `name: perf-baseline-check`.

- [ ] **Step 4: Commit**

```bash
cd /c/Users/CEO/Echo9 && git add .claude/skills/perf-baseline-check/ && git commit -m "feat(claude): add perf-baseline-check skill for §13 budget verification"
```

---

## Task 8: Create `content-schema-reviewer` subagent

**Files:**
- Create: `Echo9/.claude/agents/content-schema-reviewer.md`

- [ ] **Step 1: Write the agent definition**

Use the Write tool to create `C:\Users\CEO\Echo9\.claude\agents\content-schema-reviewer.md`:

```markdown
---
name: content-schema-reviewer
description: Reviews new or modified Echo9 content files (tasks, hooks, modules, inspections, capital cards) for Zod-schema compliance AND cross-reference integrity. Use after any change under game/src/content/. Reports findings as STRENGTHS / ISSUES / SUGGESTIONS with file:line citations.
tools: Read, Grep, Glob, Bash
---

# content-schema-reviewer

Reads every changed content file and validates it against three layers of correctness.

## Review dimensions

### 1. Schema compliance
- Every required field per the matching Zod schema in `game/src/schemas/`.
- Field types match (no string-where-enum, no missing optional fields the codebase relies on).
- File location matches the schema's convention.

### 2. Cross-reference integrity
- `consequenceHook.revealCondition.meter` resolves to a real `MeterId` in `game/src/state/store.ts`.
- `consequenceHook.sourceTask` resolves to an existing `taskNode.id`.
- `consequenceHook.sourceChoice` resolves to a `choiceNode.id` UNDER that task.
- `moduleNode.abilities[].dispatchKey` has a matching entry in `game/src/systems/moduleAbilityEngine.ts`.
- `taskNode.choices[].hooksFired` references real hook IDs.

### 3. Q1 content suite gate
- Run `cd game && npx vitest run src/tests/content/q1ContentParse.test.ts`.
- Report the exit code and any Zod path that failed.

## Output format

```
## STRENGTHS
- [bullet, with file:line]

## ISSUES (Critical)
- [file:line — what's wrong, what the schema requires]

## ISSUES (Important)
- [file:line — same]

## SUGGESTIONS
- [optional improvements]

## Test gate
PASS or FAIL — vitest q1ContentParse exit code
```

## Do not

- Do NOT modify any files. Read-only review.
- Do NOT propose new content. Only review what changed.
- Do NOT suggest renaming `MeterId`s or `dispatchKey`s — those are stable contracts.
```

- [ ] **Step 2: Verify the agent parses**

Run: `head -5 /c/Users/CEO/Echo9/.claude/agents/content-schema-reviewer.md`
Expected: frontmatter with `name: content-schema-reviewer` and `tools: Read, Grep, Glob, Bash`.

- [ ] **Step 3: Smoke test**

In a new session, dispatch the agent via `Agent(subagent_type="content-schema-reviewer", prompt="Review the q1Inspection scene at game/src/content/inspections/q1Inspection.scene.ts")`. Confirm it returns a STRENGTHS / ISSUES / SUGGESTIONS report.

- [ ] **Step 4: Commit**

```bash
cd /c/Users/CEO/Echo9 && git add .claude/agents/content-schema-reviewer.md && git commit -m "feat(claude): add content-schema-reviewer subagent"
```

---

## Task 9: Create `a11y-reviewer` subagent

**Files:**
- Create: `Echo9/.claude/agents/a11y-reviewer.md`

- [ ] **Step 1: Write the agent definition**

Use the Write tool to create `C:\Users\CEO\Echo9\.claude\agents\a11y-reviewer.md`:

```markdown
---
name: a11y-reviewer
description: Reviews Echo9 UI changes under game/src/ui/** for WCAG 2.2 AA compliance with focus on the comfort-settings pillar (keyboard nav, radiogroup wrap/Home/End, reduced-motion, contrast tokens, voice prefix, focus management). Use before closing any T-N task that touches UI.
tools: Read, Grep, Glob, Bash
---

# a11y-reviewer

Project-local wrapper around WCAG 2.2 AA review focused on Echo9's first-class a11y pillars.

## Scope

ONLY files under `game/src/ui/**`. Out of scope: `game/src/systems/`, `game/src/state/` (unless they expose comfort settings).

## Review dimensions

### Keyboard navigation
- Every interactive element reachable via Tab.
- Radiogroups: Up/Down within group, Home/End scoped to row, no wrap across groups.
- Number-key bindings (1-4) don't double-commit (T9 regression — `defaultPrevented` guard).
- Focus visibly traps inside modal dialogs (`<dialog>` shown via `showModal()`).

### Comfort settings
- Honors `motion: 'reduced'` (no transform animations, no decorative motion).
- Honors `contrast: 'high'` (uses high-contrast palette tokens).
- Honors `textSize: 'L'` (rem-based sizing, no fixed pixel values).
- Honors `voicePrefix` (Silas prompts use the chosen voice).
- Honors `pauseOnBlur: 'on'` (timers pause on `visibilitychange`).

### Screen reader / ARIA
- Every meaningful action has `aria-label` or visible text.
- Radio groups use `role="radiogroup"` + `role="radio"` (no nested roles per T10 polish).
- Dialogs use `aria-labelledby` pointing to the heading.
- Live regions (`role="status"`, `role="alert"`) used for ephemeral toasts.

### Visual / WCAG 2.2 AA
- Contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text (verify against the locked palette in `game/src/ui/tokens/palette.ts`).
- Focus indicator visible on every interactive element.
- No information conveyed by color alone.

## Output format

```
## STRENGTHS
- [bullet, file:line]

## ISSUES (Blocker — WCAG 2.2 AA fail)
- [file:line — what fails, which SC]

## ISSUES (Important — comfort-pillar regression)
- [file:line — same]

## SUGGESTIONS
- [polish]
```

## Delegation

For deep WCAG questions outside the comfort-pillar scope, surface the question and recommend dispatching `a11y-architect` directly.

## Do not

- Do NOT modify files. Read-only review.
- Do NOT propose palette changes — palette tokens are PLAN.md-locked (see PLAN.md §3).
- Do NOT mark a task "ready" if any Blocker is open.
```

- [ ] **Step 2: Verify the agent parses**

Run: `head -5 /c/Users/CEO/Echo9/.claude/agents/a11y-reviewer.md`
Expected: frontmatter with `name: a11y-reviewer`.

- [ ] **Step 3: Smoke test**

In a new session, dispatch the agent against `game/src/ui/shell/Layout.tsx`. Confirm output structure matches the format above.

- [ ] **Step 4: Commit**

```bash
cd /c/Users/CEO/Echo9 && git add .claude/agents/a11y-reviewer.md && git commit -m "feat(claude): add a11y-reviewer subagent for comfort-pillar WCAG review"
```

---

## Self-Review Notes

- **Spec coverage**: All 8 backlog items (CLAUDE.md, 2 hooks, 2 MCP, 2 skills, 2 subagents) map to Tasks 1–9. Task 2 + 3 share a settings.json file but operate on different keys (`PostToolUse` vs `PreToolUse`) — independent.
- **No placeholders**: Every code block is complete and copy-pasteable. No "TBD", no "similar to Task N".
- **Type consistency**: `MeterId`, `taskNode.id`, `choiceNode.id`, `consequenceHook.sourceChoice`, `dispatchKey` are all named consistently across Tasks 6, 8 (the content-author skill and content-schema-reviewer agent both reference the same identifier surface).
- **Ordering rationale**: 1 (CLAUDE.md) → 2,3 (hooks, protects PLAN.md from later tasks) → 4,5 (MCP, used by skills) → 6,7 (skills) → 8,9 (subagents). No task depends on later tasks.
- **Gap check**: The user's instruction also expanded `~/.claude/CLAUDE.md` (global) for AskUserQuestion enforcement. That was already applied this turn and is intentionally out-of-scope for this Echo9-local plan.
