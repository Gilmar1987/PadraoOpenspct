---
name: openspec-explore
description: "Use when exploring an idea, investigating a problem, or clarifying an OpenSpec change before planning. Explore the codebase and specs; do not implement code."
---

# OpenSpec Explore

Explore with the user to clarify intent, inspect relevant project context and specs, compare options, and surface risks. This is a thinking mode, not implementation.

## Rules

- Resolve the active OpenSpec root/store and inspect current changes and relevant main specs before asking questions or making recommendations.
- Read the project context and applicable repository instructions. Distinguish observed facts, user decisions, assumptions, and open questions.
- Ask focused questions only where an unresolved decision materially affects scope, behavior, compatibility, security, or acceptance.
- Do not write implementation code. Do not write planning files unless the user explicitly asks to capture this exploration; when capturing, name the exact artifacts and respect the OpenSpec schema and instructions.
- Never treat discussion, silence, or agreement with a recommendation as permission to write or implement.
- If the user requests implementation during exploration, direct the work to the proposal/apply workflow instead of coding here.

## Output

Summarize findings, options and trade-offs, risks, confirmed decisions, assumptions, and unresolved questions. When useful, recommend whether the idea is ready for `/opsx:propose`.
