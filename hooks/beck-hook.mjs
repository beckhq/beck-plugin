#!/usr/bin/env node
// Claude Code hook for Beck. Adds a short instruction to the agent's context when the
// project's git repo is bound to a Beck workspace, and stays silent everywhere else.
//
//   session-start   SessionStart (startup, resume, compact): call resume first.
//   plan-approved   PostToolUse on ExitPlanMode: record the approved plan.
//
// Never blocks the session: any failure (no token, no repo, network) exits 0 with no output.

import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

/**
 * @param {"session-start" | "plan-approved"} mode
 * @param {{ workspace: { name: string }, source?: string }} context
 */
export function hookMessage(mode, { workspace, source }) {
  const where = `This repo is bound to the Beck workspace "${workspace.name}".`;
  if (mode === "plan-approved") {
    return {
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: `The human approved this plan. ${where} If the plan has 3 or more tasks, call the beck record_plan tool now with the plan markdown and your breakdown (epics in order, each task with a short description and acceptance criteria). Then start_task as you begin each task and finish_task when it is done.`,
      },
    };
  }
  const lead =
    source === "compact"
      ? `The conversation was just compacted. ${where} Call the beck resume tool now to recover the tasks in progress and what is next, before re-reading code.`
      : `${where} Call the beck resume tool before starting work to see tasks in progress, waiting for review and next up.`;
  return {
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: `${lead} When the human approves a plan with 3 or more tasks, record it with record_plan.`,
    },
  };
}

function originUrl(dir) {
  try {
    return execFileSync("git", ["-C", dir, "remote", "get-url", "origin"], {
      encoding: "utf8",
      timeout: 3000,
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

/** The workspace bound to this repo, or null. */
export async function boundWorkspace({ apiUrl, token, origin, fetchImpl = fetch }) {
  const response = await fetchImpl(
    `${apiUrl.replace(/\/$/, "")}/api/v1/workspaces?repo=${encodeURIComponent(origin)}`,
    { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(5000) }
  );
  if (!response.ok) return null;
  const body = await response.json();
  // Older servers ignore ?repo= and omit repoUrl; never guess from the full list.
  if (!body.repoUrl) return null;
  return (body.workspaces ?? []).find((w) => w.repoUrl === body.repoUrl) ?? null;
}

async function readStdin() {
  let text = "";
  for await (const chunk of process.stdin) text += chunk;
  try {
    return JSON.parse(text || "{}");
  } catch {
    return {};
  }
}

async function main() {
  const mode = process.argv[2];
  const input = await readStdin();
  const token = process.env.CLAUDE_PLUGIN_OPTION_API_TOKEN || process.env.BECK_API_TOKEN;
  if (!token || !["session-start", "plan-approved"].includes(mode)) return;

  const dir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const origin = originUrl(dir);
  if (!origin) return;

  const workspace = await boundWorkspace({
    apiUrl: process.env.BECK_API_URL || "https://beck.bot",
    token,
    origin,
  });
  if (!workspace) return;

  process.stdout.write(JSON.stringify(hookMessage(mode, { workspace, source: input.source })));
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch(() => {});
}
