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
