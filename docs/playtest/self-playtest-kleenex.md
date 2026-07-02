# Solo Kleenex Playtest Protocol

Adapted from `game-design:playtest-plan` for a solo dev with no external testers. The Kleenex session simulates a fresh, uncalibrated first-touch player: notice everything, fix nothing during play, log emotional beats on paper.

## 1. When to run

- **After any Tier-1 feature lands** — a new task node, module, capital card, or inspection scene. Before invoking `polish-review` or `tutorial-review`.
- **Monthly cadence** — one Kleenex session per calendar month at minimum, even if no Tier-1 feature landed. Missing a month is a red flag.
- **Never** in the same week as a Deep session (attention contamination — see anti-patterns).

## 2. Setup

- **Mandatory ≥24h code break** before the session. If you touched the code in the last 24 hours, reschedule. This is non-negotiable — the whole point is to approximate a stranger's first-touch attention.
- **Wipe local state**:
  - `echo9:autosave` (localStorage) — delete.
  - `echo9:comfort` (localStorage) — delete. Start with defaults.
- **Use the production bundle, not the dev server**:
  - `npm run build && npm run preview` from `game/`.
  - No HMR, no DevHUD (unless a specific comfort setting enables it via query string).
- **Physical notebook and pen — no digital notes.** Typing steals attention from the screen; handwriting keeps you inside the session.
- **Close Slack, email, and every other browser tab.** Room lighting matched to what a real player would use (dim, evening).

## 3. During play (15–20 min)

Record every one of the following on paper the moment it happens. Do not stop to think about it; a two-word note is enough.

- Every confusion — even a half-second "wait, what?"
- Every misclick, mistap, or missed keyboard shortcut.
- Every emotional beat — dread, boredom, curiosity, laughter, disgust, guilt.
- Every unread text panel — did you skip past a paragraph because the layout felt long?
- Your first-read of the **trace ledger** — what did you think it was? Did you read it or scan-past it? (PLAN.md §17 ship-gate signal.)

Do not restart. Do not open DevTools. Do not fix anything. Play like a stranger.

## 4. After play (immediate, on paper)

Before you open the code or type anything into a file, answer these three questions in the notebook in one sitting:

1. **What was this session about, in one sentence?** (No jargon. What did it feel like it was about?)
2. **What surprised you?** (One entry per surprise. Good, bad, or ambiguous.)
3. **Would you replay tomorrow?** (Yes / No / Maybe — and one-line why.)

These three answers are the load-bearing artifact of the session. Everything else is supporting evidence.

## 5. Post-processing (next day, not sooner)

- Transcribe the notebook into `docs/playtest/sessions/YYYY-MM-DD-kleenex.md`. Preserve the raw phrasing — no cleaning up.
- Invoke the `fun-review` skill against the transcribed notes and the three answers. Fill out `docs/playtest/rubrics/fun-review.md` for this session.
- **Trigger rules**:
  - ≥2 confusions on the same UI beat → invoke `tutorial-review` against that beat.
  - ≥2 misclicks on the same widget → file a design bug (widget affordance is wrong, not the player).
  - ≥1 emotional beat that surprised you positively → mark as candidate for `design-discovery` accumulator.

## 6. Anti-patterns

- **Do not fix bugs during the session.** If you spot a defect, write "BUG:" and one word in the notebook, then keep playing.
- **Do not compare to design intent during play.** "This was supposed to feel X" is a post-session thought.
- **Do not play twice in a row.** A second run within the same day is calibrated by the first — no longer Kleenex.
- **Do not skip the 24h code break.** Fresh attention is the entire deliverable; without it, you are running a smoke test, not a Kleenex.
- **Do not type notes during play.** Handwriting slows you down just enough to catch feelings; typing races past them.
