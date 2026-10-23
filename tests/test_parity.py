"""The workflow (JS) and maistro_state.py (Python) must reach the same gate decisions from the same
agent results. Each test runs a stage through the scripted lab, which writes fragments as the
recorder hook would, then replays those fragments in Python."""
import json
import pathlib
import shutil
import subprocess
import tempfile
import unittest

from helpers import ROOT
import maistro_gates as G

PD = "research/test-project"
ROSTER = json.loads((ROOT / "plugins/maistro/scripts/roster.json").read_text(encoding="utf-8"))
NODE = shutil.which("node")


def run_js(cwd, args):
    r = subprocess.run([NODE, str(ROOT / "tests/workflow/run_stage.mjs"), cwd, json.dumps(args)],
                       capture_output=True, text=True, timeout=120, cwd=ROOT)
    if r.returncode:
        raise AssertionError(r.stderr)
    return json.loads(r.stdout)["result"]


def base_args(stage, scale, **kw):
    a = {"stage": stage, "project_dir": PD, "date": "2026-01-01", "scale": scale, "mode": "normal", "run": 1,
         "apis_available": True, "revisits_left": 1, "accepted_ids": ["SRC-0001", "SRC-0002"],
         "valid_experiments": ["EXP-01"], "sections": ["01-introduction", "02-results"], "debug": True}
    a.update(kw)
    return a


@unittest.skipUnless(NODE, "node is required for parity tests")
class Parity(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp(prefix="maistro-parity-")
        self.p = pathlib.Path(self.tmp) / PD

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_sources(self):
        for scale in ("pilot", "standard", "full"):
            for apis in (True, False):
                with self.subTest(scale=scale, apis=apis):
                    shutil.rmtree(self.p, ignore_errors=True)
                    js = run_js(self.tmp, base_args("sources", scale, apis_available=apis))["debug"]
                    results, _, _, offset = G.replay_sources_run(self.p, 1, scale, apis, set(), 0)
                    self.assertEqual(results.keys(), js.keys())
                    for k in js:
                        self.assertEqual(results[k]["status"], js[k]["status"], k)
                        self.assertEqual(results[k].get("grade"), js[k].get("grade"), k)
                        self.assertEqual(results[k].get("reasons"), js[k].get("reasons"), k)

    def test_sources_second_run(self):
        js = run_js(self.tmp, base_args("sources", "pilot", run=2, mode="revisit", source_id_offset=40, seen_source_keys=["doi:10.1/a1"]))["debug"]
        results, _, _, offset = G.replay_sources_run(self.p, 2, "pilot", True, {"doi:10.1/a1"}, 40)
        self.assertEqual({k: v["status"] for k, v in results.items()}, {k: v["status"] for k, v in js.items()})
        self.assertEqual(offset, 46)

    def test_theory(self):
        js = run_js(self.tmp, base_args("theory", "pilot"))["debug"]
        frontier = [r["id"] for r in ROSTER if r["division"] == "frontier"]
        py = {i["key"]: i["status"] for i in G.replay_theory_run(self.p, 1, "pilot", {"SRC-0001", "SRC-0002"}, frontier)}
        self.assertEqual(py, js)

    def test_experiments(self):
        js = run_js(self.tmp, base_args("experiments", "standard"))["debug"]
        py = G.replay_experiments_run(self.p, 1, "standard")
        self.assertEqual({k: v["status"] for k, v in py.items()}, {k: v["status"] for k, v in js.items()})

    def test_review(self):
        for scale in ("pilot", "standard"):
            with self.subTest(scale=scale):
                shutil.rmtree(self.p, ignore_errors=True)
                js = run_js(self.tmp, base_args("review", scale))["debug"]
                critics = [r["id"] for r in ROSTER if r["division"] == "critique"]
                py = G.replay_review_run(self.p, 1, scale, critics, [r["id"] for r in ROSTER], PD)
                self.assertEqual({x["key"]: {"severity": x["severity"], "resolved": x["resolved"]} for x in py}, js)

    def test_manuscript(self):
        js = run_js(self.tmp, base_args("manuscript", "pilot"))["debug"]
        py = G.replay_manuscript_run(self.p, 1, "pilot", {"SRC-0001", "SRC-0002"}, {"EXP-01"})
        self.assertEqual({c["key"]: c["decision"] for c in py}, js)


class ConstantsInSync(unittest.TestCase):
    def test_generated_block_matches_json(self):
        js = (ROOT / "plugins/maistro/workflows/lab-stage.js").read_text(encoding="utf-8")
        policy = json.loads((ROOT / "plugins/maistro/scripts/source-policy.json").read_text(encoding="utf-8"))
        consts = json.loads((ROOT / "plugins/maistro/scripts/lab-constants.json").read_text(encoding="utf-8"))
        self.assertIn("const POLICY = " + json.dumps(policy, ensure_ascii=False), js)
        self.assertIn("const K = " + json.dumps(consts, ensure_ascii=False), js)

    def test_build_roster_check_passes(self):
        r = subprocess.run(["python3", str(ROOT / "tools/build_roster.py"), "--check"], capture_output=True, text=True)
        self.assertEqual(r.returncode, 0, r.stdout)


if __name__ == "__main__":
    unittest.main()
