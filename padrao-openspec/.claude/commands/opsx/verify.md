---
name: "OPSX: Verify"
description: "Verify implementation matches change artifacts before archiving"
allowed-tools: Bash(openspec:*)
category: "Workflow"
tags: ["workflow", "verify", "experimental"]
---

Verify that an implementation matches the change artifacts (specs, tasks, design).

**Approval and command**: start only when the user has written the approval for this stage (`Eu aprovo fazer <description>`) and typed `/opsx:verify` (in an agent without the `/opsx:*` commands, asked for this stage by name). You activating this skill on your own is not the command. With only one of the two, describe in one line what this stage will do, show what is missing and wait. The written approval, quoted, is the confirmation this workflow asks for at this stage (the approval record, the `Archive:` item, the seal reconfirmation).

**Store selection:** If the user names a store (a store is a standalone OpenSpec repo registered on this machine) or the work lives in one, run `openspec store list --json` to discover registered store ids, then pass `--store <id>` on the commands that read or write specs and changes (`new change`, `status`, `instructions`, `list`, `show`, `validate`, `archive`, `doctor`, `context`, `schemas`, `view`). Once selected, treat `--store <id>` as sticky for the rest of the workflow. Every unscoped example of those commands below is shorthand: before running it, append the flag. For example, run `openspec status --change "<name>" --json --store "<id>"`, not the unscoped form shown below. Other commands do not take the flag. Hints printed by commands already carry the flag; keep it on follow-ups. Without a store, commands act on the nearest local `openspec/` root.

**Project check:** These steps expect a project that already uses OpenSpec. Before the first step that writes anything (`new change`, `archive`, `sync specs`, or authoring an artifact file), confirm the project has a root: run `openspec list --json` (with `--store <id>` when a store is selected, since the store is then the root) and read `root`. A root object means the project is set up. `"root": null` means it is not - there is no `openspec/` directory here, and a write such as `openspec new change` would create one as a side effect. The command also exits non-zero, which is that answer rather than a broken CLI, so read the JSON instead of retrying or working around it.

One `"root": null` is not about setup: when a `status` error message starts with `Declared in` or `Invalid store declaration in` and names this project's `openspec/config.yaml` (or `config.yml`), the project does use OpenSpec through a store it declares, which this machine cannot resolve (the store is not registered, or the `store:` line is malformed). Do not treat it as uninitialized and skip the branches below: stop before writing and show the user that error's `message` and `fix`.

Otherwise, with no root, what happens next depends on how this workflow was reached:

- **Auto-selected**: you chose this workflow yourself, without the user naming OpenSpec, naming this skill, or running its slash command. Stop using OpenSpec and answer the request normally, as you would with no OpenSpec installed. Do not ask them to set anything up and do not mention OpenSpec setup.
- **Explicit OpenSpec request**: the user named OpenSpec, named this skill, or ran its slash command. Stop before writing and ask how to proceed: set this project up (`openspec init`), target a store they already have (`--store <id>`), or continue without OpenSpec for this request. Wait for their answer.

In both branches, never create the root as a side effect: do not run `openspec init` until the user asks for it, do not hand-create `openspec/` files, and do not let a command create it.

**Standard version check**: if the code repository has `.openspec-padrao.json`, read its `version` and `source`, and run `git ls-remote --tags --refs "<source>" "v*"`. If the highest `vX.Y.Z` tag is newer than the installed version, show one line: `há atualização do padrão: v<installed> → v<latest> (veja docs/openspec-padrao.md)`. If the code repository has no remote (`git remote` prints nothing), or the user asks for it, also offer to update now: show the two commands of "Atualizar à mão" in `docs/openspec-padrao.md` with `v<latest>` and a temporary folder outside the code repository (delete it afterwards), and run them only after the user explicitly agrees in this conversation and `git status --porcelain` in the code repository is empty; otherwise say why they were not run. The update leaves the repository on branch `chore/padrao-v<latest>`: switch back with `git switch -` before continuing, so the command's own work never lands on the update branch, and say that `chore/padrao-v<latest>` is waiting to be reviewed and merged. If the file is missing, the command fails, or there is no network, continue silently. Never update anything without that agreement.

