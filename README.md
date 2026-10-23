# Maistro — an autonomous research lab for Claude Code

[العربية](README.ar.md)

Maistro turns Claude into a research institution. Give it an idea, and a lab of **73 specialised
agents**, run by a **Fable research director**, takes it from A to Z with no stops: charter,
methodology, validated sources, theory debate, speculative ideas, experiments, peer review, and a
paper in **English and Arabic**.

Every agent has one specific role and knows the whole roster. Agents post to a shared forum, message
each other, propose tasks and claim them from a task board. The director digests each round and
decides who works next. The rules a trustworthy lab needs are **enforced in code**, not just asked
for in prompts:

- A source with no named author, no date or no stable identifier, or whose metadata can't be
  verified, is refused. So is marketing, a press release, a vendor white paper, sponsored, SEO or
  content-farm material, an unsigned wiki page or a retracted paper.
- A validator's damning finding against an author, journal or funder counts only if it comes with
  checkable evidence. Unevidenced allegations are logged and ignored.
- "Hallucinated" frontier ideas stay quarantined until two of three independent voters support them
  **and** they are grounded in an admitted source or a concrete falsifiable test.
- An experiment counts as a result only if it ran, was independently reproduced, passed an audit, and
  every number traces to a results file.
- Every claim in the paper is attacked through three lenses. Claims refuted twice are cut, claims
  refuted once are softened, and citations to anything not admitted are stripped.

## The team

| Division | Agents | What they do |
|---|---|---|
| Director | 1 (Fable) | charter, round planning, task board, conflict resolution, stage verdicts, final sign-off |
| Methodology | 11 | turn the idea into questions, hypotheses, design, measures, sampling, feasibility, ethics, pre-registration, risks |
| Source integrity | 11 | discover sources, verify metadata, check authors, venues, retractions, conflicts of interest, bias and marketing, method quality, citation chains, replication, statistical forensics |
| Theory | 11 | frameworks, evidence synthesis, argument maps, contradictions, causal models, history, cross-field links, formal models, Bayesian credences, steelmanning, debate chairing |
| Test engineering | 11 | experiment design, analysis plans, power and simulation, building and running code, data acquisition, measurement validity, robustness, falsification, reproducibility, baselines, auditing |
| Critique | 12 | methodology, statistics, logic, source scepticism, devil's advocacy, "Reviewer 2", construct and external validity, ethics, reproducibility, overclaiming, and an auditor of the lab's own biases |
| Frontier | 11 | deliberately wild ideas from eleven different creativity techniques, all quarantined until validated |
| Editorial | 5 | manuscript, figures, references and reproducibility package, Arabic translation, terminology |

The full roster, with each agent's contribution, is in
[`plugins/maistro/skills/lab-protocol/SKILL.md`](plugins/maistro/skills/lab-protocol/SKILL.md). The
agent definitions are in [`plugins/maistro/agents/`](plugins/maistro/agents/).

## How a project runs

Each stage is its own workflow run, with its own agent budget, and its results are saved to disk
before the next stage starts:

1. **Methodology:** the director writes the charter; all 11 methodology agents plus three critics
   build the protocol over several discussion rounds.
2. **Sources:** up to eight scouts search from different angles. Every candidate goes through tier 1
   (metadata resolution, retractions, marketing detection); survivors go through tier 2 (author and
   venue background, conflicts of interest, method quality, citation chain, replication, statistical
   forensics); then a sceptic audits what was admitted. A citation-chain wave adds the rebuttals and
   replications the first search missed.
3. **Theory and frontier:** the theory division debates the admitted evidence while the frontier
   division brainstorms; then the frontier gate votes on every idea.
4. **Experiments:** designs are drafted and the director chooses which to run. Each computational
   experiment is built and run, independently reproduced, stress-tested and audited. The rest become
   protocols for humans to run.
5. **Peer review:** all 12 critics review everything; the owners respond; the critics re-check.
   Unresolved issues go into the paper's Limitations.
6. **Manuscript:** the editorial team drafts the paper, then the claim audit cuts or softens what the
   evidence doesn't support.
