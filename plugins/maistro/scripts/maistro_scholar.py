#!/usr/bin/env python3
"""Maistro scholarly metadata CLI (Python standard library only). Every command prints JSON.

  resolve <doi|arXiv id|PMID|PMCID> [--title T] [--year Y] [--surname S]
  work <doi|OpenAlex W-id>
  author <name|ORCID|OpenAlex A-id>
  venue <ISSN|name>
  retraction <doi>
  search "<query>" [--limit N] [--from-year Y]
  policy-check <record.json> [--apis-unavailable]
  ping

Sources: Crossref, OpenAlex, arXiv, PubMed E-utilities, DOAJ. Set MAISTRO_MAILTO to join the
Crossref/OpenAlex polite pools. Exit codes: 0 ok, 1 not found / bad input, 2 network unreachable.
For offline tests, MAISTRO_FIXTURES points at a directory whose index.json maps URLs to files.
"""
import argparse
import difflib
import json
import os
import pathlib
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import maistro_gates  # noqa: E402

TIMEOUT = 20
CROSSREF = "https://api.crossref.org"
OPENALEX = "https://api.openalex.org"
ARXIV = "https://export.arxiv.org/api/query"
EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
DOAJ = "https://doaj.org/api"

CROSSREF_TYPES = {
    "journal-article": "journal-article",
    "proceedings-article": "conference-paper",
    "posted-content": "preprint",
    "book": "book",
    "monograph": "book",
    "edited-book": "book",
    "reference-book": "book",
    "book-chapter": "book-chapter",
    "book-section": "book-chapter",
    "book-part": "book-chapter",
    "dissertation": "thesis",
    "dataset": "dataset",
    "report": "report",
    "report-component": "report",
    "standard": "standard",
}
OPENALEX_TYPES = {
    "article": "journal-article",
    "review": "review-article",
    "preprint": "preprint",
    "book": "book",
    "book-chapter": "book-chapter",
    "dissertation": "thesis",
    "dataset": "dataset",
    "report": "report",
    "standard": "standard",
}


class Unreachable(Exception):
    pass


class NotFound(Exception):
    pass


# --------------------------------------------------------------------------------------------
# HTTP
# --------------------------------------------------------------------------------------------
def _fixture(url):
    d = os.environ.get("MAISTRO_FIXTURES")
    if not d:
        return None
    index = json.loads((pathlib.Path(d) / "index.json").read_text(encoding="utf-8"))
    if url not in index:
        raise Unreachable(f"no fixture for {url}")
    entry = index[url]
    if entry is None:
        raise NotFound(url)
    return (pathlib.Path(d) / entry).read_bytes()


def fetch(url, accept="application/json"):
    body = _fixture(url)
    if body is not None:
        return body
    mailto = os.environ.get("MAISTRO_MAILTO", "")
    ua = "maistro-research-lab/0.1 (https://github.com/bn7ya/maistro" + (f"; mailto:{mailto}" if mailto else "") + ")"
    req = urllib.request.Request(url, headers={"User-Agent": ua, "Accept": accept})
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        if e.code == 404:
            raise NotFound(url)
        raise Unreachable(f"HTTP {e.code} from {urllib.parse.urlsplit(url).netloc}")
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        raise Unreachable(f"{urllib.parse.urlsplit(url).netloc}: {e}")


def get_json(url):
    return json.loads(fetch(url).decode("utf-8"))


def q(s):
    return urllib.parse.quote(str(s), safe="")


def polite(url):
    mailto = os.environ.get("MAISTRO_MAILTO")
    if not mailto:
        return url
    return url + ("&" if "?" in url else "?") + "mailto=" + q(mailto)


# --------------------------------------------------------------------------------------------
# Identifier handling and matching
# --------------------------------------------------------------------------------------------
def classify_id(raw):
    s = str(raw).strip()
    m = re.match(r"^(?:https?://(?:dx\.)?doi\.org/|doi:)?(10\.\d{4,9}/\S+)$", s, re.I)
    if m:
        return "doi", m.group(1).rstrip(".")
    m = re.match(r"^(?:arxiv:|https?://arxiv\.org/abs/)?(\d{4}\.\d{4,5}(?:v\d+)?|[a-z\-]+(?:\.[A-Z]{2})?/\d{7}(?:v\d+)?)$", s, re.I)
    if m:
        return "arxiv", m.group(1)
    m = re.match(r"^(?:pmcid:)?(PMC\d+)$", s, re.I)
    if m:
        return "pmcid", m.group(1).upper()
    m = re.match(r"^(?:pmid:)?(\d{1,9})$", s, re.I)
    if m:
        return "pmid", m.group(1)
    return None, s


