---
name: nextjs-implementation
description: "Use when planning, implementing, or verifying an OpenSpec change in a Next.js/React/TypeScript project (App Router or Pages Router). Maps specs and scenarios to unit, component, and end-to-end tests, validation commands, server/client boundaries, and data migrations. Detect the existing setup and Next.js version; do not assume one."
---

# Next.js implementation for OpenSpec changes

Bridge the OpenSpec workflow to a Next.js codebase. This skill does not replace the OpenSpec workflow skills (`openspec-propose`, `openspec-apply-change`, `openspec-verify-change`) or framework guidance skills; it tells you how to turn approved artifacts into Next.js code, tests, and evidence.

## Relationship with other skills

- The OpenSpec workflow skills own status, artifacts, and task tracking. Follow them first; use this skill for the Next.js-specific parts.
- If Vercel's skills are available in this session (from `vercel-labs/agent-skills`, for example `react-best-practices`, `composition-patterns`, `web-design-guidelines`), use them for React/Next.js performance, composition, and UI review guidance.
- If they are not available and the task would benefit from them, mention once that they can be installed (`npx skills add vercel-labs/agent-skills`). Do not install them yourself.
- Next.js behavior changes between major versions (caching defaults, async request APIs, linting). When a detail depends on the version, check the documentation for the version in `package.json` instead of relying on memory. From Next.js 16.2, the package bundles its docs in `node_modules/next/dist/docs/`, and the project may have an `AGENTS.md` pointing there; read both when present.

## 1. Discover the project before planning or editing

Read, do not guess:

1. `package.json`: versions of `next`, `react`, and `typescript`, and the `scripts` (`dev`, `build`, `lint`, `test`, `typecheck`, `e2e`…). The scripts are the commands you run.
2. Package manager, from the lockfile: `package-lock.json` (npm), `pnpm-lock.yaml` (pnpm), `yarn.lock` (Yarn), `bun.lock`/`bun.lockb` (Bun). Use only that package manager.
3. Router: `app/` or `src/app/` (App Router), `pages/` (Pages Router), or both. Follow the router the affected area already uses.
4. `tsconfig.json` (`strict`, path aliases), `next.config.*`, the ESLint config, `middleware.ts` or `proxy.ts` (its name since Next.js 16), and `.env.example`.
5. Choices already in place: styling (Tailwind, CSS Modules…), UI library, data layer (Prisma, Drizzle, other) and its migrations folder, auth (Auth.js, Clerk, Supabase, custom), validation (Zod, Valibot…), data fetching (Server Components, TanStack Query, SWR), test tools (Vitest or Jest, Testing Library, Playwright or Cypress).
6. The CI workflow, to know which checks are required.

Record what you found in the design or in your report. If `openspec/project.md` or `config.yaml` states a choice that contradicts the code, report the contradiction instead of choosing silently.

## 2. Planning (proposal, design, tasks)

When helping `openspec-propose` or the Spec Architect:

- **Proposal:** name the routes and pages affected, the data store, and whether the change alters a public contract (route handler API, URL structure, database schema, cookies, environment variables).
- **Design:** for each piece, decide and state where it runs: Server Component, Client Component (`'use client'`), Server Action, Route Handler, or middleware. Also cover the data flow and caching/revalidation strategy, the validation schema for each input, the authorization check for each mutation, the loading, error, and not-found states, and the database migration.
- **Tasks:** each task names the files or routes it touches and an objective validation, normally a test file or test name plus the script that runs it, for example `pnpm vitest run src/features/orders/create-order.test.ts`. Put a separate task for each database migration and each new environment variable that must exist in other environments.

## 3. From scenarios to tests

Each OpenSpec scenario needs evidence. Map it like this:

| Scenario is about | Test type | Typical tooling |
|---|---|---|
| Business rule, calculation, validation schema | Unit test of a plain module, no framework | Vitest or Jest |
| Client Component rendering and interaction | Component test | Testing Library with Vitest or Jest |
| Server Action or Route Handler logic | Unit test of the extracted server function, plus an E2E test of the flow | Vitest or Jest; Playwright or Cypress |
| Async Server Component, navigation, full user flow, auth redirect | End-to-end test against a running build | Playwright or Cypress |

