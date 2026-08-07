# CI/CD Architecture

This document is the source of truth for VyrnForge UI continuous integration,
documentation deployment, package publication, release recording, and scheduled
validation.

The CI/CD system is intentionally separated from component development. It must
not own product behavior, application state, public APIs, or styling contracts.

## Objectives

- Keep one stable branch-protection gate: `ci-gate`.
- Run the CI orchestrator for every pull request targeting `main` and every push
  to `main`.
- Select validation from the actual changed paths without workflow-level path
  filters.
- Validate affected packages and their downstream dependents.
- Keep CI validation and Pages artifact production separate from Pages
  deployment, npm publication, registry verification, and GitHub release
  creation.
- Use read-only permissions by default.
- Use npm trusted publishing through GitHub OIDC only in the protected publish
  job.
- Select security checks from changed paths and reserve complete compatibility,
  dependency, and CodeQL drift detection for nightly and release boundaries.

## Workflow map

| Workflow                             | Trigger                                                      | Responsibility                                                                                             | Write capability      |
| ------------------------------------ | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | --------------------- |
| `.github/workflows/ci.yml`           | Pull request, push to `main`, manual                         | Plan scopes, invoke quality/integration/security, expose `ci-gate`, and upload the current-main Pages site | None                  |
| `.github/workflows/_quality.yml`     | `workflow_call`                                              | Metadata, lint, coverage, targeted/full typecheck, accessibility, and regression-fixture verification      | None                  |
| `.github/workflows/_integration.yml` | `workflow_call`                                              | Selected package, consumer, browser, docs, playground, and commit-bound Pages artifact production          | None                  |
| `.github/workflows/pages.yml`        | Successful current-main CI push or manual existing CI run ID | Validate, download, package, and deploy the existing commit-bound Pages site                               | Pages deployment only |
| `.github/workflows/release.yml`      | Manual                                                       | Verify candidate, publish through OIDC, verify registry consumer, create tag and GitHub Release            | Split by job          |
| `.github/workflows/nightly.yml`      | Weekly schedule, manual                                      | Full pinned Node 24 LTS validation and high-severity dependency audit                                      | None                  |

Reusable workflow files live directly in `.github/workflows/` because GitHub
Actions does not support reusable workflow subdirectories.

## Toolchain baseline

Repository development, CI including Pages artifact production, release
verification, and nightly validation use:

- Node.js `24.18.0`, pinned by `.nvmrc` and `.node-version`;
- npm `11.16.0`, pinned by the root `packageManager`;
- TypeScript `7.0.2`, pinned exactly in the root and every workspace manifest.

`scripts/verify-toolchain.mjs` prevents version drift across manifests, the lockfile, and workflows. Development-only workspaces require Node `>=24.18 <25` and npm `>=11.16 <12`; published packages require npm `>=11.16 <12` and declare Node `>=22.12 <25` as the intended consumer compatibility target. BT-8005 verifies the published-package Node 22.12 lower bound and the Node 24.18 repository baseline across native HTML, React, Angular, and Vue consumers.

TypeScript 7 package builds separate runtime and declaration responsibilities. `tsup` emits ESM, CommonJS, and CSS with declaration bundling disabled. The native TypeScript CLI runs with each package's `tsconfig.build.json` to emit declaration-only output, and `scripts/prepare-package-declarations.mjs` removes CSS-only declaration imports and verifies that relative declaration references resolve before package verification. This avoids relying on declaration-bundling plugins built against the legacy TypeScript JavaScript compiler API.

## Package dependency impact

The package graph is:

```text
ui-core
  └─ ui-behaviors
       ├─ ui-components
       │    └─ ui-data-grid
       └─ ui-elements
```

`ui-components` and `ui-elements` also depend directly on `ui-core`.
`ui-data-grid` depends directly on both `ui-core` and `ui-components`.

The change planner uses the following impact rules:

