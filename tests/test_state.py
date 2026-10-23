"""End-to-end: maistro_state.py drives the real lab-stage workflow (with scripted agents) from init
to done, exactly as the /maistro:research skill does."""
import json
import pathlib
import shutil
import subprocess
import tempfile
import unittest

from helpers import ROOT, run_script

NODE = shutil.which("node")
PD = "research/e2e-test"
STAGES = ["methodology", "sources", "theory", "experiments", "review", "manuscript", "arabic"]


class Project:
    def __init__(self):
        self.cwd = tempfile.mkdtemp(prefix="maistro-e2e-")
        self.p = pathlib.Path(self.cwd) / PD

    def state(self, *args):
        r = run_script("maistro_state.py", list(args), cwd=self.cwd, env={"MAISTRO_FIXTURES": str(ROOT / "tests/fixtures/scholar")})
        if r.returncode:
            raise AssertionError(r.stderr or r.stdout)
        return r.stdout

    def run_js(self, args, *flags):
        r = subprocess.run([NODE, str(ROOT / "tests/workflow/run_stage.mjs"), self.cwd, json.dumps(args), *flags],
                           capture_output=True, text=True, timeout=120)
        if r.returncode:
            raise AssertionError(r.stderr)
        return json.loads(r.stdout)["result"]

    def loop(self, *flags, max_runs=20):
        runs = []
        for _ in range(max_runs):
            nxt = self.state("next", PD).strip()
            if nxt == "done":
                return runs
            args = json.loads(nxt)
            result = self.run_js(args, *flags)
            f = self.p / "_runs" / f"{args['stage']}-run{args['run']}.result.json"
            f.write_text(json.dumps(result), encoding="utf-8")
            fin = json.loads(self.state("finish", PD, "--stage", args["stage"], "--summary-file", str(f.relative_to(self.cwd))))
            runs.append((args["stage"], args["mode"], args["run"], fin))
        raise AssertionError(f"did not finish within {max_runs} runs: {[r[:3] for r in runs]}")

    def status(self):
        return json.loads((self.p / "status.json").read_text(encoding="utf-8"))

    def jsonl(self, rel):
        return [json.loads(x) for x in (self.p / rel).read_text(encoding="utf-8").splitlines() if x.strip()]


