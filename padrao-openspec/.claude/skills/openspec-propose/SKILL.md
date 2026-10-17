---
name: openspec-propose
description: "Use when turning an understood feature, bug, or change into OpenSpec planning artifacts such as proposal, delta specs, design, and tasks. Planning only; do not implement code."
---

# OpenSpec Propose

Create a complete, reviewable plan for an OpenSpec change, following the active schema and CLI instructions.

## Workflow

1. Resolve the active OpenSpec root/store with the CLI; do not assume paths or infer the root from the current folder.
2. Check for an existing change with the requested name. If it exists, ask whether to continue it or choose a new name.
3. Read project context, repository instructions, relevant main specs, and implementation/tests needed to ground the plan. Use any Business Requirements Ingestor brief as input, but independently distinguish source facts from inference.
4. Clarify ambiguity that materially changes scope, behavior, compatibility, safety, or acceptance.
5. Create the change using the OpenSpec CLI, then obtain status and per-artifact instructions. Follow each artifact's template, dependency order, rules, resolved output paths, and skip conditions.
6. Produce every artifact required transitively for apply: typically proposal, delta specs, design, and tasks under `spec-driven`. Follow the active schema rather than hardcoding these names.
7. Recheck status after each artifact; validate the change if supported by the CLI.

## Boundaries

- Planning artifacts only. Do not edit production code, start apply, or claim the feature is implemented.
- Never invent product decisions. Record minor assumptions; ask about material ones.
- Do not copy project context or agent instructions verbatim into artifacts.
- Inspect the target implementation project even when the planning store is separate; state clearly if source is unavailable.
- The user must review the artifacts before `/opsx:apply`.

## Completion report

Name the change and planning location, list artifacts created/skipped and any limitations, report CLI status, and recommend `/opsx:apply` only when the schema's required planning artifacts are ready.
