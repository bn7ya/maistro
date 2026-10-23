// CLI used by the Python tests: run one stage with the scripted lab, writing fragments into <cwd>
// exactly as the recorder hook would, and print the workflow's result as JSON.
//   node tests/workflow/run_stage.mjs <cwd> '<args json>' [--files] [--revisit]
// --files   also write the files real agents would write (charter, reports, sections, results, …)
// --revisit the director of the theory stage asks to revisit the sources stage
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { runStage } from './harness.mjs'
import { lab } from './scenarios.mjs'

const [cwd, argsJson, ...flags] = process.argv.slice(2)
const args = JSON.parse(argsJson)
const PD = args.project_dir
const put = (rel, text) => { const f = join(cwd, rel); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, text) }

const METH = { M01: 'research-questions.md', M02: 'gap-analysis.md', M03: 'hypotheses.md', M04: 'design.md', M05: 'measures.md', M06: 'sampling-and-data.md', M07: 'feasibility.md', M08: 'ethics.md', M09: 'preregistration.md', M10: 'risks.md', M11: 'methods-bridge.md' }
const THY = { T01: 'frameworks.md', T02: 'evidence-map.md', T03: 'argument-map.md', T04: 'contradictions.md', T05: 'causal-model.md', T06: 'history.md', T07: 'cross-field.md', T08: 'formal-model.md', T09: 'credence-ledger.json', T10: 'steelman.md', T11: 'debate-record.md' }

function sideEffects(label, prompt) {
  const w = label.split(' ')
  if (label === 'charter') put(`${PD}/00-charter.md`, '# A test charter\n\nAims…\n')
  if (w[0] === 'met' && METH[w[2]]) {
    put(`${PD}/01-methodology/${METH[w[2]]}`, w[2] === 'M03' ? '# Hypotheses\n\nH1: x predicts y.\n' : `# ${w[2]}\n`)
    if (w[2] === 'M04') put(`${PD}/01-methodology/protocol.md`, '# Protocol\n')
  }
  if (w[0] === 'thy' && THY[w[2]]) put(`${PD}/03-theory/${THY[w[2]]}`, w[2] === 'T09' ? '{"H1": {"credence": 0.4}}' : `# ${w[2]}\n`)
  if (label.endsWith(' gate')) put(`${PD}/stage-reports/${w[0]}.en.md`, `# ${w[0]} report\n`)
  const tr = /Write (research\/\S+\.ar\.md)\./.exec(prompt)
  if (label.startsWith('translate report') && tr) put(tr[1], '# تقرير\n')
  if (w[0] === 'build') put(`${PD}/04-experiments/results/${w[1]}/results.json`, '{"effect": 0.31}')
  if (w[0] === 'review') put(`${PD}/05-critique/review-${w[1]}.md`, '# review\n')
  const sec = /to (research\/\S+\/manuscript\/sections\/(\S+)\.en\.md)\./.exec(prompt)
  if (w[0] === 'draft' && sec) put(sec[1], `## ${sec[2]}\n\nFinding [SRC-0001] supported by [EXP-01], see Figure 1 and Table 1.\n\n$$y = ax + b$$\n`)
  if (label === 'references W03') put(`${PD}/manuscript/references.md`, '- Lovelace, A. (2020).\n')
  if (w[0] === 'ar' && w[1] !== 'fix') put(`${PD}/manuscript/sections/${w[1]}.ar.md`, `## قسم\n\nنتيجة [SRC-0001] تدعمها [EXP-01]، انظر الشكل 1 والجدول 1.\n\n$$y = ax + b$$\n`)
  if (label === 'final signoff') put(`${PD}/stage-reports/final.en.md`, '# Final report\n')
  if (label === 'translate final W04') put(`${PD}/stage-reports/final.ar.md`, '# التقرير النهائي\n')
}

const opts = flags.includes('--revisit') && args.stage === 'theory' ? { verdict: 'revisit', revisitStage: 'sources', revisitIssues: ['add rebuttals'] } : {}
const base = lab(opts)
const respond = (label, prompt, o) => {
  const r = base(label, prompt, o)
  if (flags.includes('--files') && r) sideEffects(label, prompt)
  return r
}
const { result, calls } = await runStage(args, { cwd, respond })
process.stdout.write(JSON.stringify({ result, labels: calls.map(c => c.label) }))
