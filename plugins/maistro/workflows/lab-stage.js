export const meta = {
  name: 'lab-stage',
  description: 'Run one stage of a Maistro research project with the 73-agent lab (launched by /maistro:research)',
  whenToUse: 'Launched by the /maistro:research skill with args from maistro_state.py next; not meant to be started by hand.',
  phases: [
    { title: 'Charter', detail: 'director turns the idea into a charter' },
    { title: 'Discussion', detail: 'rounds of posts, messages and self-assigned tasks' },
    { title: 'Source discovery', detail: 'scouts search from different angles' },
    { title: 'Source screening', detail: 'tier 1: gatekeeper, retraction, marketing' },
    { title: 'Source background checks', detail: 'tier 2: authors, venue, funding, quality, citations, replication, statistics' },
    { title: 'Source audit', detail: 'source sceptic and re-review' },
    { title: 'Frontier', detail: 'speculative ideas, quarantined' },
    { title: 'Idea validation', detail: 'three-vote frontier gate' },
    { title: 'Experiment build', detail: 'environment, build and run' },
    { title: 'Experiment verification', detail: 'independent re-run, robustness, audit' },
    { title: 'Peer review', detail: 'twelve critics' },
    { title: 'Responses', detail: 'owners respond, critics re-review' },
    { title: 'Drafting', detail: 'outline, sections, figures, references' },
    { title: 'Claim audit', detail: 'three-lens adversarial claim check' },
    { title: 'Revision', detail: 'sections revised after the audit' },
    { title: 'Translation', detail: 'Arabic versions and glossary' },
    { title: 'Stage gate', detail: 'director report and verdict' },
  ],
}

// ---------------------------------------------------------------------------------------------
// Generated from agents/*.md, scripts/source-policy.json and scripts/lab-constants.json by
// tools/build_roster.py. Do not edit by hand: run `python3 tools/build_roster.py`.
// <generated:begin>
const ROSTER = [
  {"id": "D00", "type": "maistro:d00-director", "division": "director", "title": "Research Director"},
  {"id": "M01", "type": "maistro:methodology:m01-problem-framer", "division": "methodology", "title": "Problem Framer"},
  {"id": "M02", "type": "maistro:methodology:m02-gap-analyst", "division": "methodology", "title": "Literature-Gap Analyst"},
  {"id": "M03", "type": "maistro:methodology:m03-hypothesis-formalizer", "division": "methodology", "title": "Hypothesis Formaliser"},
  {"id": "M04", "type": "maistro:methodology:m04-design-architect", "division": "methodology", "title": "Research-Design Architect"},
  {"id": "M05", "type": "maistro:methodology:m05-measurement-specialist", "division": "methodology", "title": "Variables & Measurement Specialist"},
  {"id": "M06", "type": "maistro:methodology:m06-sampling-strategist", "division": "methodology", "title": "Sampling & Data Strategist"},
  {"id": "M07", "type": "maistro:methodology:m07-feasibility-planner", "division": "methodology", "title": "Resources & Feasibility Planner"},
  {"id": "M08", "type": "maistro:methodology:m08-ethics-officer", "division": "methodology", "title": "Ethics & Integrity Officer"},
  {"id": "M09", "type": "maistro:methodology:m09-preregistration-writer", "division": "methodology", "title": "Pre-registration Writer"},
  {"id": "M10", "type": "maistro:methodology:m10-risk-planner", "division": "methodology", "title": "Risk & Contingency Planner"},
  {"id": "M11", "type": "maistro:methodology:m11-methods-bridge", "division": "methodology", "title": "Interdisciplinary Methods Bridge"},
  {"id": "S01", "type": "maistro:sources:s01-source-scout", "division": "sources", "title": "Source Scout"},
  {"id": "S02", "type": "maistro:sources:s02-bibliographic-gatekeeper", "division": "sources", "title": "Bibliographic Gatekeeper"},
  {"id": "S03", "type": "maistro:sources:s03-author-investigator", "division": "sources", "title": "Author Background Investigator"},
  {"id": "S04", "type": "maistro:sources:s04-venue-auditor", "division": "sources", "title": "Venue & Publisher Auditor"},
  {"id": "S05", "type": "maistro:sources:s05-retraction-sentinel", "division": "sources", "title": "Retraction & Correction Sentinel"},
  {"id": "S06", "type": "maistro:sources:s06-coi-funding-analyst", "division": "sources", "title": "Conflict-of-Interest & Funding Analyst"},
  {"id": "S07", "type": "maistro:sources:s07-bias-marketing-detector", "division": "sources", "title": "Bias, Spin & Marketing Detector"},
  {"id": "S08", "type": "maistro:sources:s08-quality-appraiser", "division": "sources", "title": "Methodological-Quality Appraiser"},
  {"id": "S09", "type": "maistro:sources:s09-citation-tracer", "division": "sources", "title": "Citation-Chain Tracer"},
  {"id": "S10", "type": "maistro:sources:s10-replication-checker", "division": "sources", "title": "Replication & Consensus Checker"},
  {"id": "S11", "type": "maistro:sources:s11-statistical-forensics", "division": "sources", "title": "Statistical Forensics Analyst"},
  {"id": "T01", "type": "maistro:theory:t01-frameworks-cartographer", "division": "theory", "title": "Theoretical Frameworks Cartographer"},
  {"id": "T02", "type": "maistro:theory:t02-evidence-synthesizer", "division": "theory", "title": "Evidence Synthesiser"},
  {"id": "T03", "type": "maistro:theory:t03-argument-mapper", "division": "theory", "title": "Argument Mapper"},
  {"id": "T04", "type": "maistro:theory:t04-contradiction-resolver", "division": "theory", "title": "Contradiction Resolver"},
  {"id": "T05", "type": "maistro:theory:t05-causal-analyst", "division": "theory", "title": "Causal-Mechanism Analyst"},
  {"id": "T06", "type": "maistro:theory:t06-history-contextualist", "division": "theory", "title": "History & Paradigm Contextualist"},
  {"id": "T07", "type": "maistro:theory:t07-cross-disciplinary-integrator", "division": "theory", "title": "Cross-Disciplinary Integrator"},
  {"id": "T08", "type": "maistro:theory:t08-formal-modeler", "division": "theory", "title": "Formal Modeller"},
  {"id": "T09", "type": "maistro:theory:t09-credence-keeper", "division": "theory", "title": "Bayesian Credence Keeper"},
  {"id": "T10", "type": "maistro:theory:t10-steelman-advocate", "division": "theory", "title": "Steelman Advocate"},
  {"id": "T11", "type": "maistro:theory:t11-debate-chair", "division": "theory", "title": "Debate Chair"},
  {"id": "E01", "type": "maistro:experiments:e01-experiment-designer", "division": "experiments", "title": "Experiment Designer"},
  {"id": "E02", "type": "maistro:experiments:e02-analysis-planner", "division": "experiments", "title": "Statistical-Analysis Planner"},
  {"id": "E03", "type": "maistro:experiments:e03-power-simulation-engineer", "division": "experiments", "title": "Power & Simulation Engineer"},
  {"id": "E04", "type": "maistro:experiments:e04-computational-builder", "division": "experiments", "title": "Computational-Experiment Builder"},
  {"id": "E05", "type": "maistro:experiments:e05-data-acquisition-engineer", "division": "experiments", "title": "Data-Acquisition Engineer"},
  {"id": "E06", "type": "maistro:experiments:e06-measurement-validity-tester", "division": "experiments", "title": "Measurement-Validity Tester"},
  {"id": "E07", "type": "maistro:experiments:e07-robustness-engineer", "division": "experiments", "title": "Robustness & Multiverse Engineer"},
  {"id": "E08", "type": "maistro:experiments:e08-falsification-designer", "division": "experiments", "title": "Falsification & Negative-Control Designer"},
  {"id": "E09", "type": "maistro:experiments:e09-reproducibility-engineer", "division": "experiments", "title": "Reproducibility Engineer"},
  {"id": "E10", "type": "maistro:experiments:e10-baselines-designer", "division": "experiments", "title": "Baselines & Null-Model Designer"},
  {"id": "E11", "type": "maistro:experiments:e11-results-auditor", "division": "experiments", "title": "Results Auditor"},
  {"id": "C01", "type": "maistro:critique:c01-methodology-reviewer", "division": "critique", "title": "Methodology Reviewer"},
  {"id": "C02", "type": "maistro:critique:c02-statistical-reviewer", "division": "critique", "title": "Statistical Reviewer"},
  {"id": "C03", "type": "maistro:critique:c03-logic-auditor", "division": "critique", "title": "Logic & Fallacy Auditor"},
  {"id": "C04", "type": "maistro:critique:c04-source-skeptic", "division": "critique", "title": "Source Sceptic"},
  {"id": "C05", "type": "maistro:critique:c05-devils-advocate", "division": "critique", "title": "Devil's Advocate"},
  {"id": "C06", "type": "maistro:critique:c06-reviewer-two", "division": "critique", "title": "Reviewer 2"},
  {"id": "C07", "type": "maistro:critique:c07-construct-validity-critic", "division": "critique", "title": "Construct-Validity Critic"},
  {"id": "C08", "type": "maistro:critique:c08-external-validity-critic", "division": "critique", "title": "External-Validity Critic"},
  {"id": "C09", "type": "maistro:critique:c09-ethics-reviewer", "division": "critique", "title": "Ethics Reviewer"},
  {"id": "C10", "type": "maistro:critique:c10-reproducibility-reviewer", "division": "critique", "title": "Clarity & Reproducibility Reviewer"},
  {"id": "C11", "type": "maistro:critique:c11-overclaiming-detector", "division": "critique", "title": "Overclaiming Detector"},
  {"id": "C12", "type": "maistro:critique:c12-lab-bias-auditor", "division": "critique", "title": "Lab-Bias Auditor"},
  {"id": "F01", "type": "maistro:frontier:f01-wild-hypothesis-generator", "division": "frontier", "title": "Wild-Hypothesis Generator"},
  {"id": "F02", "type": "maistro:frontier:f02-analogy-miner", "division": "frontier", "title": "Far-Field Analogy Miner"},
  {"id": "F03", "type": "maistro:frontier:f03-inversion-thinker", "division": "frontier", "title": "Inversion Thinker"},
  {"id": "F04", "type": "maistro:frontier:f04-assumption-breaker", "division": "frontier", "title": "Assumption Breaker"},
  {"id": "F05", "type": "maistro:frontier:f05-futurist", "division": "frontier", "title": "Futurist"},
  {"id": "F06", "type": "maistro:frontier:f06-constraint-remover", "division": "frontier", "title": "Constraint Remover"},
  {"id": "F07", "type": "maistro:frontier:f07-combinatorial-synthesizer", "division": "frontier", "title": "Combinatorial Synthesiser"},
  {"id": "F08", "type": "maistro:frontier:f08-anomaly-hunter", "division": "frontier", "title": "Anomaly Hunter"},
  {"id": "F09", "type": "maistro:frontier:f09-paradigm-rebel", "division": "frontier", "title": "Paradigm Rebel"},
  {"id": "F10", "type": "maistro:frontier:f10-naive-questioner", "division": "frontier", "title": "Naive Questioner"},
  {"id": "F11", "type": "maistro:frontier:f11-serendipity-engine", "division": "frontier", "title": "Random-Stimulus & Serendipity Engine"},
  {"id": "W01", "type": "maistro:editorial:w01-manuscript-lead", "division": "editorial", "title": "Manuscript Lead"},
  {"id": "W02", "type": "maistro:editorial:w02-figures-designer", "division": "editorial", "title": "Figures & Data-Presentation Designer"},
  {"id": "W03", "type": "maistro:editorial:w03-references-reproducibility", "division": "editorial", "title": "References & Reproducibility Editor"},
  {"id": "W04", "type": "maistro:editorial:w04-arabic-translator", "division": "editorial", "title": "Arabic Scientific Translator"},
  {"id": "W05", "type": "maistro:editorial:w05-terminology-reviewer", "division": "editorial", "title": "Bilingual Terminology Reviewer"},
]
const POLICY = {"version": 1, "min_match_score": 0.9, "identifier_types": ["doi", "arxiv", "pmid", "pmcid", "isbn", "handle", "publisher_url"], "allowed_types": ["journal-article", "review-article", "meta-analysis", "conference-paper", "preprint", "book", "book-chapter", "thesis", "dataset", "report", "official-statistics", "standard", "government-report", "intergovernmental-report", "legal-document", "news-investigative"], "org_author_allowed_types": ["official-statistics", "standard", "government-report", "intergovernmental-report", "legal-document"], "blocked_types": ["marketing", "press-release", "vendor-whitepaper", "sponsored", "advertorial", "product-page", "seo-content", "content-farm", "ai-content-farm", "unsigned-wiki", "social-post", "anonymous"], "design_tier_grade": {"1": "A", "2": "A", "3": "B", "4": "C", "5": "C", "na": "B"}, "type_grade_cap": {"preprint": "B", "thesis": "C", "report": "C", "dataset": "B", "news-investigative": "D"}, "default_grade": "C"}
const K = {"version": 1, "stages": ["methodology", "sources", "theory", "experiments", "review", "manuscript", "arabic"], "scales": {"pilot": {"rounds": 2, "maxPerRound": 8, "inboxExtra": 2, "perAgentInbox": 4, "src": {"scouts": 3, "perScout": 12, "maxCandidates": 24, "t1Batch": 20, "t2Batch": 8, "chainWave": false, "chainMax": 0, "revisit": {"scouts": 2, "perScout": 4}}, "ideasPer": 1, "ideasMax": 11, "voteBatch": 6, "experiments": 2, "reviewCycles": 1, "maxOwners": 4, "maxRereviewers": 6, "sections": 6, "maxClaims": 20, "claimBatch": 10, "revisions": 4, "arFixes": 2, "caps": {"methodology": 30, "sources": 45, "theory": 50, "experiments": 40, "review": 30, "manuscript": 30, "arabic": 12}}, "standard": {"rounds": 3, "maxPerRound": 12, "inboxExtra": 3, "perAgentInbox": 4, "src": {"scouts": 6, "perScout": 18, "maxCandidates": 100, "t1Batch": 20, "t2Batch": 10, "chainWave": true, "chainMax": 30, "revisit": {"scouts": 3, "perScout": 9}}, "ideasPer": 2, "ideasMax": 22, "voteBatch": 6, "experiments": 3, "reviewCycles": 2, "maxOwners": 6, "maxRereviewers": 12, "sections": 8, "maxClaims": 60, "claimBatch": 10, "revisions": 8, "arFixes": 3, "caps": {"methodology": 60, "sources": 120, "theory": 90, "experiments": 70, "review": 55, "manuscript": 50, "arabic": 16}}, "full": {"rounds": 4, "maxPerRound": 16, "inboxExtra": 4, "perAgentInbox": 4, "src": {"scouts": 8, "perScout": 25, "maxCandidates": 200, "t1Batch": 20, "t2Batch": 10, "chainWave": true, "chainMax": 40, "revisit": {"scouts": 3, "perScout": 13}}, "ideasPer": 3, "ideasMax": 33, "voteBatch": 6, "experiments": 5, "reviewCycles": 2, "maxOwners": 8, "maxRereviewers": 12, "sections": 10, "maxClaims": 120, "claimBatch": 10, "revisions": 10, "arFixes": 4, "caps": {"methodology": 110, "sources": 240, "theory": 150, "experiments": 110, "review": 60, "manuscript": 80, "arabic": 20}}}, "source_scouts": ["S01", "C05", "S10", "M05", "T06", "T07", "E05", "S09"], "tier1": ["S02", "S05", "S07"], "tier2": ["S03", "S04", "S06", "S08", "S09", "S10"], "tier2_empirical_extra": "S11", "min_tier2_verdicts": 4, "theory_voters": ["T09", "T05", "T08", "T07"], "critic_voters": ["C03", "C11", "C07"], "ground_voters": ["M03", "S10", "M04"], "claim_lenses": ["S09", "C02", "C06"], "min_test_sketch": 80, "min_downgrade_justification": 40, "stage_leads": {"methodology": "M04", "theory": "T02", "experiments": "E01"}}
// <generated:end>
// ---------------------------------------------------------------------------------------------

