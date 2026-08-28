# Release Responsibility Matrix

This document defines ownership of VyrnForge UI validation, delivery, and
release responsibilities. Workflow names refer only to the four lifecycle
workflows exposed in GitHub Actions.

## Responsibility matrix

| Responsibility | Trigger | Workflow/job | Permission | Output |
| --- | --- | --- | --- | --- |
| Change impact planning | Every PR/main push | `ci.yml / plan` | `contents: read` | Machine-readable CI scope |
| Package/repository quality | Planner-selected PR work; full promotion | `ci.yml / quality-checks` | `contents: read` | Format, lint, contracts, coverage, fixtures, typecheck |
| Package/consumer/browser/docs integration | Planner-selected PR work; full promotion | `ci.yml / integration-checks` | `contents: read` | Package, consumer, browser, docs/playground evidence |
| PR dependency/workflow security | Planner-selected security scope | `ci.yml / security-checks` | `contents: read`, `pull-requests: read` | Dependency review, actionlint, ShellCheck, security contracts |
| Branch merge gate | Every validated PR/main delivery run | `ci.yml / ci-gate` | `contents: read` | Stable required check |
| Exact-main Pages site artifact | Successful push CI on current `main` | `ci.yml / integration-checks` | `contents: read` | `pages-site-<sha>` |
| Full compatibility/security drift | Weekly/manual | `assurance.yml` | Read-only except CodeQL result upload | Full quality/integration, compatibility, audit, CodeQL |
| Weekly assurance gate | Weekly/manual | `assurance.yml / assurance-gate` | `contents: read` | Deep-validation aggregate |
| Pages deployment | Successful current-main CI artifact | `deploy-pages.yml` | `actions: read`, then `pages: write` + OIDC | Public docs site |
| Release artifact verification | Manual from current `main` | `release.yml / verify-release` | `actions: read`, `contents: read` | CI-bound immutable release artifact |
| npm publication | Approved retained artifact | `release.yml / publish-packages` | `actions: read`, `contents: read`, `id-token: write` | Exact verified tarballs |
| Registry verification | Successful publication | `release.yml / verify-registry-release` | `contents: read` | Fresh registry-consumer proof |
| Git tag and GitHub Release | Successful registry verification | `release.yml / create-release-record` | `contents: write` | Annotated tag and release record |

## Package responsibility

| Area | Owns | Must not own |
| --- | --- | --- |
| `@vyrnforge/ui-core` | Shared tokens, themes, density, CSS variables, utilities | Framework application components or grid behavior |
| `@vyrnforge/ui-behaviors` | Framework-neutral interaction/state contracts | Framework rendering or consuming-app state management |
| `@vyrnforge/ui-elements` | Canonical native/Custom Element surfaces | React-specific APIs or application business logic |
| `@vyrnforge/ui-components` | React adapters/facades over shared foundations | Grid-only behavior or application state |
| `@vyrnforge/ui-angular` | Angular adapters/facades over shared foundations | Independent Angular-only component architecture |
| `@vyrnforge/ui-vue` | Vue adapters/facades over shared foundations | Independent Vue-only component architecture |
| `@vyrnforge/ui-data-grid` | Enterprise data-management grid capability | Global application state or unrelated shared tokens |
| `apps/docs` | Human documentation viewer | Canonical package implementation truth |
| `examples/basic-playground` | Interactive examples | Package implementation logic |
| `scripts/verify-*` | Public-boundary and release evidence | Runtime feature behavior |
| `.github/workflows` | Four lifecycle orchestration/permission boundaries | Package APIs or visual behavior |

## Change-to-CI matrix

| Change | CI scope | Release implication |
| --- | --- | --- |
| Documentation only | Docs build | No package release by itself |
| Playground example | Playground build | No package release by itself |
| Shared/runtime package source | Affected packages plus downstream consumer/docs/browser work | Release when published behavior changes |
| Package manifest/export/CSS/LICENSE | Package payload + consumer verification | Release if published payload changes |
| CI/workflow/verification infrastructure | Full task validation | No package release unless package output changes |
| Release metadata | Release artifact verification | Required before release dispatch/approval |

`scripts/detect-ci-scope.mjs` is authoritative for technical scope; PR
checkboxes and contributor estimates are not a second CI planner.

## Approval boundaries

### Pull requests

- `ci-gate` is the stable required aggregate.
- Task PRs target their owning `integration/*` lane and run affected-scope CI.
- Promotion/hotfix PRs targeting `main` run the full repository boundary.
- Integration-lane push synchronization does not rerun CI.
- Pull-request workflows may not publish packages, deploy Pages, create tags,
  or create releases.

### Weekly assurance

`assurance-gate` covers full quality/integration, the canonical compatibility
matrix, shipped-dependency audit, workflow/shell validation, and CodeQL. Weekly
assurance never publishes, deploys, creates tags, or requests npm OIDC.

### npm publication

- `release.yml` is the only normal publication entrypoint.
- The selected release group/version/dist-tag come from canonical release
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

| Failure | First responder |
| --- | --- |
| CI planner classification | Release/platform engineering |
| Package test/typecheck | Owning package/framework maintainer |
| Package payload/export/size | Release engineering + package owner |
| Packed consumer/browser | Public API/package/framework owner |
| Docs/playground build | Documentation/example owner |
| Dependency review/audit | Repository governance |
| CodeQL/actionlint/ShellCheck | Repository governance |
| Pages deployment | Documentation owner + GitHub admin |
| npm OIDC publication | Release owner + npm admin |
| Registry verification | Release engineering |
| Tag/GitHub Release creation | Release owner + GitHub admin |
