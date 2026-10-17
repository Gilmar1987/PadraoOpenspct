---
name: openspec-apply-change
description: "Use when implementing pending tasks from an OpenSpec change or resuming an in-progress implementation. Follow approved specs and design; pause on blockers or scope changes."
---

# OpenSpec Apply

Implement the selected OpenSpec change from its approved artifacts and tracked tasks.

## Workflow

1. Resolve the active root/store and selected change using OpenSpec CLI status and apply instructions. Follow CLI paths and schema; do not assume `tasks.md` or a local root.
2. If apply is blocked or required artifacts are missing, stop and report the next planning artifact. Never bypass the blocked state.
3. Read every artifact named by `contextFiles`, including project context and applicable operation guidance.
4. Work on one pending task at a time. Confirm its description and checkbox still match the CLI's `sourcePath` and line.
5. Inspect relevant source, tests, and project conventions. Implement the smallest change that satisfies the requirement and scenarios.
6. Run existing, relevant, non-destructive tests/lint/build checks. Do not invent commands or treat unrun checks as passing.
7. Mark a task complete only after its full behavior and validation pass. Re-read apply instructions and confirm progress before continuing.

## Stop conditions

Pause for clarification when requirements conflict or are ambiguous; implementation reveals a design issue; work exceeds approved scope; validation fails unexpectedly; or external/destructive action is needed. Do not silently narrow requirements or mark partial work complete.

Do not publish, push, create tags, run migrations with destructive effects, deploy, sync main specs, or archive unless separately authorized through the corresponding workflow.

## Report

State the change/schema, tasks completed and remaining, changed files, checks and results, and blockers. Recommend verify/review before archive after tasks are complete.
