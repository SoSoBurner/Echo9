#!/usr/bin/env node
/**
 * voiceRegisterLint.mjs — LLM-judged humanization + persona-drift lint (Sprint P8).
 *
 * For each voice line pool under `src/content/voices/<voice>/<register>.ts`,
 * asks an LLM judge (claude-sonnet-4-6) to score every line on:
 *   - humanization (1-5): reads like this specific character (qa-log Q27d bar)
 *   - drift        (1-5): departs from the persona bible / register spec
 * A file FAILS if any line scores humanization < 4 OR drift > 2 (Q27).
 *
 * Cost control (qa-log Q20): each file's SHA-256 is cached alongside its
 * judge results in `.voice-lint-cache/<voice>-<register>.json`. Unchanged
 * files are never re-judged — the cached verdict is replayed for free.
 *
 * Usage:
 *   node scripts/voiceRegisterLint.mjs                      # all files, cache-aware
 *   node scripts/voiceRegisterLint.mjs --voice mourner      # one voice (10 registers)
 *   node scripts/voiceRegisterLint.mjs --register angry     # one register (9 voices)
 *   node scripts/voiceRegisterLint.mjs --voice null --register corrupted
 *   node scripts/voiceRegisterLint.mjs --all                # ignore cache, re-judge everything
 *   node scripts/voiceRegisterLint.mjs --dry-run            # print judge prompts, no API, no cache writes
 *
 * Requires ANTHROPIC_API_KEY in the environment (except --dry-run).
 * Exit codes: 0 = all pass, 1 = lint failures, 2 = configuration/crash.
 */
import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const GAME_ROOT = resolve(import.meta.dirname, '..')
const REPO_ROOT = resolve(GAME_ROOT, '..')
const VOICES_DIR = join(GAME_ROOT, 'src', 'content', 'voices')
const CACHE_DIR = join(GAME_ROOT, '.voice-lint-cache')
const BIBLES_PATH = join(REPO_ROOT, 'docs', 'voices', 'persona-bibles.md')
const CATALOG_PATH = join(REPO_ROOT, 'docs', 'voices', 'register-catalog.md')

const MODEL = 'claude-sonnet-4-6'
const HUMANIZATION_MIN = 4 // Q27: fail if humanization < 4
const DRIFT_MAX = 2 //        Q27: fail if drift > 2

/** Voice directory name -> persona-bible `## <heading>` prefix. */
const BIBLE_HEADINGS = {
  null: 'Null',
  mourner: 'The Mourner',
  defender: 'The Defender',
  sentinel: 'The Sentinel',
  forecaster: 'The Forecaster',
  commander: 'The Commander',
  spark: 'The Spark',
  drainedOne: 'The Drained One',
  champion: 'The Champion',
}

// ---------------------------------------------------------------- CLI args

function parseArgs(argv) {
  const args = { voice: null, register: null, dryRun: false, all: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--voice') args.voice = argv[++i]
    else if (a === '--register') args.register = argv[++i]
    else if (a === '--dry-run') args.dryRun = true
    else if (a === '--all') args.all = true
    else {
      console.error(`Unknown argument: ${a}`)
      console.error('Usage: node scripts/voiceRegisterLint.mjs [--voice <v>] [--register <r>] [--dry-run] [--all]')
      process.exit(2)
    }
  }
  return args
}

// ------------------------------------------------------------ doc sections

