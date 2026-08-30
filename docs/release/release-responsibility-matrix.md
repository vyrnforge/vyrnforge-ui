# Release Responsibility Matrix

This document defines ownership of VyrnForge UI validation, delivery, and
release responsibilities. Workflow names refer only to the four lifecycle
workflows exposed in GitHub Actions.

## Validation and delivery ownership

- Change impact planning runs in `ci.yml / plan` for every validated pull
  request and main push. It is read-only and produces the machine-readable CI
  scope.
- Package and repository quality runs in `ci.yml / quality-checks`. It owns
  format, lint, contracts, coverage, fixtures, and typechecking.
- Package, consumer, browser, documentation, and playground integration runs in
  `ci.yml / integration-checks`. It also creates `pages-site-<sha>` only for a
  successful exact-main delivery run.
- Pull-request dependency and workflow security runs in
  `ci.yml / security-checks`. It owns dependency review, actionlint,
  ShellCheck, and security contracts with read-only permissions.
- `ci.yml / ci-gate` is the stable required branch check.
- Full compatibility and security drift runs in `assurance.yml`. It owns full
  quality and integration, the compatibility matrix, shipped-dependency audit,
  workflow lint, ShellCheck, and CodeQL.
- `assurance.yml / assurance-gate` is the weekly deep-validation aggregate.
- `deploy-pages.yml` consumes the verified current-main Pages artifact. Only
  its deploy job receives `pages: write` and OIDC.
- `release.yml / verify-release` creates and verifies the immutable release
  artifact from current `main`.
- `release.yml / publish-packages` publishes only that retained artifact through
  the protected `npm-release` environment and GitHub OIDC.
- `release.yml / verify-registry-release` owns fresh public-registry proof.
- `release.yml / create-release-record` owns the annotated tag and GitHub
  Release after registry verification.

## Package responsibility

- `@vyrnforge/ui-core` owns shared tokens, themes, density, CSS variables, and
  utilities. It must not own framework application components or grid behavior.
- `@vyrnforge/ui-behaviors` owns framework-neutral interaction and state
  contracts. It must not own framework rendering or consuming-app state.
- `@vyrnforge/ui-elements` owns canonical native and Custom Element surfaces
  over shared foundations. It must not own React-specific APIs or application
  business logic.
- `@vyrnforge/ui-components` owns React adapters and facades over shared
  foundations. It must not own grid-only behavior or application state.
- `@vyrnforge/ui-angular` owns Angular adapters and facades over shared
  foundations. It must not become an independent Angular-only component
  architecture.
- `@vyrnforge/ui-vue` owns Vue adapters and facades over shared foundations. It
  must not become an independent Vue-only component architecture.
- `@vyrnforge/ui-data-grid` owns enterprise data-management grid capability. It
  must not own global application state or unrelated shared tokens.
- `apps/docs` owns the human documentation viewer, not canonical package
  implementation truth.
- `examples/basic-playground` owns interactive examples, not package
  implementation logic.
- `scripts/verify-*` owns public-boundary and release evidence, not runtime
  feature behavior.
- `.github/workflows` owns the four lifecycle orchestration and permission
  boundaries, not package APIs or visual behavior.

## Change-to-CI responsibility

- Documentation-only changes run the documentation build and do not require a
  package release by themselves.
- Playground changes run the playground build and do not require a package
  release by themselves.
- Shared or runtime package source changes run affected package validation plus
  downstream consumer, documentation, playground, fixture, and browser work as
  selected by the planner.
- Package manifest, export, CSS entry, or LICENSE changes run package payload
  and consumer verification.
- CI, workflow, or verification infrastructure changes run full task
  validation.
- Release metadata changes require release artifact verification before release
  dispatch or approval.

`scripts/detect-ci-scope.mjs` is authoritative for technical scope. Pull-request
checkboxes and contributor estimates are not a second CI planner.

## Approval boundaries

### Pull requests

- `ci-gate` is the stable required aggregate.
- Task PRs target their owning `integration/*` lane and run affected-scope CI.
- Promotion or emergency hotfix PRs targeting `main` run the full repository
  boundary.
- Integration-lane push synchronization does not rerun CI.
- Pull-request workflows may not publish packages, deploy Pages, create tags,
  or create releases.

### Weekly assurance

`assurance-gate` covers full quality and integration, the canonical
compatibility matrix, shipped-dependency audit, workflow and shell validation,
and CodeQL. Weekly assurance never publishes, deploys, creates tags, or
requests npm OIDC.

### npm publication

- `release.yml` is the only normal publication entrypoint.
- The selected release group, version, and dist-tag come from canonical release
  metadata.
- `publish-packages` requires the protected `npm-release` environment.
- npm authorization is short-lived GitHub OIDC.
- Publication uses the exact immutable artifact produced by `verify-release`;
  it does not rebuild or repack.

### Repository release record

The annotated tag and GitHub Release are created only after registry
verification. The release-record job receives repository write permission but
no npm OIDC.

## Failure ownership

- CI planner classification: release or platform engineering.
- Package test or typecheck: owning package or framework maintainer.
- Package payload, export, or size: release engineering plus package owner.
- Packed consumer or browser: public API, package, or framework owner.
- Documentation or playground build: documentation or example owner.
- Dependency review or audit: repository governance.
- CodeQL, actionlint, or ShellCheck: repository governance.
- Pages deployment: documentation owner plus GitHub administrator.
- npm OIDC publication: release owner plus npm administrator.
- Registry verification: release engineering.
- Tag or GitHub Release creation: release owner plus GitHub administrator.
