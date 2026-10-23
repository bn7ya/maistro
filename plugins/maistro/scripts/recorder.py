#!/usr/bin/env python3
"""PostToolUse recorder for Maistro (StructuredOutput).

Every lab agent's structured result carries a `_fragment` path. This hook writes the result there
verbatim, exactly as the workflow received it, so maistro_state.py can rebuild the shared ledgers
without any agent copying data by hand.
"""
import json
import os
import re
import sys
import tempfile

FRAGMENT = re.compile(r"^research/[a-z0-9][a-z0-9-]*/_fragments/[a-z]+/run\d+/[a-z0-9][a-z0-9-]*\.json$")


def main():
    try:
        d = json.load(sys.stdin)
    except ValueError:
        return
    if d.get("tool_name") != "StructuredOutput" or not str(d.get("agent_type") or "").startswith("maistro:"):
        return
    result = d.get("tool_input")
    if not isinstance(result, dict):
        return
    frag = result.get("_fragment")
    if not isinstance(frag, str) or not FRAGMENT.match(frag) or ".." in frag:
        return
    cwd = d.get("cwd") or os.getcwd()
    dest = os.path.join(cwd, frag)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(dest), prefix=".tmp-", suffix=".json")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=1)
    os.replace(tmp, dest)


if __name__ == "__main__":
    main()
