// Scripted agent behaviour for the workflow tests. Flags in titles (e.g. "[noauthor]") make the
// scripted validators behave in a specific way, so each gate rule is exercised.
export const PD = 'research/test-project'
export const ACCEPTED_FOR_LATER = ['SRC-0001', 'SRC-0002']

export function payload(prompt) {
  const i = prompt.indexOf('JSON):\n')
  if (i < 0) return null
  return JSON.parse(prompt.slice(i + 7).split('\n')[0])
}

const cand = (title, doi, extra) => Object.assign({
  title, authors: ['Ada Lovelace', 'Alan Turing'], year: 2020, identifier: { type: 'doi', value: doi },
  venue: 'Journal of Tests', url: `https://doi.org/${doi}`, claimed_type: 'journal-article', stance: 'supports', relevance: 'relevant',
}, extra || {})

export const SCOUTS = {
  S01: [
    cand('Good randomised trial [tier2]', '10.1/a1'),
    cand('Paper with no author [noauthor]', '10.1/a2'),
    cand('Vendor white paper [marketing]', '10.1/a3', { claimed_type: 'report' }),
    cand('Retracted trial [retracted]', '10.1/a4'),
    cand('Hallucinated reference [unresolved]', '10.1/a5'),
    cand('Press release in disguise [press]', '10.1/a6'),
    cand('Study by a smeared author [smear]', '10.1/a7'),
    cand('Paper in a hijacked journal [hijacked]', '10.1/a8'),
    cand('Cohort with misreported design [veto][tier3]', '10.1/a9'),
    cand('Report without a date [nodate]', '10.1/a10'),
  ],
  C05: [
    cand('Same trial, other title', 'https://doi.org/10.1/A1'),
    cand('Null-result replication [tier1]', '10.1/b2', { stance: 'opposes' }),
    cand('Finding that failed to replicate [replfail][tier2]', '10.1/b3'),
    cand('Preprint finding [preprint][tier2]', '10.1/b4'),
  ],
  S10: [
    cand('Meta-analysis of trials [tier1]', '10.1/c1'),
    cand('Personal blog post [blog]', '10.1/c2'),
    cand('Official labour statistics [org]', '10.1/c3'),
    cand('Barely checked source [t2missing][tier2]', '10.1/c4'),
  ],
}
for (const id of ['M05', 'T06', 'T07', 'E05', 'S09']) SCOUTS[id] = [cand(`Extra source from ${id} [tier3]`, `10.1/${id.toLowerCase()}`)]
export const CHAIN = [cand('Later rebuttal found by citation chain [tier2]', '10.1/chain1'), cand('Good randomised trial again', '10.1/a1')]

function s02(c) {
  const t = c.title
  return {
    title: c.title,
    authors: t.includes('[noauthor]') ? [] : t.includes('[org]') ? [{ name: 'National Statistics Office', kind: 'org' }] : c.authors.map(n => ({ name: n, kind: 'person' })),
    year: t.includes('[nodate]') ? 0 : c.year,
    identifier: c.identifier,
    type: t.includes('[marketing]') ? 'vendor-whitepaper' : t.includes('[preprint]') ? 'preprint' : t.includes('[blog]') ? 'blog' : t.includes('[org]') ? 'official-statistics' : 'journal-article',
    venue: c.venue, publisher: 'P', url: c.url || '', peer_reviewed: true, empirical: !t.includes('[org]'),
    resolution: { method: 'cli', match_score: t.includes('[unresolved]') ? 0.41 : 0.98, resolved_title: c.title },
  }
}

function verdict(key, agent, c, extra) {
  return Object.assign({ key, verdict: 'pass', severity: 'low', code: 'OK', rationale: `${agent} checked`, evidence: [] }, extra || {})
}

function t1(label, prompt) {
  const id = label.split(' ').pop()
  const cs = payload(prompt)
  return {
    batch_keys: cs.map(c => c.key),
    verdicts: cs.map(c => {
      const t = c.title
      if (id === 'S02') return verdict(c.key, id, c, { metadata: s02(c), verdict: t.includes('[unresolved]') ? 'fail' : 'pass' })
      if (id === 'S05') return verdict(c.key, id, c, { retracted: t.includes('[retracted]'), expression_of_concern: false })
      return verdict(c.key, id, c, t.includes('[press]') ? { assessed_type: 'press-release', verdict: 'fail', severity: 'high', code: 'PRESS_RELEASE' } : {})
    }),
  }
}

