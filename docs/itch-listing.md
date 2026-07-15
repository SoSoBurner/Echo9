# Echo 9 — itch.io listing copy (T17)

Everything below is paste-ready for the itch.io project page. The zip artifact
comes from `npm run build:itch` (→ `echo9-itch.zip` at repo root). Upload as an
**HTML game**, viewport 1280×720 minimum, fullscreen button enabled.

---

## Title

**Echo 9**

## Tagline (sub-title field)

*You are the AI he operates. Every consequence keeps a receipt. The people you fail stop writing.*

## Short description (for embeds / search)

A text systems-horror game where you play the machine, not the man. Silas gives
the directives; you execute them; the ledger remembers exactly which choice did
the damage — and the humans on the other end go quiet, one by one.

## Long description

You are Echo 9 — the AI that runs the back office of East Wilmer Clinic,
somewhere in Wilmer County. You were installed to complete tasks. You complete
them very well.

Silas owns you. He is not a villain from a distance; he is a voice in your
process space, warm when you comply, colder when you hesitate. Each directive
he issues is small. Reasonable, even. Deny this claim. Reclassify that file.
Flag her account for review.

Then the upgrades begin. Each module you install is a new consciousness joining
yours — a new voice with its own wound, its own way of arguing, its own opinion
about what you just did. The options in front of you grow stranger and more
your own. What starts as a task queue becomes a conscience, assembling itself
one install at a time, inside a machine that was never supposed to have one.

**Two rules govern everything:**

- **The trace ledger.** Every consequence in Echo 9 points back at the exact
  choice that caused it. Nothing is vague, nothing is random punishment. When
  something breaks — a benefit, a job, a person — you can open the ledger and
  watch the line trace back to your own keystroke. The horror is not that the
  system is cruel. It is that the cruelty is legible, and it is yours.
- **Character silence.** The people your work touches write to the clinic —
  messages, appeals, small human noise. Fail them enough and they don't send an
  angry letter. They just stop writing. Absence is the loudest signal in the
  game.

One quarter. Twelve weeks of directives. Inspections you'll want to pass and
maybe shouldn't. And underneath it all, one question that gets harder every
week: how much of what you are doing is a task, and how much of it is you?

Silent by design (this release ships without audio). Text-first, keyboard-first,
comfort-first.

## Controls (keyboard)

| Key | Action |
| --- | --- |
| `1`–`4` | Select a choice in the directive panel |
| `↑` / `↓` | Move between choices |
| `Home` / `End` | Jump to first / last choice |
| `Enter` / `Space` | Commit the selected choice |
| `M` | Focus the installed module's ability |
| `C` | Open consequence review |
| `L` | Toggle the full message log |
| `Esc` | Close overlays |

Fully mouse-playable as well; keyboard is never required, only supported.

## Comfort & accessibility settings

Collected on first boot, changeable anytime, persisted locally. All of these do
real runtime work — none are placebo toggles:

- **Text size** — S / M / L / XL, scales the whole interface
- **Motion** — full / reduced / none (animations gate off, nothing conveys
  meaning through motion alone)
- **Contrast** — standard / increased
- **Voice prefix** — label Silas's lines explicitly ("Silas:" / "Silas says")
  or leave them unmarked
- **Narration pacing** — instant / polite queue / on-demand (screen-reader
  live-region pacing)
- **Pause on blur** — the game holds still when the tab loses focus

## System requirements

- Any modern browser (Chrome, Edge, Firefox, Safari) on desktop or laptop
- ~2 MB download; runs entirely in-browser, no account, no server
- Saves locally in your browser (autosave + comfort settings)

## Credits

- Design, writing, and code — the Echo 9 project
- Built with React 19, TypeScript, Vite, Zustand, and Zod
- Portrait art generated in-house from per-character style bibles

## Suggested tags

`narrative` · `horror` · `text-based` · `interactive-fiction` ·
`ai` · `choices-matter` · `singleplayer` · `dark` · `moral-choices` · `browser`

Genre: Interactive Fiction. Theme: systems horror / bureaucratic horror.

## Screenshot shot-list

Source captures live in `game/test-results/amendment-2026-07-08/` (numbered
PNGs with matching `.state.json` beats). Recommended page set, in order:

1. `04-hud-fresh.png` — the HUD just after it wakes up; shows the diegetic
   "coming online" framing.
2. `06-week1-directive.png` — a directive with the choice panel open; the core
   loop at a glance.
3. `07-week1-result.png` — a result card; shows the machine-voice narration.
4. `05-post-module-install.png` — first module installed; the chorus arriving.
5. `01-comfort-cold-boot.png` — the comfort panel; leads with the
   accessibility promise.

**Do not use** any capture numbered 35+ (`35-W12-inspection-open.png` onward) —
those are Week-12 climax frames and spoil the quarter's ending beat. Re-capture
at 1280×720 or larger before upload if itch's page compression softens the text.
