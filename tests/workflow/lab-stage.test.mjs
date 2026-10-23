import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { ROOT, runStage } from './harness.mjs'
import { ACCEPTED_FOR_LATER, PD, greedy, lab } from './scenarios.mjs'

const K = JSON.parse(readFileSync(join(ROOT, 'plugins/maistro/scripts/lab-constants.json'), 'utf8'))
const STAGES = K.stages
const SCALES = Object.keys(K.scales)

function argsFor(stage, scale, extra) {
  return Object.assign({
    stage, project_dir: PD, date: '2026-01-01', scale, mode: 'normal', run: 1, apis_available: true,
    revisits_left: 1, accepted_ids: ACCEPTED_FOR_LATER, valid_experiments: ['EXP-01'],
    sections: ['01-introduction', '02-results'], prev_stage: 'x', prev_report: 'stage-reports/x.en.md', debug: true,
  }, extra || {})
}
const tmp = () => mkdtempSync(join(tmpdir(), 'maistro-wf-'))

test('every stage completes at every scale and stays within its cap', async () => {
  for (const scale of SCALES) for (const stage of STAGES) {
    const { result, calls } = await runStage(argsFor(stage, scale), { respond: lab() })
    assert.equal(result.stage, stage)
    assert.ok(calls.length <= K.scales[scale].caps[stage], `${stage}/${scale}: ${calls.length} calls > cap`)
    assert.equal(result.calls_used, calls.length)
    for (const c of calls) assert.match(c.agentType, /^maistro:/)
  }
})

test('a greedy lab can never exceed any stage budget', async () => {
  for (const scale of SCALES) for (const stage of STAGES) for (const mode of ['normal', 'repair']) {
    const { result, calls } = await runStage(argsFor(stage, scale, { mode }), { respond: greedy() })
    const cap = Math.max(4, Math.floor(K.scales[scale].caps[stage] * (mode === 'normal' ? 1 : 0.5)))
    assert.ok(calls.length <= cap, `${stage}/${scale}/${mode}: ${calls.length} > ${cap}`)
    assert.equal(result.cap, cap)
  }
})

test('round 1 of a discussion stage includes the whole home division plus guests', async () => {
  const { calls } = await runStage(argsFor('methodology', 'pilot'), { respond: lab() })
  const r1 = calls.filter(c => /^met r1 [A-Z]\d\d$/.test(c.label)).map(c => c.label.split(' ')[2])
  assert.deepEqual(r1, ['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M07', 'M08', 'M09', 'M10', 'M11', 'C01', 'C02', 'C12'])
  const r2 = calls.filter(c => c.label.startsWith('met r2 ') && !c.label.endsWith('director')).map(c => c.label.split(' ')[2])
  assert.deepEqual(r2, ['M04', 'C01'], 'director picks M04 and C01; M04 answers M03 in the same slot')
  const m04r2 = calls.find(c => c.label === 'met r2 M04')
  assert.match(m04r2.prompt, /from M03 \(needs reply\): Are H1 and H2 measurable/)
})

test('sources: the admission gate refuses what it must, and admits the rest', async () => {
  const { result } = await runStage(argsFor('sources', 'pilot'), { respond: lab() })
  const d = result.debug
  const status = Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v.status === 'accepted' ? v.grade : v.reasons.join('+')]))
  // keys follow scout order S01, C05, S10 with the duplicate dropped
  assert.deepEqual(status, {
    'SRC-0001': 'A',
    'SRC-0002': 'NO_AUTHOR',
    'SRC-0003': 'TYPE_BLOCKED:vendor-whitepaper',
    'SRC-0004': 'RETRACTED',
    'SRC-0005': 'UNRESOLVED',
    'SRC-0006': 'TYPE_BLOCKED:press-release',
    'SRC-0007': 'B',
    'SRC-0008': 'S04:HIJACKED_JOURNAL',
    'SRC-0009': 'C04:MISREPORTED_DESIGN',
    'SRC-0010': 'NO_DATE',
    'SRC-0011': 'A',
    'SRC-0012': 'B',
    'SRC-0013': 'B',
    'SRC-0014': 'A',
    'SRC-0015': 'TYPE_NOT_ALLOWED:blog',
    'SRC-0016': 'B',
    'SRC-0017': 'NOT_BACKGROUND_CHECKED',
  })
  assert.equal(result.counts.unevidenced_allegations_ignored, 1)
})

test('sources: the citation-chain wave runs at standard scale and skips seen sources', async () => {
  const { result, calls } = await runStage(argsFor('sources', 'standard'), { respond: lab() })
  assert.ok(calls.some(c => c.label === 'chain S09'))
  assert.equal(result.counts.chain_wave_candidates, 1)
  assert.ok(calls.some(c => c.label === 'w2 t1 b01 S02'))
})

test('sources: keys continue after earlier runs and seen sources are skipped', async () => {
  const { result } = await runStage(argsFor('sources', 'pilot', { run: 2, mode: 'revisit', source_id_offset: 40, seen_source_keys: ['doi:10.1/a1'] }), { respond: lab() })
  const keys = Object.keys(result.debug).sort()
  assert.equal(keys[0], 'SRC-0041')
  assert.equal(keys.length, 6, 'a focused run uses 2 scouts x 4 candidates; the already-seen trial and its duplicate are skipped')
})