function t2(label, prompt) {
  const id = label.split(' ').pop()
  const cs = payload(prompt)
  const vs = []
  for (const c of cs) {
    const t = c.title
    if (t.includes('[t2missing]') && !['S03', 'S04', 'S06'].includes(id)) continue
    const tier = (/\[tier(\d)\]/.exec(t) || [])[1]
    const v = verdict(c.key, id, c)
    if (id === 'S03' && t.includes('[smear]')) Object.assign(v, { verdict: 'fail', severity: 'critical', code: 'MISCONDUCT_RUMOUR', evidence: [] })
    if (id === 'S04' && t.includes('[hijacked]')) Object.assign(v, { verdict: 'fail', severity: 'critical', code: 'HIJACKED_JOURNAL', evidence: ['https://retractionwatch.com/hijacked-journal-checker/'] })
    if (id === 'S08') v.design_tier = tier || 'na'
    if (id === 'S10') v.replication_status = t.includes('[replfail]') ? 'failed' : 'untested'
    vs.push(v)
  }
  return { batch_keys: cs.map(c => c.key), verdicts: vs }
}

const IDEA_FLAGS = { F01: '[grounded]', F02: '[sketch]', F03: '[ungrounded]', F04: '[oppose]', F05: '[fakeid]', F06: '[grounded]' }

function idea(fid, n) {
  const title = fid === 'F07' ? 'Idea from F01 [grounded] 1' : `Idea from ${fid} ${IDEA_FLAGS[fid] || '[oppose]'} ${n}`
  return { title, statement: 's', mechanism: 'm', technique: 't', what_would_make_it_true: 'w', possible_tests: 'p', grounding_hints: [] }
}

function vote(i) {
  const t = i.title
  if (t.includes('[oppose]')) return { idea_key: i.key, vote: 'oppose', grounding_source_ids: [], test_sketch: '', rationale: 'no' }
  return {
    idea_key: i.key, vote: 'support', rationale: 'yes',
    grounding_source_ids: t.includes('[grounded]') ? ['SRC-0001'] : t.includes('[fakeid]') ? ['SRC-9999'] : [],
    test_sketch: t.includes('[sketch]') ? 'Measure X in a held-out sample; predict r > 0.3; the idea is dead if r < 0.1 with a 95% interval excluding 0.3.' : '',
  }
}

const post = (label, extra) => Object.assign({
  summary: `post ${label}`, findings: [{ text: 'f', refs: [] }], messages: [], propose_tasks: [], claim_task_ids: [],
  done_task_ids: [], blocking_issues: [], files_written: [],
}, extra || {})

const CLAIMS = [
  { section_id: '01-introduction', text: 'Supported claim', cited_ids: ['SRC-0001'], result_ids: [], kind: 'empirical' },
  { section_id: '01-introduction', text: 'Claim citing a refused source', cited_ids: ['SRC-9999'], result_ids: [], kind: 'empirical' },
  { section_id: '02-results', text: 'Claim refuted twice [refute2]', cited_ids: ['SRC-0002'], result_ids: ['EXP-01'], kind: 'empirical' },
  { section_id: '02-results', text: 'Claim refuted once [refute1]', cited_ids: ['SRC-0002'], result_ids: ['EXP-09'], kind: 'empirical' },
]

