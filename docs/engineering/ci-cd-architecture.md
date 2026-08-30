# CI/CD Architecture

This document is the source of truth for VyrnForge UI continuous integration,
weekly assurance, documentation deployment, and package release orchestration.

## Lifecycle workflows

VyrnForge intentionally exposes only four GitHub Actions workflows.

- `.github/workflows/ci.yml` runs for pull requests to `main` or
  `integration/**`, pushes to `main`, and manual validation. It owns change
  planning, scoped or full validation, the exact-main delivery artifact, and
  the stable `ci-gate`. It has no write capability.
- `.github/workflows/assurance.yml` runs weekly or manually. It owns full
  quality and integration validation, the compatibility matrix, dependency
  audit, workflow lint, ShellCheck, CodeQL, and `assurance-gate`. Only its
  CodeQL job can write security events.
- `.github/workflows/deploy-pages.yml` consumes a successful current-main CI
  artifact and deploys it. Only its deployment job receives Pages write and
  OIDC permissions.
- `.github/workflows/release.yml` is manual from current `main`. It verifies an
  immutable release artifact, publishes exact tarballs, verifies the registry,
  and creates the release record through narrowly scoped job permissions.

Internal validation responsibilities are jobs inside `ci.yml` and
`assurance.yml`; they are not separate reusable workflow files. This keeps the
GitHub Actions workflow inventory aligned with real lifecycle entrypoints.

## CI boundaries

`ci.yml` always runs for pull requests targeting `main` or a persistent
integration lane. It does not use workflow-level path filters.
`scripts/detect-ci-scope.mjs` selects quality, integration, browser, package,
consumer, docs, playground, fixture, and security work from the actual change.

- Task PR -> `integration/<lane>`: affected-scope validation once.
- Integration-lane merge or synchronization: no push-triggered CI duplication.
- Promotion or emergency hotfix PR -> `main`: full repository validation once.
- Push to `main`: exact-main delivery scope only. Quality and security are not
  rerun after the already-passed promotion gate.

The stable branch-protection check is `ci-gate`. It evaluates planner output and
the selected `quality-checks`, `integration-checks`, and `security-checks` jobs.
A selected responsibility must succeed; an unexpected skip, cancellation, or
failure fails the gate.

## Validation ownership

### Quality

The `quality-checks` job runs `scripts/run-scoped-quality.mjs`. It owns format,
lint, CSS lint, repository contracts, coverage, fixture validation, and
affected or full typechecking according to planner output.

### Integration and delivery

The `integration-checks` job owns package output preparation, packed consumer
verification, Chromium contracts, cross-framework generation smoke, repository
inventory, documentation and playground builds, and the commit-bound Pages
artifact. It prepares package output once per selected job and reuses it across
downstream checks.

Only a successful push CI run for current `main` creates
`pages-site-<commit>`. Pull requests and weekly assurance never create a
deployable Pages artifact.

### Security

PR security work is planner-selected inside `ci.yml`: high-severity
`dependency-review`, verified actionlint, ShellCheck, workflow contracts, and
security hardening verification.

Deep security drift is owned by `assurance.yml`: shipped-dependency audit,
actionlint, ShellCheck, CodeQL, and the complete compatibility matrix.

## Weekly assurance

`assurance.yml` runs Monday at 02:17 UTC and can also be dispatched manually.
It executes full Node 24.18 repository quality and integration validation, the
canonical Node, framework, and browser compatibility matrix,
dependency/security drift checks, and CodeQL. `assurance-gate` aggregates those
responsibilities. It never publishes packages, deploys Pages, creates tags, or
requests npm OIDC.

## Pages deployment

`deploy-pages.yml` is intentionally separate from normal CI to preserve least
privilege. Its preparation job has only Actions and repository read access. It
accepts only a successful `VyrnForge CI` push run for current `main`, verifies
that run's head SHA equals current `main`, downloads the matching
`pages-site-<sha>` artifact, and verifies the site contents. Only the deployment
job receives `pages: write` and `id-token: write`.

## Release pipeline

`release.yml` is the only normal npm release entrypoint and is manual. A release
is valid only from current `main` when a successful exact-main `VyrnForge CI`
push run exists for that commit. It does not rerun general CI or weekly
assurance.

The ordered responsibilities are:

1. `verify-release`: prepare and verify immutable release tarballs and bind them
   to source, CI, and digest metadata.
2. `publish-packages`: use the protected `npm-release` environment and publish
   only the retained tarballs through GitHub OIDC.
3. `verify-registry-release`: verify registry metadata, signatures, provenance,
   and a fresh consumer.
4. `create-release-record`: create or verify the annotated tag and GitHub
   release after registry verification.

No workflow stores long-lived npm or personal-access credentials.

## Toolchain baseline

Repository validation uses Node.js `24.18.0` and the root-pinned npm version.
The compatibility matrix additionally verifies the supported Node 22.12
consumer line. External GitHub Actions must be pinned to immutable full commit
SHAs with readable version comments.

## Repository protection

Repository rulesets are host configuration and must protect `main` and every
persistent `integration/*` lane. `ci-gate` is the required PR status check;
force pushes and deletion must be blocked for persistent lanes.

## Local verification

```bash
npm run check
npm run test
npm run build
npm run ci
npm run test:ci-scope
npm run verify:workflows
npm run verify:security-workflow-hardening
```