def norm_title(t):
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]+", " ", str(t or "").lower())).strip()


def match_score(meta, title=None, year=None, surname=None):
    """Weighted agreement between what the agent claims and what the registry says (0–1)."""
    parts = []
    if title:
        parts.append((0.6, difflib.SequenceMatcher(None, norm_title(title), norm_title(meta.get("title"))).ratio()))
    if year:
        y = meta.get("year") or 0
        parts.append((0.2, 1.0 if int(year) == y else 0.5 if abs(int(year) - y) == 1 else 0.0))
    if surname:
        s = norm_title(surname)
        names = [norm_title(a.get("name")) for a in meta.get("authors") or []]
        parts.append((0.2, 1.0 if any(s and s in n.split() for n in names) else 0.0))
    if not parts:
        return None
    w = sum(p[0] for p in parts)
    return round(sum(p[0] * p[1] for p in parts) / w, 3)


# --------------------------------------------------------------------------------------------
# Crossref / OpenAlex / arXiv / PubMed parsers
# --------------------------------------------------------------------------------------------
def crossref_meta(msg):
    authors = []
    for a in msg.get("author") or []:
        if a.get("family"):
            authors.append({"name": " ".join(x for x in (a.get("given"), a.get("family")) if x), "kind": "person",
                            "orcid": (a.get("ORCID") or "").rsplit("/", 1)[-1]})
        elif a.get("name"):
            authors.append({"name": a["name"], "kind": "org"})
    parts = ((msg.get("issued") or msg.get("published") or {}).get("date-parts") or [[None]])[0]
    year = parts[0] if parts and parts[0] else 0
    date = "-".join(pad for pad in [str(parts[0]) if len(parts) > 0 and parts[0] else None,
                                    f"{parts[1]:02d}" if len(parts) > 1 and parts[1] else None,
                                    f"{parts[2]:02d}" if len(parts) > 2 and parts[2] else None] if pad)
    typ = CROSSREF_TYPES.get(msg.get("type"), msg.get("type") or "unknown")
    return {
        "title": (msg.get("title") or [""])[0],
        "authors": authors,
        "year": year,
        "date": date,
        "identifier": {"type": "doi", "value": msg.get("DOI", "").lower()},
        "type": typ,
        "venue": (msg.get("container-title") or [""])[0],
        "publisher": msg.get("publisher", ""),
        "url": msg.get("URL", ""),
        "peer_reviewed": typ in ("journal-article", "conference-paper", "book-chapter") or None,
        "issn": msg.get("ISSN") or [],
        "funders": [f.get("name") for f in msg.get("funder") or [] if f.get("name")],
        "updated_by": [{"type": u.get("type"), "doi": u.get("DOI")} for u in msg.get("updated-by") or []],
        "references_count": msg.get("references-count"),
        "cited_by_count": msg.get("is-referenced-by-count"),
    }


def openalex_meta(w):
    authors = [{"name": (a.get("author") or {}).get("display_name", ""), "kind": "person",
                "orcid": ((a.get("author") or {}).get("orcid") or "").rsplit("/", 1)[-1],
                "institutions": [i.get("display_name") for i in a.get("institutions") or []]}
               for a in w.get("authorships") or []]
    src = ((w.get("primary_location") or {}).get("source") or {})
    doi = (w.get("doi") or "").replace("https://doi.org/", "").lower()
    return {
        "openalex_id": (w.get("id") or "").rsplit("/", 1)[-1],
        "title": w.get("title") or w.get("display_name") or "",
        "authors": authors,
        "year": w.get("publication_year") or 0,
        "date": w.get("publication_date") or "",
        "identifier": {"type": "doi", "value": doi} if doi else {"type": "none", "value": ""},
        "type": OPENALEX_TYPES.get(w.get("type"), w.get("type") or "unknown"),
        "venue": src.get("display_name", ""),
        "publisher": src.get("host_organization_name", ""),
        "venue_is_in_doaj": src.get("is_in_doaj"),
        "issn_l": src.get("issn_l"),
        "is_retracted": w.get("is_retracted"),
        "is_paratext": w.get("is_paratext"),
        "cited_by_count": w.get("cited_by_count"),
        "referenced_works_count": len(w.get("referenced_works") or []),
        "funders": [g.get("funder_display_name") for g in w.get("grants") or [] if g.get("funder_display_name")],
        "open_access": (w.get("open_access") or {}).get("oa_status"),
        "language": w.get("language"),
    }