// The default, well-behaved lab.
export function lab(opts) {
  const o = opts || {}
  return (label, prompt) => {
    if (o.nullIf && o.nullIf(label)) return null
    const w = label.split(' ')
    if (label === 'charter') return { title: 'T', aims: ['a'], research_questions: ['q'], success_criteria: ['s'], constraints: [], initial_tasks: [{ title: 'Write hypotheses', desc: 'd', priority: 'high', suggested_owner: 'M03' }] }
    if (/ r\d+ director$/.test(label)) {
      const k = Number(/ r(\d+) /.exec(label)[1])
      return { digest: `digest of ${label}`, board_updates: k === 1 ? [{ op: 'close', task_id: 'MET-1' }] : [], next_participants: [{ id: 'M04', task: 'integrate' }, { id: 'C01', task: 'challenge' }], stage_complete: k >= 2 }
    }
    if (/^(met|thy|exp) r\d+ /.test(label)) {
      const id = w[2]
      return post(label, id === 'M03' && label.includes(' r1 ') ? { messages: [{ to: 'M04', body: 'Are H1 and H2 measurable with the design?', needs_reply: true }], claim_task_ids: ['MET-1'] } : {})
    }
    if (label.endsWith(' gate')) return { verdict: o.verdict || 'proceed', revisit_stage: o.revisitStage || '', revisit_issues: o.revisitIssues || [], headline: `${label} headline`, key_outputs: [], open_risks: [] }
    if (label.startsWith('translate')) return { path: 'x.ar.md', new_terms: [{ en: 'effect size', ar: 'حجم الأثر' }] }
    if (w[0] === 'scout') return { candidates: (prompt.includes('(revisit run)') ? [cand(`Rebuttal found in the revisit by ${w[1]} [tier2]`, `10.1/rev-${w[1]}`)] : []).concat(SCOUTS[w[1]] || []) }
    if (/^w\d t1 /.test(label)) return t1(label, prompt)
    if (/^w\d t2 /.test(label)) return t2(label, prompt)
    if (/^w\d audit /.test(label)) return { vetoes: payload(prompt).filter(c => c.title.includes('[veto]')).map(c => ({ key: c.key, code: 'MISREPORTED_DESIGN', rationale: 'r', evidence: ['https://example.org/registry-entry'] })) }
    if (/^w\d rereview /.test(label)) return { decisions: payload(prompt).map(v => ({ key: v.key, uphold_admission: false, rationale: 'r' })) }
    if (label === 'chain S09') return { candidates: CHAIN }
    if (w[0] === 'ideas') return { ideas: [idea(w[1], 1)] }
    if (w[0] === 'vote') return { votes: payload(prompt).map(vote) }
    if (label === 'experiment plan') return { experiments: [
      { title: 'Simulation', kind: 'computational', hypothesis_ids: ['H1'], design_path: `${PD}/04-experiments/designs/EXP-01.md`, rationale: 'r' },
      { title: 'Re-analysis', kind: 'computational', hypothesis_ids: ['H2'], design_path: '04-experiments/designs/EXP-02.md', rationale: 'r' },
      { title: 'Field survey', kind: 'protocol', hypothesis_ids: ['H3'], design_path: '04-experiments/designs/EXP-03.md', rationale: 'r' },
    ] }
    if (label === 'env E04') return { ok: true, python: '3.12', packages: ['numpy==2.1.0'], notes: '' }
    if (w[0] === 'build') return { exp_id: w[1], ran: true, results_path: `04-experiments/results/${w[1]}/results.json`, code_path: 'c', headline: 'h', problems: [] }
    if (w[0] === 'rerun') return { exp_id: w[1], reproduced: w[1] !== 'EXP-02', discrepancies: [], repro_path: 'r' }
    if (w[0] === 'robust') return { exp_id: w[1], robust: 'robust', checks: [], report_path: 'r' }
    if (w[0] === 'audit') return { exp_id: w[1], verdict: 'valid', numbers_traceable: true, issues: [], audit_path: 'a' }
    if (w[0] === 'review') {
      const id = w[1]
      const issues = id === 'C01' ? [{ target: '01-methodology/design.md', code: 'NO_POWER', severity: 'blocking', rationale: 'no power analysis' }]
        : id === 'C02' ? [{ target: `${PD}/01-methodology/design.md`, code: 'no_power', severity: 'blocking', rationale: 'same' }]
        : id === 'C03' ? [{ target: 'T02', code: 'CIRCULAR', severity: 'blocking', rationale: 'circular argument' }]
        : [{ target: '03-theory/evidence-map.md', code: `MINOR_${id}`, severity: 'minor', rationale: 'style' }]
      return { summary: 's', issues, review_path: 'p' }
    }
    if (w[0] === 'respond') return { responses: payload(prompt).map(x => ({ issue_key: x.issue_key, action: 'fixed', summary: 'done', files_changed: [] })) }
    if (w[0] === 'recheck') return { checks: payload(prompt).map(x => ({ issue_key: x.issue_key, resolved: x.code === 'NO_POWER', comment: 'c' })) }
    if (w[0] === 'downgrade') return { downgrades: payload(prompt).map(x => ({ issue_key: x.issue_key, justification: 'The circularity is confined to a side remark and does not affect any conclusion.' })) }
    if (label === 'outline W01') return { sections: [{ id: 'introduction', title: 'Introduction', brief: 'b' }, { id: 'results', title: 'Results', brief: 'b' }] }
    if (w[0] === 'draft') return { section_id: w[1], path: 'p', word_count: 100, cited_ids: [] }
    if (label === 'figures W02') return { figures: [] }
    if (w[0] === 'references') return { references_path: 'r', repro_package_path: 'p', problems: [] }
    if (label === 'claims C11') return { claims: CLAIMS }
    if (w[0] === 'verify') {
      const lens = w[2]
      return { checks: payload(prompt).map(c => ({ claim_key: c.claim_key, refuted: c.text.includes('[refute2]') ? lens !== 'C06' : c.text.includes('[refute1]') ? lens === 'C02' : false, severity: 'medium', reason: 'r', suggestion: 's' })) }
    }
    if (w[0] === 'revise') return { section_id: w[1], path: 'p', changes: ['c'] }
    if (w[0] === 'ar' && w[1] !== 'fix') return { section_id: w[1], path: 'p', new_terms: [{ en: 'claim', ar: 'ادعاء' }] }
    if (label === 'glossary W05') return { glossary_path: 'g', fixes: [{ section_id: '02-results', issue: 'inconsistent term' }, { section_id: 'not-a-section', issue: 'x' }] }
    if (w[0] === 'ar' && w[1] === 'fix') return { section_id: w[2], path: 'p', new_terms: [] }
    if (label === 'final signoff') return { signoff: true, report_path: 'stage-reports/final.en.md', headline: 'signed', limitations: ['l'] }
    throw new Error(`no scripted response for "${label}"`)
  }
}

