# CI/CD Architecture

This document is the source of truth for VyrnForge continuous integration,
weekly assurance, reference-site delivery, and package release orchestration.

## Lifecycle workflows

VyrnForge exposes four GitHub Actions workflows.

- `.github/workflows/ci.yml` runs for pull requests to `main`, pushes to
  `main`, and manual validation. Pull requests use the protected merge gate;
  pushes to `main` use delivery-only scope to build the exact-main reference
  artifact.
- `.github/workflows/assurance.yml` runs weekly or manually. It owns full
  quality/integration assurance, the compatibility matrix, dependency audit,
  workflow lint, ShellCheck, CodeQL, and `assurance-gate`.
- `.github/workflows/deploy-pages.yml` deploys only a verified current-main
  Pages artifact. It does not check out or rebuild repository source.
- `.github/workflows/release.yml` is the manual package-release entrypoint from
  current `main`. It verifies immutable package artifacts, publishes retained
  tarballs, verifies the registry, records the release, then refreshes the
  release-bound reference through the existing CI and Pages workflows.

Validation responsibilities live inside these lifecycle workflows rather than
in task-, framework-, or sprint-specific workflow files.

## Pull-request boundary

Normal work uses short-lived branches with pull requests to protected `main`.
Persistent `integration/*` branches are not part of the current model.

A pull request to `main` runs full validation through
`scripts/detect-ci-scope.mjs --full`. The stable merge-facing status is
`ci-gate`.

The gate aggregates:

- repository/package quality and static verification;
- documentation verification;
- integration, packed consumer, browser/accessibility, and generated-artifact
  evidence;
- security/workflow verification.

A selected responsibility must succeed. Failed, cancelled, or unexpectedly
skipped required work fails the gate.

## Exact-main delivery

A push to `main` does not repeat the full merge suite. It runs delivery scope
only so deployable artifacts are bound to the exact commit that actually
landed.

The delivery run builds the current Docs application, assembles versioned
reference output, writes `reference-artifact.json`, verifies the site, and
uploads `pages-site-<sha>`.

Manual `mode=delivery` uses the same path when the controlled release needs to
refresh the reference after a release tag is created.

## Validation ownership

### Quality

`quality-checks` runs `scripts/run-scoped-quality.mjs` and owns formatting,
lint, CSS lint, repository contracts, canonical metadata, generated-reference
drift, package boundaries, typechecking, tests/coverage, and fixture checks.

### Integration

`integration-checks` owns package output preparation, release-artifact dry-run
checks, packed external consumers, Chromium/browser contracts, cross-framework
generation smoke, repository inventory, docs builds, PR reference previews, and
exact-main Pages artifacts.

Reference-affecting pull requests may emit
`reference-preview-pr-<number>-<tested-commit>`. Preview artifacts are
immutable and explicitly non-deployable.

### Security

PR security checks include high-severity dependency review, pinned actionlint,
ShellCheck, workflow verification, and security-control verification.

Expensive security and ecosystem drift are owned by Weekly Assurance:
shipped-dependency audit, full compatibility cases, workflow lint, ShellCheck,
and CodeQL.

## Weekly Assurance

`assurance.yml` runs Monday at 02:17 UTC and may be dispatched manually. It
executes full quality/integration validation, the canonical compatibility
matrix, dependency/security drift checks, and CodeQL.

`assurance-gate` aggregates those responsibilities. Assurance never publishes
packages, deploys Pages, creates release tags, or requests npm publication OIDC.

## Pages deployment

`deploy-pages.yml` accepts a successful current-main delivery run, verifies the
run SHA still equals current `main`, downloads the matching
`pages-site-<sha>` artifact, and validates its lineage before deployment.

Only the Pages deployment job receives `pages: write` and deployment OIDC.
The deployment workflow never rebuilds source.

## Release pipeline

`release.yml` is manual and valid only from current `main` with successful
current-main CI evidence.

The ordered responsibilities are:

1. `verify-release` — prepare and verify retained package artifacts and bind
   them to source, CI, and digest metadata.
2. `publish-packages` — publish only those retained tarballs through the
   protected npm-release environment and OIDC.
3. `verify-registry-release` — verify registry metadata, provenance, and a
   fresh consumer.
4. `create-release-record` — create or verify the immutable tag and GitHub
   release after registry verification.
5. `refresh-release-reference` — dispatch delivery-only CI and Pages for the
   exact released commit so the tagged reference becomes available without a
   follow-up source commit.

No workflow stores long-lived npm or personal-access credentials.

## Repository protection

Repository host settings should protect `main` with pull-request entry,
required `ci-gate`, review requirements as configured, and force-push/deletion
protection.

Release tags remain immutable and separately protected.

## Toolchain baseline

Repository validation uses Node.js `24.18.0` and the root-pinned npm version.
The compatibility matrix may use additional supported Node/browser cases.
External GitHub Actions must be pinned to full commit SHAs with readable version
comments.

## Local verification

```bash
npm run check
npm run test
npm run build
npm run ci
npm run verify:workflows
npm run verify:security-workflow-hardening
```
