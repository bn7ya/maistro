#!/usr/bin/env python3
"""Maistro on-disk audit, run after every stage by maistro_state.py finish.

Findings are {severity: critical|warning, code, detail, path?, section?}. A critical finding
schedules one repair run of the stage; warnings are handed to the next run as fix items.

  maistro_audit.py <research/slug> --stage S [--run N]
"""
import argparse
import collections
import json
import pathlib
import re
import sys

METHODOLOGY_FILES = ["research-questions.md", "gap-analysis.md", "hypotheses.md", "design.md", "measures.md",
                     "sampling-and-data.md", "feasibility.md", "ethics.md", "preregistration.md", "risks.md",
                     "methods-bridge.md", "protocol.md"]
THEORY_FILES = ["frameworks.md", "evidence-map.md", "argument-map.md", "contradictions.md", "causal-model.md",
                "history.md", "cross-field.md", "formal-model.md", "credence-ledger.json", "steelman.md", "debate-record.md"]
SRC_RE = re.compile(r"\bSRC-\d{4}\b")
EXP_RE = re.compile(r"\bEXP-(?:R\d+-)?\d{2}\b")
FIG_EN = re.compile(r"\b(?:Figure|Fig\.)\s*(\d+)")
FIG_AR = re.compile(r"(?:الشكل|شكل)\s*(\d+)")
TAB_EN = re.compile(r"\bTable\s*(\d+)")
TAB_AR = re.compile(r"(?:الجدول|جدول)\s*(\d+)")
EQ_RE = re.compile(r"\$\$|\\begin\{(?:equation|align)\*?\}")


def finding(sev, code, detail, **kw):
    return dict({"severity": sev, "code": code, "detail": detail}, **kw)


def read_jsonl(f):
    if not f.is_file():
        return []
    rows = []
    for line in f.read_text(encoding="utf-8").splitlines():
        if line.strip():
            try:
                rows.append(json.loads(line))
            except ValueError:
                pass
    return rows


def _text(f):
    return f.read_text(encoding="utf-8") if f.is_file() else ""