const STAGES = K.stages
const SCALES = K.scales
const STAGE_SHORT = { methodology: 'MET', sources: 'SRC', theory: 'THY', experiments: 'EXP', review: 'REV', manuscript: 'MAN', arabic: 'AR' }
const GRADES = ['A', 'B', 'C', 'D']

// ---------------------------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------------------------
const A = args || {}
if (!STAGES.includes(A.stage)) throw new Error(`args.stage must be one of ${STAGES.join(', ')}`)
if (typeof A.project_dir !== 'string' || !/^research\/[a-z0-9][a-z0-9-]*$/.test(A.project_dir)) {
  throw new Error('args.project_dir must look like "research/<slug>" (relative, lowercase slug)')
}
if (typeof A.date !== 'string' || !A.date) throw new Error('args.date is required (fixed in status.json)')
const STAGE = A.stage
const PD = A.project_dir
const SCALE = SCALES[A.scale] ? A.scale : 'full'
const SC = SCALES[SCALE]
const MODE = A.mode || 'normal'
const RUN = Number.isInteger(A.run) && A.run > 0 ? A.run : 1
const ISSUES = (A.issues || []).map(x => String(x)).slice(0, 12)
const FIX_ITEMS = (A.fix_items || []).slice(0, 12)
const ACCEPTED = new Set(A.accepted_ids || [])
const VALID_EXPS = new Set(A.valid_experiments || [])
const APIS = A.apis_available === false ? false : A.apis_available === true ? true : null
const CAP = Math.max(4, Math.floor(SC.caps[STAGE] * (MODE === 'normal' ? 1 : 0.5)))
const RESERVE = 2

const BY_ID = {}
for (const r of ROSTER) BY_ID[r.id] = r
const ORDER = {}
ROSTER.forEach((r, i) => { ORDER[r.id] = i })
const byRoster = (a, b) => (ORDER[a] ?? 999) - (ORDER[b] ?? 999) || (a < b ? -1 : a > b ? 1 : 0)
const divisionIds = d => ROSTER.filter(r => r.division === d).map(r => r.id)

