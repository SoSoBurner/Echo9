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