def audit_stage(p, stage, run, counts, summary):
    p = pathlib.Path(p)
    out = []
    frag_dir = p / "_fragments" / stage / f"run{run}"
    if not frag_dir.is_dir() or not any(frag_dir.glob("*.json")):
        out.append(finding("critical", "NO_FRAGMENTS",
                           f"No structured results were recorded in {frag_dir}. Check that the maistro plugin's hooks are enabled (the recorder hook writes them).",
                           path=str(frag_dir)))
    report = p / "stage-reports" / ("final.en.md" if stage == "arabic" else f"{stage}.en.md")
    if not report.is_file():
        out.append(finding("critical", "NO_STAGE_REPORT", f"The director's report {report.name} is missing.", path=str(report)))

    s_counts = (summary or {}).get("counts") or {}
    for key in ("accepted", "rejected", "ideas_promoted", "valid", "claims"):
        if key in s_counts and key in (counts or {}) and s_counts[key] != counts[key]:
            out.append(finding("warning", "LEDGER_MISMATCH",
                               f"The workflow counted {key}={s_counts[key]} but the rebuilt ledger has {counts[key]}. The ledger on disk is authoritative; check for missing fragments."))

    if stage == "methodology":
        if not (p / "00-charter.md").is_file():
            out.append(finding("critical", "NO_CHARTER", "00-charter.md is missing.", path="00-charter.md"))
        missing = [f for f in METHODOLOGY_FILES if not (p / "01-methodology" / f).is_file()]
        if len(missing) >= 4:
            out.append(finding("critical", "METHODOLOGY_INCOMPLETE", "Missing methodology files: " + ", ".join(missing), path="01-methodology/"))
        else:
            out += [finding("warning", "MISSING_FILE", f"01-methodology/{f} is missing.", path=f"01-methodology/{f}") for f in missing]
        hyp = _text(p / "01-methodology" / "hypotheses.md")
        if hyp and not re.search(r"\bH1\b", hyp):
            out.append(finding("warning", "HYPOTHESES_UNNUMBERED", "hypotheses.md has no numbered hypotheses (H1, H2, …).", path="01-methodology/hypotheses.md"))

    elif stage == "sources":
        n = len(read_jsonl(p / "02-sources" / "registry.jsonl"))
        if n == 0:
            out.append(finding("critical", "NO_ADMITTED_SOURCES",
                               "No source passed admission. Broaden the search (other databases, synonyms, adjacent fields, older work) and re-check.",
                               path="02-sources/registry.jsonl"))
        elif n < 5:
            out.append(finding("warning", "THIN_CORPUS", f"Only {n} admitted sources; theory will rest on very little evidence.", path="02-sources/registry.jsonl"))

    elif stage == "theory":
        for f in THEORY_FILES:
            if not (p / "03-theory" / f).is_file():
                out.append(finding("warning", "MISSING_FILE", f"03-theory/{f} is missing.", path=f"03-theory/{f}"))
        led = p / "03-theory" / "credence-ledger.json"
        if led.is_file():
            try:
                json.loads(led.read_text(encoding="utf-8"))
            except ValueError:
                out.append(finding("warning", "LEDGER_INVALID", "credence-ledger.json is not valid JSON.", path="03-theory/credence-ledger.json"))

    elif stage == "experiments":
        idx = p / "04-experiments" / "results-index.json"
        exps = json.loads(idx.read_text(encoding="utf-8")) if idx.is_file() else {}
        if not exps:
            out.append(finding("warning", "NO_EXPERIMENTS", "No experiments were planned.", path="04-experiments/"))
        for eid, e in sorted(exps.items()):
            if e.get("status") != "valid":
                continue
            rj = p / "04-experiments" / "results" / eid / "results.json"
            try:
                json.loads(rj.read_text(encoding="utf-8"))
            except (OSError, ValueError):
                out.append(finding("critical", "RESULTS_NOT_TRACEABLE", f"{eid} is marked valid but {rj.relative_to(p)} is missing or not JSON.", path=str(rj.relative_to(p))))

    elif stage == "review":
        missing = [f for f in sorted((p / "05-critique").glob("review-*.md"))]
        if len(missing) < 6:
            out.append(finding("warning", "FEW_REVIEWS", f"Only {len(missing)} critic reviews were written to 05-critique/.", path="05-critique/"))

    elif stage == "manuscript":
        secs = sorted((p / "manuscript" / "sections").glob("*.en.md"))
        if not secs:
            out.append(finding("critical", "NO_SECTIONS", "No manuscript sections were written.", path="manuscript/sections/"))
        accepted = {r["id"] for r in read_jsonl(p / "02-sources" / "registry.jsonl")}
        idx = p / "04-experiments" / "results-index.json"
        exps = json.loads(idx.read_text(encoding="utf-8")) if idx.is_file() else {}
        valid = {k for k, v in exps.items() if v.get("status") == "valid"}
        for s in secs:
            t = s.read_text(encoding="utf-8")
            bad = sorted(set(SRC_RE.findall(t)) - accepted)
            if bad:
                out.append(finding("critical", "UNADMITTED_CITATION", f"{s.name} cites sources that are not admitted: {', '.join(bad)}. Remove them and the claims resting on them.", path=f"manuscript/sections/{s.name}"))
            badx = sorted(set(EXP_RE.findall(t)) - valid)
            if badx:
                out.append(finding("critical", "INVALID_RESULT_CITED", f"{s.name} cites experiments that are not valid: {', '.join(badx)}.", path=f"manuscript/sections/{s.name}"))
        if not (p / "manuscript" / "references.md").is_file():
            out.append(finding("warning", "NO_REFERENCES", "manuscript/references.md is missing.", path="manuscript/references.md"))

    elif stage == "arabic":
        for en in sorted((p / "manuscript" / "sections").glob("*.en.md")):
            sec = en.name[: -len(".en.md")]
            ar = en.with_name(f"{sec}.ar.md")
            if not ar.is_file():
                out.append(finding("critical", "NOT_TRANSLATED", f"{ar.name} is missing.", path=f"manuscript/sections/{ar.name}", section=sec))
                continue
            te, ta = en.read_text(encoding="utf-8"), ar.read_text(encoding="utf-8")
            problems = []
            ce = collections.Counter(SRC_RE.findall(te) + EXP_RE.findall(te))
            ca = collections.Counter(SRC_RE.findall(ta) + EXP_RE.findall(ta))
            if ce != ca:
                problems.append(f"citation keys differ (en {sum(ce.values())}, ar {sum(ca.values())}: {', '.join(sorted(set(ce) ^ set(ca))) or 'counts'})")
            if sorted(FIG_EN.findall(te)) != sorted(FIG_AR.findall(ta)):
                problems.append("figure references differ")
            if sorted(TAB_EN.findall(te)) != sorted(TAB_AR.findall(ta)):
                problems.append("table references differ")
            if len(EQ_RE.findall(te)) != len(EQ_RE.findall(ta)):
                problems.append("equation count differs")
            if problems:
                out.append(finding("critical", "TRANSLATION_MISMATCH", f"{ar.name}: " + "; ".join(problems), path=f"manuscript/sections/{ar.name}", section=sec))
        if not (p / "stage-reports" / "final.ar.md").is_file():
            out.append(finding("warning", "FINAL_NOT_TRANSLATED", "stage-reports/final.ar.md is missing.", path="stage-reports/final.ar.md"))

    stages = ["methodology", "sources", "theory", "experiments", "review", "manuscript", "arabic"]
    i = stages.index(stage)
    if i > 0:
        prev = stages[i - 1]
        if (p / "stage-reports" / f"{prev}.en.md").is_file() and not (p / "stage-reports" / f"{prev}.ar.md").is_file():
            out.append(finding("warning", "REPORT_NOT_TRANSLATED", f"stage-reports/{prev}.ar.md is missing.", path=f"stage-reports/{prev}.ar.md"))
    return out


def main(argv=None):
    ap = argparse.ArgumentParser(prog="maistro_audit")
    ap.add_argument("project")
    ap.add_argument("--stage", required=True, choices=["methodology", "sources", "theory", "experiments", "review", "manuscript", "arabic"])
    ap.add_argument("--run", type=int, default=1)
    a = ap.parse_args(argv)
    print(json.dumps(audit_stage(a.project, a.stage, a.run, {}, {}), ensure_ascii=False, indent=1))


if __name__ == "__main__":
    sys.exit(main())
