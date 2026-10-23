#!/usr/bin/env python3
"""Maistro project state: which stage runs next, and the ledgers rebuilt from fragments.

  init <research/slug> [--scale pilot|standard|full] [--date YYYY-MM-DD]
  next <research/slug>                     prints the lab-stage args as JSON, or "done"
  finish <research/slug> --stage S [--summary-file F]
  materialize <research/slug> [--stage S]
  assemble <research/slug> --lang en|ar
  status [<research/slug>]                 Markdown summary (all projects if no slug)

Run from the folder that contains research/. The lab-stage workflow never writes files itself:
agents write their own files, the recorder hook stores each structured result in _fragments/,
and this script turns fragments into registry.jsonl, ideas.jsonl, issues.jsonl, claims.jsonl, etc.
"""
import argparse
import datetime
import json
import pathlib
import re
import shutil
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import maistro_audit  # noqa: E402
import maistro_gates as G  # noqa: E402

K = G.K
STAGES = K["stages"]
ROSTER = json.loads((HERE / "roster.json").read_text(encoding="utf-8"))
ROSTER_ORDER = [r["id"] for r in ROSTER]
FRONTIER = [r["id"] for r in ROSTER if r["division"] == "frontier"]
CRITICS = [r["id"] for r in ROSTER if r["division"] == "critique"]
METH_DIRS = ["01-methodology", "02-sources/notes", "02-sources/dossiers", "03-theory", "04-experiments/designs",
             "04-experiments/code", "04-experiments/results", "04-experiments/repro", "04-experiments/env",
             "05-critique", "06-frontier", "forum", "board", "stage-reports", "manuscript/sections",
             "manuscript/figures", "_fragments", "_runs"]


def out(obj):
    print(json.dumps(obj, ensure_ascii=False, indent=1))


def project_path(pd):
    pd = str(pd).rstrip("/")
    if not re.match(r"^research/[a-z0-9][a-z0-9-]*$", pd):
        sys.exit(f'project must be "research/<slug>" (relative, lowercase), got {pd!r}')
    return pathlib.Path(pd), pd


def load_status(p):
    f = p / "status.json"
    if not f.is_file():
        sys.exit(f"{f} not found: run init first")
    return json.loads(f.read_text(encoding="utf-8"))


def save_status(p, st):
    tmp = p / "status.json.tmp"
    tmp.write_text(json.dumps(st, ensure_ascii=False, indent=1), encoding="utf-8")
    tmp.replace(p / "status.json")


def read_jsonl(f):
    if not f.is_file():
        return []
    return [json.loads(line) for line in f.read_text(encoding="utf-8").splitlines() if line.strip()]


def write_jsonl(f, rows):
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text("".join(json.dumps(r, ensure_ascii=False) + "\n" for r in rows), encoding="utf-8")


def finished_runs(st, stage):
    return [r for r in st["stages"][stage]["runs"]]


def run_args(p, stage, run):
    f = p / "_runs" / f"{stage}-run{run}.args.json"
    return json.loads(f.read_text(encoding="utf-8")) if f.is_file() else {}


# --------------------------------------------------------------------------------------------
# init / next
# --------------------------------------------------------------------------------------------
def cmd_init(a):
    p, pd = project_path(a.project)
    if (p / "status.json").exists() and not a.force:
        sys.exit(f"{pd} already exists (use --resume with /maistro:research, or --force)")
    for d in METH_DIRS:
        (p / d).mkdir(parents=True, exist_ok=True)
    apis = None
    try:
        import maistro_scholar
        apis = maistro_scholar.cmd_ping(None).get("apis_available")
    except Exception:  # noqa: BLE001 — network probing must never block init
        apis = None
    date = a.date or datetime.date.today().isoformat()
    st = {
        "version": 1,
        "slug": p.name,
        "project_dir": pd,
        "created": date,
        "date": date,
        "scale": a.scale,
        "language": "bilingual (English source, Arabic translation)",
        "apis_available": apis,
        "revisits_left": 1,
        "repairs_used": {},
        "queue": [],
        "pending_fixes": [],
        "current": None,
        "finished": False,
        "stages": {s: {"state": "pending", "runs": []} for s in STAGES},
    }
    save_status(p, st)
    out({"ok": True, "project_dir": pd, "date": date, "scale": a.scale, "apis_available": apis,
         "next_step": f"write {pd}/idea.md, then run: next {pd}"})


