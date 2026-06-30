/**
 * ComfortSettings — the 6 a11y/comfort options collected on first boot
 * (PLAN.md §10 "Accessibility & Comfort panel", §3.3.7 Redundant Entry).
 *
 * Persisted to localStorage key `echo9:comfort` (DISTINCT from the gameplay
 * autosave key `echo9:autosave`). Validated on rehydrate so a corrupt or
 * tampered payload falls back to defaults rather than crashing BootScreen.
 *
 * T14 scope: the panel COLLECTS and PERSISTS these. Applying them to the
 * runtime (font scaling, motion gating, contrast wiring, etc.) is downstream
 * polish work.
 */
import { z } from 'zod'

export const TextSizeSchema       = z.enum(['S', 'M', 'L', 'XL'])
export const MotionSchema         = z.enum(['full', 'reduced', 'none'])
export const ContrastSchema       = z.enum(['standard', 'increased'])
export const VoicePrefixSchema    = z.enum(['off', 'silas', 'silas-says'])
export const NarrationPaceSchema  = z.enum(['instant', 'polite-queue', 'on-demand'])
export const PauseOnBlurSchema    = z.enum(['on', 'off'])

export type TextSize      = z.infer<typeof TextSizeSchema>
export type Motion        = z.infer<typeof MotionSchema>
export type Contrast      = z.infer<typeof ContrastSchema>
export type VoicePrefix   = z.infer<typeof VoicePrefixSchema>
export type NarrationPace = z.infer<typeof NarrationPaceSchema>
export type PauseOnBlur   = z.infer<typeof PauseOnBlurSchema>

export const ComfortSettingsSchema = z.object({
  textSize: TextSizeSchema,
  motion: MotionSchema,
  contrast: ContrastSchema,
  voicePrefix: VoicePrefixSchema,
  narrationPace: NarrationPaceSchema,
  pauseOnBlur: PauseOnBlurSchema,
})

export type ComfortSettings = z.infer<typeof ComfortSettingsSchema>

export const COMFORT_DEFAULTS: ComfortSettings = {
  textSize: 'M',
  motion: 'full',
  contrast: 'standard',
  voicePrefix: 'silas',
  narrationPace: 'polite-queue',
  pauseOnBlur: 'on',
}

/** localStorage key for persisted comfort settings (NOT the autosave key). */
export const COMFORT_STORAGE_KEY = 'echo9:comfort'
