---
name: openspec-archive-change
description: "Use when finalizing an implemented OpenSpec change after review. Assess artifacts and tasks, explain spec-sync effects, obtain required user confirmation, then use the OpenSpec archive workflow."
---

# OpenSpec Archive

Finalize a reviewed change through the OpenSpec CLI. Archiving may synchronize delta specs into the durable main specs and move the change into archive; treat both as consequential repository changes.

## Workflow

1. Resolve the selected change, store/root, schema, artifact paths, and task tracking with OpenSpec CLI. Never assume the planning repo is the current working directory.
2. Read archive instructions and project context where available. Check artifact completion and tracked task counts using CLI data; do not infer task status from filenames.
3. If artifacts or tasks are incomplete, show the exact warnings and ask the user whether to continue.
4. If delta specs exist, inspect each delta against its corresponding main spec and summarize additions, modifications, removals, and renames, including any sync blockers.
5. Before syncing or moving the change, present the proposed spec effects and archive action. Obtain explicit confirmation when the CLI/workflow requires it. Never bypass an unresolved blocker or overwrite a conflicting destination.
6. Use the official OpenSpec archive workflow/CLI rather than manually moving directories. If syncing is separately selected, follow the sync skill and verify main specs before archive.
7. Report archive path, spec-sync outcome, and any incomplete artifact/task warnings.

## Safety

- Do not archive on behalf of an ambiguous change.
- Never claim verify passed unless an evidence-based verification report exists; run/consult `/opsx:verify` first when applicable.
- Do not delete a change or overwrite main specs manually. Preserve `.openspec.yaml` and other metadata through the official command.
- If a sync or archive fails, stop and report; do not retry with destructive workarounds.