def _abandon(p, cur):
    """A run was started but never finished: move its fragments and posts aside so the rerun starts clean."""
    stage, run = cur["stage"], cur["run"]
    for base in (p / "_fragments" / stage, p / "forum" / stage):
        src = base / f"run{run}"
        if src.exists():
            k = 1
            while (base / f"run{run}-abandoned{k}").exists():
                k += 1
            src.rename(base / f"run{run}-abandoned{k}")


def cmd_next(a):
    p, pd = project_path(a.project)
    st = load_status(p)
    if st.get("current"):
        _abandon(p, st["current"])
        st["current"] = None
    item = st["queue"][0] if st["queue"] else None
    if not item:
        stage = next((s for s in STAGES if st["stages"][s]["state"] != "done"), None)
        if not stage:
            st["finished"] = True
            save_status(p, st)
            print("done")
            return
        item = {"stage": stage, "mode": "normal", "issues": []}
    stage, mode = item["stage"], item["mode"]
    run = len(st["stages"][stage]["runs"]) + 1
    args = {
        "stage": stage,
        "project_dir": pd,
        "date": st["date"],
        "scale": st["scale"],
        "mode": mode,
        "run": run,
        "issues": item.get("issues", [])[:12],
        "fix_items": st.get("pending_fixes", [])[:12],
        "apis_available": st.get("apis_available"),
        "revisits_left": st.get("revisits_left", 0),
    }
    if stage in ("theory", "manuscript"):
        args["accepted_ids"] = [r["id"] for r in read_jsonl(p / "02-sources" / "registry.jsonl")]
    if stage == "manuscript":
        idx = p / "04-experiments" / "results-index.json"
        exps = json.loads(idx.read_text(encoding="utf-8")) if idx.is_file() else {}
        args["valid_experiments"] = sorted(k for k, v in exps.items() if v.get("status") == "valid")
    if stage == "sources":
        summ = p / "02-sources" / "summary.json"
        s = json.loads(summ.read_text(encoding="utf-8")) if summ.is_file() else {}
        args["seen_source_keys"] = s.get("seen_keys", [])
        args["source_id_offset"] = s.get("id_offset", 0)
    if stage == "arabic":
        secs = sorted(f.name[:-len(".en.md")] for f in (p / "manuscript" / "sections").glob("*.en.md"))
        args["sections"] = item.get("sections") or secs
    i = STAGES.index(stage)
    if mode == "normal" and i > 0:
        prev = STAGES[i - 1]
        en, ar = p / "stage-reports" / f"{prev}.en.md", p / "stage-reports" / f"{prev}.ar.md"
        if en.is_file() and not ar.is_file():
            args["prev_stage"] = prev
            args["prev_report"] = f"stage-reports/{prev}.en.md"
    (p / "_runs").mkdir(exist_ok=True)
    (p / "_runs" / f"{stage}-run{run}.args.json").write_text(json.dumps(args, ensure_ascii=False, indent=1), encoding="utf-8")
    st["current"] = {"stage": stage, "run": run, "mode": mode}
    st["pending_fixes"] = []
    save_status(p, st)
    out(args)


# --------------------------------------------------------------------------------------------
# materialize
# --------------------------------------------------------------------------------------------
def _runs_for(st, stage, include_current=True):
    runs = [r["run"] for r in st["stages"][stage]["runs"]]
    cur = st.get("current")
    if include_current and cur and cur["stage"] == stage and cur["run"] not in runs:
        runs.append(cur["run"])
    return sorted(runs)