test('theory: frontier gate promotes only grounded ideas with two supporting votes', async () => {
  const { result } = await runStage(argsFor('theory', 'pilot'), { respond: lab() })
  assert.deepEqual(result.debug, {
    'IDEA-F01-1': 'promoted',
    'IDEA-F02-1': 'promoted',
    'IDEA-F03-1': 'needs_grounding',
    'IDEA-F04-1': 'quarantined',
    'IDEA-F05-1': 'needs_grounding',
    'IDEA-F06-1': 'promoted',
    'IDEA-F08-1': 'quarantined',
    'IDEA-F09-1': 'quarantined',
    'IDEA-F10-1': 'quarantined',
    'IDEA-F11-1': 'quarantined',
  })
})

test('experiments: only reproduced, audited experiments are valid', async () => {
  const { result } = await runStage(argsFor('experiments', 'standard'), { respond: lab() })
  assert.equal(result.debug['EXP-01'].status, 'valid')
  assert.equal(result.debug['EXP-02'].status, 'unverified')
  assert.equal(result.debug['EXP-03'].status, 'protocol')
})

test('review: duplicate issues merge, rechecks resolve, downgrades need a justification', async () => {
  const { result } = await runStage(argsFor('review', 'standard'), { respond: lab() })
  const d = result.debug
  assert.deepEqual(d['01-methodology-design-md#NO_POWER'], { severity: 'blocking', resolved: true })
  assert.deepEqual(d['t02#CIRCULAR'], { severity: 'major', resolved: false })
  assert.ok(result.counts.unresolved_to_limitations.includes('t02#CIRCULAR'))
})

test('manuscript: claim gate removes, softens and strips unadmitted citations', async () => {
  const { result, calls } = await runStage(argsFor('manuscript', 'pilot'), { respond: lab() })
  assert.deepEqual(result.debug, { 'CLM-001': 'keep', 'CLM-002': 'soften', 'CLM-003': 'remove', 'CLM-004': 'soften' })
  assert.equal(result.counts.citations_stripped, 2)
  const rev = calls.filter(c => c.label.startsWith('revise '))
  assert.equal(rev.length, 2)
})

test('arabic: fixes only real sections; final report gets translated', async () => {
  const { result, calls } = await runStage(argsFor('arabic', 'pilot'), { respond: lab() })
  assert.ok(calls.some(c => c.label === 'ar fix 02-results W04'))
  assert.ok(!calls.some(c => c.label.includes('not-a-section')))
  assert.equal(result.counts.signoff, true)
  assert.equal(result.counts.final_translated, true)
})

test('revisit verdicts are honoured only for earlier stages and only in normal runs', async () => {
  let r = await runStage(argsFor('theory', 'pilot', { revisits_left: 1 }), { respond: lab({ verdict: 'revisit', revisitStage: 'sources', revisitIssues: ['corpus misses rebuttals'] }) })
  assert.deepEqual(r.result.gate.revisit, { stage: 'sources', issues: ['corpus misses rebuttals'] })
  r = await runStage(argsFor('theory', 'pilot', { revisits_left: 1 }), { respond: lab({ verdict: 'revisit', revisitStage: 'review' }) })
  assert.equal(r.result.gate.verdict, 'proceed')
  r = await runStage(argsFor('theory', 'pilot', { revisits_left: 0 }), { respond: lab({ verdict: 'revisit', revisitStage: 'sources' }) })
  assert.equal(r.result.gate.verdict, 'proceed')
  r = await runStage(argsFor('theory', 'pilot', { mode: 'update' }), { respond: lab({ verdict: 'revisit', revisitStage: 'sources' }) })
  assert.equal(r.result.gate.verdict, 'proceed')
})

test('the director falls back to opus when fable returns nothing', async () => {
  let first = true
  const base = lab()
  const respond = (label, prompt) => {
    if (label === 'charter' && first) { first = false; return null }
    return base(label, prompt)
  }
  const { calls } = await runStage(argsFor('methodology', 'pilot'), { respond })
  const ch = calls.filter(c => c.label.startsWith('charter'))
  assert.equal(ch.length, 2)
  assert.equal(ch[1].model, 'opus')
  assert.equal(ch[1].agentType, 'maistro:d00-director')
})

test('agents that return nothing never crash a stage', async () => {
  const flaky = label => (label.length * 7 + label.charCodeAt(label.length - 1)) % 3 === 0
  for (const stage of STAGES) {
    const { result } = await runStage(argsFor(stage, 'pilot'), { respond: lab({ nullIf: flaky }) })
    assert.equal(result.stage, stage)
    assert.ok(result.failed > 0 || stage === 'arabic')
  }
})

test('relaunching replays the same calls, whatever order agents finish in', async () => {
  for (const stage of STAGES) {
    const a = await runStage(argsFor(stage, 'standard'), { respond: lab(), jitter: 1 })
    const b = await runStage(argsFor(stage, 'standard'), { respond: lab(), jitter: 2 })
    assert.deepEqual(a.calls.map(c => `${c.label}:${c.hash}`), b.calls.map(c => `${c.label}:${c.hash}`), stage)
  }
})

test('every prompt names a fragment path inside the project and stage run', async () => {
  const cwd = tmp()
  const { calls } = await runStage(argsFor('sources', 'pilot', { run: 3 }), { respond: lab(), cwd })
  for (const c of calls) assert.match(c.prompt, new RegExp(`"${PD}/_fragments/sources/run3/[a-z0-9-]+\\.json"`))
})

test('bad args are refused before any agent runs', async () => {
  for (const bad of [{ stage: 'nope' }, { project_dir: '/etc' }, { project_dir: 'research/../x' }, { date: '' }]) {
    await assert.rejects(runStage(argsFor('methodology', 'pilot', bad), { respond: lab() }))
  }
})