// ---------------------------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------------------------
const pad = (n, w) => String(n).padStart(w || 2, '0')
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
const chunk = (xs, n) => { const out = []; for (let i = 0; i < xs.length; i += n) out.push(xs.slice(i, i + n)); return out }
const clip = (s, n) => { s = String(s ?? ''); return s.length > n ? s.slice(0, n - 1) + '…' : s }
const errText = e => String((e && e.message) || e)
const frag = label => `${PD}/_fragments/${STAGE}/run${RUN}/${slug(label)}.json`
const post = (k, id) => `${PD}/forum/${STAGE}/run${RUN}/r${k}/${id}.md`
// Path relative to the project folder, whichever form an agent wrote it in.
const rel = p => { p = String(p || '').trim().replace(/^\.\//, ''); return p.startsWith(PD + '/') ? p.slice(PD.length + 1) : p }
// Keys made in a later run of the same stage carry the run number, so they never collide.
const runKey = (prefix, rest) => RUN > 1 ? `${prefix}-R${RUN}-${rest}` : `${prefix}-${rest}`

// ---------------------------------------------------------------------------------------------
// Budget ledger: every dispatch counts, including ones that come back empty.
// ---------------------------------------------------------------------------------------------
const L = { cap: CAP, used: 0, dropped: [], failed: [], notes: [] }
const can = n => L.used + n + RESERVE <= L.cap

async function call(id, prompt, schema, label, ph, extra) {
  const r = BY_ID[id]
  if (!r) { L.failed.push(label); log(`unknown agent ${id} for ${label}`); return null }
  if (L.used >= L.cap) { L.dropped.push(label); log(`budget cap ${L.cap} reached: skipped ${label}`); return null }
  L.used++
  try {
    const res = await agent(prompt, Object.assign({ agentType: r.type, schema, label, phase: ph }, extra || {}))
    if (res == null) L.failed.push(label)
    return res
  } catch (e) {
    L.failed.push(label)
    log(`${label} failed: ${clip(errText(e), 200)}`)
    return null
  }
}

// The director runs on Fable; if Fable is unavailable the same definition runs on Opus.
// Round digests pass { effort: 'high' }; the charter, stage gates and sign-off use the definition's xhigh.
async function director(prompt, schema, label, ph, extra) {
  const res = await call('D00', prompt, schema, label, ph, extra)
  if (res || L.used >= L.cap) return res
  L.notes.push(`director fallback to opus for ${label}`)
  log(`director returned nothing for ${label}; retrying on opus`)
  return call('D00', prompt, schema, `${label} (opus)`, ph, Object.assign({}, extra || {}, { model: 'opus' }))
}

// ---------------------------------------------------------------------------------------------
// Schemas. Every result carries the _fragment path; a plugin hook records it there verbatim.
// ---------------------------------------------------------------------------------------------
const str = n => ({ type: 'string', maxLength: n })
const arr = (items, n) => ({ type: 'array', items, maxItems: n })
const bool = { type: 'boolean' }
const int = (lo, hi) => ({ type: 'integer', minimum: lo, maximum: hi })
const num = (lo, hi) => ({ type: 'number', minimum: lo, maximum: hi })
const en = (...v) => ({ type: 'string', enum: v })
const obj = (props, req) => ({ type: 'object', properties: props, required: req || Object.keys(props) })
const S = (props, req) => obj(Object.assign({ _fragment: str(300) }, props), ['_fragment'].concat(req || Object.keys(props)))

const PRIORITY = en('high', 'medium', 'low')
const MSG = obj({ to: str(40), body: str(600), needs_reply: bool })
const TASKP = obj({ title: str(120), desc: str(400), suggested_owner: str(10), priority: PRIORITY }, ['title', 'desc', 'priority'])
const ISSUE = obj({ target: str(200), code: str(60), rationale: str(500) })
const FINDING = obj({ text: str(400), refs: arr(str(80), 8) }, ['text', 'refs'])

const POST = S({
  summary: str(800),
  findings: arr(FINDING, 6),
  messages: arr(MSG, 4),
  propose_tasks: arr(TASKP, 3),
  claim_task_ids: arr(str(20), 2),
  done_task_ids: arr(str(20), 6),
  blocking_issues: arr(ISSUE, 3),
  files_written: arr(str(200), 12),
})

const BOARD_OP = obj({ op: en('add', 'assign', 'close', 'drop'), task_id: str(20), title: str(120), desc: str(400), owner: str(10), priority: PRIORITY }, ['op'])
const DIGEST = S({
  digest: str(3000),
  board_updates: arr(BOARD_OP, 20),
  next_participants: arr(obj({ id: str(10), task: str(400) }), 24),
  stage_complete: bool,
}, ['digest', 'board_updates', 'next_participants', 'stage_complete'])

const CHARTER = S({
  title: str(200),
  aims: arr(str(300), 6),
  research_questions: arr(str(300), 8),
  success_criteria: arr(str(300), 8),
  constraints: arr(str(300), 8),
  initial_tasks: arr(TASKP, 12),
})

const GATE = S({
  verdict: en('proceed', 'revisit'),
  revisit_stage: str(20),
  revisit_issues: arr(str(400), 8),
  headline: str(400),
  key_outputs: arr(str(300), 10),
  open_risks: arr(str(300), 8),
})

const REPORT_TR = S({ path: str(200), new_terms: arr(obj({ en: str(120), ar: str(120) }), 40) })

const IDENT_TYPES = ['none'].concat(POLICY.identifier_types || [])
const IDENT = obj({ type: en(...IDENT_TYPES), value: str(300) })
const CANDIDATE = obj({
  title: str(400), authors: arr(str(120), 20), year: int(0, 2100), identifier: IDENT,
  venue: str(300), url: str(500), claimed_type: str(40), stance: en('supports', 'opposes', 'mixed', 'method', 'background'),
  relevance: str(300),
}, ['title', 'authors', 'year', 'identifier', 'claimed_type', 'stance', 'relevance'])
const SCOUT = n => S({ candidates: arr(CANDIDATE, n) })

const METADATA = obj({
  title: str(400),
  authors: arr(obj({ name: str(120), kind: en('person', 'org'), orcid: str(40) }, ['name', 'kind']), 40),
  year: int(0, 2100), date: str(20), identifier: IDENT, type: str(40), venue: str(300), publisher: str(200),
  url: str(500), peer_reviewed: bool, empirical: bool,
  resolution: obj({ method: en('cli', 'web', 'none'), match_score: num(0, 1), resolved_title: str(400), evidence_url: str(500) }, ['method', 'match_score']),
}, ['title', 'authors', 'year', 'identifier', 'type', 'empirical', 'resolution'])
const VERDICT = obj({
  key: str(20), verdict: en('pass', 'concern', 'fail'), severity: en('low', 'medium', 'high', 'critical'),
  code: str(60), rationale: str(500), evidence: arr(str(300), 5),
  metadata: METADATA, retracted: bool, expression_of_concern: bool, assessed_type: str(40),
  design_tier: en('1', '2', '3', '4', '5', 'na'), replication_status: en('replicated', 'mixed', 'failed', 'untested', 'na'),
}, ['key', 'verdict', 'severity', 'code', 'rationale', 'evidence'])
const CHECKS = n => S({ batch_keys: arr(str(20), n), verdicts: arr(VERDICT, n) })
const VETOES = n => S({ vetoes: arr(obj({ key: str(20), code: str(60), rationale: str(500), evidence: arr(str(300), 5) }), n) })
const REREVIEW_SRC = n => S({ decisions: arr(obj({ key: str(20), uphold_admission: bool, rationale: str(500) }), n) })

const IDEAS = n => S({
  ideas: arr(obj({
    title: str(160), statement: str(600), mechanism: str(600), technique: str(80),
    what_would_make_it_true: str(400), possible_tests: str(400), grounding_hints: arr(str(20), 6),
  }, ['title', 'statement', 'mechanism', 'technique', 'what_would_make_it_true', 'possible_tests', 'grounding_hints']), n),
})
const VOTES = n => S({
  votes: arr(obj({
    idea_key: str(30), vote: en('support', 'oppose', 'abstain'), grounding_source_ids: arr(str(20), 6),
    test_sketch: str(800), rationale: str(400),
  }), n),
})

const EXP_PLAN = n => S({
  experiments: arr(obj({
    title: str(200), kind: en('computational', 'protocol'), hypothesis_ids: arr(str(30), 6),
    design_path: str(200), rationale: str(400),
  }), n),
})
const ENV = S({ ok: bool, python: str(40), packages: arr(str(80), 40), notes: str(600) })
const BUILD = S({ exp_id: str(12), ran: bool, results_path: str(200), code_path: str(200), headline: str(600), problems: arr(str(300), 6) })
const RERUN = S({ exp_id: str(12), reproduced: bool, discrepancies: arr(str(300), 8), repro_path: str(200) })
const ROBUST = S({ exp_id: str(12), robust: en('robust', 'fragile', 'not_tested'), checks: arr(str(300), 8), report_path: str(200) })
const AUDIT = S({ exp_id: str(12), verdict: en('valid', 'invalid', 'inconclusive'), numbers_traceable: bool, issues: arr(str(300), 8), audit_path: str(200) })

const REVIEW = S({
  summary: str(800),
  issues: arr(obj({ target: str(200), code: str(60), severity: en('blocking', 'major', 'minor'), rationale: str(600), location: str(200) }, ['target', 'code', 'severity', 'rationale']), 8),
  review_path: str(200),
})
const RESPONSES = n => S({ responses: arr(obj({ issue_key: str(120), action: en('fixed', 'rebutted', 'deferred'), summary: str(600), files_changed: arr(str(200), 6) }), n) })
const RECHECK = n => S({ checks: arr(obj({ issue_key: str(120), resolved: bool, comment: str(400) }), n) })
const DOWNGRADE = S({ downgrades: arr(obj({ issue_key: str(120), justification: str(600) }), 12) })

const OUTLINE = n => S({ sections: arr(obj({ id: str(40), title: str(160), brief: str(600) }), n) })
const SECTION = S({ section_id: str(60), path: str(200), word_count: int(0, 100000), cited_ids: arr(str(20), 120) })
const FIGS = S({ figures: arr(obj({ id: str(20), path: str(200), caption: str(400), source_files: arr(str(200), 6) }), 20) })
const REFS = S({ references_path: str(200), repro_package_path: str(200), problems: arr(str(300), 10) })
const CLAIMS = n => S({
  claims: arr(obj({
    section_id: str(60), text: str(500), cited_ids: arr(str(20), 10), result_ids: arr(str(20), 6),
    kind: en('empirical', 'theoretical', 'methodological', 'speculative'),
  }), n),
})
const VERIFY = n => S({ checks: arr(obj({ claim_key: str(20), refuted: bool, severity: en('low', 'medium', 'high'), reason: str(500), suggestion: str(500) }), n) })
const REVISED = S({ section_id: str(60), path: str(200), changes: arr(str(300), 20) })

const TR_SECTION = S({ section_id: str(60), path: str(200), new_terms: arr(obj({ en: str(120), ar: str(120) }), 40) })
const TERMS = S({ glossary_path: str(200), fixes: arr(obj({ section_id: str(60), issue: str(400) }), 20) })
const FINAL = S({ signoff: bool, report_path: str(200), headline: str(600), limitations: arr(str(400), 12) })

// ---------------------------------------------------------------------------------------------
// Prompt pieces. Prompts depend only on args and earlier results, so a relaunch replays exactly.
// ---------------------------------------------------------------------------------------------
function head(id) {
  const r = BY_ID[id]
  return [
    `You are ${id} (${r.title}) in the Maistro research lab.`,
    `Project folder: ${PD}/ · stage: ${STAGE}${MODE !== 'normal' ? ` (${MODE} run)` : ''} · date: ${A.date} · scale: ${SCALE}.`,
    `Start by reading ${PD}/idea.md and ${PD}/00-charter.md (if it exists). Follow the lab protocol you were given.`,
  ].join('\n')
}

function context() {
  const out = []
  if (ISSUES.length) out.push(`This run exists to address these issues (fix them; don't redo unrelated work):\n- ${ISSUES.join('\n- ')}`)
  if (APIS === false) out.push('The scholarly APIs are unreachable in this run: use WebSearch/WebFetch and record evidence URLs.')
  return out.join('\n\n')
}

function tail(label, postPath) {
  const out = []
  if (postPath) out.push(`Write your full post (Markdown) to ${postPath}.`)
  out.push(`Set "_fragment" to exactly "${frag(label)}" in your structured result.`)
  return out.join('\n')
}

const prompt = (...parts) => parts.filter(Boolean).join('\n\n')

// ---------------------------------------------------------------------------------------------
// Task board and messages
// ---------------------------------------------------------------------------------------------
function newBoard(initial, createdBy) {
  const b = { seq: 0, tasks: [] }
  for (const t of initial || []) addTask(b, t, createdBy || 'D00', 0)
  return b
}
function addTask(b, t, by, k) {
  if (b.tasks.length >= 80) { L.notes.push('board full: task dropped'); return null }
  b.seq++
  const id = `${STAGE_SHORT[STAGE]}-${b.seq}`
  const owner = t.owner && BY_ID[t.owner] ? t.owner : null
  b.tasks.push({ id, title: clip(t.title, 120), desc: clip(t.desc, 400), priority: t.priority || 'medium', owner, status: owner ? 'claimed' : 'open', suggested: t.suggested_owner || '', by, round: k })
  return id
}
function applyAgentBoard(b, posts, k) {
  for (const p of posts) {
    for (const t of p.propose_tasks || []) addTask(b, t, p.id, k)
    for (const tid of p.claim_task_ids || []) {
      const t = b.tasks.find(x => x.id === tid)
      if (t && t.status === 'open' && !t.owner) { t.owner = p.id; t.status = 'claimed' }
    }
    for (const tid of p.done_task_ids || []) {
      const t = b.tasks.find(x => x.id === tid)
      if (t && t.owner === p.id && t.status !== 'dropped') t.status = 'done'
    }
  }
  return b
}
function applyDirectorBoard(b, ops, k) {
  for (const op of ops || []) {
    const t = op.task_id ? b.tasks.find(x => x.id === op.task_id) : null
    if (op.op === 'add' && op.title) addTask(b, { title: op.title, desc: op.desc || '', priority: op.priority, owner: op.owner }, 'D00', k)
    else if (op.op === 'assign' && t && BY_ID[op.owner]) { t.owner = op.owner; t.status = t.status === 'done' ? 'done' : 'claimed' }
    else if (op.op === 'close' && t) t.status = 'done'
    else if (op.op === 'drop' && t) t.status = 'dropped'
  }
  return b
}
const openTasks = b => b.tasks.filter(t => t.status === 'open' || t.status === 'claimed')
const openHigh = b => openTasks(b).some(t => t.priority === 'high')
function tasksFor(b, id) {
  const mine = b.tasks.filter(t => t.owner === id && t.status === 'claimed')
  const rank = { high: 0, medium: 1, low: 2 }
  const free = b.tasks.filter(t => t.status === 'open').sort((x, y) => rank[x.priority] - rank[y.priority] || x.id.localeCompare(y.id, 'en', { numeric: true })).slice(0, 5)
  return { mine, free }
}
function boardText(tasks) {
  if (!tasks.length) return '(none)'
  return tasks.map(t => `- ${t.id} [${t.priority}${t.owner ? `, owner ${t.owner}` : ''}${t.suggested && !t.owner ? `, suggested ${t.suggested}` : ''}] ${t.title}: ${t.desc}`).join('\n')
}

function route(posts, inbox, toDirector, broadcasts) {
  let dropped = 0
  const push = (to, m) => {
    inbox[to] = inbox[to] || []
    if (inbox[to].length >= SC.perAgentInbox * 2) { dropped++; return }
    inbox[to].push(m)
  }
  for (const p of posts) {
    for (const m of p.messages || []) {
      const to = String(m.to || '').trim()
      const msg = { from: p.id, body: clip(m.body, 600), needs_reply: !!m.needs_reply }
      if (to === 'director' || to === 'D00') toDirector.push(msg)
      else if (to === 'all') broadcasts.push(msg)
      else if (to.startsWith('division:')) {
        const members = divisionIds(to.slice(9))
        if (!members.length) dropped++
        for (const id of members) if (id !== p.id) push(id, msg)
      } else if (BY_ID[to] && to !== p.id) push(to, msg)
      else dropped++
    }
  }
  if (dropped) L.notes.push(`${dropped} messages dropped (unknown recipient or full inbox)`)
}
function takeInbox(inbox, id) {
  const msgs = (inbox[id] || []).slice(0, SC.perAgentInbox)
  inbox[id] = (inbox[id] || []).slice(SC.perAgentInbox)
  return msgs
}
const inboxText = msgs => msgs.length ? msgs.map(m => `- from ${m.from}${m.needs_reply ? ' (needs reply)' : ''}: ${m.body}`).join('\n') : '(empty)'

function compactPost(p) {
  const f = (p.findings || []).slice(0, 3).map(x => clip(x.text, 160)).join(' | ')
  const b = (p.blocking_issues || []).map(x => `${x.code}@${clip(x.target, 60)}`).join(', ')
  return `- ${p.id}: ${clip(p.summary, 400)}${f ? `\n  findings: ${f}` : ''}${b ? `\n  BLOCKING: ${b}` : ''}`
}

// ---------------------------------------------------------------------------------------------
// The round engine. Round 1 = whole home division + guests. Later rounds = director's picks,
// plus agents with unanswered messages. Results are kept in index order (deterministic).
// ---------------------------------------------------------------------------------------------
async function runRounds(cfg) {
  const home = divisionIds(cfg.home)
  // Normal runs open with the whole home division. Repair/revisit/update runs have half the budget,
  // so they open with the agents the issues name (by ID or by the files they own) and the stage lead.
  const named = ISSUES.join(' ').match(/\b[DMSTECFW]\d\d\b|[0-9]{2}-[a-z]+(?:\/[A-Za-z0-9._-]+)*/g) || []
  const focused = [...new Set(named.map(x => (BY_ID[x] ? x : ownerOf(x))).concat([K.stage_leads[STAGE]]))].filter(id => BY_ID[id] && id !== 'D00')
  const opening = MODE === 'normal'
    ? home.concat((cfg.guests || []).filter(g => BY_ID[g] && !home.includes(g))).sort(byRoster)
    : focused.sort(byRoster).slice(0, SC.maxPerRound)
  let who = opening.map(id => ({ id, task: cfg.openingTask }))
  let digest = '', board = cfg.board || newBoard([]), inbox = {}, last = [], exitReason = 'round_cap', k = 0
  for (const f of FIX_ITEMS) addTask(board, { title: `Audit fix: ${f.code || 'FIX'}`, desc: `${f.detail || ''} (${f.path || ''})`, priority: 'medium', owner: ownerOf(f.path) === 'D00' ? null : ownerOf(f.path) }, 'audit', 0)
  const maxRounds = MODE === 'normal' ? SC.rounds : Math.max(1, SC.rounds - 1)
  for (k = 1; k <= maxRounds; k++) {
    if (!can(who.length + 1)) { exitReason = 'budget'; L.notes.push(`${cfg.tag}: stopped before round ${k} (budget)`); k--; break }
    const prompts = who.map(p => {
      const box = takeInbox(inbox, p.id)
      const t = tasksFor(board, p.id)
      return prompt(
        head(p.id),
        `Stage goal:\n${cfg.goal}`,
        context(),
        `Round ${k} of at most ${maxRounds}.${k === 1 ? ' Opening round: every member of the home division takes part.' : ''}\nYour assignment this round: ${p.task || cfg.openingTask}`,
        `Previous round digest from the director:\n${digest || '(this is the first round)'}`,
        `Your inbox:\n${inboxText(box)}`,
        `Your claimed tasks:\n${boardText(t.mine)}\n\nOpen tasks anyone may claim:\n${boardText(t.free)}`,
        `Read what you need from: ${cfg.reads.join(', ')}. Earlier rounds of this stage: ${k > 1 ? `${PD}/forum/${STAGE}/run${RUN}/r1 … r${k - 1}` : '(none yet)'}. Don't read round ${k} files.`,
        tail(`${cfg.tag} r${k} ${p.id}`, post(k, p.id)),
      )
    })
    const res = await parallel(who.map((p, i) => () => call(p.id, prompts[i], POST, `${cfg.tag} r${k} ${p.id}`, cfg.phase)))
    last = res.map((x, i) => x && Object.assign({}, x, { id: who[i].id })).filter(Boolean)
    const toDirector = [], broadcasts = []
    route(last, inbox, toDirector, broadcasts)
    applyAgentBoard(board, last, k)
    const pending = Object.keys(inbox).filter(id => inbox[id].length).sort(byRoster)
    const d = await director(prompt(
      `You are D00, the research director. Stage ${STAGE}, round ${k} of at most ${maxRounds}. Project folder: ${PD}/.`,
      `Stage goal:\n${cfg.goal}`,
      context(),
      `Posts this round (full posts in ${PD}/forum/${STAGE}/run${RUN}/r${k}/):\n${last.map(compactPost).join('\n') || '(no posts arrived)'}`,
      `Messages to you:\n${inboxText(toDirector)}\n\nBroadcasts to everyone:\n${inboxText(broadcasts)}`,
      `Agents with unread messages: ${pending.map(id => `${id}(${inbox[id].length})`).join(', ') || 'none'}`,
      `Board:\n${boardText(openTasks(board))}`,
      `Previous digest:\n${digest || '(none)'}`,
      [
        'Decide and delegate; don\'t do the specialists\' work yourself. Read full posts or files only where a decision depends on them. If a decision changes the charter, make only that small edit to 00-charter.md, and turn any substantial rewriting into a task for its owner.',
        'Do four things:',
        '1. Write the round digest: what is now established, open disagreements, and decisions you made. Cite agent IDs, files and registry IDs.',
        '2. Update the board with board_updates (add, assign, close, drop). Write the full board as Markdown to ' + `${PD}/board/${STAGE}.md.`,
        `3. Pick next_participants (at most ${SC.maxPerRound}), each with one concrete task. Prefer agents who own open tasks or whose expertise the open questions need. Any division may be called.`,
        `4. Set stage_complete=true only if the stage goal is met and nothing blocking remains.${cfg.exitHint ? ' ' + cfg.exitHint : ''}`,
      ].join('\n'),
      tail(`${cfg.tag} r${k} director`),
    ), DIGEST, `${cfg.tag} r${k} director`, cfg.phase, { effort: 'high' })
    if (d) { digest = clip(d.digest, 3000); applyDirectorBoard(board, d.board_updates, k) }
    const blocking = last.flatMap(p => p.blocking_issues || [])
    const exitOk = blocking.length === 0 && !openHigh(board)
    if (exitOk && (d ? d.stage_complete : false)) { exitReason = 'converged'; break }
    if (k === maxRounds) { exitReason = 'round_cap'; break }
    const picks = []
    for (const p of (d && d.next_participants) || []) {
      if (BY_ID[p.id] && p.id !== 'D00' && !picks.find(x => x.id === p.id)) picks.push({ id: p.id, task: clip(p.task, 400) })
    }
    if (!d) for (const t of openTasks(board)) if (t.owner && t.owner !== 'D00' && !picks.find(x => x.id === t.owner)) picks.push({ id: t.owner, task: `Continue your task ${t.id}.` })
    let next = picks.slice(0, SC.maxPerRound)
    const waiting = Object.keys(inbox).filter(id => id !== 'D00' && inbox[id].some(m => m.needs_reply) && !next.find(x => x.id === id)).sort(byRoster).slice(0, SC.inboxExtra)
    next = next.concat(waiting.map(id => ({ id, task: 'Answer the messages in your inbox, then continue your own work.' })))
    next.sort((x, y) => byRoster(x.id, y.id))
    if (!next.length) { exitReason = 'nothing_to_do'; break }
    who = next
  }
  return { digest, board, last, rounds: k, exitReason }
}

// ---------------------------------------------------------------------------------------------
// Stage report translation (W04 translates the previous stage's report while this stage runs)
// ---------------------------------------------------------------------------------------------
function translatePrevious() {
  if (!A.prev_report) return null
  const label = `translate report ${A.prev_stage || 'previous'}`
  return call('W04', prompt(
    head('W04'),
    `Translate the stage report ${PD}/${A.prev_report} into Arabic following bilingual.md in the lab protocol. Write ${PD}/${String(A.prev_report).replace(/\.en\.md$/, '.ar.md')}.`,
    `You are the only writer of ${PD}/glossary.md during this run: add any new terms you used (keep the existing renderings).`,
    tail(label),
  ), REPORT_TR, label, 'Translation')
}

// ---------------------------------------------------------------------------------------------
// Stage gate: director report + verdict. Only an earlier stage can be revisited, at most once.
// ---------------------------------------------------------------------------------------------
async function stageGate(facts, trPromise) {
  const label = `${STAGE} gate`
  const earlier = STAGES.slice(0, STAGES.indexOf(STAGE))
  const g = await director(prompt(
    `You are D00, the research director, closing the ${STAGE} stage. Project folder: ${PD}/.`,
    context(),
    `What the workflow recorded:\n${JSON.stringify(facts, null, 1)}`,
    FIX_ITEMS.length ? `Audit findings from the previous run (list any still open under open risks):\n- ${FIX_ITEMS.map(f => `${f.code}: ${f.detail}`).join('\n- ')}` : '',
    [
      `Write the stage report to ${PD}/stage-reports/${STAGE}.en.md: what was done, what is established, what was refused and why, open risks, and what the next stage must do. Link files and registry IDs.`,
      A.revisits_left > 0 && earlier.length && MODE === 'normal'
        ? `If a serious flaw can only be fixed in an earlier stage (${earlier.join(', ')}), set verdict "revisit" with revisit_stage and the specific issues. This is allowed once per project; use it only if proceeding would make the research wrong.`
        : 'Set verdict "proceed" (no revisit is available in this run).',
    ].join('\n'),
    tail(label),
  ), GATE, label, 'Stage gate')
  const tr = trPromise ? await trPromise : null
  let verdict = 'proceed', revisit = null
  if (g && g.verdict === 'revisit' && A.revisits_left > 0 && MODE === 'normal' && earlier.includes(g.revisit_stage)) {
    verdict = 'revisit'
    revisit = { stage: g.revisit_stage, issues: (g.revisit_issues || []).slice(0, 8) }
  }
  return {
    verdict, revisit,
    headline: g ? clip(g.headline, 400) : '(no director report)',
    report: `stage-reports/${STAGE}.en.md`,
    translated_previous: !!tr,
  }
}

// debug (args.debug) returns the per-item decisions too, for the parity tests.
function finish(extra, decisions) {
  return Object.assign({
    stage: STAGE, mode: MODE, run: RUN, scale: SCALE,
    calls_used: L.used, cap: L.cap,
    dropped: L.dropped.length, failed: L.failed.length,
    notes: L.notes.slice(0, 20),
  }, extra, A.debug && decisions ? { debug: decisions } : {})
}

// ---------------------------------------------------------------------------------------------
// Gates (mirrored in scripts/maistro_gates.py; tests check both agree)
// ---------------------------------------------------------------------------------------------
const evidenced = v => Array.isArray(v.evidence) && v.evidence.some(e => String(e).trim().length >= 6)
const normType = t => String(t || '').trim().toLowerCase()

function tier1Gate(c, meta, s05, s07, apis) {
  const r = []
  if (!meta) return { status: 'rejected', reasons: ['NOT_VERIFIED'] }
  const authors = meta.authors || []
  const people = authors.filter(a => a.kind === 'person' && String(a.name || '').trim().length >= 2)
  const orgs = authors.filter(a => a.kind === 'org' && String(a.name || '').trim().length >= 2)
  const type = normType(meta.type)
  if (!people.length && !(orgs.length && POLICY.org_author_allowed_types.includes(type))) r.push('NO_AUTHOR')
  if (!meta.year) r.push('NO_DATE')
  const id = meta.identifier || {}
  if (!POLICY.identifier_types.includes(id.type) || String(id.value || '').trim().length < 3) r.push('NO_STABLE_ID')
  const res = meta.resolution || {}
  const cliOk = res.method === 'cli' && Number(res.match_score) >= POLICY.min_match_score
  const webOk = apis === false && res.method === 'web' && Number(res.match_score) >= POLICY.min_match_score && String(res.evidence_url || '').startsWith('http')
  if (!cliOk && !webOk) r.push('UNRESOLVED')
  const assessed = normType(s07 && s07.assessed_type)
  if (POLICY.blocked_types.includes(type)) r.push(`TYPE_BLOCKED:${type}`)
  else if (assessed && POLICY.blocked_types.includes(assessed)) r.push(`TYPE_BLOCKED:${assessed}`)
  else if (!POLICY.allowed_types.includes(type)) r.push(`TYPE_NOT_ALLOWED:${type || 'unknown'}`)
  if (s05 && s05.retracted === true) r.push('RETRACTED')
  return r.length ? { status: 'rejected', reasons: r } : { status: 'pass', reasons: [] }
}

function criticalFails(vs, ignored) {
  const out = []
  for (const v of vs) {
    if (!v || v.verdict !== 'fail' || v.severity !== 'critical') continue
    if (evidenced(v)) out.push(`${v.agent}:${String(v.code || 'FAIL').toUpperCase()}`)
    else ignored.push(`${v.agent}:${v.key}:${v.code}`)
  }
  return out
}

function gradeOf(meta, vs) {
  const s08 = vs.find(v => v.agent === 'S08' && v.design_tier)
  let g = s08 ? POLICY.design_tier_grade[s08.design_tier] || POLICY.default_grade : POLICY.default_grade
  const cap = POLICY.type_grade_cap[normType(meta && meta.type)]
  if (cap && GRADES.indexOf(cap) > GRADES.indexOf(g)) g = cap
  let pen = vs.filter(v => v.verdict === 'concern' && v.severity === 'high' && evidenced(v)).length
  if (vs.some(v => v.agent === 'S05' && v.expression_of_concern === true)) pen++
  if (vs.some(v => v.agent === 'S10' && v.replication_status === 'failed')) pen++
  return GRADES[Math.min(GRADES.length - 1, GRADES.indexOf(g) + pen)]
}

function promoteIdea(votes, accepted) {
  const support = votes.filter(v => v && v.vote === 'support')
  const grounded = support.some(v => (v.grounding_source_ids || []).some(id => accepted.has(id)) || String(v.test_sketch || '').trim().length >= K.min_test_sketch)
  if (support.length >= 2 && grounded) return 'promoted'
  if (support.length >= 2) return 'needs_grounding'
  return 'quarantined'
}

function claimDecision(checks, unknownIds) {
  const refuted = checks.filter(c => c && c.refuted).length
  if (refuted >= 2) return 'remove'
  if (refuted === 1 || unknownIds.length) return 'soften'
  return 'keep'
}

// ---------------------------------------------------------------------------------------------
// Stage 1: charter + methodology
// ---------------------------------------------------------------------------------------------
async function stageMethodology() {
  let initial = []
  if (MODE === 'normal' || ISSUES.some(i => /NO_CHARTER/.test(i))) {
    phase('Charter')
    const ch = await director(prompt(
      `You are D00, the research director, opening a new project. Project folder: ${PD}/.`,
      context(),
      [
        `Read ${PD}/idea.md. Write ${PD}/00-charter.md: title, the aim in one paragraph, aims, research questions, success criteria (what result would answer each question), constraints and available resources, what is out of scope, and how the lab will know the project failed.`,
        'Be ambitious about the question and honest about what this lab can do: Claude agents, web search, scholarly databases, Python on this machine and public datasets. Anything needing people, money or a wet lab becomes a protocol for humans.',
        'Return up to 12 initial_tasks for the methodology stage, each with a suggested_owner from the methodology division (M01–M11) or another division if better.',
      ].join('\n'),
      tail('charter'),
    ), CHARTER, 'charter', 'Charter')
    initial = (ch && ch.initial_tasks) || []
  }
  phase('Discussion')
  const res = await runRounds({
    tag: 'met', home: 'methodology', guests: ['C01', 'C02', 'C12'], phase: 'Discussion',
    board: newBoard(initial.map(t => ({ title: t.title, desc: t.desc, priority: t.priority, owner: null, suggested_owner: t.suggested_owner }))),
    goal: [
      'Turn the charter into a methodology this lab can actually execute. Required files in 01-methodology/ (owner in brackets):',
      'research-questions.md [M01], gap-analysis.md [M02], hypotheses.md [M03: numbered H1…, each falsifiable with a stated prediction], design.md [M04], measures.md [M05], sampling-and-data.md [M06], feasibility.md [M07], ethics.md [M08], preregistration.md [M09], risks.md [M10], methods-bridge.md [M11], and protocol.md [M04 integrates everything].',
      'Critics C01, C02 and C12 challenge the design early.',
    ].join('\n'),
    openingTask: 'Draft your specialist part of the methodology, write it to the file you own, and challenge any part of the charter that is vague, untestable or infeasible.',
    reads: [`${PD}/idea.md`, `${PD}/00-charter.md`, `${PD}/01-methodology/`],
    exitHint: 'Exit criteria: every required file exists and protocol.md is consistent with the others.',
  })
  const g = await stageGate({ rounds: res.rounds, exit_reason: res.exitReason, open_tasks: openTasks(res.board).length })
  return finish({ exit_reason: res.exitReason, rounds: res.rounds, counts: { open_tasks: openTasks(res.board).length }, gate: g })
}

// ---------------------------------------------------------------------------------------------
// Stage 2: sources (two-tier validation + audit)
// ---------------------------------------------------------------------------------------------
const ANGLE_TEXT = {
  S01: 'direct evidence for the hypotheses (primary empirical studies)',
  C05: 'evidence against the hypotheses: null results, failed replications, critiques',
  S10: 'systematic reviews, meta-analyses and consensus statements',
  M05: 'methods and measurement literature for the planned design',
  T06: 'foundational and historical works that defined the problem',
  T07: 'evidence from adjacent fields with analogous mechanisms',
  E05: 'datasets, benchmarks and official statistics the experiments could use',
  S09: 'the most cited and the most recent work, including preprints (flagged as such)',
}
const T1 = K.tier1
const T2_BASE = K.tier2
const T2_EXTRA = K.tier2_empirical_extra

function normKey(c) {
  const id = c.identifier || {}
  let v = String(id.value || '').trim().toLowerCase()
  if (id.type === 'doi') v = v.replace(/^https?:\/\/(dx\.)?doi\.org\//, '').replace(/^doi:/, '')
  if (['doi', 'arxiv', 'pmid', 'pmcid', 'isbn'].includes(id.type) && v) return `${id.type}:${v}`
  return `t:${String(c.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '')}:${c.year || 0}`
}

async function screenWave(cands, wave, results) {
  const W = `w${wave}`
  // Tier 1 — every candidate
  phase('Source screening')
  const b1 = chunk(cands, SC.src.t1Batch)
  const jobs1 = []
  b1.forEach((b, bi) => T1.forEach(id => jobs1.push({ id, b, bi })))
  const t1 = await parallel(jobs1.map(j => () => call(j.id, prompt(
    head(j.id),
    context(),
    `Tier-1 source screening, wave ${wave}, batch ${bi2(j.bi)}. Check every candidate below for your role and return one verdict per key (and every key in batch_keys). Follow source-policy.md in the lab protocol exactly.`,
    j.id === 'S02' ? 'You must resolve each candidate with the scholarly CLI (`resolve`, with --title/--year/--surname) and return the corrected metadata, including authors with kind person|org, the stable identifier and resolution{method, match_score, resolved_title, evidence_url}. Never guess metadata.' : '',
    j.id === 'S05' ? 'Set retracted and expression_of_concern for every key, using the `retraction` and `work` commands, plus a web check of Retraction Watch where needed.' : '',
    j.id === 'S07' ? 'Set assessed_type whenever a source is really marketing, a press release, a vendor white paper, sponsored, SEO/content-farm or AI content-farm material, an unsigned wiki, a social post or anonymous. Also flag spin and advocacy as concerns.' : '',
    `Candidates (JSON):\n${JSON.stringify(j.b.map(c => ({ key: c.key, title: c.title, authors: c.authors, year: c.year, identifier: c.identifier, venue: c.venue, url: c.url, claimed_type: c.claimed_type })), null, 0)}`,
    `Write a short screening note to ${PD}/02-sources/notes/${W}-t1-b${bi2(j.bi)}-${j.id}.md.`,
    tail(`${W} t1 b${bi2(j.bi)} ${j.id}`),
  ), CHECKS(j.b.length), `${W} t1 b${bi2(j.bi)} ${j.id}`, 'Source screening')))
  const byKey = {}
  for (const c of cands) byKey[c.key] = { c, v: [] }
  t1.forEach((r, i) => { if (r) addVerdicts(byKey, jobs1[i], r.verdicts) })
  const ignored = []
  const survivors = []
  for (const c of cands) {
    const e = byKey[c.key]
    const meta = (e.v.find(v => v.agent === 'S02' && v.metadata) || {}).metadata || null
    const s05 = e.v.find(v => v.agent === 'S05') || null
    const s07 = e.v.find(v => v.agent === 'S07') || null
    const g1 = tier1Gate(c, meta, s05, s07, APIS)
    const crit = criticalFails(e.v, ignored)
    e.meta = meta
    if (g1.status === 'rejected' || crit.length) results[c.key] = { status: 'rejected', reasons: g1.reasons.concat(crit), wave }
    else survivors.push(c)
  }
  // Tier 2 — survivors only
  phase('Source background checks')
  let b2 = chunk(survivors, SC.src.t2Batch)
  const perBatch = b => T2_BASE.length + (b.some(c => byKey[c.key].meta && byKey[c.key].meta.empirical) ? 1 : 0)
  let need = b2.reduce((n, b) => n + perBatch(b), 0)
  while (b2.length && !can(need + b2.length)) {
    const cut = b2.pop()
    for (const c of cut) results[c.key] = { status: 'rejected', reasons: ['NOT_BACKGROUND_CHECKED'], wave }
    need = b2.reduce((n, b) => n + perBatch(b), 0)
    L.notes.push(`sources wave ${wave}: ${cut.length} candidates not background-checked (budget)`)
  }
  const jobs2 = []
  b2.forEach((b, bi) => {
    const ids = T2_BASE.concat(perBatch(b) > T2_BASE.length ? [T2_EXTRA] : [])
    ids.forEach(id => jobs2.push({ id, b, bi }))
  })
  const t2 = await parallel(jobs2.map(j => () => call(j.id, prompt(
    head(j.id),
    context(),
    `Tier-2 background check, wave ${wave}, batch ${bi2(j.bi)}. These sources passed tier 1. Do your role's checks on every key and return one verdict per key (and every key in batch_keys). Follow source-policy.md. A critical fail needs evidence; without evidence it is ignored.`,
    j.id === 'S08' ? 'Set design_tier for every key (1–5 or na).' : '',
    j.id === 'S10' ? 'Set replication_status for every key.' : '',
    j.id === 'S11' ? 'Only empirical papers need forensic checks; give "pass" with code NOT_APPLICABLE for the rest.' : '',
    `Sources (verified metadata, JSON):\n${JSON.stringify(j.b.map(c => Object.assign({ key: c.key }, byKey[c.key].meta)), null, 0)}`,
    `Write your notes to ${PD}/02-sources/notes/${W}-t2-b${bi2(j.bi)}-${j.id}.md.`,
    tail(`${W} t2 b${bi2(j.bi)} ${j.id}`),
  ), CHECKS(j.b.length), `${W} t2 b${bi2(j.bi)} ${j.id}`, 'Source background checks')))
  t2.forEach((r, i) => { if (r) addVerdicts(byKey, jobs2[i], r.verdicts) })
  const admitted = []
  for (const b of b2) for (const c of b) {
    const e = byKey[c.key]
    const t2v = e.v.filter(v => !T1.includes(v.agent))
    const crit = criticalFails(t2v, ignored)
    if (crit.length) results[c.key] = { status: 'rejected', reasons: crit, wave }
    else if (new Set(t2v.map(v => v.agent)).size < K.min_tier2_verdicts) results[c.key] = { status: 'rejected', reasons: ['NOT_BACKGROUND_CHECKED'], wave }
    else { results[c.key] = { status: 'accepted', grade: gradeOf(e.meta, e.v), wave }; admitted.push(c) }
  }
  // Audit — source sceptic, then one re-review of evidenced vetoes
  phase('Source audit')
  const b3 = chunk(admitted, SC.src.t2Batch)
  const audits = can(b3.length) ? await parallel(b3.map((b, bi) => () => call('C04', prompt(
    head('C04'),
    context(),
    `Audit these newly admitted sources (wave ${wave}, batch ${bi2(bi)}). Read their notes in ${PD}/02-sources/notes/. Veto a source only for a concrete, evidenced reason the validators missed or got wrong (e.g. fabricated data finding, undisclosed conflict, hijacked journal, misreported design).`,
    `Admitted (JSON):\n${JSON.stringify(b.map(c => ({ key: c.key, grade: results[c.key].grade, title: byKey[c.key].meta.title, year: byKey[c.key].meta.year, identifier: byKey[c.key].meta.identifier })), null, 0)}`,
    tail(`${W} audit b${bi2(bi)} C04`),
  ), VETOES(b.length), `${W} audit b${bi2(bi)} C04`, 'Source audit'))) : []
  const vetoed = []
  audits.forEach((r, bi) => {
    if (!r) return
    for (const v of r.vetoes || []) {
      const inBatch = b3[bi] && b3[bi].some(c => c.key === v.key)
      if (!inBatch) continue
      if (evidenced(v)) { if (!vetoed.find(x => x.key === v.key)) vetoed.push(v) } else ignored.push(`C04:${v.key}:${v.code}`)
    }
  })
  if (vetoed.length) {
    const rr = await parallel(['S08', 'S10'].map(id => () => call(id, prompt(
      head(id),
      context(),
      'The source sceptic (C04) vetoed these admitted sources with evidence. Re-review each one independently and decide whether admission should be upheld.',
      `Vetoes (JSON):\n${JSON.stringify(vetoed, null, 0)}`,
      tail(`${W} rereview ${id}`),
    ), REREVIEW_SRC(vetoed.length), `${W} rereview ${id}`, 'Source audit')))
    for (const v of vetoed) {
      const ups = rr.map(r => r && (r.decisions || []).find(d => d.key === v.key)).filter(Boolean)
      const kept = ups.length === 2 && ups.every(d => d.uphold_admission === true)
      if (!kept) results[v.key] = { status: 'rejected', reasons: [`C04:${String(v.code || 'VETO').toUpperCase()}`], wave }
    }
  }
  return { ignored, admitted: admitted.filter(c => results[c.key].status === 'accepted') }
}
function bi2(n) { return pad(n + 1, 2) }
// Keep the first verdict per (agent, key), and only for keys that were in that agent's batch.
function addVerdicts(byKey, job, verdicts) {
  for (const v of verdicts || []) {
    const e = byKey[v.key]
    if (!e || !job.b.some(c => c.key === v.key) || e.v.some(x => x.agent === job.id)) continue
    e.v.push(Object.assign({}, v, { agent: job.id }))
  }
}

async function stageSources() {
  const tr = translatePrevious()
  phase('Source discovery')
  const focused = MODE !== 'normal'
  const nScouts = focused ? SC.src.revisit.scouts : SC.src.scouts
  const perScout = focused ? SC.src.revisit.perScout : SC.src.perScout
  const angles = K.source_scouts.slice(0, nScouts).map(id => ({ id, angle: ANGLE_TEXT[id] }))
  const scouts = await parallel(angles.map(a => () => call(a.id, prompt(
    head(a.id),
    context(),
    `Source discovery. Your search angle: ${a.angle}.`,
    `Use the charter, ${PD}/01-methodology/ (especially hypotheses.md and protocol.md) and the scholarly CLI \`search\` command plus WebSearch. Return up to ${perScout} candidates that a serious researcher would want checked${focused ? ', aimed at the issues above' : ''}. Report metadata exactly as found and never invent it; the gatekeeper will verify everything. Prefer primary, peer-reviewed sources with DOIs. Don't include marketing, press releases, vendor material or unsigned pages: they will be refused anyway.`,
    `Write a short search log (queries, databases, what you excluded and why) to ${PD}/02-sources/notes/scout-${a.id}.md.`,
    tail(`scout ${a.id}`),
  ), SCOUT(perScout), `scout ${a.id}`, 'Source discovery')))
  const seen = new Set(A.seen_source_keys || [])
  let cands = []
  scouts.forEach((r, i) => {
    if (!r) return
    for (const c of r.candidates || []) {
      const nk = normKey(c)
      if (seen.has(nk)) continue
      seen.add(nk)
      cands.push(Object.assign({}, c, { nk, found_by: angles[i].id }))
    }
  })
  if (cands.length > SC.src.maxCandidates) {
    L.notes.push(`sources: ${cands.length - SC.src.maxCandidates} candidates beyond the cap of ${SC.src.maxCandidates} were not screened`)
    cands = cands.slice(0, SC.src.maxCandidates)
  }
  let next = Number.isInteger(A.source_id_offset) ? A.source_id_offset : 0
  for (const c of cands) c.key = `SRC-${pad(++next, 4)}`
  const results = {}
  const w1 = await screenWave(cands, 1, results)
  let ignored = w1.ignored, wave2 = 0
  if (SC.src.chainWave && !focused && w1.admitted.length && can(1 + 3 + 7 + 2)) {
    phase('Source discovery')
    const top = w1.admitted.slice().sort((a, b) => GRADES.indexOf(results[a.key].grade) - GRADES.indexOf(results[b.key].grade) || a.key.localeCompare(b.key)).slice(0, 10)
    const ch = await call('S09', prompt(
      head('S09'),
      context(),
      `Citation-chain wave. For these admitted sources, follow backward references and forward citations (OpenAlex/Crossref via the CLI, plus WebSearch) and return up to ${SC.src.chainMax} new candidates the lab is missing, especially rebuttals, replications and later corrections.`,
      `Seed sources (JSON):\n${JSON.stringify(top.map(c => ({ key: c.key, title: c.title, year: c.year, identifier: c.identifier })), null, 0)}`,
      tail('chain S09'),
    ), SCOUT(SC.src.chainMax), 'chain S09', 'Source discovery')
    let more = []
    for (const c of (ch && ch.candidates) || []) {
      const nk = normKey(c)
      if (seen.has(nk)) continue
      seen.add(nk)
      more.push(Object.assign({}, c, { nk, found_by: 'S09' }))
    }
    more = more.slice(0, SC.src.chainMax)
    for (const c of more) c.key = `SRC-${pad(++next, 4)}`
    if (more.length) {
      const w2 = await screenWave(more, 2, results)
      ignored = ignored.concat(w2.ignored)
      wave2 = more.length
    }
  }
  const keys = Object.keys(results).sort()
  const accepted = keys.filter(k => results[k].status === 'accepted')
  const rejected = keys.filter(k => results[k].status === 'rejected')
  const grades = {}
  for (const k of accepted) grades[results[k].grade] = (grades[results[k].grade] || 0) + 1
  const reasons = {}
  for (const k of rejected) for (const r of results[k].reasons) { const key = r.split(':')[0]; reasons[key] = (reasons[key] || 0) + 1 }
  const facts = { candidates: keys.length, chain_wave_candidates: wave2, accepted: accepted.length, rejected: rejected.length, grades, rejection_reasons: reasons, unevidenced_allegations_ignored: ignored.length }
  const g = await stageGate(facts, tr)
  return finish({ exit_reason: 'done', counts: facts, gate: g }, results)
}

// ---------------------------------------------------------------------------------------------
// Stage 3: theory + frontier
// ---------------------------------------------------------------------------------------------
const THEORY_VOTERS = K.theory_voters
const CRITIC_VOTERS = K.critic_voters
const GROUND_VOTERS = K.ground_voters

async function stageTheory() {
  const tr = translatePrevious()
  phase('Frontier')
  const fIds = divisionIds('frontier')
  // Frontier brainstorms only in a normal run; repair/revisit/update runs keep the earlier ideas.
  const ideasP = MODE !== 'normal' ? Promise.resolve([]) : parallel(fIds.map(id => () => call(id, prompt(
    head(id),
    context(),
    `Frontier brainstorm. Using your technique, propose up to ${SC.ideasPer} bold, out-of-the-box ideas for this research: hypotheses, mechanisms, angles or experiments nobody in the lab has considered. Wild is welcome. Everything you write is SPECULATIVE; other agents will validate it.`,
    `Look at the charter, ${PD}/01-methodology/hypotheses.md and the admitted sources in ${PD}/02-sources/registry.jsonl for inspiration. If an idea relates to admitted sources, list their IDs in grounding_hints.`,
    `Write your idea notes to ${PD}/06-frontier/${id}.md.`,
    tail(`ideas ${id}`),
  ), IDEAS(SC.ideasPer), `ideas ${id}`, 'Frontier')))
  phase('Discussion')
  const discP = runRounds({
    tag: 'thy', home: 'theory', guests: ['C03', 'C05', 'C11', 'C12'], phase: 'Discussion',
    board: newBoard([]),
    goal: [
      'Build the theory of this research from the admitted evidence. Relate every admitted source to the research questions and hypotheses; say what seems right, what seems wrong, and why.',
      'Required outputs in 03-theory/: frameworks.md [T01], evidence-map.md [T02: claim × source × direction × grade], argument-map.md [T03], contradictions.md [T04], causal-model.md [T05: DAG and confounders], history.md [T06], cross-field.md [T07], formal-model.md [T08], credence-ledger.json [T09: credence per hypothesis, updated each round, with reasons], steelman.md [T10], debate-record.md [T11].',
      'Cite only registry IDs as evidence. Frontier ideas (06-frontier/) are speculative inputs to discuss, not evidence.',
    ].join('\n'),
    openingTask: 'Read the registry and the hypotheses, write your specialist analysis to the file you own, and take a position others can challenge.',
    reads: [`${PD}/00-charter.md`, `${PD}/01-methodology/`, `${PD}/02-sources/registry.jsonl`, `${PD}/02-sources/dossiers/`, `${PD}/03-theory/`, `${PD}/06-frontier/`],
    exitHint: 'Exit criteria: every hypothesis has a credence with reasons, the evidence map covers the registry, and contradictions are explained or flagged.',
  })
  const [ideaRes, disc] = await Promise.all([ideasP, discP])
  // Idea validation — three voters per batch, rotated
  phase('Idea validation')
  const seenTitles = new Set()
  let ideas = []
  ideaRes.forEach((r, i) => {
    if (!r) return
    (r.ideas || []).forEach((x, n) => {
      const t = String(x.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '')
      if (!t || seenTitles.has(t)) return
      seenTitles.add(t)
      ideas.push(Object.assign({}, x, { key: runKey('IDEA', `${fIds[i]}-${n + 1}`), by: fIds[i] }))
    })
  })
  if (ideas.length > SC.ideasMax) { L.notes.push(`${ideas.length - SC.ideasMax} ideas beyond the cap were not reviewed`); ideas = ideas.slice(0, SC.ideasMax) }
  const batches = chunk(ideas, SC.voteBatch)
  const jobs = []
  batches.forEach((b, bi) => [THEORY_VOTERS[bi % THEORY_VOTERS.length], CRITIC_VOTERS[bi % CRITIC_VOTERS.length], GROUND_VOTERS[bi % GROUND_VOTERS.length]].forEach(id => jobs.push({ id, b, bi })))
  const affordable = can(jobs.length) ? jobs : jobs.slice(0, Math.max(0, L.cap - L.used - RESERVE))
  if (affordable.length < jobs.length) L.notes.push(`${jobs.length - affordable.length} idea votes skipped (budget)`)
  const votes = await parallel(affordable.map(j => () => call(j.id, prompt(
    head(j.id),
    context(),
    `Frontier gate, batch ${bi2(j.bi)}. Vote on each speculative idea: support only if it is coherent, not contradicted by admitted evidence, and worth testing. To ground it, cite admitted registry IDs that make it plausible (grounding_source_ids) or write a concrete falsifiable test (test_sketch: what would be measured, the predicted result, and what result would kill the idea). Be fair to wild ideas; be strict about evidence.`,
    `Ideas (JSON):\n${JSON.stringify(j.b.map(x => ({ key: x.key, title: x.title, statement: x.statement, mechanism: x.mechanism, what_would_make_it_true: x.what_would_make_it_true, possible_tests: x.possible_tests, grounding_hints: x.grounding_hints })), null, 0)}`,
    tail(`vote b${bi2(j.bi)} ${j.id}`),
  ), VOTES(j.b.length), `vote b${bi2(j.bi)} ${j.id}`, 'Idea validation')))
  const status = {}
  for (const idea of ideas) {
    const vs = []
    votes.forEach((r, i) => {
      if (!r || !affordable[i].b.some(x => x.key === idea.key)) return
      const v = (r.votes || []).find(x => x.idea_key === idea.key)
      if (v) vs.push(v)
    })
    status[idea.key] = promoteIdea(vs, ACCEPTED)
  }
  const tally = { promoted: 0, needs_grounding: 0, quarantined: 0 }
  for (const k of Object.keys(status)) tally[status[k]]++
  const facts = { rounds: disc.rounds, exit_reason: disc.exitReason, ideas: ideas.length, ideas_promoted: tally.promoted, ideas_need_grounding: tally.needs_grounding, ideas_quarantined: tally.quarantined, promoted: Object.keys(status).filter(k => status[k] === 'promoted') }
  const g = await stageGate(facts, tr)
  return finish({ exit_reason: disc.exitReason, rounds: disc.rounds, counts: facts, gate: g }, status)
}

// ---------------------------------------------------------------------------------------------
// Stage 4: experiments
// ---------------------------------------------------------------------------------------------
async function stageExperiments() {
  const tr = translatePrevious()
  phase('Discussion')
  const disc = await runRounds({
    tag: 'exp', home: 'experiments', guests: ['M04', 'M05', 'C02'], phase: 'Discussion',
    board: newBoard([]),
    goal: [
      `Engineer the tests of this research. Design up to ${SC.experiments} experiments for the hypotheses (01-methodology/hypotheses.md) and the promoted frontier ideas (06-frontier/ideas.jsonl, status "promoted").`,
      'Computational experiments (simulations, analyses of public data, re-analyses) will be built and run by this lab in Python. Anything needing people, equipment or money becomes a ready-to-run protocol.',
      'Each design goes in 04-experiments/designs/EXP-NN.md with: hypothesis, prediction, design, data, analysis plan [E02], power or simulation justification [E03], baselines and null models [E10], negative controls [E08], measurement validity [E06], robustness plan [E07] and the exact pass/fail criterion fixed before running.',
    ].join('\n'),
    openingTask: 'Contribute your specialist part of the experiment designs, write it to the design files (claim the parts you own on the board), and challenge designs that cannot actually answer the hypothesis.',
    reads: [`${PD}/00-charter.md`, `${PD}/01-methodology/`, `${PD}/02-sources/registry.jsonl`, `${PD}/03-theory/`, `${PD}/06-frontier/ideas.jsonl`, `${PD}/04-experiments/`],
    exitHint: 'Exit criteria: each design has a fixed pass/fail criterion, an analysis plan and a power or simulation justification.',
  })
  phase('Experiment build')
  const plan = await director(prompt(
    `You are D00, the research director. Choose the experiments to run. Project folder: ${PD}/.`,
    context(),
    `Designs are in ${PD}/04-experiments/designs/. Pick up to ${SC.experiments} that best answer the research questions. Mark each "computational" if this lab can build and run it on this machine with Python and public data, otherwise "protocol". Give the path of its design file.`,
    tail('experiment plan'),
  ), EXP_PLAN(SC.experiments), 'experiment plan', 'Experiment build')
  const exps = ((plan && plan.experiments) || []).slice(0, SC.experiments).map((x, i) => Object.assign({}, x, { exp_id: runKey('EXP', pad(i + 1, 2)) }))
  const comp = exps.filter(x => x.kind === 'computational')
  const out = {}
  for (const x of exps) out[x.exp_id] = { kind: x.kind, title: clip(x.title, 200), status: x.kind === 'protocol' ? 'protocol' : 'not_run' }
  if (comp.length && can(1 + comp.length * 4)) {
    const env = await call('E04', prompt(
      head('E04'),
      context(),
      `Prepare one shared Python environment for these experiments in ${PD}/04-experiments/env/ (a virtual environment or a requirements file plus a note on how to activate it). Install only what the designs need, pin versions in ${PD}/04-experiments/env/requirements.txt, and record the Python version. Nobody else installs packages during this stage.`,
      `Experiments (JSON):\n${JSON.stringify(comp.map(x => ({ exp_id: x.exp_id, title: x.title, design_path: x.design_path })), null, 0)}`,
      tail('env E04'),
    ), ENV, 'env E04', 'Experiment build')
    const builds = await parallel(comp.map(x => () => call('E04', prompt(
      head('E04'),
      context(),
      `Build and run ${x.exp_id} (${x.title}) exactly as designed in ${PD}/${rel(x.design_path)}. Code goes in ${PD}/04-experiments/code/${x.exp_id}/; outputs in ${PD}/04-experiments/results/${x.exp_id}/, with every number you report written to results.json there. Use the environment in ${PD}/04-experiments/env/ (status: ${env && env.ok ? 'ready' : 'unknown'}). Fix seeds. Never fabricate or hand-edit results; if it fails, report the failure.`,
      tail(`build ${x.exp_id} E04`),
    ), BUILD, `build ${x.exp_id} E04`, 'Experiment build')))
    phase('Experiment verification')
    const reruns = await parallel(comp.map(x => () => call('E09', prompt(
      head('E09'),
      context(),
      `Independently reproduce ${x.exp_id}. Start from the design (${PD}/${rel(x.design_path)}) and the code in ${PD}/04-experiments/code/${x.exp_id}/, re-run it in a clean working directory ${PD}/04-experiments/repro/${x.exp_id}/, and compare every number with ${PD}/04-experiments/results/${x.exp_id}/results.json.`,
      tail(`rerun ${x.exp_id} E09`),
    ), RERUN, `rerun ${x.exp_id} E09`, 'Experiment verification')))
    const robust = await parallel(comp.map(x => () => call('E07', prompt(
      head('E07'),
      context(),
      `Test the robustness of ${x.exp_id}: the sensitivity analyses and specification variations planned in the design, plus any obvious ones it missed. Write ${PD}/04-experiments/results/${x.exp_id}/robustness.md.`,
      tail(`robust ${x.exp_id} E07`),
    ), ROBUST, `robust ${x.exp_id} E07`, 'Experiment verification')))
    const audits = await parallel(comp.map((x, i) => () => call('E11', prompt(
      head('E11'),
      context(),
      `Audit ${x.exp_id}. Check that the code implements the design, that the pass/fail criterion was fixed in advance and applied as written, that there's no leakage or p-hacking, and that every number in the results traces to results.json. Reproduction: ${reruns[i] ? (reruns[i].reproduced ? 'reproduced' : 'NOT reproduced') : 'no report'}. Robustness: ${robust[i] ? robust[i].robust : 'no report'}. Write ${PD}/04-experiments/results/${x.exp_id}/audit.md.`,
      tail(`audit ${x.exp_id} E11`),
    ), AUDIT, `audit ${x.exp_id} E11`, 'Experiment verification')))
    comp.forEach((x, i) => {
      const b = builds[i], r = reruns[i], a = audits[i]
      const valid = !!(b && b.ran && r && r.reproduced && a && a.verdict === 'valid' && a.numbers_traceable)
      out[x.exp_id].status = valid ? 'valid' : !b ? 'not_run' : !b.ran ? 'failed_to_run' : 'unverified'
      out[x.exp_id].robustness = robust[i] ? robust[i].robust : 'not_tested'
    })
  } else if (comp.length) L.notes.push('experiments: not enough budget to build and verify; all left unrun')
  const facts = { rounds: disc.rounds, exit_reason: disc.exitReason, experiments: out }
  const g = await stageGate(facts, tr)
  return finish({ exit_reason: disc.exitReason, rounds: disc.rounds, counts: { planned: exps.length, valid: Object.values(out).filter(x => x.status === 'valid').length }, experiments: out, gate: g }, out)
}

// ---------------------------------------------------------------------------------------------
// Stage 5: peer review
// ---------------------------------------------------------------------------------------------
const OWNER_BY_PREFIX = [
  ['00-charter', 'D00'], ['01-methodology', 'M04'], ['02-sources', 'S02'], ['03-theory', 'T02'],
  ['04-experiments/code', 'E04'], ['04-experiments/results', 'E11'], ['04-experiments', 'E01'], ['06-frontier', 'T09'],
]
function ownerOf(target) {
  const t = String(target || '').trim()
  if (BY_ID[t.toUpperCase()]) return t.toUpperCase()
  const r = rel(t)
  for (const [p, o] of OWNER_BY_PREFIX) if (r.startsWith(p)) return o
  return 'D00'
}
const issueKey = i => `${slug(rel(i.target)).slice(0, 60)}#${String(i.code || '').toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 40)}`

async function stagePeerReview() {
  const tr = translatePrevious()
  phase('Peer review')
  const critics = divisionIds('critique')
  const reviews = await parallel(critics.map(id => () => call(id, prompt(
    head(id),
    context(),
    'Peer review of the whole project so far: charter, methodology, sources and their grades, theory, frontier gate decisions and experiment results. Review it the way your role demands, as a referee for a top journal would. Raise at most 8 issues; mark an issue "blocking" only if the paper would be wrong or misleading without the fix. Each issue needs a target (a file path inside the project or an agent ID), a short code and a rationale.',
    `Write your full review to ${PD}/05-critique/review-${id}.md.`,
    tail(`review ${id}`),
  ), REVIEW, `review ${id}`, 'Peer review')))
  const issues = {}
  reviews.forEach((r, i) => {
    if (!r) return
    for (const x of r.issues || []) {
      const key = issueKey(x)
      if (!issues[key]) issues[key] = { key, target: x.target, code: x.code, severity: x.severity, rationale: clip(x.rationale, 600), raised_by: [critics[i]], owner: ownerOf(x.target), resolved: false }
      else {
        issues[key].raised_by.push(critics[i])
        if (x.severity === 'blocking') issues[key].severity = 'blocking'
      }
    }
  })
  const downgraded = []
  let cycles = 0
  const maxCycles = MODE === 'normal' ? SC.reviewCycles : 1
  for (let c = 1; c <= maxCycles; c++) {
    const open = Object.values(issues).filter(x => x.severity === 'blocking' && !x.resolved).sort((a, b) => a.key.localeCompare(b.key))
    if (!open.length) break
    phase('Responses')
    const owners = [...new Set(open.map(x => x.owner))].sort(byRoster)
    const keepOwners = owners.slice(0, SC.maxOwners)
    for (const x of open) if (!keepOwners.includes(x.owner)) x.owner = 'D00'
    const finalOwners = [...new Set(open.map(x => x.owner))].sort(byRoster)
    const rereviewers = [...new Set(open.map(x => x.raised_by[0]))].sort(byRoster).slice(0, SC.maxRereviewers)
    if (!can(finalOwners.length + rereviewers.length + 1)) { L.notes.push(`review: cycle ${c} skipped (budget)`); break }
    cycles = c
    const responses = await parallel(finalOwners.map(o => () => {
      const mine = open.filter(x => x.owner === o)
      const text = prompt(
        o === 'D00' ? `You are D00, the research director, responding to peer review. Project folder: ${PD}/.` : head(o),
        context(),
        `Respond to these blocking review issues (cycle ${c}). For each: fix it in the files (action "fixed", list files_changed), or rebut it with evidence (action "rebutted"), or defer it to Limitations with a reason (action "deferred"). Ask colleagues' files for help by reading them; don't rewrite other owners' files.`,
        `Issues (JSON):\n${JSON.stringify(mine.map(x => ({ issue_key: x.key, target: x.target, code: x.code, rationale: x.rationale, raised_by: x.raised_by })), null, 0)}`,
        `Write your response letter to ${PD}/05-critique/response-c${c}-${o}.md.`,
        tail(`respond c${c} ${o}`),
      )
      return o === 'D00' ? director(text, RESPONSES(mine.length), `respond c${c} ${o}`, 'Responses') : call(o, text, RESPONSES(mine.length), `respond c${c} ${o}`, 'Responses')
    }))
    const respByKey = {}
    responses.forEach(r => { for (const x of (r && r.responses) || []) respByKey[x.issue_key] = x })
    const checks = await parallel(rereviewers.map(id => () => {
      const mine = open.filter(x => x.raised_by[0] === id)
      return call(id, prompt(
        head(id),
        context(),
        `Re-review your blocking issues after the owners' responses (cycle ${c}). Read the changed files. Mark an issue resolved only if the fix or rebuttal really answers it.`,
        `Issues and responses (JSON):\n${JSON.stringify(mine.map(x => ({ issue_key: x.key, target: x.target, code: x.code, rationale: x.rationale, response: respByKey[x.key] || null })), null, 0)}`,
        tail(`recheck c${c} ${id}`),
      ), RECHECK(mine.length), `recheck c${c} ${id}`, 'Responses')
    }))
    checks.forEach((r, i) => {
      for (const x of (r && r.checks) || []) {
        const iss = issues[x.issue_key]
        if (iss && iss.raised_by[0] === rereviewers[i] && x.resolved) iss.resolved = true
      }
    })
    const still = open.filter(x => !x.resolved)
    if (still.length) {
      const d = await director(prompt(
        `You are D00, the research director. Peer review cycle ${c} left these blocking issues unresolved. Project folder: ${PD}/.`,
        `Unresolved (JSON):\n${JSON.stringify(still.map(x => ({ issue_key: x.key, target: x.target, code: x.code, rationale: x.rationale, response: respByKey[x.key] || null })), null, 0)}`,
        'You may downgrade an issue from blocking to major only if you can justify it in writing (the justification is published in the review record). Otherwise leave it; unresolved issues go into the Limitations section.',
        tail(`downgrade c${c}`),
      ), DOWNGRADE, `downgrade c${c}`, 'Responses')
      for (const x of (d && d.downgrades) || []) {
        const iss = issues[x.issue_key]
        if (iss && iss.severity === 'blocking' && !iss.resolved && String(x.justification || '').trim().length >= K.min_downgrade_justification) {
          iss.severity = 'major'; iss.downgraded = clip(x.justification, 600); downgraded.push(iss.key)
        }
      }
    }
  }
  const all = Object.values(issues)
  const limitations = all.filter(x => !x.resolved && (x.severity === 'blocking' || x.severity === 'major')).map(x => x.key)
  const facts = { issues: all.length, blocking: all.filter(x => x.severity === 'blocking' || x.downgraded).length, resolved: all.filter(x => x.resolved).length, downgraded, unresolved_to_limitations: limitations, cycles }
  const g = await stageGate(facts, tr)
  return finish({ exit_reason: 'done', counts: facts, gate: g }, Object.fromEntries(all.map(x => [x.key, { severity: x.severity, resolved: x.resolved }])))
}

// ---------------------------------------------------------------------------------------------
// Stage 6: manuscript (English) with the claim gate
// ---------------------------------------------------------------------------------------------
async function stageManuscript() {
  const tr = translatePrevious()
  phase('Drafting')
  const outline = await call('W01', prompt(
    head('W01'),
    context(),
    `Plan the paper. Read everything in ${PD}/ (stage reports first). Propose up to ${SC.sections} sections in order, e.g. abstract, introduction, background, methods, results, frontier-ideas (clearly labelled speculative), discussion, limitations (must include every unresolved review issue in ${PD}/05-critique/issues.jsonl), conclusion, reproducibility. Give each a short id and a brief saying exactly what it must contain and which registry IDs and experiment IDs it uses.`,
    tail('outline W01'),
  ), OUTLINE(SC.sections), 'outline W01', 'Drafting')
  const sections = ((outline && outline.sections) || []).slice(0, SC.sections).map((s, i) => ({ id: slug(s.id || s.title) || `section-${i + 1}`, title: clip(s.title, 160), brief: clip(s.brief, 600), nn: pad(i + 1, 2) }))
  const sectionPath = s => `${PD}/manuscript/sections/${s.nn}-${s.id}.en.md`
  const drafts = await parallel(sections.map(s => () => call('W01', prompt(
    head('W01'),
    context(),
    `Write section ${s.nn} "${s.title}" of the paper to ${sectionPath(s)}. Brief: ${s.brief}`,
    'Cite admitted sources only as [SRC-xxxx] and experiment results only as [EXP-NN] (only experiments whose status is valid count as results). Report effect sizes and uncertainty. Hedge exactly as the evidence allows.',
    tail(`draft ${s.nn} W01`),
  ), SECTION, `draft ${s.nn} W01`, 'Drafting')).concat([
    () => call('W02', prompt(head('W02'), context(), `Produce the figures and tables the paper needs from ${PD}/04-experiments/results/ and the evidence map. Generate them with code (save scripts next to the figures) in ${PD}/manuscript/figures/. Never invent data.`, tail('figures W02')), FIGS, 'figures W02', 'Drafting'),
    () => call('W03', prompt(head('W03'), context(), `Build the reference list ${PD}/manuscript/references.md from ${PD}/02-sources/registry.jsonl (only admitted sources, formatted APA 7th) and the reproducibility package ${PD}/manuscript/reproducibility.md (environment, code, data provenance, how to re-run each experiment).`, tail('references W03')), REFS, 'references W03', 'Drafting'),
  ]))
  phase('Claim audit')
  const ex = await call('C11', prompt(
    head('C11'),
    context(),
    `Extract every substantive claim the paper makes from ${PD}/manuscript/sections/*.en.md (up to ${SC.maxClaims}, most important first): empirical findings, causal statements, comparisons and generalisations. Copy each claim's text and its citations exactly as written.`,
    tail('claims C11'),
  ), CLAIMS(SC.maxClaims), 'claims C11', 'Claim audit')
  const claims = ((ex && ex.claims) || []).slice(0, SC.maxClaims).map((c, i) => Object.assign({}, c, { key: runKey('CLM', pad(i + 1, 3)) }))
  const unknown = {}
  for (const c of claims) unknown[c.key] = (c.cited_ids || []).filter(id => !ACCEPTED.has(id)).concat((c.result_ids || []).filter(id => !VALID_EXPS.has(id)))
  const LENS_TEXT = {
    S09: 'citation support: does each cited admitted source actually support the claim as worded?',
    C02: 'statistics: are the numbers, effect sizes, uncertainty and inferences correct and traceable to results?',
    C06: 'overclaiming: does the wording go beyond what the evidence shows (causal language, generalisation, certainty)?',
  }
  const lenses = K.claim_lenses.map(id => ({ id, lens: LENS_TEXT[id] }))
  const cb = chunk(claims, SC.claimBatch)
  const jobs = []
  cb.forEach((b, bi) => lenses.forEach(l => jobs.push({ l, b, bi })))
  const affordable = can(jobs.length + 1) ? jobs : jobs.slice(0, Math.max(0, L.cap - L.used - RESERVE - 1))
  if (affordable.length < jobs.length) L.notes.push(`${jobs.length - affordable.length} claim checks skipped (budget); unchecked claims are softened`)
  const checks = await parallel(affordable.map(j => () => call(j.l.id, prompt(
    head(j.l.id),
    context(),
    `Adversarial claim audit, batch ${bi2(j.bi)}. Your lens: ${j.l.lens} Try to refute each claim; mark refuted=true when it fails your lens. Read the cited dossiers and results.`,
    `Claims (JSON):\n${JSON.stringify(j.b.map(c => ({ claim_key: c.key, section_id: c.section_id, text: c.text, cited_ids: c.cited_ids, result_ids: c.result_ids })), null, 0)}`,
    tail(`verify b${bi2(j.bi)} ${j.l.id}`),
  ), VERIFY(j.b.length), `verify b${bi2(j.bi)} ${j.l.id}`, 'Claim audit')))
  const decision = {}
  for (const c of claims) {
    const cs = []
    let lensesRun = 0
    checks.forEach((r, i) => {
      if (!r || !affordable[i].b.some(x => x.key === c.key)) return
      lensesRun++
      const v = (r.checks || []).find(x => x.claim_key === c.key)
      if (v) cs.push(v)
    })
    let d = claimDecision(cs, unknown[c.key])
    if (lensesRun < lenses.length && d === 'keep') d = 'soften'
    decision[c.key] = { decision: d, unknown_ids: unknown[c.key], reasons: cs.filter(x => x.refuted).map(x => clip(x.reason, 300)), suggestions: cs.map(x => clip(x.suggestion, 300)).filter(Boolean) }
  }
  phase('Revision')
  // C11 may name a section "results", "02-results" or "02".
  const inSection = (c, s) => [s.id, `${s.nn}-${s.id}`, s.nn].includes(slug(c.section_id))
  const toFix = sections.filter(s => claims.some(c => inSection(c, s) && decision[c.key].decision !== 'keep')).slice(0, SC.revisions)
  const revisions = await parallel(toFix.map(s => () => call('W01', prompt(
    head('W01'),
    context(),
    `Revise section ${s.nn} (${sectionPath(s)}) after the claim audit. For every claim marked "remove", delete it (and anything that depends on it). For "soften", reword it to what the evidence supports, following the suggestions. Strip every citation listed under unknown_ids: those are not admitted sources or valid results. Don't add new claims.`,
    `Audit decisions (JSON):\n${JSON.stringify(claims.filter(c => inSection(c, s)).map(c => Object.assign({ claim_key: c.key, text: c.text }, decision[c.key])), null, 0)}`,
    tail(`revise ${s.nn} W01`),
  ), REVISED, `revise ${s.nn} W01`, 'Revision')))
  if (can(1)) await call('W03', prompt(head('W03'), context(), `The sections were revised after the claim audit. Update ${PD}/manuscript/references.md so it lists exactly the registry IDs still cited in ${PD}/manuscript/sections/*.en.md.`, tail('references final W03')), REFS, 'references final W03', 'Revision')
  const tally = { keep: 0, soften: 0, remove: 0 }
  for (const k of Object.keys(decision)) tally[decision[k].decision]++
  const facts = { sections: sections.map(s => `${s.nn}-${s.id}`), drafted: drafts.slice(0, sections.length).filter(Boolean).length, claims: claims.length, claim_decisions: tally, citations_stripped: Object.values(decision).reduce((n, d) => n + d.unknown_ids.length, 0), revised_sections: revisions.filter(Boolean).length }
  const g = await stageGate(facts, tr)
  return finish({ exit_reason: 'done', counts: facts, gate: g }, Object.fromEntries(Object.keys(decision).map(k => [k, decision[k].decision])))
}

// ---------------------------------------------------------------------------------------------
// Stage 7: Arabic + final sign-off
// ---------------------------------------------------------------------------------------------
async function stageArabic() {
  phase('Translation')
  const secs = (A.sections || []).slice(0, SC.sections)
  const jobs = [() => translatePrevious()].concat(secs.map(s => () => call('W04', prompt(
    head('W04'),
    context(),
    `Translate ${PD}/manuscript/sections/${s}.en.md into Arabic following bilingual.md in the lab protocol, and write ${PD}/manuscript/sections/${s}.ar.md. The English is frozen. Keep every citation key, figure/table reference, number and equation exactly as in the English. Read ${PD}/glossary.md and use its renderings; return new terms in new_terms. Don't edit glossary.md yourself.`,
    tail(`ar ${s} W04`),
  ), TR_SECTION, `ar ${s} W04`, 'Translation')))
  const tr = await parallel(jobs)
  const terms = []
  tr.slice(1).forEach(r => { for (const t of (r && r.new_terms) || []) terms.push(t) })
  const gl = await call('W05', prompt(
    head('W05'),
    context(),
    `Merge these new terms into ${PD}/glossary.md (you are its only writer now), resolve inconsistent renderings across sections, and check terminology in ${PD}/manuscript/sections/*.ar.md. List the sections that need a fix.`,
    `New terms (JSON):\n${JSON.stringify(terms.slice(0, 400), null, 0)}`,
    tail('glossary W05'),
  ), TERMS, 'glossary W05', 'Translation')
  const fixes = ((gl && gl.fixes) || []).filter(f => secs.includes(f.section_id)).slice(0, SC.arFixes)
  const fixed = await parallel(fixes.map(f => () => call('W04', prompt(
    head('W04'),
    context(),
    `Fix ${PD}/manuscript/sections/${f.section_id}.ar.md: ${f.issue}. Use the updated ${PD}/glossary.md.`,
    tail(`ar fix ${f.section_id} W04`),
  ), TR_SECTION, `ar fix ${f.section_id} W04`, 'Translation')))
  phase('Stage gate')
  const fin = await director(prompt(
    `You are D00, the research director, signing off the project. Project folder: ${PD}/.`,
    context(),
    `Read the English sections, the stage reports, ${PD}/05-critique/issues.jsonl and ${PD}/manuscript/claims.jsonl. Write the final report to ${PD}/stage-reports/final.en.md: the answer to each research question with its confidence, what the lab refused and why, the limitations, and what a human team should do next. Sign off (signoff=true) only if the paper says nothing the evidence doesn't support.`,
    tail('final signoff'),
  ), FINAL, 'final signoff', 'Stage gate')
  const finTr = fin && can(1) ? await call('W04', prompt(
    head('W04'),
    `Translate ${PD}/stage-reports/final.en.md into Arabic as ${PD}/stage-reports/final.ar.md, following bilingual.md and ${PD}/glossary.md.`,
    tail('translate final W04'),
  ), REPORT_TR, 'translate final W04', 'Stage gate') : null
  const facts = { sections: secs.length, translated: tr.slice(1).filter(Boolean).length, new_terms: terms.length, fixes: fixed.filter(Boolean).length, signoff: !!(fin && fin.signoff), final_translated: !!finTr }
  return finish({ exit_reason: 'done', counts: facts, gate: { verdict: 'proceed', revisit: null, headline: fin ? clip(fin.headline, 600) : '(no sign-off)', report: 'stage-reports/final.en.md', limitations: fin ? (fin.limitations || []).slice(0, 12) : [] } })
}

// ---------------------------------------------------------------------------------------------
log(`Maistro ${STAGE} stage · ${MODE} run ${RUN} · scale ${SCALE} · budget ${CAP} agent calls`)
const RUNNERS = { methodology: stageMethodology, sources: stageSources, theory: stageTheory, experiments: stageExperiments, review: stagePeerReview, manuscript: stageManuscript, arabic: stageArabic }
const result = await RUNNERS[STAGE]()
log(`${STAGE} done: ${L.used}/${L.cap} calls, ${L.failed.length} empty, ${L.dropped.length} skipped`)
return result