def arxiv_meta(xml_bytes):
    ns = {"a": "http://www.w3.org/2005/Atom", "arxiv": "http://arxiv.org/schemas/atom"}
    root = ET.fromstring(xml_bytes)
    e = root.find("a:entry", ns)
    if e is None or e.find("a:title", ns) is None:
        raise NotFound("arXiv entry")
    pid = (e.findtext("a:id", default="", namespaces=ns) or "").rsplit("/abs/", 1)[-1]
    published = e.findtext("a:published", default="", namespaces=ns) or ""
    doi = e.findtext("arxiv:doi", default="", namespaces=ns) or ""
    return {
        "title": re.sub(r"\s+", " ", e.findtext("a:title", default="", namespaces=ns)).strip(),
        "authors": [{"name": a.findtext("a:name", default="", namespaces=ns), "kind": "person"} for a in e.findall("a:author", ns)],
        "year": int(published[:4]) if published[:4].isdigit() else 0,
        "date": published[:10],
        "identifier": {"type": "arxiv", "value": re.sub(r"v\d+$", "", pid)},
        "type": "preprint",
        "venue": "arXiv",
        "publisher": "arXiv",
        "url": f"https://arxiv.org/abs/{pid}",
        "peer_reviewed": False,
        "journal_doi": doi.lower(),
        "journal_ref": e.findtext("arxiv:journal_ref", default="", namespaces=ns) or "",
    }


def pubmed_meta(summary, pmid):
    r = (summary.get("result") or {}).get(str(pmid))
    if not r or r.get("error"):
        raise NotFound(f"PMID {pmid}")
    ids = {x.get("idtype"): x.get("value") for x in r.get("articleids") or []}
    pubtypes = [p.lower() for p in r.get("pubtype") or []]
    y = re.match(r"(\d{4})", r.get("pubdate") or "")
    typ = "meta-analysis" if "meta-analysis" in pubtypes else "review-article" if "review" in pubtypes else "journal-article"
    return {
        "title": r.get("title", "").rstrip("."),
        "authors": [{"name": a.get("name", ""), "kind": "person" if a.get("authtype", "Author") == "Author" else "org"} for a in r.get("authors") or []],
        "year": int(y.group(1)) if y else 0,
        "date": r.get("sortpubdate", "")[:10].replace("/", "-"),
        "identifier": {"type": "pmid", "value": str(pmid)},
        "doi": (ids.get("doi") or "").lower(),
        "type": typ,
        "venue": r.get("fulljournalname") or r.get("source", ""),
        "publisher": "",
        "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
        "peer_reviewed": True,
        "pubtypes": r.get("pubtype") or [],
        "retracted": "retracted publication" in pubtypes,
    }


# --------------------------------------------------------------------------------------------
# Commands
# --------------------------------------------------------------------------------------------
def cmd_resolve(a):
    kind, val = classify_id(a.id)
    if not kind:
        raise NotFound(f"not a DOI, arXiv id, PMID or PMCID: {a.id}")
    meta, source = None, None
    if kind == "doi":
        try:
            meta, source = crossref_meta(get_json(polite(f"{CROSSREF}/works/{q(val)}"))["message"]), "crossref"
        except NotFound:
            meta, source = openalex_meta(get_json(polite(f"{OPENALEX}/works/doi:{q(val)}"))), "openalex"
    elif kind == "arxiv":
        meta, source = arxiv_meta(fetch(f"{ARXIV}?id_list={q(val)}", accept="application/atom+xml")), "arxiv"
    elif kind in ("pmid", "pmcid"):
        pmid = val
        if kind == "pmcid":
            conv = get_json(f"https://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/?ids={q(val)}&format=json")
            pmid = ((conv.get("records") or [{}])[0]).get("pmid")
            if not pmid:
                raise NotFound(val)
        meta, source = pubmed_meta(get_json(f"{EUTILS}/esummary.fcgi?db=pubmed&id={q(pmid)}&retmode=json"), pmid), "pubmed"
    score = match_score(meta, a.title, a.year, a.surname)
    return {
        "ok": True,
        "resolved": True,
        "source": source,
        "match_score": score,
        "match_note": "no title/year/surname given to compare" if score is None else
                      ("matches" if score >= maistro_gates.POLICY["min_match_score"] else "DOES NOT MATCH the claimed reference"),
        "metadata": meta,
    }


def cmd_work(a):
    kind, val = classify_id(a.id)
    path = f"doi:{q(val)}" if kind == "doi" else q(a.id)
    return {"ok": True, "work": openalex_meta(get_json(polite(f"{OPENALEX}/works/{path}")))}