Rules:

- Name tests after the scenario so verification can trace them.
- Cover the error and boundary scenarios listed in the spec: invalid input, unauthorized user, not found, empty states.
- Unit test runners do not fully support async Server Components. Test their logic by extracting it into plain functions and cover the rendered result with E2E tests.
- Mock network and third-party services in unit tests. E2E tests must not hit real third-party production services.

## 4. Implementation rules

Follow the repository's conventions first. Where it has none, apply these:

- Business rules live in server-side modules (services or Server Actions that call them), never inside components. Keep components focused on rendering and interaction.
- Treat every Server Action and Route Handler as a public endpoint. Validate input with the project's schema library and check authentication and authorization inside it, even if the UI hides the control. Never trust IDs, prices, or roles sent by the client.
- Mark modules that touch secrets, the database, or server-only APIs with `import 'server-only'`, so importing them into client code fails the build.
- Only variables prefixed `NEXT_PUBLIC_` reach the browser, and they are inlined at build time. Never put a secret in one. Add new variables to `.env.example` without real values.
- Keep `'use client'` boundaries as low in the tree as possible. Do not pass non-serializable values or secrets as props from Server to Client Components.
- In recent Next.js versions, request APIs (`cookies()`, `headers()`, `params`, `searchParams`) are asynchronous, and caching defaults differ by version. Follow what the project's version requires.
- After a mutation, revalidate or refresh the affected data with the mechanism the project uses (`revalidatePath`, `revalidateTag`, router refresh, query invalidation).
- Provide `loading`, `error`, and `not-found` handling where the design lists those states.
- Keep TypeScript strict. Do not use `any`, `@ts-ignore`, or `eslint-disable` to make checks pass.
- Do not log personal or secret data on the server or in the browser console. This connects to the risk section of the proposal.
- Add a dependency only when the design justifies it, with the project's package manager.

### Database migrations

- Prisma: create migrations with `prisma migrate dev --name <name>` against a local database and review the generated SQL. `prisma migrate deploy` belongs to the deployment pipeline. Never run `prisma migrate reset` or `prisma db push` against a shared database.
- Drizzle: generate migrations with `drizzle-kit generate` and review the SQL. Apply them only to a local or test database.
- Destructive changes (dropping or narrowing columns, renames that lose data) need an explicit design decision and data plan. Stop and ask if the design does not cover them.

## 5. Validation commands

Use the `package.json` scripts and the project's package manager. The usual local checks are:

```text
<pm> run lint          # ESLint; `next lint` is deprecated since Next.js 15.5 and removed in 16
<pm> exec tsc --noEmit # if there is no typecheck script
<pm> run test          # unit and component tests
<pm> run build         # catches server/client boundary and type errors
<pm> run e2e           # or the project's Playwright/Cypress script
```

- Run the narrowest relevant tests while implementing a task, then lint, typecheck, unit tests, and build before marking the last task of a change complete. Run E2E when the change has E2E scenarios.
- Report each command and its result. A command you did not run is "not verified", never "passed".

## 6. Verification (before archive)

When helping `openspec-verify-change` or the QA Validator, provide for each ADDED/MODIFIED requirement the tests that cover each scenario and the command output that shows they pass. Also confirm that:

- `build` succeeds;
- no secret is reachable from client code (`NEXT_PUBLIC_` and `server-only` boundaries);
- each new Server Action or Route Handler validates input and checks authorization;
- migrations were generated and reviewed;
- new environment variables are in `.env.example`, along with the environments that still need them.

## Stop conditions

Stop and ask when the project's stack contradicts the artifacts, when a migration is destructive and the design does not cover it, when a public route or API contract would break without a decision in the design, or when validation requires real third-party services, a shared database, or a deployment.