/** Split a markdown doc on `## ` headings; return [{ heading, body }]. */
function sections(md) {
  const out = []
  const parts = md.split(/\n(?=## )/)
  for (const part of parts) {
    const m = part.match(/^## (.+)\n([\s\S]*)$/)
    if (m) out.push({ heading: m[1].trim(), body: m[2].trim() })
  }
  return out
}

function bibleSection(biblesMd, voice) {
  const heading = BIBLE_HEADINGS[voice]
  const sec = sections(biblesMd).find((s) => s.heading.startsWith(heading))
  if (!sec) throw new Error(`No persona-bible section found for voice "${voice}" (heading "${heading}")`)
  return `## ${sec.heading}\n\n${sec.body}`
}

function registerSection(catalogMd, register) {
  const secs = sections(catalogMd)
  const sec = secs.find((s) => s.heading === register)
  if (!sec) throw new Error(`No register-catalog section found for register "${register}"`)
  const invariants = secs.find((s) => s.heading.startsWith('Cross-register invariants'))
  let text = `## ${sec.heading}\n\n${sec.body}`
  if (invariants) text += `\n\n## ${invariants.heading}\n\n${invariants.body}`
  return text
}

// ------------------------------------------------------------ LINES parse

/**
 * Extract the LINES array from a voice pool .ts file WITHOUT importing TS.
 * Matches `export const LINES: string[] = [ ... ]` and JSON-parses each
 * double-quoted string literal inside (handles \" escapes).
 */
function extractLines(source, filePath) {
  const m = source.match(/export const LINES\s*:\s*string\[\]\s*=\s*\[([\s\S]*?)\n\]/)
  if (!m) throw new Error(`Could not locate \`export const LINES: string[] = [...]\` in ${filePath}`)
  const body = m[1]
  const lines = []
  const strRe = /"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'/g
  let sm
  while ((sm = strRe.exec(body)) !== null) {
    if (sm[1] !== undefined) lines.push(JSON.parse(`"${sm[1]}"`))
    else lines.push(sm[2].replace(/\\(.)/g, '$1'))
  }
  if (lines.length === 0) throw new Error(`LINES array parsed empty in ${filePath}`)
  return lines
}

// ------------------------------------------------------------ judge prompt

function buildPrompt({ voice, register, bible, registerSpec, lines }) {
  return `You are a strict fiction line-editor for the narrative game Echo 9. Judge the following dialogue line pool for the voice "${voice}" in the "${register}" register.

=== PERSONA BIBLE (source of truth for this character) ===
${bible}

=== REGISTER SPEC (how this register must sound) ===
${registerSpec}

=== LINES UNDER REVIEW (${lines.length}) ===
${lines.map((l, i) => `${i + 1}. ${JSON.stringify(l)}`).join('\n')}

=== TASK ===
Score EVERY line on two axes:
- "humanization" (1-5): does this read like this specific, fully humanized character — their wound, quirks, obsessions, cadence? 5 = unmistakably them; 1 = generic HUD prose. Bar: character-first concrete detail ("She typed please twice." not "This is bad.").
- "drift" (1-5): how far the line DEPARTS from the persona bible and register spec (banned words, broken quirk rules, wrong register affect). 1 = fully faithful; 5 = contradicts the bible.

Respond with STRICT JSON only — no markdown fences, no prose — an array of exactly ${lines.length} objects in input order:
[{ "line": "<verbatim line>", "humanization": <1-5>, "drift": <1-5>, "note": "<one short sentence explaining the scores>" }]`
}

// ------------------------------------------------------------ API client

async function judge(prompt, apiKey) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Anthropic API ${res.status}: ${text.slice(0, 500)}`)
  }
  const data = await res.json()
  const raw = (data.content ?? [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
  // Tolerate accidental code fences despite the strict-JSON instruction.
  const jsonText = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
  let results
  try {
    results = JSON.parse(jsonText)
  } catch {
    throw new Error(`Judge returned non-JSON output:\n${raw.slice(0, 500)}`)
  }
  if (!Array.isArray(results)) throw new Error('Judge output is not a JSON array')
  return results
}

// ------------------------------------------------------------ verdicts

function verdict(results) {
  const offenders = results.filter(
    (r) => Number(r.humanization) < HUMANIZATION_MIN || Number(r.drift) > DRIFT_MAX,
  )
  return { pass: offenders.length === 0, offenders }
}

function reportOffenders(label, offenders) {
  for (const o of offenders) {
    console.log(`    FAIL  h=${o.humanization} d=${o.drift}  ${JSON.stringify(o.line)}`)
    if (o.note) console.log(`          note: ${o.note}`)
  }
}

// ------------------------------------------------------------------ main

async function main() {
  const args = parseArgs(process.argv.slice(2))

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey && !args.dryRun) {
    console.error(
      'ANTHROPIC_API_KEY is not set.\n' +
        'The voice-register lint uses the Anthropic API as its LLM judge.\n' +
        'Set it in your environment, e.g.  export ANTHROPIC_API_KEY=sk-ant-...\n' +
        '(or pass --dry-run to preview the judge prompts without calling the API).',
    )
    process.exit(2)
  }

  const [biblesMd, catalogMd] = await Promise.all([
    readFile(BIBLES_PATH, 'utf8'),
    readFile(CATALOG_PATH, 'utf8'),
  ])

  // Discover targets.
  const allVoices = (await readdir(VOICES_DIR, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
  const voices = args.voice ? [args.voice] : allVoices
  for (const v of voices) {
    if (!allVoices.includes(v)) {
      console.error(`Unknown voice "${v}". Known: ${allVoices.join(', ')}`)
      process.exit(2)
    }
  }

  const targets = []
  for (const voice of voices) {
    const files = (await readdir(join(VOICES_DIR, voice))).filter((f) => f.endsWith('.ts'))
    for (const file of files) {
      const register = file.replace(/\.ts$/, '')
      if (args.register && register !== args.register) continue
      targets.push({ voice, register, path: join(VOICES_DIR, voice, file) })
    }
  }
  if (targets.length === 0) {
    console.error('No matching voice/register files found.')
    process.exit(2)
  }

  if (!args.dryRun) await mkdir(CACHE_DIR, { recursive: true })

  let judged = 0
  let cached = 0
  let failures = 0

  for (const t of targets) {
    const source = await readFile(t.path, 'utf8')
    const hash = createHash('sha256').update(source).digest('hex')
    const cachePath = join(CACHE_DIR, `${t.voice}-${t.register}.json`)
    const label = `${t.voice}/${t.register}`

    // Cache check (Q20) — skipped when --all forces a re-judge.
    if (!args.all && !args.dryRun && existsSync(cachePath)) {
      try {
        const entry = JSON.parse(await readFile(cachePath, 'utf8'))
        if (entry.hash === hash && Array.isArray(entry.results)) {
          const { pass, offenders } = verdict(entry.results)
          cached++
          console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${label}  (cached)`)
          if (!pass) {
            failures++
            reportOffenders(label, offenders)
          }
          continue
        }
      } catch {
        // Corrupt cache entry — fall through to a fresh judge run.
      }
    }

    const lines = extractLines(source, t.path)
    const prompt = buildPrompt({
      voice: t.voice,
      register: t.register,
      bible: bibleSection(biblesMd, t.voice),
      registerSpec: registerSection(catalogMd, t.register),
      lines,
    })

    if (args.dryRun) {
      console.log(`\n========== DRY RUN — judge prompt for ${label} (${lines.length} lines) ==========\n`)
      console.log(prompt)
      continue
    }

    process.stdout.write(`  judging ${label} (${lines.length} lines)... `)
    const results = await judge(prompt, apiKey)
    judged++
    const { pass, offenders } = verdict(results)
    console.log(pass ? 'PASS' : 'FAIL')
    if (!pass) {
      failures++
      reportOffenders(label, offenders)
    }
    // Write cache regardless of verdict so unchanged files never re-judge (Q20).
    await writeFile(cachePath, JSON.stringify({ hash, model: MODEL, results }, null, 2) + '\n')
  }

  if (args.dryRun) {
    console.log(`\n[dry-run] ${targets.length} prompt(s) printed. No API calls made, no cache written.`)
    return
  }

  console.log(`\n=== VERDICT ===`)
  console.log(`files: ${targets.length}  judged: ${judged}  cached: ${cached}  failing: ${failures}`)
  console.log(failures === 0 ? 'overall: PASS' : 'overall: FAIL')
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error('CRASHED:', e.message ?? e)
  process.exit(2)
})