def cmd_author(a):
    s = a.query.strip()
    if re.match(r"^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$", s):
        data = {"results": [get_json(polite(f"{OPENALEX}/authors/orcid:{s}"))]}
    elif re.match(r"^A\d+$", s):
        data = {"results": [get_json(polite(f"{OPENALEX}/authors/{s}"))]}
    else:
        data = get_json(polite(f"{OPENALEX}/authors?search={q(s)}&per-page=5"))
    out = []
    for r in data.get("results") or []:
        aid = (r.get("id") or "").rsplit("/", 1)[-1]
        retracted = None
        try:
            retracted = (get_json(polite(f"{OPENALEX}/works?filter=author.id:{aid},is_retracted:true&per-page=1")).get("meta") or {}).get("count")
        except (Unreachable, NotFound):
            pass
        stats = r.get("summary_stats") or {}
        out.append({
            "openalex_id": aid,
            "name": r.get("display_name"),
            "orcid": (r.get("orcid") or "").rsplit("/", 1)[-1],
            "works_count": r.get("works_count"),
            "cited_by_count": r.get("cited_by_count"),
            "h_index": stats.get("h_index"),
            "i10_index": stats.get("i10_index"),
            "institutions": [i.get("display_name") for i in r.get("last_known_institutions") or []],
            "affiliations": [(x.get("institution") or {}).get("display_name") for x in (r.get("affiliations") or [])[:8]],
            "retracted_works": retracted,
        })
    return {"ok": True, "candidates": out, "note": "Name matches are ambiguous: confirm by ORCID, affiliation and works."}


def cmd_venue(a):
    s = a.query.strip()
    if re.match(r"^\d{4}-\d{3}[\dX]$", s, re.I):
        data = get_json(polite(f"{OPENALEX}/sources?filter=issn:{s}"))
    else:
        data = get_json(polite(f"{OPENALEX}/sources?search={q(s)}&per-page=5"))
    out = []
    for r in data.get("results") or []:
        issn = r.get("issn_l") or (r.get("issn") or [None])[0]
        doaj = None
        if issn:
            try:
                d = get_json(f"{DOAJ}/search/journals/issn:{q(issn)}")
                doaj = {"listed": (d.get("total") or 0) > 0}
                if d.get("results"):
                    bib = (d["results"][0].get("bibjson") or {})
                    doaj.update({"publisher": (bib.get("publisher") or {}).get("name"), "review_process": (bib.get("editorial") or {}).get("review_process")})
            except (Unreachable, NotFound):
                doaj = {"listed": None, "note": "DOAJ unreachable"}
        out.append({
            "openalex_id": (r.get("id") or "").rsplit("/", 1)[-1],
            "name": r.get("display_name"),
            "issn_l": r.get("issn_l"),
            "issn": r.get("issn"),
            "type": r.get("type"),
            "publisher": r.get("host_organization_name"),
            "is_in_doaj": r.get("is_in_doaj"),
            "is_oa": r.get("is_oa"),
            "apc_usd": r.get("apc_usd"),
            "works_count": r.get("works_count"),
            "cited_by_count": r.get("cited_by_count"),
            "doaj": doaj,
        })
    return {"ok": True, "venues": out}


def cmd_retraction(a):
    kind, val = classify_id(a.id)
    if kind != "doi":
        raise NotFound("retraction checks need a DOI")
    notices = []
    try:
        data = get_json(polite(f"{CROSSREF}/works?filter=updates:{q(val)}&rows=20"))
        for it in (data.get("message") or {}).get("items") or []:
            for u in it.get("update-to") or []:
                if str(u.get("DOI", "")).lower() == val.lower():
                    notices.append({"type": u.get("type"), "notice_doi": it.get("DOI"), "date": ((u.get("updated") or {}).get("date-parts") or [[None]])[0]})
    except NotFound:
        pass
    updated_by = []
    try:
        msg = get_json(polite(f"{CROSSREF}/works/{q(val)}"))["message"]
        updated_by = [{"type": u.get("type"), "doi": u.get("DOI"), "source": u.get("source")} for u in msg.get("updated-by") or []]
    except NotFound:
        pass
    oa_retracted = None
    try:
        oa_retracted = get_json(polite(f"{OPENALEX}/works/doi:{q(val)}")).get("is_retracted")
    except (NotFound, Unreachable):
        pass
    types = {str(n.get("type") or "").lower() for n in notices + updated_by}
    return {
        "ok": True,
        "doi": val.lower(),
        "retracted": bool("retraction" in types or "withdrawal" in types or oa_retracted),
        "expression_of_concern": "expression_of_concern" in types or "expression-of-concern" in types,
        "corrections": sorted(t for t in types if t in ("correction", "erratum", "corrigendum", "addendum")),
        "notices": notices,
        "updated_by": updated_by,
        "openalex_is_retracted": oa_retracted,
    }


