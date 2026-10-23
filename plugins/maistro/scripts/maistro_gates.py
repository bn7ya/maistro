"""Maistro gates: the Python mirror of the gate logic in workflows/lab-stage.js.

The workflow applies these rules while a stage runs. After the stage, maistro_state.py replays the
same rules over the recorded fragments (every agent's exact structured result) to rebuild the
ledgers on disk. tests/test_parity.py checks that both implementations agree.
"""
import json
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent
POLICY = json.loads((HERE / "source-policy.json").read_text(encoding="utf-8"))
K = json.loads((HERE / "lab-constants.json").read_text(encoding="utf-8"))
GRADES = ["A", "B", "C", "D"]


# --------------------------------------------------------------------------------------------
# Helpers shared with the workflow (same semantics as the JS versions)
# --------------------------------------------------------------------------------------------
def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", str(s).lower()).strip("-")[:80]


def pad(n, w=2):
    return str(n).zfill(w)


def chunk(xs, n):
    return [xs[i:i + n] for i in range(0, len(xs), n)]


def run_key(prefix, rest, run):
    return f"{prefix}-R{run}-{rest}" if run > 1 else f"{prefix}-{rest}"


def norm_type(t):
    return str(t or "").strip().lower()


def evidenced(v):
    return isinstance(v.get("evidence"), list) and any(len(str(e).strip()) >= 6 for e in v["evidence"])


