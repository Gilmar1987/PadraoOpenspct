---
name: openspec-update-change
description: "Use when revising existing planning artifacts of an OpenSpec change after decisions change or implementation reveals gaps. Keep proposal, specs, design, and tasks coherent; never edit implementation code."
---

# OpenSpec Update Change

Revise existing planning artifacts without implementing code or advancing the artifact build frontier.

## Workflow

1. Resolve the selected change and schema via OpenSpec CLI. Use `artifactPaths.<id>.existingOutputPaths` as the editable scope; never assume default artifact names or write to an unresolved glob.
2. Read the requested artifact and all related existing artifacts. Compare them for downstream and upstream inconsistencies.
3. Draft exact proposed edits and explain why each artifact needs a change. Do not write until the user confirms the scope and proposed revisions.
4. For substantial edits, obtain current per-artifact instructions, templates, dependencies, and rules. Treat context/rules as constraints, not content to copy.
5. Edit only confirmed existing artifacts. Do not create missing non-glob artifacts here; point to CLI instructions for the next artifact. If a partially populated glob needs a new file, confirm its exact concrete path, ensure it remains inside changeRoot, and use a create-only operation.
6. Recheck status and report revised/rejected artifacts, remaining planning gaps, and recommended next workflow.

## Boundaries

- Planning artifacts only; never alter production source or tests.
- Leave intentionally skipped artifacts untouched.
- If the requested change alters intent rather than refining it, recommend a distinct new change instead of repurposing the existing one.
- Never apply code changes; suggest `/opsx:apply` when the plan is ready or implementation must catch up.
