# Working on Maistro

Maistro is a Claude Code plugin (in `plugins/maistro/`); this repo is also its marketplace.

## Rules that keep it consistent
- **Generated content:** after editing any agent file, `scripts/source-policy.json` or
  `scripts/lab-constants.json`, run `python3 tools/build_roster.py`. It rewrites the roster in
  `skills/lab-protocol/SKILL.md`, the `<generated>` block in `workflows/lab-stage.js` and
  `scripts/roster.json`. Never edit those parts by hand.
- **Gates live in two places:** `lab-stage.js` (during a run) and `scripts/maistro_gates.py`
  (rebuilding the ledgers from fragments). Change both together. `tests/test_parity.py` fails if
  they disagree.
- **Fragment labels are an interface:** every `agent()` label becomes a fragment file name
  (`slug(label).json`) that the Python replays read. If you rename a label, update the replay too.
- **Workflow script constraints:** plain JavaScript, no imports, no `Date.now()`, `Math.random()` or
  argless `new Date()`; `export const meta` must stay first and stay a pure literal. Keep prompts
  deterministic (they may depend only on args and earlier results) so relaunches replay from cache.
  Use `parallel()` with index-ordered results, not completion order.
- **Agent files:** keep the frontmatter and section layout that `tests/test_agents.py` enforces.
  Every lab agent stays `model: opus` with `disallowedTools: Agent, Workflow`; the director stays
  `model: fable`. Descriptions stay short and say "Internal", because all 73 load into every session.
- **Scripts:** Python standard library only (they run on users' machines from the plugin cache).

## Tests
```bash
python3 -m unittest discover -s tests
node --test tests/workflow/lab-stage.test.mjs
claude plugin validate plugins/maistro
```
All tests are offline. `tests/workflow/harness.mjs` runs the real workflow script with scripted
agents (`scenarios.mjs`); `tests/test_state.py` drives whole projects end to end through
`maistro_state.py`.