Changes under `apps/regression-fixtures/**` are explicitly classified as fixture quality work. Changes under `tests/dom/**` run both shared component tests and regression fixtures. Package runtime changes also run fixtures because the fixture app validates public-package integration.

| Changed area                           | Package quality             | Package payloads              | Consumer | Docs | Playground | Fixtures                         | Browser  |
| -------------------------------------- | --------------------------- | ----------------------------- | -------- | ---- | ---------- | -------------------------------- | -------- |
| `ui-core` runtime/public surface       | core, components, data-grid | all                           | yes      | yes  | yes        | yes                              | Chromium |
| `ui-components` runtime/public surface | components, data-grid       | all                           | yes      | yes  | yes        | yes                              | Chromium |
| `ui-data-grid` runtime/public surface  | data-grid                   | all                           | yes      | yes  | yes        | yes                              | Chromium |
| Package test only                      | changed package             | no                            | no       | no   | no         | when shared DOM utilities change | no       |
| Package README or package LICENSE      | no                          | all coordinated payloads      | yes      | no   | no         | no                               | no       |
| Consumer fixture                       | no                          | included by consumer verifier | yes      | no   | no         | no                               | no       |
| Regression fixture app                 | fixture quality             | no                            | no       | no   | no         | yes                              | Chromium |
| Metadata                               | metadata                    | no                            | no       | yes  | no         | no                               | no       |
| Docs                                   | no                          | no                            | no       | yes  | no         | no                               | no       |
| Playground                             | no                          | no                            | no       | no   | yes        | no                               | no       |

The planner is implemented by `scripts/detect-ci-scope.mjs`. Its machine outputs
are:

- `quality`
- `integration`
- `security`
- `historical_evidence`
- `metadata`
- `ui_core`
- `ui_behaviors`
- `ui_components`
- `ui_elements`
- `ui_data_grid`
- `packages`
- `consumer`
- `docs`
- `playground`
- `fixtures`
- `browser`
- `full`
- `docs_only`

Planner behavior is covered by `scripts/detect-ci-scope.test.mjs`.

## Why the CI workflow always starts

The required workflow does not use `paths` or `paths-ignore`. A required
workflow skipped by workflow-level filtering can remain pending and block pull
requests. Instead, `ci.yml` always creates a run, computes a plan, skips only
irrelevant jobs, and finishes through `ci-gate`.

A skipped job is accepted by the aggregation jobs. A failed or cancelled job is
not accepted.

## Required status checks

The required branch-protection check is:

```text
ci-gate
```

`ci-gate` is the stable aggregate check. It directly evaluates the planner and
each reusable validation result. A planned validation must succeed; a skipped
validation is accepted only when the planner did not require it. Failed,
cancelled, or unexpectedly skipped planned work fails `ci-gate`.

The G1 quality checks aggregated by `ci-gate` are:

- toolchain and workflow-contract verification;
- package-boundary verification and package payload verification;
- ESLint, formatting, and CSS lint;
- TypeScript typechecking;
- unit and DOM interaction tests, including automated axe accessibility tests;
- Chromium browser contracts for affected runtime, fixture, and browser-test changes;
- package coverage thresholds;
- normalized component metadata and component-maturity verification; and
- documentation and playground builds whenever the planner requires them.

`ci-gate` evaluates the planner plus the selected quality, integration, and
security responsibilities. Compatibility drift is owned by nightly and release
preflight instead of every pull request. npm publication, registry verification,
Pages deployment, and release-record creation remain outside pull-request CI.

Repository rulesets remain external configuration and must require the stable
`ci-gate` check separately.

## Validation responsibilities

### Quality

`scripts/run-scoped-quality.mjs` runs the mandatory repository checks and
coverage suite, then performs targeted package typechecks when possible. It
builds required package prerequisites once and suppresses repeated
`pretypecheck` rebuilds.

A full scope runs the authoritative root typecheck command.

### Browser contracts

