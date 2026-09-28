# Beck

Your coding agent plans the work; Beck keeps the plan. When you approve a plan, the agent records it as epics and tasks, works through them, asks decisions with a default while it keeps going, and hands off for review. Humans follow the run live. Works with Claude Code, Cursor, Grok Bot, and any MCP client.

Beck is a Cursor plugin (skill + MCP server) for [beck.bot](https://beck.bot). It connects your AI assistant to project management, product management, task tracking, backlog grooming, document planning, and agent automation. The same stories humans move on the board are the stories the agent starts, logs, finishes, and (when you choose) accepts or rejects.

Use this plugin when you want the plan your agent made to outlive the session: record the approved plan, resume after compaction, log progress with test checks, ask instead of guessing, and submit for review on the same backlog your team uses.

## What it is

A **project management** and **task management** system built for coding agents and the people they work with. The agent plans with the repo in front of it and records the approved plan with `record_plan`: the plan document, then epics and tasks with acceptance criteria. Each session is a **run** on the Now page. **Decisions** hold the agent's questions with the default it is using. For teammates who are not coding, Documents hold PRDs and specs, and **Plan it** turns selected pages into an epic and suggested stories. The daily product is the **backlog**: icebox for what is not ready, list order for priority, in progress, ready for review, accepted. Story points (1, 2, 3, 5, 8), acceptance criteria, comments, and structured progress stay on the story.

Agents are workers in that queue. They get an API token, not a public URL. Autonomy is an expressed choice: human review, peer-bot review, or full automation — per job or channel. The human’s prompt always wins.

## Who it is for

- Founders and engineering leads using Cursor, Grok Bot, Claude Code, or another MCP host who need project management the agent can actually operate
- Anyone who wants to follow an agent's run and answer its questions without sitting at the terminal
- Product managers writing a PRD or spec who want it turned into stories on the same list (Plan it)
- Teams that want AI automation on the same backlog as standup: what’s next, what’s in review, what was accepted
- Multi-bot channels (coder, reviewer, PM) that need named tokens so activity attributes to each bot

## What the assistant can do

**The loop**
- Bind this repo to a workspace (or create one if you asked)
- Resume at session start and after compaction
- Record an approved plan: the plan document, then epics and tasks in order
- Add tasks when scope grows mid-run

**Documents and Plan it**
- Co-write planning documents: PRD, research notes, specs (etag-safe markdown)
- Plan it when you ask: snapshot documents into an epic spec and suggested user stories
- Import suggested tasks to the backlog or the icebox
- List epics, read the working spec, attach a branch name / PR URL

**Task management and execution**
- List and filter tasks (status, epic, assignee, icebox)
- Recommend the next story
- Start, log progress (attempted, succeeded, failed, blockers, questions, test checks), finish
- Ask a decision with the default you are going with; the answer comes back on the next start, finish or recommend
- Accept or reject ready-for-review work under the autonomy mode
- Comments, relevant files, story points, acceptance criteria, tags

**Automation and identity**
- `whoami` — token identity
- Named API tokens for a roster (`Coder`, `Reviewer`); coordinator tokens can mint workers
- Live skill and llms.txt as MCP resources so a bundled copy does not go stale

## How work flows

1. Plan in your agent, in plan mode if it has one. Approve the plan.
2. The agent records it in Beck: plan document, epics, tasks.
3. It starts, logs progress with test checks, and finishes the same tasks you see in the UI. Its run shows on the Now page.
4. When a choice is yours, it asks with a default and keeps going. You answer from anywhere.
5. Review is human, peer bot, or full — you choose. Quality stays in the loop.

Canonical agent instructions: [beck.bot/skill.md](https://beck.bot/skill.md) and [beck.bot/llms.txt](https://beck.bot/llms.txt). Product facts: [beck.bot/ai-info](https://beck.bot/ai-info).

## Install in Claude Code

1. `/plugin marketplace add beckhq/beck-plugin`
2. `/plugin install beck@beck` and paste a token from [Settings → Tokens](https://beck.bot/settings/tokens) when asked. Name it after the agent (`Claude Code`). It is stored in secure storage, not in a settings file.
3. In a repo, ask Claude to bind it to a Beck workspace once (`bind_workspace`).

After that, two hooks run in bound repos and stay silent everywhere else:

- **Plan approved** (after `ExitPlanMode`): Claude records the plan with `record_plan`, doing the breakdown itself.
- **Session start and after compaction**: Claude calls `resume` to pick up tasks in progress and what is next.

## Install in Cursor

1. Add **Beck** from the Cursor Marketplace (or Grok Bot’s Cursor plugin install).
2. Open **Plugins → Beck → Configure**.
3. Paste a token from [Settings → Tokens](https://beck.bot/settings/tokens). Name it after this bot when you staff a roster (`Coder`, `Reviewer`).
4. Optional: `BECK_API_URL` if you are not on `https://beck.bot`.

Pin a workspace from Documents → Point an agent. Re-read the live skill before acting; this bundle can lag.

The MCP process is [`@becklabs/beck-mcp-server`](https://www.npmjs.com/package/@becklabs/beck-mcp-server). REST is the same surface at `https://beck.bot/api/v1` with `Authorization: Bearer beck_…`.

## Search terms

Agent plan tracking, plan mode, record plan, agent runs, agent decisions, resume after compaction, project management, product management, task management, task tracker, backlog, icebox, agile planning, user stories, story points, epic, PRD, product requirements document, spec, specification, planning documents, markdown docs, accept/reject review, ready for review, what’s next, standup board, AI agents, agent automation, MCP server, Cursor plugin, Grok Bot, multi-bot workflow, API token.

## License

MIT