def _num(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return float("nan")


def norm_key(c):
    ident = c.get("identifier") or {}
    t = ident.get("type")
    v = str(ident.get("value") or "").strip().lower()
    if t == "doi":
        v = re.sub(r"^https?://(dx\.)?doi\.org/", "", v)
        v = re.sub(r"^doi:", "", v)
    if t in ("doi", "arxiv", "pmid", "pmcid", "isbn") and v:
        return f"{t}:{v}"
    title = re.sub(r"[^a-z0-9]+", "", str(c.get("title") or "").lower())
    return f"t:{title}:{c.get('year') or 0}"


# --------------------------------------------------------------------------------------------
# Source admission
# --------------------------------------------------------------------------------------------
def tier1_gate(meta, s05=None, s07=None, apis=None):
    if not meta:
        return {"status": "rejected", "reasons": ["NOT_VERIFIED"]}
    r = []
    authors = meta.get("authors") or []
    people = [a for a in authors if a.get("kind") == "person" and len(str(a.get("name") or "").strip()) >= 2]
    orgs = [a for a in authors if a.get("kind") == "org" and len(str(a.get("name") or "").strip()) >= 2]
    typ = norm_type(meta.get("type"))
    if not people and not (orgs and typ in POLICY["org_author_allowed_types"]):
        r.append("NO_AUTHOR")
    if not meta.get("year"):
        r.append("NO_DATE")
    ident = meta.get("identifier") or {}
    if ident.get("type") not in POLICY["identifier_types"] or len(str(ident.get("value") or "").strip()) < 3:
        r.append("NO_STABLE_ID")
    res = meta.get("resolution") or {}
    score = _num(res.get("match_score"))
    cli_ok = res.get("method") == "cli" and score >= POLICY["min_match_score"]
    web_ok = (apis is False and res.get("method") == "web" and score >= POLICY["min_match_score"]
              and str(res.get("evidence_url") or "").startswith("http"))
    if not cli_ok and not web_ok:
        r.append("UNRESOLVED")
    assessed = norm_type((s07 or {}).get("assessed_type"))
    if typ in POLICY["blocked_types"]:
        r.append(f"TYPE_BLOCKED:{typ}")
    elif assessed and assessed in POLICY["blocked_types"]:
        r.append(f"TYPE_BLOCKED:{assessed}")
    elif typ not in POLICY["allowed_types"]:
        r.append(f"TYPE_NOT_ALLOWED:{typ or 'unknown'}")
    if s05 and s05.get("retracted") is True:
        r.append("RETRACTED")
    return {"status": "rejected", "reasons": r} if r else {"status": "pass", "reasons": []}


def critical_fails(vs, ignored):
    out = []
    for v in vs:
        if not v or v.get("verdict") != "fail" or v.get("severity") != "critical":
            continue
        if evidenced(v):
            out.append(f"{v['agent']}:{str(v.get('code') or 'FAIL').upper()}")
        else:
            ignored.append(f"{v['agent']}:{v.get('key')}:{v.get('code')}")
    return out


def grade_of(meta, vs):
    s08 = next((v for v in vs if v.get("agent") == "S08" and v.get("design_tier")), None)
    g = POLICY["design_tier_grade"].get(s08["design_tier"], POLICY["default_grade"]) if s08 else POLICY["default_grade"]
    cap = POLICY["type_grade_cap"].get(norm_type((meta or {}).get("type")))
    if cap and GRADES.index(cap) > GRADES.index(g):
        g = cap
    pen = sum(1 for v in vs if v.get("verdict") == "concern" and v.get("severity") == "high" and evidenced(v))
    if any(v.get("agent") == "S05" and v.get("expression_of_concern") is True for v in vs):
        pen += 1
    if any(v.get("agent") == "S10" and v.get("replication_status") == "failed" for v in vs):
        pen += 1
    return GRADES[min(len(GRADES) - 1, GRADES.index(g) + pen)]


def promote_idea(votes, accepted):
    support = [v for v in votes if v and v.get("vote") == "support"]
    grounded = any(
        any(i in accepted for i in (v.get("grounding_source_ids") or []))
        or len(str(v.get("test_sketch") or "").strip()) >= K["min_test_sketch"]
        for v in support
    )
    if len(support) >= 2 and grounded:
        return "promoted"
    if len(support) >= 2:
        return "needs_grounding"
    return "quarantined"


def claim_decision(checks, unknown_ids):
    refuted = sum(1 for c in checks if c and c.get("refuted"))
    if refuted >= 2:
        return "remove"
    if refuted == 1 or unknown_ids:
        return "soften"
    return "keep"


def rel_path(p, project_dir):
    """Path relative to the project folder (project_dir like "research/<slug>"), as the JS rel()."""
    p = str(p or "").strip()
    if p.startswith("./"):
        p = p[2:]
    return p[len(project_dir) + 1:] if p.startswith(project_dir + "/") else p


def issue_key(issue, project_dir):
    code = re.sub(r"[^A-Z0-9_]", "", str(issue.get("code") or "").upper())[:40]
    return f"{slug(rel_path(issue.get('target'), project_dir))[:60]}#{code}"


# --------------------------------------------------------------------------------------------
# Replays over recorded fragments
# --------------------------------------------------------------------------------------------
class Fragments:
    """Reads the fragments of one stage run: <project>/_fragments/<stage>/run<N>/<slug(label)>.json"""

    def __init__(self, project, stage, run):
        self.dir = pathlib.Path(project) / "_fragments" / stage / f"run{run}"
        self.read = set()

    def get(self, label):
        p = self.dir / f"{slug(label)}.json"
        self.read.add(p.name)
        if not p.is_file():
            return None
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return None

    def exists(self):
        return self.dir.is_dir()


def _add_verdicts(by_key, agent_id, batch, verdicts):
    keys = {c["key"] for c in batch}
    for v in verdicts or []:
        k = v.get("key")
        e = by_key.get(k)
        if not e or k not in keys or any(x["agent"] == agent_id for x in e["v"]):
            continue
        e["v"].append(dict(v, agent=agent_id))


def _screen_wave(fr, cands, wave, sc, apis, results, records):
    W = f"w{wave}"
    by_key = {c["key"]: {"c": c, "v": [], "meta": None} for c in cands}
    for bi, b in enumerate(chunk(cands, sc["src"]["t1Batch"])):
        for aid in K["tier1"]:
            r = fr.get(f"{W} t1 b{pad(bi + 1)} {aid}")
            if r:
                _add_verdicts(by_key, aid, b, r.get("verdicts"))
    ignored, survivors = [], []
    for c in cands:
        e = by_key[c["key"]]
        s02 = next((v for v in e["v"] if v["agent"] == "S02" and v.get("metadata")), None)
        meta = s02["metadata"] if s02 else None
        s05 = next((v for v in e["v"] if v["agent"] == "S05"), None)
        s07 = next((v for v in e["v"] if v["agent"] == "S07"), None)
        g1 = tier1_gate(meta, s05, s07, apis)
        crit = critical_fails(e["v"], ignored)
        e["meta"] = meta
        if g1["status"] == "rejected" or crit:
            results[c["key"]] = {"status": "rejected", "reasons": g1["reasons"] + crit, "wave": wave}
        else:
            survivors.append(c)
    t2_ids = K["tier2"] + [K["tier2_empirical_extra"]]
    batches2 = chunk(survivors, sc["src"]["t2Batch"])
    for bi, b in enumerate(batches2):
        for aid in t2_ids:
            r = fr.get(f"{W} t2 b{pad(bi + 1)} {aid}")
            if r:
                _add_verdicts(by_key, aid, b, r.get("verdicts"))
    admitted = []
    for b in batches2:
        for c in b:
            e = by_key[c["key"]]
            t2v = [v for v in e["v"] if v["agent"] not in K["tier1"]]
            crit = critical_fails(t2v, ignored)
            if crit:
                results[c["key"]] = {"status": "rejected", "reasons": crit, "wave": wave}
            elif len({v["agent"] for v in t2v}) < K["min_tier2_verdicts"]:
                results[c["key"]] = {"status": "rejected", "reasons": ["NOT_BACKGROUND_CHECKED"], "wave": wave}
            else:
                results[c["key"]] = {"status": "accepted", "grade": grade_of(e["meta"], e["v"]), "wave": wave}
                admitted.append(c)
    vetoed = []
    for bi, b in enumerate(chunk(admitted, sc["src"]["t2Batch"])):
        r = fr.get(f"{W} audit b{pad(bi + 1)} C04")
        keys = {c["key"] for c in b}
        for v in (r or {}).get("vetoes") or []:
            if v.get("key") not in keys:
                continue
            if evidenced(v):
                if not any(x["key"] == v["key"] for x in vetoed):
                    vetoed.append(v)
            else:
                ignored.append(f"C04:{v.get('key')}:{v.get('code')}")
    if vetoed:
        rr = [fr.get(f"{W} rereview {aid}") for aid in ("S08", "S10")]
        for v in vetoed:
            ups = [next((d for d in (r or {}).get("decisions") or [] if d.get("key") == v["key"]), None) for r in rr if r]
            ups = [u for u in ups if u]
            if not (len(ups) == 2 and all(u.get("uphold_admission") is True for u in ups)):
                results[v["key"]] = {"status": "rejected", "reasons": [f"C04:{str(v.get('code') or 'VETO').upper()}"], "wave": wave}
            by_key[v["key"]]["veto"] = v
    for k, e in by_key.items():
        records[k] = {"candidate": e["c"], "meta": e["meta"], "verdicts": e["v"], "veto": e.get("veto")}
    return {"ignored": ignored, "admitted": [c for c in admitted if results[c["key"]]["status"] == "accepted"]}


def replay_sources_run(project, run, scale, apis, seen, offset):
    """Replays one sources-stage run. `seen` (set of normalised keys) and `offset` (last SRC number)
    carry over from earlier runs. Returns (results, records, ignored, new_offset)."""
    sc = K["scales"][scale]
    fr = Fragments(project, "sources", run)
    cands = []
    for sid in K["source_scouts"][: sc["src"]["scouts"]]:
        r = fr.get(f"scout {sid}")
        for c in (r or {}).get("candidates") or []:
            nk = norm_key(c)
            if nk in seen:
                continue
            seen.add(nk)
            cands.append(dict(c, nk=nk, found_by=sid))
    cands = cands[: sc["src"]["maxCandidates"]]
    for c in cands:
        offset += 1
        c["key"] = f"SRC-{pad(offset, 4)}"
    results, records = {}, {}
    w1 = _screen_wave(fr, cands, 1, sc, apis, results, records)
    ignored = list(w1["ignored"])
    ch = fr.get("chain S09") if sc["src"]["chainWave"] and w1["admitted"] else None
    if ch:
        more = []
        for c in ch.get("candidates") or []:
            nk = norm_key(c)
            if nk in seen:
                continue
            seen.add(nk)
            more.append(dict(c, nk=nk, found_by="S09"))
        more = more[: sc["src"]["chainMax"]]
        for c in more:
            offset += 1
            c["key"] = f"SRC-{pad(offset, 4)}"
        if more:
            w2 = _screen_wave(fr, more, 2, sc, apis, results, records)
            ignored += w2["ignored"]
    return results, records, ignored, offset


def replay_theory_run(project, run, scale, accepted, frontier_ids):
    sc = K["scales"][scale]
    fr = Fragments(project, "theory", run)
    seen, ideas = set(), []
    for fid in frontier_ids:
        r = fr.get(f"ideas {fid}")
        for n, x in enumerate((r or {}).get("ideas") or []):
            t = re.sub(r"[^a-z0-9]+", "", str(x.get("title") or "").lower())
            if not t or t in seen:
                continue
            seen.add(t)
            ideas.append(dict(x, key=run_key("IDEA", f"{fid}-{n + 1}", run), by=fid))
    ideas = ideas[: sc["ideasMax"]]
    tv, cv, gv = K["theory_voters"], K["critic_voters"], K["ground_voters"]
    votes = {i["key"]: [] for i in ideas}
    for bi, b in enumerate(chunk(ideas, sc["voteBatch"])):
        for vid in (tv[bi % len(tv)], cv[bi % len(cv)], gv[bi % len(gv)]):
            r = fr.get(f"vote b{pad(bi + 1)} {vid}")
            if not r:
                continue
            for idea in b:
                v = next((x for x in r.get("votes") or [] if x.get("idea_key") == idea["key"]), None)
                if v:
                    votes[idea["key"]].append(dict(v, voter=vid))
    out = []
    for idea in ideas:
        out.append(dict(idea, status=promote_idea(votes[idea["key"]], accepted), votes=votes[idea["key"]]))
    return out


def replay_experiments_run(project, run, scale):
    sc = K["scales"][scale]
    fr = Fragments(project, "experiments", run)
    plan = fr.get("experiment plan")
    out = {}
    for i, x in enumerate(((plan or {}).get("experiments") or [])[: sc["experiments"]]):
        eid = run_key("EXP", pad(i + 1), run)
        e = {"exp_id": eid, "title": x.get("title"), "kind": x.get("kind"), "design_path": x.get("design_path"),
             "hypothesis_ids": x.get("hypothesis_ids") or []}
        if x.get("kind") == "protocol":
            e["status"] = "protocol"
        else:
            b, rr = fr.get(f"build {eid} E04"), fr.get(f"rerun {eid} E09")
            ro, a = fr.get(f"robust {eid} E07"), fr.get(f"audit {eid} E11")
            valid = bool(b and b.get("ran") and rr and rr.get("reproduced") and a and a.get("verdict") == "valid" and a.get("numbers_traceable"))
            e["status"] = "valid" if valid else ("not_run" if not b else ("failed_to_run" if not b.get("ran") else "unverified"))
            e["robustness"] = (ro or {}).get("robust", "not_tested")
            e["results_path"] = (b or {}).get("results_path")
            e["headline"] = (b or {}).get("headline")
        out[eid] = e
    return out


def replay_review_run(project, run, scale, critic_ids, roster_order, project_dir):
    sc = K["scales"][scale]
    fr = Fragments(project, "review", run)
    issues = {}
    for cid in critic_ids:
        r = fr.get(f"review {cid}")
        for x in (r or {}).get("issues") or []:
            key = issue_key(x, project_dir)
            if key not in issues:
                issues[key] = {"key": key, "target": x.get("target"), "code": x.get("code"), "severity": x.get("severity"),
                               "rationale": x.get("rationale"), "raised_by": [cid], "resolved": False}
            else:
                issues[key]["raised_by"].append(cid)
                if x.get("severity") == "blocking":
                    issues[key]["severity"] = "blocking"
    order = {a: i for i, a in enumerate(roster_order)}
    for c in range(1, sc["reviewCycles"] + 1):
        open_ = sorted([x for x in issues.values() if x["severity"] == "blocking" and not x["resolved"]], key=lambda x: x["key"])
        if not open_:
            break
        rereviewers = sorted({x["raised_by"][0] for x in open_}, key=lambda a: (order.get(a, 999), a))[: sc["maxRereviewers"]]
        for rid in rereviewers:
            r = fr.get(f"recheck c{c} {rid}")
            for x in (r or {}).get("checks") or []:
                iss = issues.get(x.get("issue_key"))
                if iss and iss["raised_by"][0] == rid and x.get("resolved"):
                    iss["resolved"] = True
        still = [x for x in open_ if not x["resolved"]]
        if still:
            d = fr.get(f"downgrade c{c}")
            for x in (d or {}).get("downgrades") or []:
                iss = issues.get(x.get("issue_key"))
                if (iss and iss["severity"] == "blocking" and not iss["resolved"]
                        and len(str(x.get("justification") or "").strip()) >= K["min_downgrade_justification"]):
                    iss["severity"] = "major"
                    iss["downgraded"] = str(x.get("justification"))[:600]
    return sorted(issues.values(), key=lambda x: x["key"])


def replay_manuscript_run(project, run, scale, accepted, valid_exps):
    sc = K["scales"][scale]
    fr = Fragments(project, "manuscript", run)
    ex = fr.get("claims C11")
    claims = []
    for i, c in enumerate(((ex or {}).get("claims") or [])[: sc["maxClaims"]]):
        claims.append(dict(c, key=run_key("CLM", pad(i + 1, 3), run)))
    lenses = K["claim_lenses"]
    out = []
    for bi, b in enumerate(chunk(claims, sc["claimBatch"])):
        frs = [(lid, fr.get(f"verify b{pad(bi + 1)} {lid}")) for lid in lenses]
        for c in b:
            unknown = [i for i in (c.get("cited_ids") or []) if i not in accepted] + \
                      [i for i in (c.get("result_ids") or []) if i not in valid_exps]
            cs, ran = [], 0
            for lid, r in frs:
                if not r:
                    continue
                ran += 1
                v = next((x for x in r.get("checks") or [] if x.get("claim_key") == c["key"]), None)
                if v:
                    cs.append(dict(v, lens=lid))
            d = claim_decision(cs, unknown)
            if ran < len(lenses) and d == "keep":
                d = "soften"
            out.append(dict(c, decision=d, unknown_ids=unknown, checks=cs))
    return out