`.github/workflows/_integration.yml` owns the mandatory Chromium project. It installs
Chromium and its system dependencies, starts the deterministic regression fixture
application through Playwright `webServer`, runs `npm run test:browser`, and uploads
HTML reports, traces, screenshots, and JSON results when the job fails.

Browser work is independently planned through the `browser` scope. Runtime package
changes, fixture changes, `tests/browser/**`, and `playwright.config.ts` require the
integration job's browser responsibility. Documentation-only work does not.
`ci-gate` treats a required skipped integration job as a failure.

The release verification workflow installs Chromium before running the authoritative
`npm run ci` command. Nightly validation also runs the same reusable integration
workflow.

### Package payloads

Package verification follows the canonical BT-8002 release groups. The four
non-grid beta packages are built and packed together; `ui-data-grid` retains its
independent alpha version. BT-8003 verifies every public entry point and clean
offline tarball consumption. BT-8004 measures packed, unpacked, JavaScript,
declaration, CSS, and file-count dimensions and fails growth beyond the
approved budget unless a narrow, unexpired waiver exists.

### External consumer

The integration owner verifies the external consumer from packed artifacts,
never workspace links, while reusing package output prepared once in the same
job.

### Compatibility release matrix

`.github/workflows/_compatibility.yml` executes the canonical BT-8005 matrix.
Cases cover the supported Node 22.12 and Node 24.18 lines, React 18 and 19,
Angular 21 and 22, Vue 3.4 and 3.5, and native HTML in Chromium, Firefox, and
WebKit. Every case installs clean fixture dependencies, packs the VyrnForge
packages, rejects workspace links, typechecks, production-builds, and runs the
shared browser smoke scenarios. Each case uploads a machine-readable report.

### Security validation

`.github/workflows/_security.yml` owns pull-request dependency review, a
high-severity audit of shipped dependencies, CodeQL analysis, verified
`actionlint`, ShellCheck, immutable Action-pin enforcement, and security
contract checks. Permissions are job-scoped: normal checks are read-only, and
only CodeQL receives `security-events: write`. Mandatory failures cannot be
converted to warnings or hidden with `continue-on-error`.

### Documentation

Documentation and playground validation are separate from package publication.
A docs-only change does not run package runtime tests. Runtime package changes
still build docs and playground because those applications exercise the public
packages.

## Pull-request and issue intake contracts

The repository provides a compact automatic pull-request fallback plus focused
templates for component/package changes, documentation/examples, CI/CD
infrastructure, coordinated releases, and repository maintenance. Multiple
package-specific forms are avoided because a single upstream change may affect
several packages; the component/package template records all direct and
transitive package impact in one review.

Focused templates are stored under `.github/PULL_REQUEST_TEMPLATE/` and are
selected through GitHub's `template` query parameter. Template selection and
author checkboxes provide review evidence only. The generated planner output
remains authoritative and CI verifies the repository-template contracts.

Repository infrastructure has a dedicated issue form for CI orchestration,
planner behavior, package/consumer verification, Pages, trusted publishing,
registry proof, release records, nightly validation, and branch protection. The
release-readiness form is reserved for a specific candidate or published
release and captures version, dist-tag, release stage, partial-publication
state, provenance, consumer evidence, and expected final registry state.

`npm run verify:templates` enforces these intake contracts and is included in
`npm run check`. This prevents the repository templates from drifting back to
duplicated command checklists or omitting required release evidence.

## Pages deployment

The main-push `_integration.yml` job owns the deployable static-site build. It
uses the deployment base paths, assembles docs and playground output once, and
uploads `pages-site-<commit>` as a commit-bound CI artifact. Pull requests,
manual CI runs, and nightly validation do not create that deployable artifact.

Automatic deployment begins only after `VyrnForge CI` completes successfully on
`main`. `pages.yml` resolves the triggering run through the Actions API, requires
a successful `push` run for `main`, compares its `head_sha` with the current
`main` commit, and downloads only the matching named artifact. This prevents a
slower stale CI run from overwriting a newer deployment.

