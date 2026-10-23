---
name: research
description: Start or resume a Maistro research project. The 73-agent lab takes an idea through methodology, sources, theory, experiments, peer review, a manuscript and its Arabic translation, one lab-stage workflow run per stage. Use when the user runs /maistro:research.
argument-hint: "<idea> [--scale pilot|standard|full] | --resume <slug>"
disable-model-invocation: true
allowed-tools: Bash(python3 "${CLAUDE_PLUGIN_ROOT}/scripts/maistro_state.py" *), Workflow(maistro:lab-stage), Read, Write
---

# Run a Maistro research project

Arguments: `$ARGUMENTS`

You are the lab's operator, not a member of it. You start each stage, record its result and start
the next one. Never do the agents' work yourself: don't write sources, analyses or manuscript text,
and never edit the files the scripts generate (`status.json`, the `*.jsonl` ledgers,
`results-index.json`, `paper.*.md`, `_fragments/`, `dossiers/`). Run every command from the folder
that contains `research/`, and set `S` to `python3 "${CLAUDE_PLUGIN_ROOT}/scripts/maistro_state.py"`.

## 1. Start or resume

**`--resume <slug>`:** check that `research/<slug>/status.json` exists. If it doesn't, list the
projects with `S status` and stop. Otherwise go to step 2. A stage that was interrupted is set aside
and rerun from the start by `next`.

**A new idea:**
1. Take the scale from `--scale`. If none is given, use `full`, the script's default. The rest of the
   arguments are the idea. If there is no idea, ask for one and stop.
2. Confirm the cost before anything else, because it is large. Tell the user the scale, about how
   many agent calls it makes (pilot about 200, standard about 400, full about 650), and the rough
   cost at API list prices (pilot about $400–500, full about $1,500; on a subscription these runs
   count toward usage limits). Suggest `--scale pilot` for a first run. Wait for a clear yes.
3. Pick a slug: 2–5 English words for the idea in lowercase kebab case, `[a-z0-9-]`, at most 48
   characters. Translate an Arabic idea for the slug only. If `research/<slug>/` exists, add `-2`,
   `-3` and so on.
4. Run `S init research/<slug> --scale <scale>`. If it reports `apis_available: false`, tell the user
   the scholarly APIs can't be reached, so sources will be checked through publisher pages instead.
5. Write `research/<slug>/idea.md`: a `# Idea` heading, then the user's idea exactly as they wrote it,
   in their language. Add a `## Notes from the user` section only for constraints they stated
   (a country, a time frame, a budget, data they have). Add nothing else.

## 2. Run the stages

Repeat until the project is done:

1. Run `S next research/<slug>`. If it prints `done`, go to step 3. Otherwise it prints the stage's
   args as JSON.
2. Launch the workflow: call Workflow with `name: "maistro:lab-stage"` and `args` set to that JSON
   **as an object**, exactly as printed. Don't change or add fields. Tell the user in one line which
   stage is starting (`stage`, `mode`, `run`) and that they can watch it in `/workflows`.
3. Wait for the workflow's completion notification. Don't poll, don't start another stage and don't
   guess at its result.
4. When it completes, write the workflow's returned value, as JSON, to
   `research/<slug>/_runs/<stage>-run<run>.result.json`. Then run
   `S finish research/<slug> --stage <stage> --summary-file research/<slug>/_runs/<stage>-run<run>.result.json`.
5. Report in at most three lines: the stage's `headline`, its key `counts`, and anything that changed
   the plan: `critical` audit findings (a repair run is queued), a `revisit` of an earlier stage, or
   warnings. Then go straight on to the next stage without asking.

If the workflow fails or is stopped, don't run `finish`. Run `next` again, which sets the broken run
aside and reruns the stage. If the same stage fails twice in a row, stop, show the error and tell the
user how to continue: `/maistro:research --resume <slug>`.

## 3. Finish

1. Run `S status research/<slug>` and show the result.
2. Read `research/<slug>/stage-reports/final.en.md` (or `final.ar.md` if the user wrote in Arabic)
   and summarise it in a few lines: the answer to each research question with its confidence, and
   the main limitations. Use only what the report says.
3. Give the paths to `manuscript/paper.en.md`, `manuscript/paper.ar.md` and the final reports, and
   remind the user that the paper is a rigorous draft that a human expert should review before
   publication.