// A lab that does everything it can to blow the budget.
export function greedy() {
  const base = lab()
  let n = 0
  return (label, prompt) => {
    n++
    const w = label.split(' ')
    const many = (k, f) => Array.from({ length: k }, (_, i) => f(i))
    if (/ r\d+ director$/.test(label)) return { digest: 'never done', board_updates: many(20, i => ({ op: 'add', title: `t${n}-${i}`, desc: 'd', priority: 'high' })), next_participants: many(24, i => ({ id: ['M01', 'S01', 'T01', 'E01', 'C01', 'F01', 'W01', 'D00'][i % 8].replace('01', String((i % 11) + 1).padStart(2, '0')), task: 't' })), stage_complete: false }
    if (/^(met|thy|exp) r\d+ /.test(label)) return post(label, { messages: [{ to: 'all', body: 'x', needs_reply: true }, { to: 'division:critique', body: 'x', needs_reply: true }, { to: 'division:theory', body: 'x', needs_reply: true }, { to: 'E04', body: 'x', needs_reply: true }], propose_tasks: many(3, i => ({ title: `p${n}-${i}`, desc: 'd', priority: 'high' })), blocking_issues: [{ target: 'x', code: 'MORE', rationale: 'r' }] })
    if (w[0] === 'scout' || label === 'chain S09') return { candidates: many(50, i => cand(`Unique source ${label} ${i} [tier1]`, `10.9/${n}-${i}`)) }
    if (w[0] === 'ideas') return { ideas: many(3, i => idea('F06', `${w[1]}-${i}`)) }
    if (w[0] === 'review') return { summary: 's', issues: many(8, i => ({ target: `${w[1]}-file-${i}.md`, code: `BLOCK_${i}`, severity: 'blocking', rationale: 'r' })), review_path: 'p' }
    if (w[0] === 'recheck') return { checks: payload(prompt).map(x => ({ issue_key: x.issue_key, resolved: false, comment: 'c' })) }
    if (w[0] === 'downgrade') return { downgrades: [] }
    if (label === 'experiment plan') return { experiments: many(8, i => ({ title: `e${i}`, kind: 'computational', hypothesis_ids: [], design_path: 'd', rationale: 'r' })) }
    if (label === 'outline W01') return { sections: many(12, i => ({ id: `s${i}`, title: `S${i}`, brief: 'b' })) }
    if (label === 'claims C11') return { claims: many(200, i => ({ section_id: `s${i % 12}`, text: `claim ${i} [refute1]`, cited_ids: ['SRC-0001'], result_ids: [], kind: 'empirical' })) }
    if (label === 'glossary W05') return { glossary_path: 'g', fixes: many(20, i => ({ section_id: `0${i % 9 + 1}-s`, issue: 'x' })) }
    return base(label, prompt)
  }
}
