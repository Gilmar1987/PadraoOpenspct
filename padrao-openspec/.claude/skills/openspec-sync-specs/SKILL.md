---
name: openspec-sync-specs
description: "Use when applying delta specs from an active OpenSpec change to the main specs without archiving the change. Merge semantically and preserve requirements/scenarios not changed by the delta."
---

# OpenSpec Sync Specs

Apply selected delta specs to their corresponding main specs while leaving the change active. Use the CLI's resolved planning root and concrete delta paths; a store may be separate from the code checkout.

## Workflow

1. Resolve the change and status using OpenSpec CLI. Use `artifactPaths.specs.existingOutputPaths` as the only delta-spec source. If absent/empty, stop without writing.
2. Read all selected delta specs and the corresponding main specs. Read project context and obtain current `specs` artifact rules before the first write; if instructions fail or are invalid, stop.
3. Merge ADDED, MODIFIED, REMOVED, and RENAMED requirements semantically. Preserve unaffected content, scenarios, titles, and existing Purpose sections. Do not invent baseline requirements. For new capabilities, only ADDED requirements can seed a new main spec.
4. Respect explicit retirement rules and path containment before deleting a capability spec. Never leave an empty Requirements section.
5. Update only main specs corresponding to selected delta files; leave the change and its tracking artifacts in place.
6. Run `openspec validate --specs` with the selected store/root. If it fails, report failure and the affected paths; do not claim sync success.

## Output

List updated capabilities and requirement operations, any blocked/retired capability, validation result, and confirm that the change remains active. Do not archive in this workflow.
