---
name: setup
description: Prepare the current folder for unattended Maistro research runs by writing the permission rules and settings the lab needs into .claude/settings.json, after showing the change and getting the user's approval. Use when the user runs /maistro:setup or a Maistro run keeps stopping for permission prompts.
disable-model-invocation: true
---

# Set up this folder for Maistro

A Maistro run launches hundreds of agent calls. Each one that hits a permission prompt stops the lab
until someone answers, so a run meant to be autonomous needs its permissions set up in advance. The
plugin already approves its own scripts and blocks lab agents from writing outside `research/`, through
its guard hook. This skill adds the rest.

## 1. Read the current settings

Read `.claude/settings.json` in the current folder, if it exists, and keep everything already there.

## 2. Propose the change

Merge these entries in, without removing or reordering anything that is already there:

```json
{
  "permissions": {
    "allow": [
      "Workflow(maistro:lab-stage)",
      "WebSearch",
      "WebFetch",
      "Read(/research/**)",
      "Edit(/research/**)"
    ]
  },
  "env": {
    "CLAUDE_CODE_WORKFLOW_MAX_CONCURRENT_AGENTS": "16"
  }
}
```

Explain each line in one sentence:
- `Workflow(maistro:lab-stage)` lets `/maistro:research` start each stage without asking.
- `WebSearch` and `WebFetch` let the source, theory and critique agents search for and read
  literature. These allow every domain, because sources can be anywhere.
- `Read(/research/**)` and `Edit(/research/**)` let agents read and write the project folder. The
  guard hook still stops them writing anywhere else, and stops them editing the generated ledgers.
- `CLAUDE_CODE_WORKFLOW_MAX_CONCURRENT_AGENTS` sets how many agents run at once, 16 at most. Lower
  it if API rate limits are tight.

Then explain the one thing these rules don't cover: the **test-engineering agents run Python code
they wrote themselves**, and they install packages into the project's environment. Offer the user
three options and recommend the first:
1. **Run Maistro in auto mode** (`claude --permission-mode auto`), ideally with `/sandbox` on. A
   classifier reviews each command, so experiment code can run without prompts while risky actions
   still get stopped.
2. **Also allow Python under `research/`.** Add `"Bash(python3 research/*)"` to the allow list. This
   approves any script the agents put there, so use it only with `/sandbox` on, or in a container or
   VM.
3. **Approve experiment commands by hand.** The experiments stage will pause until each command is
   approved.

Show the final merged JSON and ask the user to confirm before writing anything.

## 3. Write it

Only after the user confirms, write `.claude/settings.json`, creating `.claude/` if needed. Then tell
them:
- Settings take effect for new sessions, or after `/reload-plugins`.
- To start a pilot run (about 200 agent calls) before a full one:
  `/maistro:research <idea> --scale pilot`.
- The scholarly APIs Maistro uses must be reachable from this machine: api.crossref.org,
  api.openalex.org, export.arxiv.org, eutils.ncbi.nlm.nih.gov and doaj.org. If they aren't, the lab
  falls back to checking publisher pages, and marks those sources `resolution: web`.
- Optionally, set `MAISTRO_MAILTO` to their email address in the `env` block. This puts the CLI's
  requests in the Crossref and OpenAlex polite pools, which are faster. It is only sent to those two
  APIs.
