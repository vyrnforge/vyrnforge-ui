# CI/CD Architecture

This document is the source of truth for VyrnForge UI continuous integration,
weekly assurance, reference-site deployment, and package release orchestration.

## Lifecycle workflows

VyrnForge intentionally exposes only four GitHub Actions workflows.

- `.github/workflows/ci.yml` runs for pull requests to `main` or
  `integration/**`, pushes to `main`, and manual validation. It owns change
  planning, scoped or full validation, non-deployable PR reference previews,
  the exact-main delivery artifact, and the stable `ci-gate`. Manual dispatch
  also exposes an explicit delivery-only mode for release-bound reference
  refresh after a Git tag exists. CI has no write capability.
- `.github/workflows/assurance.yml` runs weekly or manually. It owns full
  quality and integration validation, the compatibility matrix, dependency
  audit, workflow lint, ShellCheck, CodeQL, and `assurance-gate`. Only its
  CodeQL job can write security events.
- `.github/workflows/deploy-pages.yml` consumes a successful current-main CI
  artifact and deploys it. It accepts the normal successful main-push delivery
  or an explicitly selected successful current-main delivery-dispatch run.
  Only its deployment job receives Pages write and OIDC permissions.
- `.github/workflows/release.yml` is manual from current `main`. It verifies an
  immutable release artifact, publishes exact tarballs, verifies the registry,
  creates the release record through narrowly scoped job permissions, then
  dispatches the existing CI and Pages workflows to refresh the newly tagged
  reference snapshot.

Internal validation responsibilities are jobs inside `ci.yml` and
`assurance.yml`; they are not separate reusable workflow files. This keeps the
GitHub Actions workflow inventory aligned with real lifecycle entrypoints.

## CI boundaries

`ci.yml` always runs for pull requests targeting `main` or a persistent
integration lane. It does not use workflow-level path filters.
`scripts/detect-ci-scope.mjs` selects quality, integration, browser, package,
consumer, docs, playground, fixture, and security work from the actual change.

- Task PR -> `integration/<lane>`: affected-scope validation once. When docs or
  playground/reference work is selected, CI also emits a non-deployable
  immutable preview artifact.
- Integration-lane merge or synchronization: no push-triggered CI duplication.
- Promotion or emergency hotfix PR -> `main`: full repository validation once,
  including the same non-deployable reference preview boundary.
- Push to `main`: exact-main delivery scope only. Quality and security are not
  rerun after the already-passed promotion gate.
- Manual `mode=delivery` from `main`: the same delivery-only scope, used by the
  controlled release after its tag exists so versioned reference assembly can
  include that new immutable release without another source commit.

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
inventory, documentation and playground builds, PR reference previews, and the
commit-bound Pages reference artifact. It prepares package output once per
selected job and reuses it across downstream checks.

A reference-affecting pull request creates
`reference-preview-pr-<number>-<tested-commit>`. The artifact contains the docs
surface at `/`, the playground surface at `/playground/`, and
`reference-artifact.json`. The manifest records `kind: preview`,
`deployable: false`, immutability, the tested commit, and the producing CI run.
CI keeps repository-wide read-only permissions; no preview path receives Pages
write, npm OIDC, tag creation, or repository write access.

A successful exact-main delivery creates `pages-site-<commit>`. The normal
producer is a successful push CI run for current `main`; the controlled release
may also explicitly dispatch the same delivery-only mode after its release tag
exists. Pull-request validation and weekly assurance never create a deployable
Pages artifact. Production output carries the same lineage manifest with
`kind: production` and `deployable: true`.

Exact-main delivery builds the current documentation inspector and the current
human-facing playground, then runs `scripts/assemble-versioned-pages.mjs`.
That assembler uses two distinct sources of truth:

- `docs/metadata/release-groups.json` describes current source release lines,
  package membership, channels, and publication intent.
- Real SemVer Git release tags describe which historical reference versions
  actually exist and may be retained in the deployed site.

Release lines are not treated as interchangeable site versions. For example,
the independent data-grid alpha line remains visible as package/release status,
while the reference-site version selector is based on `Next` plus retained
SemVer release snapshots.

For every retained release tag, exact-main delivery checks out the tag in an
isolated worktree and builds both surfaces from that release's source:

- `/versions/v<version>/` contains the release documentation inspector.
- `/versions/v<version>/playground/` contains the release playground.

The current main surfaces remain at `/` and `/playground/`. The assembled site
contains `vyrnforge-versions.json`, a machine-readable catalog bound to the
exact main commit, plus the temporary backward-compatible `docs-versions.json`
consumed by `apps/docs`. `scripts/reference-artifact.mjs` then binds the site to
its exact source commit and CI run. `scripts/verify-pages-site.mjs` and the
reference-artifact verifier require the current surfaces, catalog, release
lines, exact lineage, and every retained docs/playground pair before upload.

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
accepts either a successful `VyrnForge CI` push run for current `main` or a
successful explicitly selected `workflow_dispatch` delivery run for current
`main`. In both cases it verifies that the run head SHA equals current `main`
and downloads the matching `pages-site-<sha>` artifact. A full manual CI run
cannot accidentally deploy because it does not create that production artifact.

Before deployment, the preparation job verifies the current docs and playground,
`reference-artifact.json`, `vyrnforge-versions.json`, the compatibility
manifest, exact-main commit and CI-run binding, and every retained release
docs/playground pair. The production manifest must be immutable and deployable,
and its commit must match the version catalog. Deployment never checks out
source or rebuilds the site. Only the deployment job receives `pages: write`
and `id-token: write`.

## Release pipeline

`release.yml` is the only normal npm release entrypoint and is manual. A release
is valid only from current `main` when a successful exact-main `VyrnForge CI`
push run exists for that commit. It does not rerun general CI or weekly
assurance before package publication.

The ordered responsibilities are:

1. `verify-release`: prepare and verify immutable release tarballs and bind them
   to source, CI, and digest metadata.
2. `publish-packages`: use the protected `npm-release` environment and publish
   only the retained tarballs through GitHub OIDC.
3. `verify-registry-release`: verify registry metadata, signatures, provenance,
   and a fresh consumer.
4. `create-release-record`: create or verify the annotated tag and GitHub
   release after registry verification.
5. `refresh-release-reference`: verify the release tag resolves to the workflow
   commit and that the commit is still current `main`; dispatch CI in
   delivery-only mode; wait for that exact run; require its
   `pages-site-<sha>` artifact; dispatch `deploy-pages.yml` with that exact CI
   run ID; and wait for deployment success.

The reference refresh intentionally happens after tag creation. Therefore the
versioned Pages assembler sees the new release tag and produces the tagged docs
and playground snapshot immediately, without a follow-up source commit.

Permission separation remains explicit. The refresh job receives `actions:
write` only so it can dispatch the existing CI and Pages workflows. It does not
receive npm OIDC, repository write, `pages: write`, or Pages deployment OIDC.
The Pages workflow remains the only holder of Pages deployment permissions, and
CI remains read-only.

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

Because repository policy uses squash merges for protected-lane PRs, a lane may
be content-current while Git ancestry remains topologically divergent from
`main`. Lane synchronization must still use protected PRs; force-moving a
persistent lane is not an acceptable workaround for ancestry shape.

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