**Input**: Optionally specify a change name after `/opsx:verify` (e.g., `/opsx:verify add-auth`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, run `openspec list --json` to get available changes and ask the user to select one

   When prompting, show all active changes returned by the list, including changes with `status: "no-tasks"`.
   Include the schema used for each change if available.
   Mark changes with incomplete tasks as "(In Progress)".

   **Describe the delivery**: always announce the selected change by what it delivers, in one line (for example, "Entrega: adds `.gitattributes` to the code repository and binds Docker ports to 127.0.0.1"). Show the change name only when it is needed to tell two active changes apart, or when the user asks for it. When asking the user to pick a change, list each one with its one-line delivery and its name. To work on another change, the user names it or passes its name to the command. When you point to the next step, show the command alone, without the change name (for example, `/opsx:verify`).

2. **Check status to understand the schema**
   ```bash
   openspec status --change "<name>" --json
   ```
   Parse the JSON to understand:
   - `schemaName`: The workflow being used (e.g., "spec-driven")
   - `planningHome`, `changeRoot`, `artifactPaths`, and `actionContext`: path and scope context
   - Which artifacts exist for this change

2a. **Review before verify**: decide whether the change altered code, with the definition of apply step 6a (anything executed, loaded or interpreted by tools or agents), from its commits (the `OpenSpec-Change:` trailer) or its diff. If it did and `review.md` is missing from `changeRoot` (from the status above, which points to the store when one is selected), stop here, before any other check: write no `verification.md`, say that the code review (apply step 6a) is a prerequisite of the verification, and offer to run it. Continue only once `review.md` exists. A change that did not alter code goes on normally.

3. **Get planning context and load artifacts**

   ```bash
   openspec instructions apply --change "<name>" --json
   ```

   This returns the change directory, `contextFiles` (artifact ID -> array of concrete file paths), `taskTrackingConfigured`, and top-level `tasks` and `progress` aggregated from every concrete file matched by the schema's `apply.tracks` configuration that could be read. Read all available artifacts from `contextFiles`.

   Treat apply `state` and `instruction` as context, not a verification verdict. Do not implement tasks or archive the change during verification.

4. **Initialize verification report structure**

   Create a report structure with three dimensions:
   - **Completeness**: Track tasks and spec coverage
   - **Correctness**: Track requirement implementation and scenario coverage
   - **Coherence**: Track design adherence and pattern consistency

   Each dimension can have CRITICAL, WARNING, or SUGGESTION issues.

   Verification is advisory. Respect intentional omissions such as `skip_specs: true`, optional design documents, and schemas without task tracking. Do not require or invent optional or intentionally omitted artifacts to obtain a clean report. `Not verified` describes a limit of this report, not a new archive prerequisite. Archive retains its own checks and user-confirmation behavior.
   Mark checks the schema does not define, or artifacts the status reports as intentionally skipped, as **Not applicable**. The correctness checks of a change whose readable delta specs contain REMOVED or RENAMED requirements but no ADDED or MODIFIED requirements are also **Not applicable** (see step 6). Exclude them from skipped-check counts and the archive-readiness assessment. Reserve **Not verified** for applicable checks whose evidence is missing or unusable.

   If only task evidence is available for applicable checks, verify task completion only and mark the remaining applicable checks, including **Code Pattern Consistency**, as not verified with the reason "Only task evidence available".

   If artifacts cannot be read or contain no usable requirements, scenarios, or design decisions, mark the affected checks as not verified with the specific reason. Continue checks supported by the remaining evidence, but a partially checked input set is not a fully verified check. Missing requirements affect Spec Coverage and Requirement Implementation Mapping; missing scenarios affect Scenario Coverage; missing design decisions affect Design Adherence.

5. **Verify Completeness**

   **Task Completion**:
   - If `taskTrackingConfigured` is false, report **Task Completion** as not applicable. Do not treat empty `tasks` as missing evidence.
   - Otherwise, use the top-level `tasks` and `progress` fields. They already aggregate every readable concrete file matched by `apply.tracks`, regardless of the tracked artifact's ID; do not infer tracking from a `contextFiles` key.
   - If `unavailableTrackingFiles` is nonempty, mark **Task Completion** as not verified and include every unavailable path and reason. Continue using any readable task evidence, but do not infer completion from the partial `tasks` and `progress` fields.
   - If `taskTrackingConfigured` is true and `tasks` is empty, mark **Task Completion** as not verified and record the reason from apply `state` and `instruction`. Nonzero totals alone do not establish evaluable task descriptions.
   - Report complete vs total tasks from `progress`.
   - If `progress.remaining` is greater than 0:
     - Add CRITICAL issue for each listed incomplete task. If the remaining count exceeds the listed incomplete tasks, also report the incomplete checkboxes without descriptions and recommend adding descriptions and completing them. Do not infer completion from the listed tasks alone.
     - Recommendation: "Complete task: <description>" or "Mark as done if already implemented"

   **Code review record**: decide whether the change altered code from its commits (the `OpenSpec-Change:` trailer) or its diff, with the definition of apply step 6a (anything executed, loaded or interpreted by tools or agents), never from what `review.md` claims. If it did, read `review.md` in the change directory. Missing file (normally already stopped at step 2a), or a Critical or Important finding without a fix or a justification: add a CRITICAL issue "Code review missing or unresolved". A `não aplicável` entry for a change that did alter code is also CRITICAL. If code commits of the change come after the last review's `HEAD_SHA`, other than the fix commits it lists, add a WARNING "Code review is stale". Report the review range and reviewer under `Comandos:` (for example, `review.md → <BASE_SHA>..<HEAD_SHA>, <reviewer>`); only a missing, unresolved or stale review becomes an `Itens:` line.

   **Dependencies in Impact**: list the dependencies (libraries, packages, services) that the proposal's Impact says the change adds. For each one, check that a task installs or configures it; for libraries and packages, also check that it appears in the project's dependency manifest (not applicable when the project has none, and never for services). Add a WARNING `Dependency in Impact without task or manifest entry: <name>` for each miss, with the recommendation to add the task or remove it from the Impact.

   **Spec Coverage**:
   - If status marks the spec artifact skipped by `skip_specs: true`, or the schema defines no spec artifact (no artifact whose `artifactPaths.<id>.outputPath` is under `specs/`), report the spec-dependent checks as not applicable.
   - Otherwise, `contextFiles` is keyed by artifact id, and artifact ids come from the active schema, so do not assume an id such as `specs`. The spec artifacts are those whose `artifactPaths.<id>.outputPath` is under `specs/`; read their files from `contextFiles.<id>`. If those spec files are absent or empty, mark **Spec Coverage**, **Requirement Implementation Mapping**, and **Scenario Coverage** as not verified; do not treat any of them as clean.
   - If delta specs exist in those spec files:
     - Extract all requirements (marked with "### Requirement:", or listed as `FROM:`/`TO:` pairs under `## RENAMED Requirements`) and note the delta section each one sits under: `## ADDED`, `## MODIFIED`, `## REMOVED`, or `## RENAMED Requirements`. The section decides what the check looks for.
     - For each ADDED or MODIFIED requirement (for MODIFIED, check the text in the delta, not the old wording):
       - Search codebase for keywords related to the requirement
       - Assess if implementation likely exists
     - If ADDED or MODIFIED requirements appear unimplemented:
       - Add CRITICAL issue: "Requirement not found: <requirement name>"
       - Recommendation: "Implement requirement X: <description>"
     - For each REMOVED requirement, the change asks for the behavior to be gone, so invert the check:
       - A REMOVED block carries only the requirement name and any `**Reason**`/`**Migration**` notes, so the delta does not describe the behavior itself. Before searching, read the baseline requirement in the main spec at `<planningHome.root>/openspec/specs/<capability-path>/spec.md`, using the same capability path as the delta spec. Match it by normalized name, scanning that file's requirement headings rather than string-matching the delta's exact title. Its body and scenarios are the evidence for the behavior that must be gone; never search from the requirement name alone.
       - If that file holds no such requirement under this or a near-equivalent name - for example because an earlier sync already applied the removal - recover the baseline from the same file's history, in the planning repository rather than the current directory: `git -C "<planningHome.root>" log -p -- openspec/specs/<capability-path>/spec.md`, or `git -C "<planningHome.root>" show <commit>^:./openspec/specs/<capability-path>/spec.md` once you have identified the commit that applied the removal. Empty output means the pathspec matched nothing, not that there is no baseline: `git log` reports an unmatched path as success, so re-check the path before drawing any conclusion from silence.
       - A baseline that adds nothing to its own title - no body beyond a restatement of the name, no scenarios - is unusable evidence, the same as a missing one. If no usable baseline is available in either place, mark **Spec Coverage** as not verified for that entry with the reason and stop there: do not search, and never count an unsearched removal as passing.
       - Search codebase for that behavior. Matches in `openspec/` artifacts or docs, or in code that serves only the Migration note or an ADDED requirement, are not evidence by themselves. Report any code path that still delivers the removed behavior, including one shared with an ADDED requirement.
       - Finding no implementation is the expected result, but only once the baseline behavior was the thing you searched for. Never report a REMOVED requirement as "Requirement not found" or recommend implementing it.
       - If the behavior is still present:
         - Add CRITICAL issue: "Removed requirement still implemented: <requirement name>"
         - Recommendation: "Remove the remaining implementation at <file>:<lines>, following the requirement's Migration note if it has one"
     - For each RENAMED entry (`FROM:`/`TO:`), the name changes but the behavior stays, so check the TO requirement for that unchanged behavior:
       - Do not report the FROM name as missing, and do not require code symbols, identifiers, or file names to be renamed.
       - If the TO name also appears under MODIFIED, its behavior is checked there against the MODIFIED text; skip it here.
       - Otherwise, read the baseline requirement in the main spec at `<planningHome.root>/openspec/specs/<capability-path>/spec.md`, using the same capability path as the delta spec: the requirement under the FROM name, or under the TO name only when the FROM name is absent because the main spec is already synced. Its body and scenarios are the evidence for the behavior the TO requirement keeps.
       - Search codebase for that behavior and assess if it is still implemented.
       - If it appears unimplemented:
         - Add CRITICAL issue: "Renamed requirement not found: <TO name>"
         - Recommendation: "Restore the behavior of <TO name> (renamed from <FROM name>); a rename must not change behavior"
       - If the baseline requirement cannot be found or read, mark **Spec Coverage** as not verified for that entry with the reason. Never count an unchecked rename as passing.

6. **Verify Correctness**

   If the delta specs are readable and contain at least one REMOVED or RENAMED requirement but no ADDED or MODIFIED requirements (the change only removes or renames requirements), report **Requirement Implementation Mapping** and **Scenario Coverage** as **Not applicable**. The REMOVED and RENAMED checks under Spec Coverage are the evidence for such a change (each REMOVED and RENAMED entry with a usable baseline is checked there against its baseline behavior, and an entry already marked not verified there stays not verified), so do not mark these two checks as not verified. A delta spec with no parseable requirements at all is unusable evidence, not a removal-only change: mark these checks as not verified.

   **Requirement Implementation Mapping**:
   - For each ADDED or MODIFIED requirement from delta specs (REMOVED entries, and RENAMED entries without a MODIFIED block, were settled under Spec Coverage):
     - Search codebase for implementation evidence
     - If found, note file paths and line ranges
     - Assess if implementation matches requirement intent
     - If divergence detected:
       - Add WARNING: "Implementation may diverge from spec: <details>"
       - Recommendation: "Review <file>:<lines> against requirement X"

   **Scenario Coverage**:
   - For each scenario under an ADDED or MODIFIED requirement in delta specs (marked with "#### Scenario:"):
     - Check if conditions are handled in code
     - Check if tests exist covering the scenario; map tests to scenarios by the requirement and scenario cited in the test name or comment first, and by inspection only when there is no citation
     - If scenario appears uncovered:
       - Add WARNING: "Scenario not covered: <scenario name>"
       - Recommendation: "Add test or implementation for scenario: <description>"
   - Skip scenarios under a REMOVED requirement; that behavior is meant to be gone.

   **Agent-run browser scripts**: when the evidence of a browser verification script says an agent ran it without real interaction (HTTP requests, no clicks or typing), report each scenario it covers as partially covered under `Não verificado` (reason: "roteiro executado por agente, sem interação") and ask for a human run before archive. This is a pause: do not suggest the archive until a person has run the script, or the user explicitly accepts the partial coverage in this conversation. A run by a person, or by an automated browser that clicks, covers the scenario.

   **Interface quality gate**: when the change's `design.md` has a "Brief visual" section, read `interface-report.md` in `changeRoot` (skill `interface-quality`). A missing report, a report without the "Avaliação do validador" section, or a final grade there of `fraco` is a CRITICAL issue "Interface below client-ready", citing the grade and the listed corrections; the change goes back to apply. A final grade of `médio` or better passes. The report's journeys ran in a real browser with clicks and typing, so they count as interactive coverage for the scenarios they exercise. When the change has no `design.md`, or its `design.md` has no "Brief visual" section, but tasks, design or delta specs mention a screen, page, form, layout, visual component, front-end or UI in the sense of something a user sees (in Portuguese: tela, página, formulário, layout, componente visual, front-end, interface de usuário), or the change has `interface/jornadas.json`, add a WARNING "Screens without visual brief" that quotes the words or files that triggered it, and ask the user whether the change has screens. If they confirm, turn it into a CRITICAL issue and recommend `/opsx:update` to add the brief, the screen states and the browser validation. If they say no, keep one line under `Itens:`: `[warning] Screens without visual brief: o responsável disse que não há tela (<trigger>)`. Without an answer, keep the WARNING and do not suggest the archive until it is answered.

7. **Verify Coherence**

   **Design Adherence**:
   - If the schema defines no design artifact (no artifact with id `design`, and none whose `artifactPaths.<id>.outputPath` is or ends in `design.md`), report **Design Adherence** as not applicable.
   - If the design artifact's `contextFiles.<id>` file exists:
     - Extract key decisions (look for sections like "Decision:", "Approach:", "Architecture:")
     - Verify implementation follows those decisions
     - If contradiction detected:
       - Add WARNING: "Design decision not followed: <decision>"
       - Recommendation: "Update implementation or revise design.md to match reality"
   - Otherwise, if the design artifact's `contextFiles.<id>` file is absent or empty: mark **Design Adherence** as not verified. With other supporting artifacts, **Code Pattern Consistency** still runs; the task-only case remains limited to task completion.

   **Code Pattern Consistency**:
   - If implementation changes cannot be identified, mark **Code Pattern Consistency** as not verified and explain the missing evidence.
   - Otherwise, review new code for consistency with project patterns
   - Check file naming, directory structure, coding style
   - If significant deviations found:
     - Add SUGGESTION: "Code pattern deviation: <details>"
     - Recommendation: "Consider following project pattern: <example>"

8. **Generate Verification Report**

   **Summary Scorecard**:
   ```markdown
   ## Verification Report

   **Entrega:** <one line on what the change delivers>

   ### Summary
   | Dimension    | Status           |
   |--------------|------------------|
   | Completeness | X/Y tasks, N reqs|
   | Correctness  | M/N reqs covered |
   | Coherence    | Followed/Issues  |
   ```

   In each Status cell, report the results of checks that ran and `Not verified (<reason>)` for every skipped check. If all checks in a dimension were skipped, start the cell with `Not verified`. Never score a skipped check as passing. Treat every not verified or partially verified check as skipped in the final assessment. Count only ADDED and MODIFIED requirements in N, and report REMOVED and RENAMED requirements separately (for example, "1 removal confirmed, 1 rename verified", or "1 removal not verified (baseline unavailable)"). For a change that only removes or renames requirements, the Correctness cell reads `Not applicable (no ADDED or MODIFIED requirements)`.

   **Issues by Priority**:

   1. **CRITICAL** (Must fix before archive):
      - Incomplete tasks
      - Missing requirement implementations
      - Removed requirements still implemented
      - Renamed requirements whose behavior is no longer implemented
      - Each with specific, actionable recommendation

   2. **WARNING** (Should fix):
      - Spec/design divergences
      - Missing scenario coverage
      - Each with specific recommendation

   3. **SUGGESTION** (Nice to fix):
      - Pattern inconsistencies
      - Minor improvements
      - Each with specific recommendation

   **Final Assessment**:
   - If CRITICAL issues: "X critical issue(s) found. Fix before archiving." If any check was skipped, also name every skipped check and its reason.
   - If no CRITICAL issues, one or more warnings, and no checks were skipped: "No critical issues. Y warning(s) to consider. Ready for archive (with noted improvements)."
   - If only suggestions and no checks were skipped: "No critical issues or warnings. Z suggestion(s) to consider. Ready for archive (with noted improvements)."
   - If no issues and no checks were skipped: "All checks passed. Ready for archive."
   - If any check was skipped and there are no CRITICAL issues: do not claim readiness. Say "No critical issues found in the checks that ran. <check(s)> not verified: <reason>." Include the warning count when nonzero.
   - Include the suggestion count when nonzero in every final assessment.

   **Write the verification record**:
   After presenting the report, append an entry to `verification.md` in the change directory (`changeRoot`), creating the file if it does not exist. Do this on every run, including a clean one. Never rewrite or remove earlier entries; the newest entry goes last. Write the `# Verificações` title only when you create the file, and do not copy the full report into it. Use exactly this format, one `##` section per run:

   ```markdown
   # Verificações — <change-name>

   ## YYYY-MM-DD

   - Críticos: <n>
   - Warnings: <n>
   - Sugestões: <n>
   - Não verificado: <check (reason); check (reason)>, or — when every check ran
   - Camadas: <layer (command); layer (command)>, or — (sem matriz no project.md)
   - Cobertura fora da suíte: <scenario (where the evidence is; who ran it); ...>, or —
   - Avaliação: <the final assessment in one line>

   Itens:

   - [crítico] <one-line summary> (`<file:line>` when there is one)
   - [warning] <one-line summary>
   - [sugestão] <one-line summary>

   Comandos:

   - `<command>` → <relevant result> (exit <code>)
   - `<command>` → <relevant result> (exit <code>; reused from apply)

   Triagem:

   - <tool>: <finding> → real | não se aplica | risco aceito (<ADR/decisão>) | falso positivo | não verificado (<motivo>) — <evidência>
   ```

   Write one `Itens:` line per issue of the report, or `Itens: nenhum`. Under `Comandos:`, list every command you ran or reused, with a one-line result (for example, `130 passed`), never the full output; write `Comandos: nenhum (<reason>)` when the run was inspection only. `Cobertura fora da suíte` lists every scenario whose only evidence is a manual run, a script outside the repository or an external tool, as the **Evidence reuse** heuristic requires. Write the `Triagem:` section only when the run triaged a report from an external tool, as the **External report triage** heuristic requires; leave it out otherwise.

**Verification Heuristics**

- **Completeness**: Focus on objective checklist items (checkboxes, requirements list)
- **Correctness**: Use keyword search, file path analysis, reasonable inference - don't require perfect certainty
- **Coherence**: Look for glaring inconsistencies, don't nitpick style
- **False Positives**: When uncertain, prefer SUGGESTION over WARNING, WARNING over CRITICAL
- **Actionability**: Every issue must have a specific recommendation with file/line references where applicable
- **Project validation commands**: take test, lint, typecheck and build evidence from the commands in the "Comandos de verificação" section of `openspec/project.md` that apply to the change. A command recorded as missing or postponed there is reported as not verified with that reason; never invent a replacement. **Accepted failures**: when `openspec/estado-atual.md` has the "Falhas aceitas" section, compare each failure of the commands that ran (the project's commands and the ADRs' `verificacao`) with its Falha column, by the exact identifier (test name, or linter rule plus file) and not by message text. A listed failure is recorded under `Comandos:` as `aceita (catraca: <failure>)`, with no issue; a failure not listed is a regression and stays CRITICAL; a row whose verification ran and whose failure did not appear is a WARNING ("catraca envelhecida: retire a linha").
- **Interface contract check**: when the change touches an interface registered in "Contratos de interface", run the "Teste de contrato" command from `project.md` and report both directions: operations declared but not implemented, and operations implemented but not declared. A confirmed divergence is CRITICAL. A missing or postponed command is not verified, with the reason. When the change touches a third-party contract copy or its integration, recompute its SHA-256 over the content with CRLF normalized to LF (the command in the "Contratos de interface" note of `project.md`) and compare it with the `SHA-256:` line of `ORIGEM.md`; a mismatch is CRITICAL. A service that does not expose its contract hash is not an issue.
- **Verification layers**: when `project.md` has the "Camadas de verificação" table, decide which layers apply to the change (for example: a changed screen → E2E or roteiro manual; a changed route → contrato; a domain rule → unitário). List the layers that ran in the record's `Camadas:` line, with their command. A layer that applies and did not run goes under `Não verificado`, with the reason, even when the table marks it "Adiado" (write it as `<layer> (Adiado na matriz)`, so the count of unverified checks shows which ones are deferred layers). Without the table, write `Camadas: — (sem matriz no project.md)`.
- **Engineering principles**: for a change that altered code, read the "Princípios de engenharia" line and the validation and logging decisions of `project.md`, then check the code the change wrote. Without that line, all three items apply. An external input (request, message, file, environment variable) used without the project's validation tool (for example Zod, Pydantic, Bean Validation or FluentValidation, whichever `project.md` records) is a WARNING; when the validation decision is postponed, report the boundary as a WARNING citing the postponed decision. A mutation or critical boundary without the initiated, success and failed log states is a WARNING, unless `project.md` marks the three-state log "Não aplicável". An error response that returns an internal exception, driver or stack text, or the personal data or credentials of someone other than the caller, or a log that writes personal data or credentials unmasked, is CRITICAL; field-level validation messages meant for the client and the caller's own data returned to them are not leaks. A scenario test that does not cite its requirement and scenario is a SUGGESTION. Cite file and line for each.
- **Evidence reuse**: Reuse a result recorded during apply only when it names the command and its exit code and no code file changed after it (check with `git log` and `git status`); otherwise run the command again. A check kept outside the repository (a manual run, a script in a temp folder) is not automated coverage: report the scenario as covered outside the suite.
- **External report triage**: when the user or the change provides a report from an external analysis tool (static analysis, dependency scanner, automated review), triage every finding before acting on it. Confirm it in the code (file and line), in the configuration and in the recorded decisions (ADRs, `project.md` constraints). Classify it as **real**, **not applicable** (the pattern exists but cannot be exploited here, with the reason), **accepted risk** (cite the ADR or recorded decision) or **false positive** (cite the code that disproves it). Keep the reported severity, or raise it, for every real finding; never lower it to make the report look better. A finding you cannot confirm or disprove stays not verified, with the reason: list it also under `Não verificado:` and do not claim the change is ready for archive while it stays there. Real findings become `Itens:` of the verification record, mapping the tool's severity as critical or high → `[crítico]`, medium → `[warning]`, low or info → `[sugestão]`, never lower; add one line under `Triagem:` per finding with its class and evidence.
- **Declared gaps**: when the store has `openspec/lacunas.md`, run `node <root>/scripts/lacunas.mjs --raiz <root>`, where `<root>` is the `root.path` that `openspec list --json` reports (with the selected `--store <id>`), adding `--codigo <code repository root>` when a row cites `codigo:`; a missing `openspec/` under `--raiz` exits 2, so a wrong root never passes and record the result under `Comandos:`; a failure is a CRITICAL issue. When `project.md` records a "Conferência de lacunas" command under "Comandos de verificação", run it too. For each reference source the change touches (main specs it affects, ADRs it cites, documents named in the proposal or design), add a CRITICAL issue for (a) a divergence the change introduced or revealed that is neither fixed nor declared in the registry, and (b) a declared gap the change closed while its row is still in the registry. Without the registry, skip this check without an issue.
- **ADR verification**: for each Accepted ADR the change touches (cited in `design.md` or tied to the affected capabilities), read its `imposicao`; without it, the ADR counts as `controle` when it has `verificacao` and as `norma` when it does not. A `controle` or `consultivo` ADR with an empty `verificacao` is CRITICAL ("verificador ausente"). A `norma` ADR runs nothing, even when it lists a `verificacao`, and does not go under `Não verificado`; to have its check run, the ADR declares `consultivo`. For the other ADRs, run each listed command or test, or reuse its evidence as **Evidence reuse** allows, and record it under `Comandos:`. Before grading a failure, compare it with **Accepted failures**: the catraca also covers ADR checks. A missing test is a CRITICAL issue naming the ADR and the cited command or path. A failing test is CRITICAL for `controle` and a WARNING for `consultivo`, with the output. For `externo`, check that the cited configuration file exists, that the rule is in it and that it is not turned off (for example `off`, `0` or `ignore`, or the rule inside an exclusion block); a missing or disabled rule is CRITICAL, and when `project.md` records the tool's command, run it too; when you cannot read the configuration format, report it under `Não verificado` with the reason instead of passing it. A check that runs with nothing to scan (the folder or files of its surface do not exist yet, or its output says nothing was checked) goes under `Não verificado` as `<ADR> (nada a varrer)` and does not count as passing.
- **ADR check seen failing**: for each `verificacao` this change added or changed (compare the ADR with the branch base), look in `tasks.md` for the evidence of two runs: with the violation injected (it failed) and clean (it passed), with both exit codes. Without it, report a WARNING naming the ADR; for an ADR this change promoted to `controle`, report a CRITICAL. Also check the diff for leftovers of the injected violation.
- **Exit conditions**: when `openspec/estado-atual.md` exists, read the "Sai quando" of the "Fora do ciclo atual" and "Falhas aceitas" tables and check the conditions you can (a path exists, a change is archived, an ADR status, a `project.md` line). A condition already met with the row still in the table is a WARNING naming the row and the fact (close it in a change or renew the reason); a condition that cannot be checked (for example "quando der tempo", or a date alone) is a SUGGESTION to rewrite it as a checkable fact; a checkable condition not yet met needs nothing.

**Output Format**

Use clear markdown with:
- Table for summary scorecard
- Grouped lists for issues (CRITICAL/WARNING/SUGGESTION)
- Code references in format: `file.ts:123`
- Specific, actionable recommendations
- No vague suggestions like "consider reviewing"

**Stop and show the next step**: this workflow runs one stage only. When it ends, stop and show the next stage in three lines: what it will do (one line), the suggested approval (`Eu aprovo fazer <description>`), and the command to type (`/opsx:<stage>`, without the change name). Never start the next stage yourself, even when `## Aprovação` has `Escopo: archive`: each stage starts only after the user writes its approval and types its command. A stage without a command (push, pull request, merge, release) needs an explicit request or a condition recorded in `## Aprovação`.