def materialize_sources(p, st):
    seen, offset = set(), 0
    results, records, ignored = {}, {}, []
    for run in _runs_for(st, "sources"):
        args = run_args(p, "sources", run)
        apis = args.get("apis_available", st.get("apis_available"))
        res, rec, ign, offset = G.replay_sources_run(p, run, args.get("scale", st["scale"]), apis, seen, offset)
        for k in res:
            res[k]["run"] = run
        results.update(res)
        records.update(rec)
        ignored += ign
    accepted, rejected = [], []
    for key in sorted(results):
        r, rec = results[key], records.get(key, {})
        c, meta = rec.get("candidate") or {}, rec.get("meta") or {}
        checks = [{"agent": v["agent"], "verdict": v.get("verdict"), "severity": v.get("severity"), "code": v.get("code")} for v in rec.get("verdicts") or []]
        if r["status"] == "accepted":
            accepted.append({
                "id": key, "grade": r["grade"], "title": meta.get("title"), "authors": meta.get("authors"),
                "year": meta.get("year"), "date": meta.get("date"), "identifier": meta.get("identifier"),
                "type": meta.get("type"), "venue": meta.get("venue"), "publisher": meta.get("publisher"),
                "url": meta.get("url"), "peer_reviewed": meta.get("peer_reviewed"), "empirical": meta.get("empirical"),
                "resolution": (meta.get("resolution") or {}).get("method"), "found_by": c.get("found_by"),
                "stance": c.get("stance"), "relevance": c.get("relevance"), "wave": r["wave"], "run": r["run"],
                "checks": checks,
            })
        else:
            rejected.append({
                "id": key, "reasons": r["reasons"], "title": meta.get("title") or c.get("title"),
                "authors": meta.get("authors") or c.get("authors"), "year": meta.get("year") or c.get("year"),
                "identifier": meta.get("identifier") or c.get("identifier"), "claimed_type": c.get("claimed_type"),
                "found_by": c.get("found_by"), "wave": r["wave"], "run": r["run"], "checks": checks,
            })
        _write_dossier(p, key, r, rec)
    write_jsonl(p / "02-sources" / "registry.jsonl", accepted)
    write_jsonl(p / "02-sources" / "rejected.jsonl", rejected)
    grades, reasons = {}, {}
    for a in accepted:
        grades[a["grade"]] = grades.get(a["grade"], 0) + 1
    for r in rejected:
        for x in r["reasons"]:
            reasons[x.split(":")[0]] = reasons.get(x.split(":")[0], 0) + 1
    summary = {"candidates": len(results), "accepted": len(accepted), "rejected": len(rejected), "grades": grades,
               "rejection_reasons": reasons, "unevidenced_allegations_ignored": len(ignored),
               "seen_keys": sorted(seen), "id_offset": offset}
    (p / "02-sources" / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=1), encoding="utf-8")
    return {k: summary[k] for k in ("candidates", "accepted", "rejected", "grades", "rejection_reasons")}


