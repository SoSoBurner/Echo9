# Solo Deep Playtest Protocol

Adapted from `game-design:playtesting-strategy` for a solo dev with no external testers. The Deep session simulates a *returning* player — same save file across 3–5 weeks — and rotates a rubric skill into focus each week so weaknesses surface in every dimension over a month.

## 1. When to run

- **Weekly**, same day of week (e.g., every Friday afternoon). Consistency matters more than the specific day.
- **Same save file for 3–5 consecutive weeks**, then archive and start a new save for the next cycle. This simulates a returning player who has lived with the state.
- Never in the same week as a Kleenex session — see anti-patterns.

## 2. Setup

- **No 24h code break required** (Deep is not fresh-attention), but **no code CHANGES either**. Freeze the branch at session start; if you find yourself wanting to edit code, note it and keep playing.
- **DevHUD ON**: launch with `?dev=1` query string. The Beat panel is the load-bearing instrument for spine-timing checks.
- **Rubrics open in a second window**: the rubric for the week's in-focus skill (see rotation below) is open so you can glance at dimensions without breaking flow.
- **Screen recorder rolling** for the full session. OBS or built-in Windows Game Bar (`Win+G`) is fine. Recording is non-negotiable — see anti-patterns.

## 3. During play

The Deep session runs 20–25 minutes across three phases. Use the DevHUD Beat panel throughout to record spine-beat timings. Target: **first consequence return ≤ minute 40** across the total playtime of the save file. **>10% off target = red flag** — log it, don't fix it mid-session.

### Phase A — First 10 min: Kleenex-style attention

Notice, don't intervene. Record surprises, confusions, emotional beats. This phase is Kleenex-lite: no rubric, just observation. Purpose is to catch drift the returning player would catch on re-entry.

### Phase B — Middle 10 min: Rubric-driven attention on ONE skill (rotate weekly)

Focus attention through the current week's rubric. Rotation:

- **Week 1 — `mechanics-review`** — is each mechanic still satisfying in isolation and combination?
- **Week 2 — `fun-review`** — does the incentive chain still pull? Does surprise still land?
- **Week 3 — `feedback-loop-review`** — pick a loop (capital → Silas → capital; hooks → ledger → hooks); is it still tuned?
- **Week 4 — `polish-review`** — does silence still land? Do micro-animations still feel intentional?

Fill in only the in-focus rubric — do not spread attention across multiple rubrics in one session.

### Phase C — Last 5 min: Explicit break-attempt

Try to break the game. Weird inputs, rapid clicks, refresh mid-choice, degenerate strategies (spam one module, ignore another meter entirely, pick the same choice ten times in a row if the game lets you). Log every anomaly.

## 4. After play

- Fill out the rubric score sheet for the in-focus skill (in `docs/playtest/rubrics/<skill>.md`).
- Save the screen recording. **Do NOT watch immediately** — see anti-patterns.
- Write a two-line session log in `docs/playtest/sessions/YYYY-MM-DD-deep.md`: (a) what was this session about, (b) one thing you didn't expect.

The next day: watch the recording at 2× speed. Note any moment where past-you looked confused or bored that present-you didn't remember. Add those to the session log.

## 5. Every 4th Deep session — invoke `design-discovery`

At the end of a 4-week rotation cycle, invoke the `design-discovery` skill against the accumulated notes from all four sessions. Fill out `docs/playtest/rubrics/design-discovery.md`. Look for patterns suggesting the game **wants to become something the current design doesn't accommodate** — not "what's broken" but "what's trying to emerge."

Concrete triggers to look for:
- Same emergent behavior across ≥3 of the 4 sessions.
- A mechanic the design considers secondary that keeps stealing focus.
- A pillar (identity / comfort / complicity / silence / ritual) that keeps winning attention over the pillars the design highlights.

## 6. Anti-patterns

- **Don't run Deep + Kleenex in the same week.** Kleenex needs fresh attention; Deep exhausts it. Contamination in either direction wastes both sessions.
- **Don't skip the recording.** Present-you cannot see what past-you missed without a rewatch. No recording = the session's most valuable evidence is gone.
- **Don't watch the recording immediately.** Sleep on it. Same-day rewatch is calibrated by the just-lived session; next-day rewatch surfaces what you didn't notice live.
- **Don't change the in-focus rubric mid-cycle.** If Week 2 was supposed to be fun-review, keep it fun-review even if you're itching to look at polish.
- **Don't start a new save file mid-cycle.** The whole point of Deep is that the state accumulates.
