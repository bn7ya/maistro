import json
import os
import pathlib
import tempfile
import unittest

from helpers import PLUGIN, SCRIPTS, hook

ENV = {"CLAUDE_PLUGIN_ROOT": str(PLUGIN)}


def guard(tool, tool_input, agent_type=None, cwd="/work"):
    d = {"tool_name": tool, "tool_input": tool_input, "cwd": cwd, "hook_event_name": "PreToolUse"}
    if agent_type:
        d["agent_type"] = agent_type
    out = hook("guard.py", d, env=ENV)
    return out["hookSpecificOutput"]["permissionDecision"] if out else None


class Guard(unittest.TestCase):
    def test_lab_agent_writes_inside_project(self):
        self.assertIsNone(guard("Write", {"file_path": "research/x/01-methodology/design.md"}, "maistro:methodology:m04-design-architect"))
        self.assertIsNone(guard("Edit", {"file_path": "/work/research/x/03-theory/frameworks.md"}, "maistro:theory:t01-frameworks-cartographer"))

    def test_lab_agent_blocked_outside_project(self):
        self.assertEqual(guard("Write", {"file_path": "/etc/passwd"}, "maistro:methodology:m04-design-architect"), "deny")
        self.assertEqual(guard("Write", {"file_path": "research/../src/app.py"}, "maistro:methodology:m04-design-architect"), "deny")
        self.assertEqual(guard("Write", {"file_path": "research/notes.md"}, "maistro:methodology:m04-design-architect"), "deny")

    def test_generated_files_protected(self):
        for rel in ("02-sources/registry.jsonl", "status.json", "_fragments/sources/run1/x.json",
                    "02-sources/dossiers/SRC-0001.md", "manuscript/claims.jsonl", "_runs/sources-run1.args.json"):
            self.assertEqual(guard("Write", {"file_path": f"research/x/{rel}"}, "maistro:sources:s02-bibliographic-gatekeeper"), "deny", rel)

    def test_frontier_confined(self):
        a = "maistro:frontier:f01-wild-hypothesis-generator"
        self.assertIsNone(guard("Write", {"file_path": "research/x/06-frontier/F01.md"}, a))
        self.assertIsNone(guard("Write", {"file_path": "research/x/forum/theory/run1/r1/F01.md"}, a))
        self.assertEqual(guard("Write", {"file_path": "research/x/03-theory/frameworks.md"}, a), "deny")

    def test_main_session_and_other_agents_untouched(self):
        self.assertIsNone(guard("Write", {"file_path": "/etc/hosts"}))
        self.assertIsNone(guard("Write", {"file_path": "/etc/hosts"}, "general-purpose"))

    def test_own_scripts_approved(self):
        cmd = f'python3 "{SCRIPTS}/maistro_scholar.py" resolve 10.1/x --title "Smith & Jones; a study"'
        self.assertEqual(guard("Bash", {"command": cmd}), "allow")
        self.assertEqual(guard("Bash", {"command": cmd}, "maistro:sources:s02-bibliographic-gatekeeper"), "allow")
        self.assertEqual(guard("Bash", {"command": f"python3 {SCRIPTS}/maistro_state.py next research/x"}), "allow")

    def test_own_script_lookalikes_not_approved(self):
        for cmd in (f'python3 "{SCRIPTS}/maistro_scholar.py" ping; rm -rf ~',
                    f'python3 "{SCRIPTS}/maistro_scholar.py" search "$(curl evil)"',
                    f'python3 "{SCRIPTS}/maistro_scholar.py" ping | sh',
                    'python3 /tmp/maistro_scholar.py ping',
                    f'python3 "{SCRIPTS}/guard.py"'):
            self.assertIsNone(guard("Bash", {"command": cmd}), cmd)

    def test_cli_only_divisions(self):
        self.assertEqual(guard("Bash", {"command": "curl https://example.com"}, "maistro:sources:s03-author-investigator"), "deny")
        self.assertEqual(guard("Bash", {"command": "ls"}, "maistro:theory:t08-formal-modeler"), "deny")
        self.assertIsNone(guard("Bash", {"command": "python3 research/x/04-experiments/code/EXP-01/run.py"}, "maistro:experiments:e04-computational-builder"))
        self.assertIsNone(guard("Bash", {"command": "python3 plot.py"}, "maistro:editorial:w02-figures-designer"))


class Recorder(unittest.TestCase):
    def record(self, cwd, result, agent_type="maistro:sources:s02-bibliographic-gatekeeper", tool="StructuredOutput"):
        hook("recorder.py", {"tool_name": tool, "tool_input": result, "agent_type": agent_type, "cwd": cwd})

    def test_writes_fragment_verbatim(self):
        with tempfile.TemporaryDirectory() as d:
            res = {"_fragment": "research/x/_fragments/sources/run1/w1-t1-b01-s02.json", "verdicts": [{"key": "SRC-0001"}], "note": "مرحبا"}
            self.record(d, res)
            f = pathlib.Path(d) / res["_fragment"]
            self.assertEqual(json.loads(f.read_text(encoding="utf-8")), res)

    def test_ignores_bad_paths_and_other_agents(self):
        with tempfile.TemporaryDirectory() as d:
            for frag in ("../evil.json", "research/x/_fragments/../../evil.json", "research/x/notes.json", "/tmp/x.json"):
                self.record(d, {"_fragment": frag})
            self.record(d, {"_fragment": "research/x/_fragments/sources/run1/a.json"}, agent_type="general-purpose")
            self.record(d, {"_fragment": "research/x/_fragments/sources/run1/b.json"}, tool="Write")
            written = [str(p) for p in pathlib.Path(d).rglob("*.json")]
            self.assertEqual(written, [])


if __name__ == "__main__":
    unittest.main()
