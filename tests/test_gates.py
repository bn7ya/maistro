import unittest

from helpers import meta
import maistro_gates as G


class Tier1Gate(unittest.TestCase):
    def reasons(self, m, s05=None, s07=None, apis=True):
        return G.tier1_gate(m, s05, s07, apis)["reasons"]

    def test_valid_source_passes(self):
        self.assertEqual(G.tier1_gate(meta(), None, None, True)["status"], "pass")

    def test_no_metadata_is_not_verified(self):
        self.assertEqual(self.reasons(None), ["NOT_VERIFIED"])

    def test_no_author_rejected(self):
        self.assertIn("NO_AUTHOR", self.reasons(meta(authors=[])))

    def test_org_author_only_for_allowed_types(self):
        org = [{"name": "Acme Corp", "kind": "org"}]
        self.assertIn("NO_AUTHOR", self.reasons(meta(authors=org)))
        self.assertNotIn("NO_AUTHOR", self.reasons(meta(authors=org, type="official-statistics")))

    def test_no_date_rejected(self):
        self.assertIn("NO_DATE", self.reasons(meta(year=0)))

    def test_no_identifier_rejected(self):
        self.assertIn("NO_STABLE_ID", self.reasons(meta(identifier={"type": "none", "value": ""})))

    def test_unresolved_rejected(self):
        self.assertIn("UNRESOLVED", self.reasons(meta(resolution={"method": "cli", "match_score": 0.6})))
        self.assertIn("UNRESOLVED", self.reasons(meta(resolution={"method": "none", "match_score": 1})))

    def test_web_resolution_only_when_apis_unavailable(self):
        web = {"method": "web", "match_score": 0.95, "evidence_url": "https://publisher.example/a"}
        self.assertIn("UNRESOLVED", self.reasons(meta(resolution=web), apis=True))
        self.assertIn("UNRESOLVED", self.reasons(meta(resolution=web), apis=None))
        self.assertNotIn("UNRESOLVED", self.reasons(meta(resolution=web), apis=False))

    def test_marketing_rejected_by_type_or_assessment(self):
        self.assertIn("TYPE_BLOCKED:marketing", self.reasons(meta(type="marketing")))
        self.assertIn("TYPE_BLOCKED:press-release", self.reasons(meta(type="report"), s07={"assessed_type": "press-release"}))

    def test_unknown_type_not_allowed(self):
        self.assertIn("TYPE_NOT_ALLOWED:blog", self.reasons(meta(type="blog")))

    def test_retracted_rejected(self):
        self.assertIn("RETRACTED", self.reasons(meta(), s05={"retracted": True}))


class Grades(unittest.TestCase):
    def test_design_tier_and_caps(self):
        self.assertEqual(G.grade_of(meta(), [{"agent": "S08", "design_tier": "2"}]), "A")
        self.assertEqual(G.grade_of(meta(type="preprint"), [{"agent": "S08", "design_tier": "1"}]), "B")
        self.assertEqual(G.grade_of(meta(), []), "C")

    def test_only_evidenced_concerns_penalise(self):
        base = [{"agent": "S08", "design_tier": "2"}]
        unevidenced = {"agent": "S03", "verdict": "concern", "severity": "high", "evidence": []}
        evidenced = {"agent": "S03", "verdict": "concern", "severity": "high", "evidence": ["https://pubpeer.com/x"]}
        self.assertEqual(G.grade_of(meta(), base + [unevidenced]), "A")
        self.assertEqual(G.grade_of(meta(), base + [evidenced]), "B")

    def test_failed_replication_and_floor(self):
        vs = [{"agent": "S08", "design_tier": "5"}, {"agent": "S10", "replication_status": "failed"},
              {"agent": "S05", "expression_of_concern": True}]
        self.assertEqual(G.grade_of(meta(), vs), "D")

    def test_unevidenced_critical_is_ignored(self):
        ignored = []
        out = G.critical_fails([{"agent": "S03", "key": "SRC-0001", "verdict": "fail", "severity": "critical", "code": "fraud", "evidence": []}], ignored)
        self.assertEqual(out, [])
        self.assertEqual(len(ignored), 1)
        out = G.critical_fails([{"agent": "S03", "key": "SRC-0001", "verdict": "fail", "severity": "critical", "code": "fraud", "evidence": ["https://ori.hhs.gov/case"]}], ignored)
        self.assertEqual(out, ["S03:FRAUD"])


class FrontierAndClaims(unittest.TestCase):
    def test_promotion_needs_two_votes_and_grounding(self):
        acc = {"SRC-0001"}
        s = lambda **kw: dict({"vote": "support", "grounding_source_ids": [], "test_sketch": ""}, **kw)
        self.assertEqual(G.promote_idea([s(), s()], acc), "needs_grounding")
        self.assertEqual(G.promote_idea([s(grounding_source_ids=["SRC-0001"]), s()], acc), "promoted")
        self.assertEqual(G.promote_idea([s(grounding_source_ids=["SRC-9999"]), s()], acc), "needs_grounding")
        self.assertEqual(G.promote_idea([s(test_sketch="x" * 80), s()], acc), "promoted")
        self.assertEqual(G.promote_idea([s(grounding_source_ids=["SRC-0001"]), {"vote": "oppose"}, None], acc), "quarantined")

    def test_claim_decisions(self):
        self.assertEqual(G.claim_decision([{"refuted": True}, {"refuted": True}, {"refuted": False}], []), "remove")
        self.assertEqual(G.claim_decision([{"refuted": True}, {"refuted": False}], []), "soften")
        self.assertEqual(G.claim_decision([{"refuted": False}], ["SRC-9999"]), "soften")
        self.assertEqual(G.claim_decision([{"refuted": False}] * 3, []), "keep")


class Keys(unittest.TestCase):
    def test_slug_matches_fragment_names(self):
        self.assertEqual(G.slug("w1 t1 b01 S02"), "w1-t1-b01-s02")
        self.assertEqual(G.slug("  --Charter!! "), "charter")

    def test_issue_key_normalises_target(self):
        a = G.issue_key({"target": "research/x/01-methodology/design.md", "code": "no-power"}, "research/x")
        b = G.issue_key({"target": "./01-methodology/design.md", "code": "NO_POWER"}, "research/x")
        self.assertEqual(a, "01-methodology-design-md#NOPOWER")
        self.assertEqual(G.issue_key({"target": "01-methodology/design.md", "code": "NOPOWER"}, "research/x"), a)
        self.assertNotEqual(a, b)

    def test_norm_key(self):
        self.assertEqual(G.norm_key({"identifier": {"type": "doi", "value": "https://doi.org/10.1/ABC"}}), "doi:10.1/abc")
        self.assertEqual(G.norm_key({"identifier": {"type": "none", "value": ""}, "title": "A B!", "year": 2001}), "t:ab:2001")


if __name__ == "__main__":
    unittest.main()
