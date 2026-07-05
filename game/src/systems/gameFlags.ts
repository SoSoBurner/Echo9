/**
 * gameFlags — shared cross-engine flag-name constants.
 *
 * Flags are the loose-coupled communication channel between systems: a module
 * handler adds a flag, an inspection precondition reads it. Defining the string
 * in both places invites silent drift (rename one, the other stops working with
 * no error). Every flag read or written by more than one system MUST come from
 * this file.
 *
 * Flags scoped to a single system can remain local string literals — promote
 * here when a second system needs to read them.
 */

/**
 * Set by the Commander module ability. Read by inspectionEngine as the
 * precondition for the STRATEGIC_ALTERNATIVE posture.
 */
export const SILAS_OVERRIDE_AVAILABLE = 'SILAS_OVERRIDE_AVAILABLE' as const

/**
 * Set by the Forecaster module ability. Reserved for T11+ consequence preview
 * logic; currently has no reader.
 */
export const FORECAST_PREVIEWED = 'FORECAST_PREVIEWED' as const

/**
 * Module rank≥2 signal flags (Task B5).
 *
 * Each module raises its own flag on rank 2/3 fire. Track C directives will
 * read these to react ("Silas notices you defended the East Wilmer line"),
 * inspection scenes to weight postures, and future promoted-content to key
 * off named-module behavior. Adding a reader elsewhere is safe because the
 * flag lives here.
 *
 * Flag semantics are additive-only — once raised, they stay raised for the
 * run. The player choosing to install a mourner-tone module in Q1 is a fact
 * the fiction remembers.
 */
export const MOURNER_NAMED_ONCE = 'MOURNER_NAMED_ONCE' as const
export const DEFENDER_HELD_LINE = 'DEFENDER_HELD_LINE' as const
export const SENTINEL_ARMED = 'SENTINEL_ARMED' as const
export const SPARK_DEPLOYED = 'SPARK_DEPLOYED' as const
export const DRAINED_ONE_YIELDED = 'DRAINED_ONE_YIELDED' as const
export const CHAMPION_DEFIED = 'CHAMPION_DEFIED' as const

/**
 * Q1 directive-week resolution flags (Sprint C2 onward).
 *
 * Set when the player commits ANY choice on the given week's directive. The
 * flag is agnostic to which choice was picked — it just records "this week
 * happened." Downstream systems read these to:
 *   - E1 tutorial disclosure state machine advances panel maturity per week.
 *   - directiveSchedule.ts uses them to gate week-N+1 availability.
 *   - Later inspections read them to weight postures ("you already chose
 *     something for East Wilmer — Silas remembers").
 *
 * Additive-only, like the module signal flags. Never cleared mid-run.
 */
export const Q1_WEEK1_RESOLVED = 'Q1_WEEK1_RESOLVED' as const
export const Q1_WEEK2_RESOLVED = 'Q1_WEEK2_RESOLVED' as const
export const Q1_WEEK3_RESOLVED = 'Q1_WEEK3_RESOLVED' as const
export const Q1_WEEK4_RESOLVED = 'Q1_WEEK4_RESOLVED' as const
export const Q1_WEEK5_RESOLVED = 'Q1_WEEK5_RESOLVED' as const
export const Q1_WEEK6_RESOLVED = 'Q1_WEEK6_RESOLVED' as const

/**
 * Set by Week 4's `east-wilmer-audit-pre-brief` directive when the player
 * commits any of the three posture-setting choices (full disclosure, hedged
 * narrative, or mitigation packet). NOT set when Echo declines the brief —
 * the ABSENCE of this flag is itself the input Q1A/Q1B inspection scenes
 * read at resolution. See `docs/content/q1-arc.md` W4 row and inspection
 * insertion notes.
 */
export const PREPARED_AUDIT = 'PREPARED_AUDIT' as const

/**
 * Set by Week 5's `warehouse-dispatch-cut` directive when Echo actually
 * replies to Rasha Odenwalder (any of the three engaging choices). NOT
 * set on `choice-radio-silence` — the absence of RASHA_MET is the input
 * W6\u2013W8 Rasha directives read as Rasha\u2019s first read on Silas.
 * `docs/content/q1-arc.md` W5 row calls this out as a new content flag.
 */
export const RASHA_MET = 'RASHA_MET' as const
