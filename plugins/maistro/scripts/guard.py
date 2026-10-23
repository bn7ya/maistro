#!/usr/bin/env python3
"""PreToolUse guard for Maistro (Write, Edit, NotebookEdit, Bash).

- Approves the plugin's own scripts (maistro_scholar/state/audit.py), run as plain
  `python3 <plugin>/scripts/maistro_*.py ...` with no shell operators, so an unattended run isn't
  stopped by prompts for the lab's own tools.
- Lab agents (agent_type "maistro:*") may write only inside research/<slug>/, never to generated
  ledgers or _fragments/. Frontier agents may write only to forum/ and 06-frontier/.
- Methodology, sources and theory agents may use Bash only for the scholarly CLI and read-only
  inspection commands. Writes to the session's scratchpad are always allowed.
Anything else gets no decision from this hook, so the normal permission rules apply.
"""
import json
import os
import re
import shlex
import sys

PLUGIN_ROOT = os.path.realpath(os.environ.get("CLAUDE_PLUGIN_ROOT") or os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OWN_SCRIPTS = {os.path.join(PLUGIN_ROOT, "scripts", n) for n in ("maistro_scholar.py", "maistro_state.py", "maistro_audit.py")}
PROTECTED = {
    "status.json",
    "02-sources/registry.jsonl",
    "02-sources/rejected.jsonl",
    "02-sources/summary.json",
    "06-frontier/ideas.jsonl",
    "05-critique/issues.jsonl",
    "04-experiments/results-index.json",
    "manuscript/claims.jsonl",
    "manuscript/paper.en.md",
    "manuscript/paper.ar.md",
}
PROTECTED_DIRS = ("_fragments/", "_runs/", "02-sources/dossiers/")
CLI_ONLY_DIVISIONS = {"methodology", "sources", "theory", "frontier", "director"}
READ_ONLY = {"ls", "cat", "head", "tail", "wc", "grep", "rg", "pwd", "stat", "file", "sort", "uniq", "cut", "tr",
             "diff", "tree", "du", "basename", "dirname", "realpath", "echo", "jq", "column", "nl", "less"}


def decide(decision, reason):
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": decision, "permissionDecisionReason": reason}}))
    sys.exit(0)


def division_of(agent_type):
    parts = agent_type.split(":")
    if len(parts) == 2:
        return "director"
    return parts[1] if len(parts) > 2 else ""


def is_own_script(cmd):
    if "`" in cmd or "$(" in cmd or "${" in cmd or "\n" in cmd:
        return False
    try:
        lex = shlex.shlex(cmd, posix=True, punctuation_chars=True)
        lex.whitespace_split = True
        tokens = list(lex)
    except ValueError:
        return False
    if any(t and set(t) <= set("();<>|&") for t in tokens):
        return False
    if len(tokens) < 2 or os.path.basename(tokens[0]) not in ("python3", "python"):
        return False
    return os.path.realpath(tokens[1]) in OWN_SCRIPTS


def is_read_only(cmd):
    """Plain inspection commands (ls, cat, wc, grep…), possibly piped together, with no redirects
    other than to /dev/null and no command substitution."""
    if "`" in cmd or "$(" in cmd or "\n" in cmd:
        return False
    cleaned = re.sub(r"\s[12]?>\s*/dev/null|\s2>&1", " ", cmd)
    if re.search(r"[<>]", cleaned):
        return False
    for seg in re.split(r"\|\||&&|;|\|", cleaned):
        seg = seg.strip()
        if not seg:
            continue
        if seg.startswith("cd "):
            continue
        prog = seg.split()[0]
        if os.path.basename(prog) not in READ_ONLY:
            return False
    return True


def main():
    try:
        d = json.load(sys.stdin)
    except ValueError:
        return
    tool = d.get("tool_name") or ""
    ti = d.get("tool_input") or {}
    agent = d.get("agent_type") or ""
    lab = agent.startswith("maistro:")
    cwd = d.get("cwd") or os.getcwd()

    if tool == "Bash":
        cmd = str(ti.get("command") or "").strip()
        if is_own_script(cmd):
            decide("allow", "Maistro's own scholarly/state scripts")
        if lab and division_of(agent) in CLI_ONLY_DIVISIONS and not is_read_only(cmd):
            decide("deny", "This lab division may use Bash only for the scholarly CLI (python3 \"<plugin>/scripts/maistro_scholar.py\" <command>) and read-only inspection (ls, cat, grep, wc…). Use Read/Glob/Grep for files.")
        return

    if not lab or tool not in ("Write", "Edit", "NotebookEdit"):
        return
    path = ti.get("file_path") or ti.get("notebook_path") or ""
    target = os.path.normpath(os.path.join(cwd, path))
    scratch = d.get("scratchpad_dir")
    if scratch and (target + os.sep).startswith(os.path.normpath(scratch) + os.sep):
        return
    research = os.path.join(os.path.normpath(cwd), "research") + os.sep
    if not target.startswith(research):
        decide("deny", "Lab agents write only inside research/<slug>/ of this project.")
    inner = target[len(research):].replace(os.sep, "/").split("/", 1)
    if len(inner) < 2 or not re.match(r"^[a-z0-9][a-z0-9-]*$", inner[0]):
        decide("deny", "Lab agents write only inside a project folder research/<slug>/.")
    rel = inner[1]
    if rel in PROTECTED or rel.startswith(PROTECTED_DIRS):
        decide("deny", f"{rel} is generated by the lab's scripts from everyone's structured results; agents never edit it.")
    if division_of(agent) == "frontier" and not rel.startswith(("forum/", "06-frontier/")):
        decide("deny", "Frontier agents write only their forum posts and 06-frontier/ notes.")


if __name__ == "__main__":
    main()
