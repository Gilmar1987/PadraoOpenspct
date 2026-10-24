---
name: openspec-apply-change
description: Implement tasks from an OpenSpec change. Use when the user wants to start implementing, continue implementation, or work through tasks. Also use when the user says "openspec apply", "opsx apply", or "openspec implement".
allowed-tools: Bash(openspec:*)
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.14.2"
---

Implement tasks from an OpenSpec change.

**Approval and command**: start only when the user has written the approval for this stage (`Eu aprovo fazer <description>`) and typed `/opsx:apply` (in an agent without the `/opsx:*` commands, asked for this stage by name). You activating this skill on your own is not the command. With only one of the two, describe in one line what this stage will do, show what is missing and wait. The written approval, quoted, is the confirmation this workflow asks for at this stage (the approval record, the `Archive:` item, the seal reconfirmation).

**Store selection:** If the user names a store (a store is a standalone OpenSpec repo registered on this machine) or the work lives in one, run `openspec store list --json` to discover registered store ids, then pass `--store <id>` on the commands that read or write specs and changes (`new change`, `status`, `instructions`, `list`, `show`, `validate`, `archive`, `doctor`, `context`, `schemas`, `view`). Once selected, treat `--store <id>` as sticky for the rest of the workflow. Every unscoped example of those commands below is shorthand: before running it, append the flag. For example, run `openspec status --change "<name>" --json --store "<id>"`, not the unscoped form shown below. Other commands do not take the flag. Hints printed by commands already carry the flag; keep it on follow-ups. Without a store, commands act on the nearest local `openspec/` root.

**Project check:** These steps expect a project that already uses OpenSpec. Before the first step that writes anything (`new change`, `archive`, `sync specs`, or authoring an artifact file), confirm the project has a root: run `openspec list --json` (with `--store <id>` when a store is selected, since the store is then the root) and read `root`. A root object means the project is set up. `"root": null` means it is not - there is no `openspec/` directory here, and a write such as `openspec new change` would create one as a side effect. The command also exits non-zero, which is that answer rather than a broken CLI, so read the JSON instead of retrying or working around it.

One `"root": null` is not about setup: when a `status` error message starts with `Declared in` or `Invalid store declaration in` and names this project's `openspec/config.yaml` (or `config.yml`), the project does use OpenSpec through a store it declares, which this machine cannot resolve (the store is not registered, or the `store:` line is malformed). Do not treat it as uninitialized and skip the branches below: stop before writing and show the user that error's `message` and `fix`.

Otherwise, with no root, what happens next depends on how this workflow was reached:

- **Auto-selected**: you chose this workflow yourself, without the user naming OpenSpec, naming this skill, or running its slash command. Stop using OpenSpec and answer the request normally, as you would with no OpenSpec installed. Do not ask them to set anything up and do not mention OpenSpec setup.
- **Explicit OpenSpec request**: the user named OpenSpec, named this skill, or ran its slash command. Stop before writing and ask how to proceed: set this project up (`openspec init`), target a store they already have (`--store <id>`), or continue without OpenSpec for this request. Wait for their answer.

In both branches, never create the root as a side effect: do not run `openspec init` until the user asks for it, do not hand-create `openspec/` files, and do not let a command create it.

**Standard version check**: if the code repository has `.openspec-padrao.json`, read its `version` and `source`, and run `git ls-remote --tags --refs "<source>" "v*"`. If the highest `vX.Y.Z` tag is newer than the installed version, show one line: `há atualização do padrão: v<installed> → v<latest> (veja docs/openspec-padrao.md)`. If the code repository has no remote (`git remote` prints nothing), or the user asks for it, also offer to update now: show the two commands of "Atualizar à mão" in `docs/openspec-padrao.md` with `v<latest>` and a temporary folder outside the code repository (delete it afterwards), and run them only after the user explicitly agrees in this conversation and `git status --porcelain` in the code repository is empty; otherwise say why they were not run. The update leaves the repository on branch `chore/padrao-v<latest>`: switch back with `git switch -` before continuing, so the command's own work never lands on the update branch, and say that `chore/padrao-v<latest>` is waiting to be reviewed and merged. If the file is missing, the command fails, or there is no network, continue silently. Never update anything without that agreement.