def _write_dossier(p, key, result, rec):
    meta, c = rec.get("meta") or {}, rec.get("candidate") or {}
    lines = [f"# {key} — {meta.get('title') or c.get('title') or '(untitled)'}", ""]
    if result["status"] == "accepted":
        lines.append(f"**Admitted** · evidence grade **{result['grade']}** · wave {result['wave']} · run {result.get('run')}")
    else:
        lines.append(f"**Refused** · {', '.join(result['reasons'])} · wave {result['wave']} · run {result.get('run')}")
    lines += ["", "## Verified metadata (S02)", ""]
    if meta:
        authors = "; ".join(f"{x.get('name')} ({x.get('kind')})" for x in meta.get("authors") or [])
        ident = meta.get("identifier") or {}
        res = meta.get("resolution") or {}
        lines += [f"- Authors: {authors or '—'}", f"- Year/date: {meta.get('year') or '—'} {meta.get('date') or ''}",
                  f"- Identifier: {ident.get('type')}:{ident.get('value')}", f"- Type: {meta.get('type')}",
                  f"- Venue / publisher: {meta.get('venue') or '—'} / {meta.get('publisher') or '—'}",
                  f"- Resolution: {res.get('method')} (match {res.get('match_score')}) {res.get('evidence_url') or ''}"]
    else:
        lines.append("No verified metadata was returned.")
    lines += ["", "## As reported by the scout", "",
              f"- Found by {c.get('found_by')} ({c.get('stance')}): {c.get('relevance') or ''}",
              f"- Claimed: {', '.join(c.get('authors') or [])} ({c.get('year')}), {c.get('claimed_type')}", "", "## Checks", ""]
    for v in rec.get("verdicts") or []:
        ev = "; ".join(v.get("evidence") or []) or "no evidence given"
        extra = [f"{k}={v[k]}" for k in ("retracted", "expression_of_concern", "assessed_type", "design_tier", "replication_status") if k in v]
        lines.append(f"- **{v['agent']}** {v.get('verdict')}/{v.get('severity')} `{v.get('code')}` {' '.join(extra)}: {v.get('rationale')} _(evidence: {ev})_")
    if rec.get("veto"):
        v = rec["veto"]
        lines += ["", f"## Source sceptic (C04) veto: `{v.get('code')}`", "", f"{v.get('rationale')} _(evidence: {'; '.join(v.get('evidence') or [])})_"]
    d = p / "02-sources" / "dossiers"
    d.mkdir(parents=True, exist_ok=True)
    (d / f"{key}.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def materialize_theory(p, st):
    ideas = []
    for run in _runs_for(st, "theory"):
        args = run_args(p, "theory", run)
        accepted = set(args.get("accepted_ids", []))
        ideas += G.replay_theory_run(p, run, args.get("scale", st["scale"]), accepted, FRONTIER)
    rows = [{k: i.get(k) for k in ("key", "by", "status", "title", "statement", "mechanism", "technique",
                                     "what_would_make_it_true", "possible_tests", "grounding_hints")}
            | {"votes": [{"voter": v.get("voter"), "vote": v.get("vote"), "grounding_source_ids": v.get("grounding_source_ids"),
                          "test_sketch": v.get("test_sketch"), "rationale": v.get("rationale")} for v in i.get("votes") or []]}
            for i in ideas]
    write_jsonl(p / "06-frontier" / "ideas.jsonl", rows)
    tally = {"promoted": 0, "needs_grounding": 0, "quarantined": 0}
    for r in rows:
        tally[r["status"]] += 1
    return {"ideas": len(rows), "ideas_promoted": tally["promoted"], "ideas_need_grounding": tally["needs_grounding"],
            "ideas_quarantined": tally["quarantined"]}


def materialize_experiments(p, st):
    allx = {}
    for run in _runs_for(st, "experiments"):
        allx.update(G.replay_experiments_run(p, run, run_args(p, "experiments", run).get("scale", st["scale"])))
    (p / "04-experiments").mkdir(exist_ok=True)
    (p / "04-experiments" / "results-index.json").write_text(json.dumps(allx, ensure_ascii=False, indent=1), encoding="utf-8")
    return {"planned": len(allx), "valid": sum(1 for x in allx.values() if x.get("status") == "valid")}


def materialize_review(p, st, pd):
    issues = {}
    for run in _runs_for(st, "review"):
        for x in G.replay_review_run(p, run, run_args(p, "review", run).get("scale", st["scale"]), CRITICS, ROSTER_ORDER, pd):
            issues[x["key"]] = dict(x, run=run)
    rows = sorted(issues.values(), key=lambda x: x["key"])
    write_jsonl(p / "05-critique" / "issues.jsonl", rows)
    return {"issues": len(rows), "resolved": sum(1 for x in rows if x["resolved"]),
            "unresolved_blocking_or_major": sum(1 for x in rows if not x["resolved"] and x["severity"] in ("blocking", "major"))}


def materialize_manuscript(p, st):
    claims = []
    for run in _runs_for(st, "manuscript"):
        args = run_args(p, "manuscript", run)
        claims += G.replay_manuscript_run(p, run, args.get("scale", st["scale"]), set(args.get("accepted_ids", [])),
                                          set(args.get("valid_experiments", [])))
    write_jsonl(p / "manuscript" / "claims.jsonl", [{k: c.get(k) for k in ("key", "section_id", "text", "kind", "cited_ids", "result_ids", "decision", "unknown_ids")}
                                                    | {"checks": [{"lens": x.get("lens"), "refuted": x.get("refuted"), "reason": x.get("reason")} for x in c.get("checks") or []]}
                                                    for c in claims])
    assemble(p, "en")
    tally = {"keep": 0, "soften": 0, "remove": 0}
    for c in claims:
        tally[c["decision"]] += 1
    return {"claims": len(claims), "claim_decisions": tally}


def materialize(p, st, pd, stage):
    if stage == "sources":
        return materialize_sources(p, st)
    if stage == "theory":
        return materialize_theory(p, st)
    if stage == "experiments":
        return materialize_experiments(p, st)
    if stage == "review":
        return materialize_review(p, st, pd)
    if stage == "manuscript":
        return materialize_manuscript(p, st)
    if stage == "arabic":
        assemble(p, "ar")
        return {"sections_ar": len(list((p / "manuscript" / "sections").glob("*.ar.md")))}
    return {}


def cmd_materialize(a):
    p, pd = project_path(a.project)
    st = load_status(p)
    stages = [a.stage] if a.stage else [s for s in STAGES if _runs_for(st, s)]
    out({s: materialize(p, st, pd, s) for s in stages})


# --------------------------------------------------------------------------------------------
# assemble
# --------------------------------------------------------------------------------------------
def assemble(p, lang):
    secs = sorted((p / "manuscript" / "sections").glob(f"*.{lang}.md"))
    if not secs:
        return None
    charter = p / "00-charter.md"
    title = None
    if charter.is_file():
        m = re.search(r"^# (.+)$", charter.read_text(encoding="utf-8"), re.M)
        title = m.group(1).strip() if m else None
    parts = []
    if lang == "en":
        parts.append(f"# {title or p.name}\n\n_Produced by the Maistro research lab. Evidence: admitted sources only (`[SRC-…]`), audited experiments only (`[EXP-…]`)._\n")
    else:
        parts.append(f"<div dir=\"rtl\">\n\n# {title or p.name}\n\n_أُعدّت هذه الورقة في مختبر مايسترو البحثي. الأدلة: المصادر المقبولة فقط (`[SRC-…]`) والتجارب المُدقَّقة فقط (`[EXP-…]`)._\n")
    for s in secs:
        parts.append(s.read_text(encoding="utf-8").strip() + "\n")
    refs = p / "manuscript" / "references.md"
    if refs.is_file():
        parts.append(("## References\n\n" if lang == "en" else "## المراجع\n\n") + refs.read_text(encoding="utf-8").strip() + "\n")
    if lang == "ar":
        parts.append("</div>\n")
    dest = p / "manuscript" / f"paper.{lang}.md"
    dest.write_text("\n".join(parts), encoding="utf-8")
    return str(dest)


def cmd_assemble(a):
    p, _ = project_path(a.project)
    out({"ok": True, "path": assemble(p, a.lang)})


# --------------------------------------------------------------------------------------------
# finish
# --------------------------------------------------------------------------------------------
def _gate_fragment(p, stage, run):
    fr = G.Fragments(p, stage, run)
    return fr.get("final signoff" if stage == "arabic" else f"{stage} gate")


def cmd_finish(a):
    p, pd = project_path(a.project)
    st = load_status(p)
    cur = st.get("current")
    if not cur or cur["stage"] != a.stage:
        sys.exit(f"no started run of stage {a.stage} (current: {cur})")
    run, mode = cur["run"], cur["mode"]
    summary = {}
    if a.summary_file and pathlib.Path(a.summary_file).is_file():
        try:
            summary = json.loads(pathlib.Path(a.summary_file).read_text(encoding="utf-8"))
        except ValueError:
            summary = {}
    counts = materialize(p, st, pd, a.stage)
    findings = maistro_audit.audit_stage(p, a.stage, run, counts, summary)
    critical = [f for f in findings if f["severity"] == "critical"]
    gate = _gate_fragment(p, a.stage, run) or {}
    rec = {
        "run": run, "mode": mode, "finished": datetime.date.today().isoformat(),
        "exit_reason": summary.get("exit_reason"), "calls_used": summary.get("calls_used"), "cap": summary.get("cap"),
        "failed_calls": summary.get("failed"), "skipped_calls": summary.get("dropped"),
        "notes": (summary.get("notes") or [])[:8],
        "headline": gate.get("headline") or (summary.get("gate") or {}).get("headline"),
        "counts": counts, "audit": findings[:30],
    }
    st["stages"][a.stage]["runs"].append(rec)
    st["current"] = None
    if st["queue"] and st["queue"][0]["stage"] == a.stage and st["queue"][0]["mode"] == mode:
        st["queue"].pop(0)
    repairs = st.setdefault("repairs_used", {})
    if critical and repairs.get(a.stage, 0) < 1:
        repairs[a.stage] = repairs.get(a.stage, 0) + 1
        item = {"stage": a.stage, "mode": "repair", "issues": [f"{f['code']}: {f['detail']}" for f in critical][:12]}
        secs = sorted({f["section"] for f in critical if f.get("section")})
        if a.stage == "arabic" and secs:
            item["sections"] = secs
        st["queue"].insert(0, item)
        st["stages"][a.stage]["state"] = "repairing"
    else:
        st["stages"][a.stage]["state"] = "done"
    earlier = STAGES[: STAGES.index(a.stage)]
    if (mode == "normal" and gate.get("verdict") == "revisit" and st.get("revisits_left", 0) > 0
            and gate.get("revisit_stage") in earlier):
        issues = [str(x) for x in gate.get("revisit_issues") or []][:8]
        st["revisits_left"] -= 1
        st["queue"].append({"stage": gate["revisit_stage"], "mode": "revisit", "issues": issues})
        st["queue"].append({"stage": a.stage, "mode": "update",
                            "issues": [f"Integrate what changed in the revisit of the {gate['revisit_stage']} stage."] + issues})
        rec["revisit"] = {"stage": gate["revisit_stage"], "issues": issues}
    st["pending_fixes"] = [{"code": f["code"], "detail": f["detail"], "path": f.get("path", "")} for f in findings if f["severity"] == "warning"][:12]
    if not st["queue"] and all(st["stages"][s]["state"] == "done" for s in STAGES):
        st["finished"] = True
    save_status(p, st)
    nxt = st["queue"][0] if st["queue"] else next(({"stage": s, "mode": "normal"} for s in STAGES if st["stages"][s]["state"] != "done"), None)
    out({"ok": True, "stage": a.stage, "run": run, "mode": mode, "headline": rec["headline"], "counts": counts,
         "critical": len(critical), "critical_codes": sorted({f["code"] for f in critical}),
         "warnings": len(findings) - len(critical), "revisit": rec.get("revisit"),
         "next": nxt, "finished": st["finished"]})


# --------------------------------------------------------------------------------------------
# status
# --------------------------------------------------------------------------------------------
def render_status(p):
    st = load_status(p)
    lines = [f"## {st['slug']} · scale {st['scale']} · started {st['created']}", ""]
    title = None
    if (p / "00-charter.md").is_file():
        m = re.search(r"^# (.+)$", (p / "00-charter.md").read_text(encoding="utf-8"), re.M)
        title = m.group(1) if m else None
    if title:
        lines += [f"**{title}**", ""]
    lines += ["| Stage | State | Runs | Latest headline |", "|---|---|---|---|"]
    for s in STAGES:
        runs = st["stages"][s]["runs"]
        h = (runs[-1].get("headline") or "") if runs else ""
        lines.append(f"| {s} | {st['stages'][s]['state']} | {len(runs)} | {h[:160]} |")
    if st.get("current"):
        lines += ["", f"Running now: {st['current']['stage']} (run {st['current']['run']}, {st['current']['mode']})"]
    if st["queue"]:
        lines += ["", "Queued: " + ", ".join(f"{q['stage']} ({q['mode']})" for q in st["queue"])]
    reg = read_jsonl(p / "02-sources" / "registry.jsonl")
    rej = read_jsonl(p / "02-sources" / "rejected.jsonl")
    if reg or rej:
        lines += ["", f"Sources: {len(reg)} admitted, {len(rej)} refused."]
    ideas = read_jsonl(p / "06-frontier" / "ideas.jsonl")
    if ideas:
        lines.append(f"Frontier ideas: {len(ideas)} ({sum(1 for i in ideas if i['status'] == 'promoted')} promoted).")
    for lang in ("en", "ar"):
        f = p / "manuscript" / f"paper.{lang}.md"
        if f.is_file():
            lines.append(f"Paper ({lang}): {f}")
    if st.get("finished"):
        lines += ["", "Finished. Final report: " + str(p / "stage-reports" / "final.en.md") + " / " + str(p / "stage-reports" / "final.ar.md")]
    return "\n".join(lines)


def cmd_status(a):
    if a.project:
        p, _ = project_path(a.project)
        print(render_status(p))
        return
    root = pathlib.Path("research")
    projects = sorted(d for d in root.iterdir() if (d / "status.json").is_file()) if root.is_dir() else []
    if not projects:
        print("No Maistro projects in ./research/")
        return
    print("\n\n".join(render_status(d) for d in projects))


def main(argv=None):
    ap = argparse.ArgumentParser(prog="maistro_state")
    sub = ap.add_subparsers(dest="cmd", required=True)
    i = sub.add_parser("init")
    i.add_argument("project")
    i.add_argument("--scale", choices=list(K["scales"]), default="full")
    i.add_argument("--date")
    i.add_argument("--force", action="store_true")
    sub.add_parser("next").add_argument("project")
    f = sub.add_parser("finish")
    f.add_argument("project")
    f.add_argument("--stage", required=True, choices=STAGES)
    f.add_argument("--summary-file")
    m = sub.add_parser("materialize")
    m.add_argument("project")
    m.add_argument("--stage", choices=STAGES)
    s = sub.add_parser("assemble")
    s.add_argument("project")
    s.add_argument("--lang", choices=["en", "ar"], required=True)
    sub.add_parser("status").add_argument("project", nargs="?")
    a = ap.parse_args(argv)
    {"init": cmd_init, "next": cmd_next, "finish": cmd_finish, "materialize": cmd_materialize,
     "assemble": cmd_assemble, "status": cmd_status}[a.cmd](a)


if __name__ == "__main__":
    main()
