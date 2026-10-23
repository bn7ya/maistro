# The seven stages: who does what

Each stage runs as its own `lab-stage` workflow, in this order. Every call names your `_fragment`
path and, in discussion rounds, your post path. The director (D00) closes every stage with a stage
report and a verdict: proceed, or (once per project) revisit an earlier stage.

A **discussion round** works like this: every participant gets the stage goal, the director's digest
of the previous round, its inbox and its tasks; it works, posts, messages colleagues and claims or
proposes tasks. Then the director digests the round, updates the board and picks who works next.
Round 1 always includes the whole home division.

## 1. Methodology (`methodology`)
- **D00** writes `00-charter.md` and seeds the board.
- **Discussion:** all of M01–M11 plus critics C01, C02 and C12. Required files in `01-methodology/`:
  research-questions (M01), gap-analysis (M02), hypotheses (M03), design (M04), measures (M05),
  sampling-and-data (M06), feasibility (M07), ethics (M08), preregistration (M09), risks (M10),
  methods-bridge (M11). M04 integrates them all into protocol.md.

## 2. Sources (`sources`)
- **Discovery:** scouts search from separate angles: S01 (direct evidence), C05 (counter-evidence),
  S10 (reviews and meta-analyses), M05 (measurement literature), T06 (foundational works), T07
  (adjacent fields), E05 (datasets and statistics), S09 (most cited and most recent). Pilot uses the
  first 3, standard the first 6, full all 8.
- **Tier 1 (every candidate):** S02 resolves metadata with the CLI; S05 checks retractions; S07
  detects marketing and spin.
- **Tier 2 (survivors):** S03, S04, S06, S08, S09, S10, plus S11 for empirical papers. A source needs
  verdicts from at least 4 tier-2 checkers to be admitted.
- **Audit:** C04 can veto admitted sources with evidence; S08 and S10 re-review each veto.
- **Citation-chain wave** (standard/full): S09 follows references and citations from the best
  admitted sources, and the new candidates go through the same checks.
- Evidence grades and refusal codes: see `source-policy.md`.

## 3. Theory and frontier (`theory`)
- **Frontier, at the same time as round 1:** all of F01–F11 propose speculative ideas into `06-frontier/`.
- **Discussion:** all of T01–T11 plus C03, C05, C11 and C12. Outputs go to `03-theory/`; T09 keeps
  `credence-ledger.json`.
- **Frontier gate:** each batch of ideas gets one theory voter (T09/T05/T08/T07), one critique voter
  (C03/C11/C07) and one grounding voter (M03/S10/M04). An idea is promoted only with ≥ 2 supporting
  votes **and** grounding: an admitted source ID, or a concrete falsifiable test sketch of at least
  80 characters.

## 4. Experiments (`experiments`)
- **Discussion:** all of E01–E11 plus M04, M05 and C02 design experiments in `04-experiments/designs/`.
- **D00** picks the experiments and marks each computational or protocol.
- **Build and verify each computational experiment:** E04 sets up the shared environment, then builds
  and runs each experiment. E09 reproduces it independently, E07 tests robustness, and E11 audits it.
  An experiment counts as **valid** only if it ran, was reproduced, the audit passed, and every
  number traces to `results.json`.

## 5. Peer review (`review`)
- All 12 critics review everything and raise issues (blocking, major or minor).
- **Owners respond:** the agent named as the target, or the owner of the file's folder: methodology
  → M04, sources → S02, theory → T02, experiment code → E04, results → E11, designs → E01, frontier
  → T09, charter or anything else → D00.
- The critic who first raised an issue re-checks it. D00 may downgrade an issue only with a written
  justification. Up to 2 cycles. Unresolved issues go to Limitations.

## 6. Manuscript (`manuscript`)
- **W01** outlines and drafts the sections, **W02** makes figures from real results, **W03** does the
  references and the reproducibility package.
- **Claim audit:** C11 extracts the claims. Each batch is checked through three lenses: S09 (does the
  citation support it), C02 (statistics), C06 (overclaiming). Refuted twice → removed; refuted once,
  or citing an ID that isn't admitted → softened, and the bad citation is stripped. W01 revises; W03
  updates the references.

## 7. Arabic (`arabic`)
- **W04** translates each frozen English section, **W05** merges the glossary and lists fixes, and
  W04 applies them.
- **D00** writes the final report and signs off; W04 translates the final report.
- Each stage report is translated by W04 during the following stage.
