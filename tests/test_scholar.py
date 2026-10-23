import json
import tempfile
import unittest

from helpers import ROOT, run_script

FIX = {"MAISTRO_FIXTURES": str(ROOT / "tests" / "fixtures" / "scholar"), "MAISTRO_MAILTO": ""}


def cli(*args):
    r = run_script("maistro_scholar.py", args, env=FIX)
    return r.returncode, json.loads(r.stdout)


class Resolve(unittest.TestCase):
    def test_doi_matches(self):
        code, out = cli("resolve", "10.1038/nature12373", "--title", "Nanometre-scale thermometry in a living cell", "--year", "2013", "--surname", "Kucsko")
        self.assertEqual(code, 0)
        self.assertEqual(out["source"], "crossref")
        self.assertGreaterEqual(out["match_score"], 0.9)
        m = out["metadata"]
        self.assertEqual(m["year"], 2013)
        self.assertEqual(m["type"], "journal-article")
        self.assertEqual(m["authors"][0], {"name": "G. Kucsko", "kind": "person", "orcid": "0000-0002-1825-0097"})
        self.assertEqual(m["identifier"], {"type": "doi", "value": "10.1038/nature12373"})

    def test_wrong_claim_scores_low(self):
        code, out = cli("resolve", "https://doi.org/10.1038/nature12373", "--title", "Deep learning for protein folding", "--year", "2019", "--surname", "Smith")
        self.assertEqual(code, 0)
        self.assertLess(out["match_score"], 0.5)
        self.assertIn("DOES NOT MATCH", out["match_note"])

    def test_arxiv(self):
        code, out = cli("resolve", "arXiv:1706.03762", "--title", "Attention is all you need", "--surname", "Vaswani")
        self.assertEqual(code, 0)
        self.assertEqual(out["metadata"]["type"], "preprint")
        self.assertEqual(out["metadata"]["identifier"], {"type": "arxiv", "value": "1706.03762"})
        self.assertEqual(out["metadata"]["title"], "Attention Is All You Need")
        self.assertGreaterEqual(out["match_score"], 0.9)

    def test_pubmed(self):
        code, out = cli("resolve", "PMID:12345678")
        self.assertEqual(code, 0)
        self.assertEqual(out["metadata"]["type"], "meta-analysis")
        self.assertEqual(out["metadata"]["year"], 2018)
        self.assertIsNone(out["match_score"])

    def test_org_author(self):
        code, out = cli("resolve", "10.1000/stats.2020")
        self.assertEqual(out["metadata"]["authors"], [{"name": "National Statistics Office", "kind": "org"}])

    def test_not_found(self):
        code, out = cli("resolve", "10.9999/does-not-exist")
        self.assertEqual(code, 1)
        self.assertFalse(out["ok"])

    def test_unreachable_is_reported(self):
        code, out = cli("resolve", "10.5555/no-fixture-for-this")
        self.assertEqual(code, 2)
        self.assertTrue(out["unreachable"])
        self.assertIn("WebFetch", out["advice"])

    def test_bad_identifier(self):
        code, out = cli("resolve", "not an id")
        self.assertEqual(code, 1)


class Retraction(unittest.TestCase):
    def test_retraction_detected(self):
        code, out = cli("retraction", "10.1000/retracted.1")
        self.assertEqual(code, 0)
        self.assertTrue(out["retracted"])
        self.assertEqual(out["notices"][0]["notice_doi"], "10.1000/notice.1")
        self.assertTrue(out["openalex_is_retracted"])


class Search(unittest.TestCase):
    def test_search(self):
        code, out = cli("search", "thermometry living cell", "--limit", "5")
        self.assertEqual(code, 0)
        self.assertEqual(out["results"][0]["identifier"]["value"], "10.1038/nature12373")


class PolicyCheck(unittest.TestCase):
    def check(self, record, *flags):
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
            json.dump(record, f)
        return cli("policy-check", f.name, *flags)[1]

    def test_good_record(self):
        rec = {"metadata": {"title": "T", "authors": [{"name": "Ada Lovelace", "kind": "person"}], "year": 2020,
                            "identifier": {"type": "doi", "value": "10.1/x"}, "type": "journal-article",
                            "resolution": {"method": "cli", "match_score": 0.95}}}
        self.assertEqual(self.check(rec)["status"], "would_pass_tier1")

    def test_bad_records(self):
        out = self.check({"title": "Buy our product", "authors": [], "year": 0, "identifier": {"type": "none", "value": ""},
                          "type": "marketing", "resolution": {"method": "none", "match_score": 0}})
        self.assertEqual(out["status"], "rejected")
        for code in ("NO_AUTHOR", "NO_DATE", "NO_STABLE_ID", "UNRESOLVED", "TYPE_BLOCKED:marketing"):
            self.assertIn(code, out["reasons"])
        out = self.check({"metadata": {"title": "T", "authors": [{"name": "Ada Lovelace", "kind": "person"}], "year": 2020,
                                       "identifier": {"type": "doi", "value": "10.1/x"}, "type": "journal-article",
                                       "resolution": {"method": "cli", "match_score": 0.95}}, "retracted": True})
        self.assertIn("RETRACTED", out["reasons"])


if __name__ == "__main__":
    unittest.main()