def cmd_search(a):
    flt = f"&filter=from_publication_date:{int(a.from_year)}-01-01" if a.from_year else ""
    limit = max(1, min(int(a.limit), 50))
    try:
        data = get_json(polite(f"{OPENALEX}/works?search={q(a.query)}&per-page={limit}{flt}"))
        res = [openalex_meta(w) for w in data.get("results") or []]
        src = "openalex"
    except Unreachable:
        data = get_json(polite(f"{CROSSREF}/works?query.bibliographic={q(a.query)}&rows={limit}"))
        res = [crossref_meta(m) for m in (data.get("message") or {}).get("items") or []]
        src = "crossref"
    slim = [{
        "title": r.get("title"),
        "authors": [x.get("name") for x in r.get("authors") or []][:6],
        "year": r.get("year"),
        "identifier": r.get("identifier"),
        "type": r.get("type"),
        "venue": r.get("venue"),
        "cited_by_count": r.get("cited_by_count"),
        "is_retracted": r.get("is_retracted"),
    } for r in res]
    return {"ok": True, "source": src, "results": slim}


def cmd_policy_check(a):
    rec = json.loads(pathlib.Path(a.record).read_text(encoding="utf-8"))
    meta = rec.get("metadata", rec)
    s05 = {"retracted": rec.get("retracted")} if "retracted" in rec else None
    s07 = {"assessed_type": rec.get("assessed_type")} if rec.get("assessed_type") else None
    g = maistro_gates.tier1_gate(meta, s05, s07, False if a.apis_unavailable else True)
    return {"ok": True, "status": "would_pass_tier1" if g["status"] == "pass" else "rejected", "reasons": g["reasons"]}


def cmd_ping(_a):
    checks = {
        "crossref": polite(f"{CROSSREF}/works?rows=0"),
        "openalex": polite(f"{OPENALEX}/works?per-page=1"),
        "arxiv": f"{ARXIV}?id_list=1706.03762",
        "pubmed": f"{EUTILS}/einfo.fcgi?retmode=json",
        "doaj": f"{DOAJ}/search/journals/issn:1932-6203",
    }
    out = {}
    for name, url in checks.items():
        try:
            fetch(url)
            out[name] = True
        except (Unreachable, NotFound):
            out[name] = False
    out["apis_available"] = bool(out["crossref"] or out["openalex"])
    return dict(ok=True, **out)


def main(argv=None):
    p = argparse.ArgumentParser(prog="maistro_scholar", description="Scholarly metadata for the Maistro lab (JSON output).")
    sub = p.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("resolve")
    r.add_argument("id")
    r.add_argument("--title")
    r.add_argument("--year", type=int)
    r.add_argument("--surname")
    sub.add_parser("work").add_argument("id")
    sub.add_parser("author").add_argument("query")
    sub.add_parser("venue").add_argument("query")
    sub.add_parser("retraction").add_argument("id")
    s = sub.add_parser("search")
    s.add_argument("query")
    s.add_argument("--limit", default=10)
    s.add_argument("--from-year")
    pc = sub.add_parser("policy-check")
    pc.add_argument("record")
    pc.add_argument("--apis-unavailable", action="store_true")
    sub.add_parser("ping")
    a = p.parse_args(argv)
    fn = {"resolve": cmd_resolve, "work": cmd_work, "author": cmd_author, "venue": cmd_venue,
          "retraction": cmd_retraction, "search": cmd_search, "policy-check": cmd_policy_check, "ping": cmd_ping}[a.cmd]
    try:
        out, code = fn(a), 0
    except NotFound as e:
        out, code = {"ok": False, "resolved": False, "error": f"not found: {e}"}, 1
    except Unreachable as e:
        out, code = {"ok": False, "unreachable": True, "error": str(e),
                     "advice": "API unreachable: verify on the publisher's page with WebFetch and record the evidence URL."}, 2
    except (ValueError, KeyError) as e:
        out, code = {"ok": False, "error": f"unexpected response: {e}"}, 1
    print(json.dumps(out, ensure_ascii=False, indent=1))
    return code


if __name__ == "__main__":
    sys.exit(main())