@unittest.skipUnless(NODE, "node is required for end-to-end tests")
class EndToEnd(unittest.TestCase):
    def setUp(self):
        self.x = Project()
        self.x.state("init", PD, "--scale", "pilot", "--date", "2026-01-01")
        (self.x.p / "idea.md").write_text("# Idea\n\nDoes x cause y?\n", encoding="utf-8")

    def tearDown(self):
        shutil.rmtree(self.x.cwd, ignore_errors=True)

    def test_full_project(self):
        runs = self.x.loop("--files")
        self.assertEqual([r[0] for r in runs], STAGES, "each stage once, no repairs")
        st = self.x.status()
        self.assertTrue(st["finished"])
        self.assertTrue(all(st["stages"][s]["state"] == "done" for s in STAGES))
        for _, _, _, fin in runs:
            self.assertEqual(fin["critical"], 0, fin)

        reg = self.x.jsonl("02-sources/registry.jsonl")
        rej = {r["id"]: r["reasons"] for r in self.x.jsonl("02-sources/rejected.jsonl")}
        self.assertEqual([r["id"] for r in reg], ["SRC-0001", "SRC-0007", "SRC-0011", "SRC-0012", "SRC-0013", "SRC-0014", "SRC-0016"])
        self.assertEqual(rej["SRC-0002"], ["NO_AUTHOR"])
        self.assertEqual(rej["SRC-0003"], ["TYPE_BLOCKED:vendor-whitepaper"])
        self.assertEqual(rej["SRC-0009"], ["C04:MISREPORTED_DESIGN"])
        dossier = (self.x.p / "02-sources/dossiers/SRC-0007.md").read_text(encoding="utf-8")
        self.assertIn("**Admitted**", dossier)
        self.assertIn("MISCONDUCT_RUMOUR", dossier, "the ignored allegation stays visible in the dossier")

        ideas = {i["key"]: i["status"] for i in self.x.jsonl("06-frontier/ideas.jsonl")}
        self.assertEqual(ideas["IDEA-F01-1"], "promoted")
        self.assertEqual(ideas["IDEA-F03-1"], "needs_grounding")
        exps = json.loads((self.x.p / "04-experiments/results-index.json").read_text(encoding="utf-8"))
        self.assertEqual(exps["EXP-01"]["status"], "valid")
        issues = {i["key"]: i for i in self.x.jsonl("05-critique/issues.jsonl")}
        self.assertTrue(issues["01-methodology-design-md#NO_POWER"]["resolved"])
        claims = {c["key"]: c["decision"] for c in self.x.jsonl("manuscript/claims.jsonl")}
        self.assertEqual(claims, {"CLM-001": "keep", "CLM-002": "soften", "CLM-003": "remove", "CLM-004": "soften"})

        en = (self.x.p / "manuscript/paper.en.md").read_text(encoding="utf-8")
        ar = (self.x.p / "manuscript/paper.ar.md").read_text(encoding="utf-8")
        self.assertTrue(en.startswith("# A test charter"))
        self.assertIn('<div dir="rtl">', ar)
        self.assertIn("## المراجع", ar)
        self.assertIn("Finished.", self.x.state("status", PD))

        args = json.loads((self.x.p / "_runs/theory-run1.args.json").read_text(encoding="utf-8"))
        self.assertEqual(args["accepted_ids"], [r["id"] for r in reg])
        self.assertEqual(args["prev_report"], "stage-reports/sources.en.md")

    def test_missing_outputs_trigger_one_repair(self):
        runs = self.x.loop()  # scripted agents write no files: every stage report is missing
        seq = [(s, m) for s, m, _, _ in runs]
        self.assertEqual(seq[:2], [("methodology", "normal"), ("methodology", "repair")])
        self.assertEqual(sum(1 for s, m in seq if m == "repair"), len(STAGES), "exactly one repair per stage, then it moves on")
        self.assertTrue(self.x.status()["finished"])
        rep = json.loads((self.x.p / "_runs/methodology-run2.args.json").read_text(encoding="utf-8"))
        self.assertTrue(any("NO_STAGE_REPORT" in i for i in rep["issues"]))

    def test_revisit_then_update(self):
        runs = self.x.loop("--files", "--revisit")
        seq = [(s, m, n) for s, m, n, _ in runs]
        i = seq.index(("theory", "normal", 1))
        self.assertEqual(seq[i + 1:i + 3], [("sources", "revisit", 2), ("theory", "update", 2)])
        self.assertEqual(self.x.status()["revisits_left"], 0)
        self.assertTrue(self.x.status()["finished"])
        rev = json.loads((self.x.p / "_runs/sources-run2.args.json").read_text(encoding="utf-8"))
        self.assertEqual(rev["issues"], ["add rebuttals"])
        self.assertGreater(rev["source_id_offset"], 0)
        keys = [r["id"] for r in self.x.jsonl("02-sources/registry.jsonl")] + [r["id"] for r in self.x.jsonl("02-sources/rejected.jsonl")]
        self.assertEqual(len(keys), len(set(keys)), "revisit keys never collide with earlier ones")
        idea_keys = [i["key"] for i in self.x.jsonl("06-frontier/ideas.jsonl")]
        self.assertIn("IDEA-F01-1", idea_keys, "ideas from the first theory run are kept")
        self.assertFalse(any(k.startswith("IDEA-R2-") for k in idea_keys), "the update run doesn't re-brainstorm")
        upd = json.loads((self.x.p / "_runs/theory-run2.args.json").read_text(encoding="utf-8"))
        self.assertEqual(upd["mode"], "update")
        self.assertIn("SRC-0018", upd["accepted_ids"], "the update run sees sources admitted in the revisit")

    def test_abandoned_run_is_moved_aside(self):
        args = json.loads(self.x.state("next", PD))
        stale = self.x.p / "_fragments" / args["stage"] / "run1" / "stale.json"
        stale.parent.mkdir(parents=True, exist_ok=True)
        stale.write_text("{}", encoding="utf-8")
        again = json.loads(self.x.state("next", PD))
        self.assertEqual((again["stage"], again["run"]), (args["stage"], 1))
        self.assertFalse(stale.exists())
        self.assertTrue((self.x.p / "_fragments" / args["stage"] / "run1-abandoned1" / "stale.json").exists())

    def test_init_refuses_bad_paths_and_existing_projects(self):
        r = run_script("maistro_state.py", ["init", "/tmp/evil"], cwd=self.x.cwd)
        self.assertNotEqual(r.returncode, 0)
        r = run_script("maistro_state.py", ["init", PD], cwd=self.x.cwd)
        self.assertNotEqual(r.returncode, 0)


if __name__ == "__main__":
    unittest.main()
