/**
 * AccessibilityComfortPanel — collects the 6 a11y/comfort settings on first
 * boot and persists them to localStorage['echo9:comfort'] (Task 14,
 * PLAN.md §10, §3.3.7 Redundant Entry).
 *
 * Pattern: each setting is a <fieldset><legend> group of native <input
 * type="radio"> elements. Native radios are the WCAG-conformant baseline for
 * mutually exclusive choices — no roving tabindex, no custom keyboard
 * handlers, no aria-checked drift. Tab moves between groups; arrows move
 * within a group; Space/Enter activates. The browser handles all of it.
 *
 * T14 scope: PERSIST only. Applying the settings to the runtime (font
 * scaling, motion gating, contrast theming, etc.) is downstream polish work.
 * Storing the choice now so it is never re-prompted (§3.3.7) is the spec
 * line this component satisfies.
 */
import { useState, useCallback } from 'react'
import {
  COMFORT_DEFAULTS,
  COMFORT_STORAGE_KEY,
  type ComfortSettings,
  type TextSize,
  type Motion,
  type Contrast,
  type VoicePrefix,
  type NarrationPace,
  type PauseOnBlur,
} from '@schemas/comfortSettings.schema'

interface AccessibilityComfortPanelProps {
  /** Called after Continue persists. Parent flips its gate to render BootScreen's Initialize. */
  onComplete: () => void
}

interface RadioOption<T extends string> {
  value: T
  label: string
}

const TEXT_SIZE_OPTIONS: ReadonlyArray<RadioOption<TextSize>> = [
  { value: 'S',  label: 'Small' },
  { value: 'M',  label: 'Medium' },
  { value: 'L',  label: 'Large' },
  { value: 'XL', label: 'Extra Large' },
]

const MOTION_OPTIONS: ReadonlyArray<RadioOption<Motion>> = [
  { value: 'full',    label: 'Full motion' },
  { value: 'reduced', label: 'Reduced motion' },
  { value: 'none',    label: 'No motion' },
]

const CONTRAST_OPTIONS: ReadonlyArray<RadioOption<Contrast>> = [
  { value: 'standard',  label: 'Standard contrast' },
  { value: 'increased', label: 'Increased contrast' },
]

const VOICE_PREFIX_OPTIONS: ReadonlyArray<RadioOption<VoicePrefix>> = [
  { value: 'off',        label: 'Off' },
  { value: 'silas',      label: '"Silas:" prefix' },
  { value: 'silas-says', label: '"Silas says:" prefix' },
]

const NARRATION_PACE_OPTIONS: ReadonlyArray<RadioOption<NarrationPace>> = [
  { value: 'instant',      label: 'Instant' },
  { value: 'polite-queue', label: 'Polite queue' },
  { value: 'on-demand',    label: 'On demand' },
]

const PAUSE_ON_BLUR_OPTIONS: ReadonlyArray<RadioOption<PauseOnBlur>> = [
  { value: 'on',  label: 'Pause on focus loss' },
  { value: 'off', label: 'Pause off (keep running when unfocused)' },
]

export function AccessibilityComfortPanel({
  onComplete,
}: AccessibilityComfortPanelProps) {
  const [settings, setSettings] = useState<ComfortSettings>(COMFORT_DEFAULTS)

  const handleContinue = useCallback(() => {
    try {
      localStorage.setItem(COMFORT_STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // QuotaExceededError or blocked storage — proceed with defaults.
      // BootScreen will re-show the panel on next launch.
    }
    onComplete()
  }, [settings, onComplete])

  return (
    <main
      className="bg-background min-h-screen flex items-center justify-center px-6 py-12 font-mono"
      aria-label="Accessibility and comfort settings"
    >
      <section className="w-full max-w-2xl space-y-6">
        <header className="space-y-2 text-fg-secondary text-sm tracking-widest uppercase">
          <p>Pre-boot configuration</p>
          <p className="text-null-accent">accessibility & comfort</p>
          <p className="text-fg-primary normal-case tracking-normal text-sm">
            These settings persist. You will not be asked again on replay.
          </p>
        </header>

        <RadioGroup
          legend="Text size"
          name="textSize"
          options={TEXT_SIZE_OPTIONS}
          value={settings.textSize}
          onChange={(v) =>
            setSettings((s) => ({ ...s, textSize: v }))
          }
        />

        <RadioGroup
          legend="Motion"
          name="motion"
          options={MOTION_OPTIONS}
          value={settings.motion}
          onChange={(v) => setSettings((s) => ({ ...s, motion: v }))}
        />

        <RadioGroup
          legend="Contrast"
          name="contrast"
          options={CONTRAST_OPTIONS}
          value={settings.contrast}
          onChange={(v) => setSettings((s) => ({ ...s, contrast: v }))}
        />

        <RadioGroup
          legend="Voice prefix"
          name="voicePrefix"
          options={VOICE_PREFIX_OPTIONS}
          value={settings.voicePrefix}
          onChange={(v) =>
            setSettings((s) => ({ ...s, voicePrefix: v }))
          }
        />

        <RadioGroup
          legend="Narration pacing"
          name="narrationPace"
          options={NARRATION_PACE_OPTIONS}
          value={settings.narrationPace}
          onChange={(v) =>
            setSettings((s) => ({ ...s, narrationPace: v }))
          }
        />

        <RadioGroup
          legend="Pause on focus loss"
          name="pauseOnBlur"
          options={PAUSE_ON_BLUR_OPTIONS}
          value={settings.pauseOnBlur}
          onChange={(v) =>
            setSettings((s) => ({ ...s, pauseOnBlur: v }))
          }
        />

        <div className="pt-4">
          <button
            type="button"
            onClick={handleContinue}
            className="
              w-full sm:w-auto
              px-8 py-3
              border border-sealed-dim
              text-fg-primary text-sm tracking-widest uppercase
              hover:border-null-accent
              focus:outline-none focus:ring-2 focus:ring-null-accent
              transition-colors
              cursor-pointer
            "
          >
            [ Continue ]
          </button>
        </div>
      </section>
    </main>
  )
}

/**
 * Generic radio group. Renders a <fieldset><legend> with native radios.
 * The `name` attribute scopes each group so the browser's native single-
 * selection semantics apply per-group.
 */
function RadioGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string
  name: string
  options: ReadonlyArray<RadioOption<T>>
  value: T
  onChange: (next: T) => void
}) {
  return (
    <fieldset className="border border-sealed-dim p-4 space-y-2">
      <legend className="text-fg-secondary text-xs uppercase tracking-widest px-2">
        {legend}
      </legend>
      <div className="flex flex-col gap-1.5">
        {options.map((opt) => {
          const id = `comfort-${name}-${opt.value}`
          return (
            <label
              key={opt.value}
              htmlFor={id}
              className="flex items-center gap-2 text-fg-primary text-sm cursor-pointer"
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                className="accent-null-accent"
              />
              <span>{opt.label}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
