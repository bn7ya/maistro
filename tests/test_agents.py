import re
import unittest

from helpers import PLUGIN
import build_roster

AGENTS = build_roster.load_agents()
BY_ID = {a["id"]: a for a in AGENTS}
SECTIONS = ["## Mission", "## Methods and standards", "## You own", "## Works with", "## In each stage", "## Red lines"]
TOOLS = {"Read", "Write", "Edit", "Glob", "Grep", "Bash", "WebSearch", "WebFetch"}
COLORS = {"director": "purple", "methodology": "blue", "sources": "green", "theory": "cyan", "experiments": "orange",
          "critique": "red", "frontier": "pink", "editorial": "yellow"}
ID_PREFIX = {"director": "D", "methodology": "M", "sources": "S", "theory": "T", "experiments": "E", "critique": "C",
             "frontier": "F", "editorial": "W"}


def tools(a, key="tools"):
    v = a["frontmatter"].get(key) or ""
    return {t.strip() for t in (v if isinstance(v, list) else v.split(",")) if t.strip()}


class Roster(unittest.TestCase):
    def test_division_sizes(self):
        counts = {}
        for a in AGENTS:
            counts[a["division"]] = counts.get(a["division"], 0) + 1
        for d in ("methodology", "sources", "theory", "experiments", "critique", "frontier"):
            self.assertGreaterEqual(counts.get(d, 0), 10, d)
        self.assertEqual(counts["director"], 1)
        self.assertGreaterEqual(counts["editorial"], 5)
        self.assertEqual(len(AGENTS), 73)

    def test_ids_unique_and_consistent(self):
        self.assertEqual(len(BY_ID), len(AGENTS))
        for a in AGENTS:
            self.assertRegex(a["id"], r"^[DMSTECFW]\d\d$")
            self.assertEqual(a["id"][0], ID_PREFIX[a["division"]], a["path"])
            self.assertEqual(a["h1_id"], a["id"], f"H1 id differs in {a['path'].name}")
            self.assertEqual(a["frontmatter"]["name"], a["path"].stem if a["division"] != "director" else "d00-director")

    def test_models(self):
        for a in AGENTS:
            self.assertEqual(a["model"], "fable" if a["division"] == "director" else "opus", a["path"].name)

    def test_types_are_plugin_scoped(self):
        self.assertEqual(BY_ID["D00"]["type"], "maistro:d00-director")
        self.assertEqual(BY_ID["S02"]["type"], "maistro:sources:s02-bibliographic-gatekeeper")


class AgentFiles(unittest.TestCase):
    def test_frontmatter(self):
        for a in AGENTS:
            fm, name = a["frontmatter"], a["path"].name
            with self.subTest(agent=name):
                self.assertTrue(fm["description"].startswith(f"Internal Maistro lab agent {a['id']} ("), name)
                self.assertLessEqual(len(fm["description"].split()), 30)
                self.assertTrue(tools(a) <= TOOLS, tools(a) - TOOLS)
                self.assertEqual(tools(a, "disallowedTools"), {"Agent", "Workflow"})
                self.assertEqual(fm.get("skills"), ["lab-protocol"])
                self.assertEqual(fm.get("color"), COLORS[a["division"]])
                self.assertEqual(fm.get("effort"), "xhigh" if a["division"] == "director" else "high")
                self.assertNotIn("memory", fm)

    def test_tool_policy_by_division(self):
        for a in AGENTS:
            t = tools(a)
            if a["division"] == "frontier":
                self.assertEqual(t, {"Read", "Write", "Glob", "Grep"}, a["path"].name)
            if a["division"] == "director":
                self.assertNotIn("Bash", t)
            if a["division"] in ("sources", "experiments", "critique"):
                self.assertIn("Bash", t, a["path"].name)

    def test_sections_and_length(self):
        for a in AGENTS:
            body = a["body"]
            with self.subTest(agent=a["path"].name):
                self.assertTrue(a["mission"], "missing '>' contribution line")
                pos = [body.find(s) for s in SECTIONS]
                self.assertNotIn(-1, pos, [s for s, p in zip(SECTIONS, pos) if p < 0])
                self.assertEqual(pos, sorted(pos), "sections out of order")
                n = len(a["path"].read_text(encoding="utf-8").splitlines())
                self.assertGreaterEqual(n, 40)
                self.assertLessEqual(n, 110)

    def test_colleague_ids_exist(self):
        for a in AGENTS:
            for ref in set(re.findall(r"\b([DMSTECFW]\d\d)\b", a["body"])):
                self.assertIn(ref, BY_ID, f"{a['path'].name} mentions unknown agent {ref}")

    def test_cli_path_placeholder(self):
        for a in AGENTS:
            if "maistro_scholar.py" in a["body"]:
                self.assertIn('${CLAUDE_PLUGIN_ROOT}/scripts/maistro_scholar.py', a["body"], a["path"].name)


class Protocol(unittest.TestCase):
    def test_roster_in_protocol(self):
        skill = (PLUGIN / "skills/lab-protocol/SKILL.md").read_text(encoding="utf-8")
        for a in AGENTS:
            self.assertIn(f"| {a['id']} | {a['title']} |", skill)
        self.assertIn("user-invocable: false", skill)
        self.assertNotIn("disable-model-invocation: true", skill, "a preloaded skill must stay model-invocable")


if __name__ == "__main__":
    unittest.main()
