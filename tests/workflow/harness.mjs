// Runs workflows/lab-stage.js outside Claude Code, with a scripted agent() in place of real agents.
// Each scripted result is also written to its _fragment path, as the plugin's recorder hook would.
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = join(HERE, '..', '..')
const SCRIPT = join(ROOT, 'plugins', 'maistro', 'workflows', 'lab-stage.js')
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

export function loadScript() {
  const src = readFileSync(SCRIPT, 'utf8')
  if (!src.startsWith('export const meta')) throw new Error('meta must be the first statement')
  return src.replace(/^export const meta/, 'const meta')
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

// The real runtime makes agents retry until their output fits the schema; here we just trim
// arrays and strings to their limits, which is what a compliant agent would have returned.
export function conform(v, schema) {
  if (!schema || v == null) return v
  if (schema.type === 'array' && Array.isArray(v)) {
    const out = v.map(x => conform(x, schema.items))
    return schema.maxItems != null ? out.slice(0, schema.maxItems) : out
  }
  if (schema.type === 'object' && typeof v === 'object') {
    const out = {}
    for (const [k, x] of Object.entries(v)) out[k] = schema.properties && schema.properties[k] ? conform(x, schema.properties[k]) : x
    return out
  }
  if (schema.type === 'string' && typeof v === 'string' && schema.maxLength != null) return v.slice(0, schema.maxLength)
  return v
}
const hash = s => createHash('sha1').update(s).digest('hex').slice(0, 12)

// opts: { cwd, respond(label, prompt, opts) -> object|null|undefined, jitter: number (seeded delays) }
export async function runStage(args, opts) {
  const calls = []
  const logs = []
  const cwd = opts.cwd
  const jitter = opts.jitter || 0
  const agent = async (prompt, o) => {
    calls.push({ label: o.label, agentType: o.agentType, model: o.model, hash: hash(prompt), prompt })
    if (jitter) await sleep(parseInt(hash(o.label + jitter), 16) % 7)
    else await Promise.resolve()
    const res = opts.respond(o.label, prompt, o)
    if (res == null) return null
    const m = /Set "_fragment" to exactly "([^"]+)"/.exec(prompt)
    if (!m) throw new Error(`no _fragment instruction in prompt for ${o.label}`)
    const out = conform(Object.assign({ _fragment: m[1] }, res), o.schema)
    if (cwd) {
      const f = join(cwd, m[1])
      mkdirSync(dirname(f), { recursive: true })
      writeFileSync(f, JSON.stringify(out))
    }
    return out
  }
  const parallel = thunks => Promise.all(thunks.map(t => Promise.resolve().then(t).catch(() => null)))
  const pipeline = async () => { throw new Error('pipeline() is not used by lab-stage') }
  const phase = () => {}
  const log = m => logs.push(m)
  const budget = { total: null, spent: () => 0, remaining: () => Infinity }
  const fn = new AsyncFunction('agent', 'parallel', 'pipeline', 'phase', 'log', 'args', 'budget', 'workflow', loadScript())
  const result = await fn(agent, parallel, pipeline, phase, log, args, budget, () => { throw new Error('no nesting') })
  return { result, calls, logs }
}

// Pull the single-line JSON payload that follows "<marker> (JSON):\n" in a prompt.
export function payload(prompt, marker) {
  const i = prompt.indexOf(`${marker} (JSON):\n`)
  if (i < 0) return null
  const line = prompt.slice(i + marker.length + 8).split('\n')[0]
  return JSON.parse(line)
}