Manual dispatch requires the ID of an existing successful current-main CI push
run and follows the same validation path. The Pages workflow does not check out
source, install dependencies, run repository validation, or rebuild the site.
Its preparation job has only `actions: read` and `contents: read`; only the
deployment job receives `pages: write` and `id-token: write`.

## Trusted release pipeline

`release.yml` is manual and serialized. The compatibility and security reusable
workflows must succeed first. It then has four release responsibilities:

1. **verify-release** — read-only candidate validation, including BT-8003
   package artifacts and BT-8004 budgets for the non-grid beta group; no
   environment and no OIDC.
2. **publish-packages** — protected `npm-release` environment; `contents: read`
   plus `id-token: write`; publishes ui-core, ui-components, and ui-data-grid in
   dependency order.
3. **verify-registry-release** — read-only fresh installation from the public
   registry, exact metadata/dependency verification, npm registry-signature and
   provenance-attestation verification, typecheck, and production build.
4. **create-release-record** — `contents: write` only; creates the annotated Git
   tag and GitHub prerelease after registry verification.

The npm publishing job cannot write repository contents. The release-record job
cannot request npm OIDC. This separation limits the impact of each permission.

No workflow stores `NPM_TOKEN`, `NODE_AUTH_TOKEN`, or another long-lived
publishing credential.

### Prerelease dist-tags

The explicitly selected prerelease tag (`alpha`, `beta`, or `next`) is the
authoritative installation channel. npm may retain a registry-managed `latest`
tag even for prerelease-only packages. During prerelease:

- documentation must use the explicit prerelease tag;
- release verification must validate the selected tag;
- `latest` is not a stability signal;
- a stale `latest` mapping may be aligned manually when npm registry behavior
  requires it, but it is not used by the automated release contract.

## Git tags and GitHub Releases

Git tags and GitHub Releases are created only after all npm packages propagate
and a fresh registry consumer builds successfully.

The release tag format is:

```text
v<package-version>
```

Examples:

```text
v0.1.0-alpha.2
v0.1.0-beta.0
```

Prerelease versions create GitHub prereleases. The generated release notes list
the coordinated package versions, installation command, source commit, package
order, OIDC publication, and registry-consumer evidence.

## Nightly validation

The weekly nightly workflow runs at 02:17 UTC on Monday, away from the top of
the hour. It validates:

- full quality on the pinned Node `24.18.0` LTS baseline;
- package payloads;
- packed external consumer;
- docs and playground;
- the complete BT-8005 compatibility matrix;
- BT-8006 dependency, CodeQL, actionlint, ShellCheck, and workflow validation;
- one final `nightly-gate`.

Nightly never publishes, deploys, creates tags, or writes repository contents.

## Local commands

```bash
npm run check
npm run test
npm run build
npm run ci
npm run verify:toolchain
npm run format:check
npm run format
npm run test:ci-scope
npm run verify:workflows
npm run verify:templates
npm run test:beta-package-size-budgets
npm run verify:beta-package-size-budgets
npm run test:compatibility-release-matrix
npm run verify:compatibility-release-matrix
npm run test:security-workflow-hardening
npm run verify:security-workflow-hardening
```

`npm run format:check` verifies supported repository files without changing
them. `npm run format` applies the same formatter configuration.

To inspect a full planner result locally:

```bash
npm run ci:plan
```

To inspect a specific diff:

```bash
node scripts/detect-ci-scope.mjs --base <base-sha> --head <head-sha>
```

## Change rules

When changing CI/CD infrastructure:

- update this document and the release responsibility matrix;
- add planner tests for new path categories;
- preserve the `ci-gate` name;
- keep global workflow permissions read-only;
- do not add registry secrets;
- do not combine Pages deployment with npm publishing;
- do not combine npm OIDC and repository write permissions in one job;
- run focused workflow verification before the complete `npm run ci` validation.
