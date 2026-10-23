# Maistro source admission policy

This file explains the rules in `scripts/source-policy.json`. The rules are applied in code twice:
once by the `lab-stage` workflow while a run is going, and again by `maistro_state.py materialize`
when the registry is rebuilt on disk. An agent can't override them. This document says what the
validators must report so the code can apply the rules correctly.

## Two-tier check

| Tier | Who | On what |
|---|---|---|
| 1 | S02 bibliographic gatekeeper, S05 retraction & correction sentinel, S07 bias/spin/marketing detector | every candidate, in batches of up to 20 |
| 2 | S03 author background, S04 venue & publisher, S06 conflicts & funding, S08 methodological quality, S09 citation chain, S10 replication & consensus, S11 statistical forensics (empirical papers only) | tier-1 survivors, in batches of 8–10 |
| audit | C04 source sceptic | admitted sources; an evidenced veto triggers one re-review by S08 and S10, and both must uphold admission |

## Hard requirements (any failure means rejection)

| Code | Rule |
|---|---|
| `NOT_VERIFIED` | S02 returned no metadata for the candidate |
| `NO_AUTHOR` | No named person among the authors. An organisation counts as author only when the type is `official-statistics`, `standard`, `government-report`, `intergovernmental-report` or `legal-document` |
| `NO_DATE` | No publication year |
| `NO_STABLE_ID` | No identifier of an accepted type: `doi`, `arxiv`, `pmid`, `pmcid`, `isbn`, `handle`, `publisher_url` |
| `UNRESOLVED` | Metadata wasn't confirmed by the scholarly CLI with a match score ≥ 0.9 (title, year and first-author surname). Only when the run's `apis_available` is `false` can a publisher page fetched with WebFetch stand in, with its URL as `evidence_url`; the registry then records `resolution: web` |
| `TYPE_BLOCKED:<type>` | S02's type or S07's assessed type is on the blocklist: `marketing`, `press-release`, `vendor-whitepaper`, `sponsored`, `advertorial`, `product-page`, `seo-content`, `content-farm`, `ai-content-farm`, `unsigned-wiki`, `social-post`, `anonymous` |
| `TYPE_NOT_ALLOWED:<type>` | Type isn't on the allowed list, e.g. `blog`, `other` |
| `RETRACTED` | S05 found a retraction |
| `<AGENT>:<CODE>` | Any validator returned `fail` with severity `critical` **and** at least one evidence item (URL, DOI or registry note) |

Allowed types: `journal-article`, `review-article`, `meta-analysis`, `conference-paper`, `preprint`,
`book`, `book-chapter`, `thesis`, `dataset`, `report`, `official-statistics`, `standard`,
`government-report`, `intergovernmental-report`, `legal-document`, `news-investigative`.

A critical `fail` **without** evidence is ignored and written in the dossier as an unevidenced
allegation. Validators must never smear an author, journal or funder without something checkable.

## Evidence grade (admitted sources)

1. Base grade from S08's `design_tier`: `1` systematic review/meta-analysis of strong designs → A;
   `2` randomised trial or equivalent controlled design → A; `3` cohort, quasi-experiment, strong
   observational → B; `4` case-control, cross-sectional, small sample → C; `5` case series, expert
   opinion, commentary → C; `na` theoretical, mathematical, historical or legal work → B. No S08
   verdict → C.
2. Capped by type: preprint ≤ B, dataset ≤ B, thesis ≤ C, report ≤ C, news-investigative ≤ D.
3. Minus one grade for each **evidenced** `concern` of severity `high`, for an expression of concern
   (S05), and for a failed replication (S10). The floor is D.

## What validators return for each candidate key

```json
{ "key": "SRC-0007", "verdict": "pass|concern|fail", "severity": "low|medium|high|critical",
  "code": "SHORT_CODE", "rationale": "…", "evidence": ["https://…", "doi:…"] }
```
Extra fields by role:
- S02: `metadata`, with `title`, `authors[{name, kind: person|org, orcid?}]`, `year`, `date`,
  `identifier{type, value}`, `type`, `venue`, `publisher`, `url`, `peer_reviewed`, `empirical` and
  `resolution{method: cli|web|none, match_score, resolved_title, evidence_url}`.
- S05: `retracted` and `expression_of_concern` (booleans).
- S07: `assessed_type`, when the source is really something other than what it claims to be.
- S08: `design_tier` (`1`–`5` or `na`).
- S10: `replication_status` (`replicated`, `mixed`, `failed`, `untested`, `na`).

## Background checks expected from tier 2

- **S03, authors:** OpenAlex/ORCID profile and affiliation history; retracted works (`author` command);
  Retraction Watch and PubPeer coverage (WebSearch); misconduct findings by official bodies;
  undisclosed industry roles; extreme self-citation. Report patterns, with evidence, not rumours.
- **S04, venue:** peer-review model, DOAJ/indexing status, publisher, predatory signals (fake impact
  factors, very fast acceptance, spam solicitation), hijacked-journal lists, editorial-board reality.
- **S06, conflicts and funding:** funding statements, declared conflicts, sponsor ties, think-tank
  or advocacy funding, ghost-writing signs.
- **S08, method:** RoB 2, ROBINS-I, CASP, GRADE or another fitting tool; sample size; preregistration;
  outcome switching.
- **S09, citation chain:** does the source actually say what the lab cites it for; who cites it and who
  rebuts it.
- **S10, replication:** replications, meta-analyses, consensus statements, many-labs results.
- **S11, statistics:** GRIM/GRIMMER/SPRITE where means of integer data are reported; recomputed
  p-values from test statistics; impossible numbers; duplicated images or tables.
