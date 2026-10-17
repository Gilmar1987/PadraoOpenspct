---
name: openspec-verify-change
description: "Use when verifying an implemented OpenSpec change against its tasks, requirements, scenarios, design, and project conventions before archive. Produce an evidence-based report; do not modify code or archive."
---

# OpenSpec Verify

Independently assess whether implementation matches the selected change artifacts. Verification is advisory and must not alter implementation, planning artifacts, main specs, or archive state.

## Workflow

1. Resolve the change, schema, planning root, artifact paths, and apply tracking data from the OpenSpec CLI.
2. Read all artifacts listed by apply `contextFiles`; respect custom schemas, skipped artifacts, and tracking configuration.
3. Report task progress from CLI tracking data. Identify each incomplete task and any unavailable tracking files.
4. Map ADDED/MODIFIED requirements and scenarios to implementation and tests. For REMOVED/RENAMED requirements, inspect the baseline behavior and verify removal/preservation appropriately.
5. Compare design decisions with implementation and project patterns.
6. Run only relevant, existing, non-destructive checks whose commands and effects are understood. Never represent unexecuted checks as passed.
7. Distinguish **Not applicable**, **Not verified**, and **Failed**. Cite files/requirements/scenarios and specific evidence. Prefer a suggestion to a warning when uncertain; never claim full readiness if applicable checks were not verified.

## Output

Provide a scorecard for completeness, correctness, and coherence; findings grouped by critical/warning/suggestion/not verified; evidence and actionable recommendations; and a final assessment. Do not fix findings in this workflow. Recommend `/opsx:apply` for implementation corrections or `/opsx:archive` only after review and appropriate user confirmation.
