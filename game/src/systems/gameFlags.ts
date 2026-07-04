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