7. **Arabic:** the paper and every stage report are translated, with terminology checks and an
   automatic check that citations, figures and equations match the English.

After every stage the director writes a report and may send the lab back to an earlier stage, once
per project. An audit checks the files on disk; a critical gap triggers one repair run of that stage.

## Install

You need Claude Code with dynamic workflows (tested on 2.1.309), Python 3.9+, and access to the
Fable and Opus models.

```text
/plugin marketplace add bn7ya/maistro
/plugin install maistro@maistro
```

Then, in the folder where your research should live:

```text
/maistro:setup
```

This shows you the permission rules an unattended run needs and writes them only after you confirm.
For the experiments stage, which runs code the agents write, it recommends auto mode with `/sandbox`.

## Use

```text
/maistro:research Does intermittent fasting improve working memory in adults? --scale pilot
/maistro:status
/maistro:research --resume intermittent-fasting-memory
```

Watch the agents work in `/workflows`. Everything they say and decide is in `research/<slug>/`:
`forum/` (every post), `board/` (task boards), `02-sources/registry.jsonl` and
`02-sources/dossiers/` (every check made on every source), `rejected.jsonl` (every refusal and why),
`stage-reports/*.en.md` and `*.ar.md`, and `manuscript/paper.en.md` and `paper.ar.md`.

| Scale | Rounds per discussion | Sources screened | Experiments | Agent calls (about) |
|---|---|---|---|---|
| `pilot` | 2 | 24 | 2 | 200 |
| `standard` | 3 | 100 + citation chain | 3 | 400 |
| `full` (default) | 4 | 200 + citation chain | 5 | 650 |

**Cost:** every lab agent runs on Opus and the director on Fable. A `full` run is several hours and
tens of millions of tokens. Start with `--scale pilot`.

## What's in this repository

```
.claude-plugin/marketplace.json     the repo is its own marketplace
plugins/maistro/
  agents/                           73 agent definitions (director + 7 divisions)
  skills/research, status, setup    the commands you run
  skills/lab-protocol/              protocol preloaded into every agent: blackboard, evidence rules, roster,
                                    source-policy.md, bilingual.md, stages.md
  workflows/lab-stage.js            the orchestration: round engine, gates, the 7 stages, budget ledger
  hooks/hooks.json                  guard (write scope, Bash scope) and recorder (structured results → _fragments/)
  scripts/maistro_scholar.py        Crossref / OpenAlex / arXiv / PubMed / DOAJ metadata CLI (stdlib only)
  scripts/maistro_state.py          stage state machine; rebuilds the ledgers from fragments; assembles the papers
  scripts/maistro_gates.py          the gate rules, mirrored from the workflow
  scripts/maistro_audit.py          on-disk checks after each stage
  scripts/source-policy.json        admission policy (single source of truth)
  scripts/lab-constants.json        scales, budgets, scouts, voters, lenses
tools/build_roster.py               regenerates the roster and the workflow's generated block
tests/                              unit, hook, CLI, parity and end-to-end tests (offline)
```

## Safety and trust

- **Guard hook:** lab agents can write only inside `research/<slug>/`, and never to the generated
  ledgers. Frontier agents can write only their notes. The methodology, sources and theory divisions
  can run only the scholarly CLI. The hook also approves the plugin's own scripts, so they don't
  prompt.
- **Recorder hook:** each agent's structured result is saved exactly as the workflow received it. The
  registry and the other ledgers are rebuilt from these by the same rules the workflow applies, and
  tests check that both implementations agree.
- **Limits worth knowing:** agents are language models, and the checks reduce errors but can't
  eliminate them. Paywalled full texts may be out of reach. Only computational experiments run;
  others come out as protocols. Treat the output as a rigorous draft that a human expert should
  review before publication.

## Development

```bash
python3 tools/build_roster.py            # after editing agents, source-policy.json or lab-constants.json
python3 -m unittest discover -s tests    # Python: gates, CLI, hooks, JS/Python parity, end to end
node --test tests/workflow/lab-stage.test.mjs
claude plugin validate plugins/maistro
```

## License

MIT