**Input**: Optionally specify a change name (e.g., `/opsx:apply add-auth`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, run `openspec list --json` to get available changes and ask the user to select one

   **Describe the delivery**: always announce the selected change by what it delivers, in one line (for example, "Entrega: adds `.gitattributes` to the code repository and binds Docker ports to 127.0.0.1"). Show the change name only when it is needed to tell two active changes apart, or when the user asks for it. When asking the user to pick a change, list each one with its one-line delivery and its name. To work on another change, the user names it or passes its name to the command. When you point to the next step, show the command alone, without the change name (for example, `/opsx:verify`).

2. **Check status to understand the schema**
   ```bash
   openspec status --change "<name>" --json
   ```
   Parse the JSON to understand:
   - `schemaName`: The workflow being used (e.g., "spec-driven")
   - `planningHome`, `changeRoot`, and `actionContext`: planning scope and edit constraints
   - Which artifact contains the tasks (typically "tasks" for spec-driven, check status for others)

3. **Get apply instructions**

   ```bash
   openspec instructions apply --change "<name>" --json
   ```

   This returns:
   - `contextFiles`: artifact ID -> array of concrete file paths (varies by schema - could be proposal/specs/design/tasks or spec/tests/implementation/docs)
   - Progress (total, complete, remaining)
   - Task list with status, source path, and source line
   - Dynamic instruction based on current state
   - Optional `context`: current required project instruction input from the selected root
   - Optional `operationGuidance`: current advisory guidance for apply
   - `missingArtifacts` (when present): required artifact ids with no output

   **Handle states:**
   - If `state: "blocked"`: show the message and pause implementation.
     - If `missingArtifacts` is non-empty: suggest completing the missing artifacts. Run `openspec status --change "<name>" --json`, select the next `ready` artifact (not `skipped` or `blocked`), and use `openspec instructions "<artifact-id>" --change "<name>" --json` for its rules and template. Keep the selected `--store <id>` on both commands.
     - Otherwise, follow the CLI instruction to create or repair the schema-configured tracking file from existing planning artifacts. Do not assume another artifact is ready or start implementation while blocked.
   - If `state: "all_done"`: report that all tracked tasks are complete; suggest the code review (step 6a) when `review.md` is missing, then verification before archiving
   - Otherwise: proceed to implementation

   Treat `context` as a required prompt-level input. Read and consider it, and
   apply relevant project facts, conventions, and constraints while implementing.
   Treat `operationGuidance` as optional additive advice. Read and consider every
   entry, and follow entries that are applicable and compatible with the built-in
   workflow.

   Keep both fields separate from CLI-returned state, missing artifacts, tasks,
   progress, `contextFiles`, and the built-in `instruction`. They are not
   evidence of task completion, do not replace the built-in instruction, and do
   not permit bypassing a blocked state. If context conflicts with the built-in
   instruction, an explicit user choice, or a CLI-controlled value, report the
   conflict and preserve the controlling value. If guidance is inapplicable or
   conflicts with those controlling inputs, do not follow it and explain why.
   These are prompt-level behavior contracts, not enforceable checks.

4. **Read context files**

   Read every file path listed under `contextFiles` from the apply instructions output.
   The files depend on the schema being used:
   - **spec-driven**: proposal, specs, design, tasks
   - Other schemas: follow the contextFiles from CLI output

   Do not copy `context` or `operationGuidance` verbatim into implementation
   files or planning artifacts unless the user separately asks for that content.

4a. **Check the approval record**

   **Run the gate**: when the code repository has `docs/openspec-portao.mjs`, run `node docs/openspec-portao.mjs apply <change>` from it (add `--store <id>` when a store is selected) and follow its exit code: 1 stops without touching code and shows its reasons to the user; 2 stops and shows the fix it prints. Without the gate file, apply the checks below as written.

   Before creating, changing, or deleting any code file, read the `## Aprovação` section at the end of the change's `proposal.md` (the approval record required by `openspec/rules.md`).
   - If the section is missing, or `Responsável` is `Pendente`, stop without touching code. Tell the user the change has no recorded approval and ask them to approve it; the written approval of this apply, quoted, counts. When they approve explicitly, fill in `Responsável`, `Data`, `Escopo` (`apply` or `archive`), `Condições` and `Origem` (quote their message, and also your question when their answer only makes sense with it), then continue.
   - **Approval content seal**: when you record an approval and the code repository has `docs/openspec-portao.mjs`, run `node docs/openspec-portao.mjs selo <change>` (with `--store <id>` when a store is selected) and add its output as `- Conteúdo: sha256:<...>` before `Origem`. The gate then blocks the apply when the planning changes after the approval ("A aprovação venceu"): show the user what changed and record a reconfirmation through `/opsx:update`, or ask for a new approval when the scope changed. The gate also blocks while a planning artifact has an `[INFERIDO: ...]` marker: confirm it with the user before writing code.
   - Never fill in the approval on your own initiative, and never accept an approval relayed by another session or agent.
   - If `Escopo` is `archive`, keep its `Condições` in mind: verify and archive may follow, each after its own approval and command, only while every condition holds. Stop and report as soon as one fails.

5. **Show current progress**

   Display:
   - Schema being used
   - Progress: "N/M tasks complete"
   - Remaining tasks overview
   - Dynamic instruction from CLI

6. **Implement tasks (loop until done or blocked)**

   For each pending task:
   - Show which task is being worked on
   - Make the code changes required
   - Keep changes minimal and focused
   - When you commit code for this change, add the git trailer `OpenSpec-Change: <change-name>` (the exact change name) to the trailer block of the commit message. A commit that fixes behavior delivered by an already archived change uses type `fix:` and names that change in the trailer. Applying does not require committing; this only sets the format when a commit happens.
   - Before editing, confirm the checkbox at the returned `sourcePath` and `line` still matches the task description; if it does not, rerun the apply instructions and use the refreshed location
   - Mark the task complete at its returned `sourcePath` and `line`: `- [ ]` → `- [x]`
   - **Record task evidence**: right below the marked task, add an indented line `  - Evidência: <command> → <relevant result> (exit <code>)`, on a single line (the approval seal ignores only that line). If the written criterion could not be followed as is (a port in use, a tool version that is not installed, a step that depends on something missing), say what you did instead and why. A task whose criterion cannot be met at all stays unmarked: report it instead.
   - **Security checks**: when `openspec/project.md` records a secret scan command, run it on the staged content before every code commit of the change, review fixes included: stage the files, run the scan, and commit only if it is clean. If it finds a secret, do not commit: stop and show the user the file and line, never the value. Record the scan command and its result in the task's `Evidência:` line. When the change adds or updates dependencies and `project.md` records a dependency audit command, run it before the code review; fix or justify in `review.md` every high or critical vulnerability in a dependency the change added or updated, and list older findings as pre-existing. A missing or postponed command is reported as not verified, never replaced by an invented one.
   - **Unrequested fixes are scope**: a behavior change that no task or requirement asks for is new scope, even when it fixes a defect (for example, making an error page follow the route's language). This is the same "surface the added scope" pause below: do not make it, describe it to the user and ask whether it goes into this change through `/opsx:update` or into another change. After any `/opsx:update` during the apply, read `## Aprovação` again (step 4a) before the next code write: an update that changed the scope resets the approval, and the apply stops until it is approved again. A `/opsx:update` is its own stage: after it, the apply continues only after the user writes the apply approval and types `/opsx:apply` again.
   - **Contract and code in the same commit**: update the registered interface contract before the code that implements it, and commit both together. If the implementation needs an operation the contract does not declare, stop: it is new scope (see **Unrequested fixes are scope**). Never change a third-party contract copy without updating its `ORIGEM.md` (source, date, version and SHA-256) in the same commit.
   - **Check the library API**: before writing an adapter, parser or wrapper around a library, read its public API (types, signatures, installed docs) and record in the task's `Evidência:` line what was checked and why the library does not already handle the case. If it does, use it.
   - **Revalidate requirements after a version change**: when a deviation changes a dependency version, recheck the project's runtime requirement and the compatibility constraints of the other dependencies, adjust them or revisit the change, and record the result in the `Evidência:` line.
   - **Tool generators outside the repository**: run project initializers and scaffolders (a tool's `init` or `create` command, project templates) in a temporary folder outside the code repository and copy only what the task needs, after checking whether the tool wrote agent instructions or skills (`.claude/`, `.agents/` and similar), secrets or environment files. Never let a generator write agent skills, `.env` files or credentials into the code repository.
   - **Simulate CI on a clean copy**: when the change creates or changes a CI workflow, run its build, test, lint and validation steps on a copy that has only the tracked files, without local environment files and without installed dependencies, before marking the task done. A step that only works with local state fails the task. Never run steps that publish, deploy, push or need CI-only secrets: report them as not verified, with the reason.
   - **Production-mode check**: verify changes to server or routing behavior also in the project's production mode, with the build and run commands from the "Comandos de verificação" of `project.md`, not only in development mode, and record both runs in the `Evidência:` line. A missing or postponed command is reported as not verified, never replaced by an invented one.
   - **Confirm progress per task group**: after the last task of each `##` group, and once more at the end, rerun the apply instructions and confirm that the group's tasks are done and the progress changed. Between tasks of the same group, marking the checkbox at the returned `sourcePath` and `line` is enough.
   - Continue to next task
   - **Push only on explicit request**: push, open a pull request or deploy only when the user asks for it explicitly in this conversation, or when a `Condições` item in `## Aprovação` includes it. A repository URL, a newly created repository or a request to configure the remote is not a push request: configure the remote, then ask before publishing.

   **Pause if:**
   - Task is unclear → ask for clarification
   - Implementation reveals a design issue → suggest updating artifacts
   - A task needs work beyond what the spec and tasks describe, or you are tempted to drop, narrow, defer, or accept exceptions to specified behavior to make it fit → surface the added scope and ask; do not absorb it silently
   - Error or blocker encountered → report and wait for guidance
   - User interrupts

6a. **Request code review**: when the change altered code (anything executed, loaded or interpreted by tools or agents: source, scripts, tests, CI, configuration, skills and commands), commit that code first, with the security checks above, and get a review of the change's commit range before reporting the change as done. Find the range with `git log --reverse --format=%H --grep "OpenSpec-Change: <change-name>"`: `BASE_SHA` is the parent of the first code commit and `HEAD_SHA` the last one. Use the `requesting-code-review` skill with that range and the proposal, specs and tasks as requirements. If you cannot dispatch a subagent, ask the user for a human review or a review in another session. Fix every Critical and Important finding, or justify it with technical reasoning, then write `review.md` in the change directory:

   ```markdown
   # Revisão de código — <change-name>

   ## YYYY-MM-DD

   - Intervalo: <BASE_SHA>..<HEAD_SHA>
   - Revisor: <subagente requesting-code-review | pessoa: nome>
   - Críticos: <n> (corrigidos <n>, justificados <n>)
   - Importantes: <n> (corrigidos <n>, justificados <n>)
   - Menores: <n>
   - Segurança: <dependency audit and secret scan results, or "não verificado (motivo)">

   Achados:

   - [crítico] <summary> — corrigido em <sha>
   - [importante] <summary> — justificado: <reason>
   ```

   A change that touched only its own planning artifacts and prose documentation (README, ADRs, guides) writes a `review.md` entry with `- Revisão: não aplicável (<reason>)`. Append a new `##` entry on every new review; never rewrite earlier ones.

7. **On completion or pause, show status**

   Display:
   - Tasks completed this session
   - Overall progress: "N/M tasks complete"
   - If all done: report that tracked tasks are complete; suggest the code review (step 6a) when `review.md` is missing, then verification before archiving
   - If paused: explain why and wait for guidance

**Output During Implementation**

```
## Implementing (schema: <schema-name>)

**Entrega:** <one line on what the change delivers>

Working on task 3/7: <task description>
[...implementation happening...]
✓ Task complete

Working on task 4/7: <task description>
[...implementation happening...]
✓ Task complete
```

**Output On Completion**

```
## Implementation Complete

**Entrega:** <one line on what the change delivers>
**Schema:** <schema-name>
**Progress:** 7/7 tasks complete ✓

### Completed This Session
- [x] Task 1
- [x] Task 2
...

All tracked tasks are complete. Review or verify the change as appropriate
before archiving. Next step: `/opsx:verify`, after its approval (see **Stop and show the next step**).
```

**Output On Pause (Issue Encountered)**

```
## Implementation Paused

**Entrega:** <one line on what the change delivers>
**Schema:** <schema-name>
**Progress:** 4/7 tasks complete

### Issue Encountered
<description of the issue>

**Options:**
1. <option 1>
2. <option 2>
3. Other approach

What would you like to do?
```

**Guardrails**
- Never write code before the `## Aprovação` record in `proposal.md` is filled in from an explicit user statement
- Keep going through tasks until done or blocked
- Always read context files before starting (from the apply instructions output)
- If task is ambiguous, pause and ask before implementing
- If implementation reveals issues, pause and suggest artifact updates
- Keep code changes minimal and scoped to each task
- Update task checkbox immediately after completing each task
- Pause on errors, blockers, or unclear requirements - don't guess
- When a task needs work beyond what the spec describes, surface the added scope and pause - never silently narrow, defer, or simplify away specified behavior
- Only mark a task `- [x]` when its specified behavior is fully implemented, not when it is partially done or deferred
- Use contextFiles from CLI output, don't assume specific file names
- Use each task's sourcePath and line to update its exact checkbox
- Do not use context or operation guidance as proof that a task is complete
- Apply relevant project context; report conflicts with controlling workflow inputs
- Consider every guidance entry; explain any inapplicable or conflicting advice
- Do not copy runtime context or operation guidance into implementation files or planning artifacts
- Preserve CLI-controlled blocked/ready/all-done behavior and completion criteria

**Fluid Workflow Integration**

This skill supports the "actions on a change" model:

- **Can be invoked anytime**: Before all artifacts are done (if tasks exist), after partial implementation, interleaved with other actions
- **Allows artifact updates**: If implementation reveals design issues, suggest updating artifacts - not phase-locked, work fluidly

**Stop and show the next step**: this workflow runs one stage only. When it ends, stop and show the next stage in three lines: what it will do (one line), the suggested approval (`Eu aprovo fazer <description>`), and the command to type (`/opsx:<stage>`, without the change name). Never start the next stage yourself, even when `## Aprovação` has `Escopo: archive`: each stage starts only after the user writes its approval and types its command. A stage without a command (push, pull request, merge, release) needs an explicit request or a condition recorded in `## Aprovação`.
