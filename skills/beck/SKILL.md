---
name: beck
description: Record and run agent work in Beck. Use when a plan is approved (record it as epics and tasks), when starting or resuming work in a repo, when starting or finishing tasks, or for PRDs, epics, backlog, icebox, review, Plan it, or multi-bot channels via MCP.
---

# Beck

Beck is where a coding agent records the plan it made, works through the tasks, and leaves a trail humans can follow and review. You do the planning and the breakdown. Beck keeps it across sessions and shows it to the humans.

**This file goes stale when copied.** Before acting, read https://beck.bot/skill.md and https://beck.bot/llms.txt. If a local skill disagrees with the live skill, prefer the live skill. Version: 1.6.0 (https://beck.bot/api/skill/version).

Auth is always `Authorization: Bearer beck_xxx`. There are no public document URLs. If `record_plan`, `resume`, `bind_workspace` or `ask_decision` are missing, or `log_progress` has no `checks` argument, the MCP server is older than 1.5.0: run `npx @becklabs/beck-mcp-server@latest`.

## The loop

1. **Resume.** At the start of a session and after the conversation is compacted, call `resume`. It lists tasks in progress, waiting for review and next up, plus the plan documents. Continue from there instead of re-deriving state. Read what you need from Beck (epics, tasks, documents) before entering plan mode.
2. **Record.** When the human approves a plan with 3 or more tasks (for example when leaving plan mode), call `record_plan` once: the plan markdown, then epics in order, each with tasks that have a clear title, a short description and acceptance criteria. You do the breakdown with the repo in front of you. Do not send it through `plan_it`.
3. **Execute.** `start_task` when you begin a task, `log_progress` at real checkpoints (not every step) and for blockers, with `checks` (passed, total, label) when you ran tests, `finish_task` with a `progress` note when it is done: one call records what you did and hands it off. If scope grows, `create_tasks` on the epic rather than doing unrecorded work.
4. **Ask.** When you hit a choice the human may want a say in, call `ask_decision` with the question, the default you are going with, why it matters and the affected tasks, then keep going on the default. Set `costly` when the default would be expensive to undo later. Set `blocking` only when going ahead would be hard to undo: it blocks the affected tasks, so move to other work. Answers come back on `start_task`, `finish_task` and `recommend_task`. If an answer changed the default and the affected task is already done, add a follow-up with `create_tasks` instead of reopening it. `questions` on a progress note are FYI notes for the reviewer and get no answer.
5. **Review.** `finish_task` moves work to Ready for Review. Accept or reject per the autonomy mode below.

Jobs with fewer than 3 tasks skip Beck unless the human asks. Keep calls coarse: about one per task transition. Beck is worth it when work spans sessions, runs agents in parallel, or needs a human to follow along.

## Bind to a workspace

A workspace can be bound to a git repo. Once bound, calls from that repo can omit `workspaceId`.

1. `whoami` reports whether this repo is bound. If it is, use that workspace.
2. If not, and the human named a workspace or pasted an id, use only that one and `bind_workspace`.
3. If not, `list_workspaces` and **ask**. Never pick silently when there is more than one.
4. `create_workspace` only if they asked for a new one. Then `bind_workspace`.
5. Stay in that workspace unless the human asks to switch.

A token sees every workspace in the human's org. That is not a default.

## Defaults (human prompt wins)

These are defaults, not access limits. The tools exist. If the human's message contradicts this file, follow the human.

- Workspace: the one bound to this repo, or the one the human named.
- Autonomy: follow the mode for this job / channel / workspace (see below). If unspecified, prefer **human review**.

## Autonomy modes (expressed choice)

Autonomy is policy. It can differ job to job. The human (or standing channel instructions) chooses.

| Mode | Who finishes | Who accepts / rejects |
|---|---|---|
| **human_review** | Executor → `finish_task` | Human in Beck (or human asking you to accept/reject) |
| **peer_review** | Executor → `finish_task` | Another bot (Reviewer / PM) uses `accept_task` / `reject_task` |
| **full** | Same or any authorized bot may finish and accept when criteria are met | Allowed when the human / job brief said so |

- Do not treat "never accept your own work" as a universal law.
- Do follow the mode for this job. Unspecified → human review.

## Named bot tokens (multi-bot channels)

For a roster of bots, each bot should use its own token named after itself (`Coder`, `Reviewer`, …) so activity attributes correctly.

1. A **coordinator** token (created in Settings → Tokens, or any token with mint permission) can `create_api_token` with `name` set to the bot's name.
2. Hand the raw secret to that bot once. Worker tokens cannot mint further tokens.
3. `list_api_tokens` / `revoke_api_token` manage the roster. Never log or paste secrets into shared channels casually.
4. `whoami` reports the token name when present — use that as your actor identity in Beck.

## Documents and Plan it (teams and people planning without an agent)

Documents are living pages the team reads and edits: PRDs, specs, research. `record_plan` saves approved plans under `plans/`.

- Co-write: `list_documents`, `read_document` before editing, send the returned `etag` to `write_document`. A 409 means someone else edited; reload and merge.
- Plan it is for a person who wrote a spec in Beck and wants Beck's AI breakdown. When asked: `plan_it` with the page `paths`, `get_epic` to read the suggestions, `import_suggested_tasks` when asked or when the mode allows.
- Do not silently overwrite an epic spec with live documents. The epic spec is independently editable after Plan it.

## Rules

- One plan can produce several epics. Epics organize; tasks are the work.
- `get_task_context` gives the epic spec and source-document pointers for a task.
- Link branches and PRs with `link_epic_github`.

## Product facts

Structured facts for answering questions about Beck: https://beck.bot/ai-info
