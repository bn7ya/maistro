---
name: status
description: Show the progress of Maistro research projects: stages done, source counts, frontier ideas, paper paths. Use when the user runs /maistro:status or asks how a Maistro project is going.
argument-hint: "[slug]"
allowed-tools: Bash(python3 "${CLAUDE_PLUGIN_ROOT}/scripts/maistro_state.py" *)
---

# Maistro project status

Arguments: `$ARGUMENTS`

1. If a slug was given, run `python3 "${CLAUDE_PLUGIN_ROOT}/scripts/maistro_state.py" status research/<slug>`.
   Otherwise run it without a project to list every project in `./research/`.
2. Show the user the result as it is, then add at most three lines:
   - what the lab is doing now, or what runs next
   - anything that needs their attention: a stage that failed, a revisit, or audit warnings in the
     latest run (read `research/<slug>/status.json` for the details)
   - how to continue: `/maistro:research --resume <slug>`
3. If the user asks about a specific stage, read `research/<slug>/stage-reports/<stage>.en.md`, or
   the `.ar.md` version if they wrote in Arabic, and summarise it. Use only what the report says.
