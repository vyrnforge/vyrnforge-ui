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
- Keep normal CI, Pages deployment, npm publication, registry verification, and
  GitHub release creation as separate responsibilities.
- Use read-only permissions by default.
- Use npm trusted publishing through GitHub OIDC only in the protected publish
  job.
- Keep expensive cross-version checks in the nightly workflow instead of every
  pull request.

## Workflow map

| Workflow | Trigger | Responsibility | Write capability |
| --- | --- | --- | --- |
| `.github/workflows/ci.yml` | Pull request, push to `main`, manual | Plan affected scopes, invoke reusable validation, expose `quality`, `external-consumer`, and `ci-gate` | None |
| `.github/workflows/_quality.yml` | `workflow_call` | Metadata, lint, targeted/full typecheck, and targeted/full tests | None |
| `.github/workflows/_packages.yml` | `workflow_call` | Clean package builds, package payload validation, declarations, CSS, LICENSE, and dry-run packs | None |
| `.github/workflows/_consumer.yml` | `workflow_call` | Packed-artifact consumer installation and production build | None |
| `.github/workflows/_docs.yml` | `workflow_call` | Documentation and playground builds | None |
| `.github/workflows/pages.yml` | Successful `VyrnForge CI` run on current `main`, manual | Build and deploy GitHub Pages only | Pages deployment only |
| `.github/workflows/release.yml` | Manual | Verify candidate, publish through OIDC, verify registry consumer, create tag and GitHub Release | Split by job |
| `.github/workflows/nightly.yml` | Weekly schedule, manual | Full Node 22/24 validation and high-severity dependency audit | None |

Reusable workflow files live directly in `.github/workflows/` because GitHub
Actions does not support reusable workflow subdirectories.

## Package dependency impact

The package graph is:

```text
ui-core
  └─ ui-components
       └─ ui-data-grid
```

`ui-data-grid` also depends directly on `ui-core`.

The change planner uses the following impact rules:

| Changed area | Package quality | Package payloads | Consumer | Docs | Playground |
| --- | --- | --- | --- | --- | --- |
| `ui-core` runtime/public surface | core, components, data-grid | all | yes | yes | yes |
| `ui-components` runtime/public surface | components, data-grid | all | yes | yes | yes |
| `ui-data-grid` runtime/public surface | data-grid | all | yes | yes | yes |
| Package test only | changed package | no | no | no | no |
| Package README or package LICENSE | no | all coordinated payloads | yes | no | no |
| Consumer fixture | no | included by consumer verifier | yes | no | no |
| Metadata | metadata | no | no | yes | no |
| Canonical docs | no | no | no | yes | no |
| Docs app | no | no | no | yes | no |
| Playground app | no | no | no | no | yes |
| Root manifest, lockfile, shared build config, scripts, or workflows | full | all | yes | yes | yes |
| Unknown path | safe full fallback | all | yes | yes | yes |

The planner is implemented by `scripts/detect-ci-scope.mjs`. Its machine outputs
are:

- `quality`
- `metadata`
- `ui_core`
- `ui_components`
- `ui_data_grid`
- `packages`
- `consumer`
- `docs`
- `playground`
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

The long-term required branch-protection check is:

```text
ci-gate
```

The orchestrator temporarily preserves these compatibility checks:

```text
quality
external-consumer
```

This allows the workflow refactor to merge without immediately breaking the
existing branch rule. After the new workflow has completed successfully on
`main`:

1. Add `ci-gate` as a required check.
2. Confirm a test pull request is blocked while `ci-gate` is pending or failing.
3. Remove the old `quality` and `external-consumer` requirements.
4. Keep the compatibility jobs until a later infrastructure cleanup release.

## Validation responsibilities

### Quality

`scripts/run-scoped-quality.mjs` performs targeted package typecheck and tests
when possible. It builds required package prerequisites once and suppresses
repeated `pretypecheck` rebuilds.

A full scope runs the authoritative root typecheck and test commands.

### Package payloads

Package verification remains coordinated because the three packages share one
release version and exact internal dependencies during alpha. It verifies all
publishable artifacts even when only one package changed.

### External consumer

The external-consumer job always uses packed artifacts, never workspace links.
It remains independent from the package job so a clean runner proves the public
boundary.

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
`npm run verify:ci`. This prevents the repository templates from drifting back
to duplicated command checklists or omitting required release evidence.

## Pages deployment

`pages.yml` owns GitHub Pages only. The build job has `contents: read`; only the
deploy job receives `pages: write` and `id-token: write`.

Automatic deployment begins only after `VyrnForge CI` completes successfully on
`main`. The workflow checks out that exact verified commit and rejects the run
when it is no longer the current `origin/main`, preventing a slower stale CI run
from overwriting a newer Pages deployment. Manual dispatch is still available,
but the same current-main guard applies.

Pages no longer repeats the entire repository test suite. It verifies metadata,
builds publishable packages, builds the docs application and playground with
the deployment base paths, then deploys the assembled static artifact.

## Trusted release pipeline

`release.yml` is manual and serialized. It has four responsibilities:

1. **verify-release** — read-only candidate validation; no environment and no
   OIDC.
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

- full quality on Node 22;
- full quality on Node 24;
- package payloads;
- packed external consumer;
- docs and playground;
- high-severity dependency audit;
- one final `nightly-gate`.

Nightly never publishes, deploys, creates tags, or writes repository contents.

## Local commands

```bash
npm run test:ci-scope
npm run verify:workflows
npm run verify:templates
npm run verify:ci
npm run quality
```

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
- run `npm run verify:ci` before the broader quality suite.
