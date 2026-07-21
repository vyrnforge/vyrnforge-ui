# Release Responsibility Matrix

This document defines who or what owns each VyrnForge UI delivery step. The
roles are responsibilities, not assumptions about current team size. One
maintainer may currently perform several roles.

## Responsibility matrix

| Responsibility                                  | Trigger                                              | Owner role               | Workflow/job                                                                 | Permission                          | Output                                                                                                   |
| ----------------------------------------------- | ---------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Change impact planning                          | Every PR/main push                                   | CI planner               | `ci.yml / plan`                                                              | `contents: read`                    | Machine-readable CI scope                                                                                |
| Pull-request classification and review evidence | Every PR                                             | Change author + reviewer | `.github/pull_request_template.md` plus `.github/PULL_REQUEST_TEMPLATE/*.md` | None                                | Focused scope, impact, and validation record                                                             |
| CI/CD infrastructure intake                     | Report or proposal                                   | Release engineering      | `.github/ISSUE_TEMPLATE/ci-cd-infrastructure.yml`                            | None                                | Focused infrastructure issue                                                                             |
| Release-readiness intake                        | Candidate or published release problem               | Release owner            | `.github/ISSUE_TEMPLATE/release-readiness.yml`                               | None                                | Versioned release evidence                                                                               |
| Package quality                                 | Planned changes                                      | Package maintainer       | `_quality.yml`                                                               | `contents: read`                    | Toolchain, format, lint, CSS, metadata/maturity, typecheck, coverage, unit/DOM, and accessibility result |
| Package payload verification                    | Planned package/public payload changes               | Release engineering      | `_packages.yml`                                                              | `contents: read`                    | Verified pack contents                                                                                   |
| External consumer verification                  | Planned public-boundary changes                      | Release engineering      | `_consumer.yml`                                                              | `contents: read`                    | Packed consumer build                                                                                    |
| Documentation validation                        | Planned docs/playground changes                      | Documentation owner      | `_docs.yml`                                                                  | `contents: read`                    | Static build result                                                                                      |
| Branch merge gate                               | Every PR/main push                                   | Repository governance    | `ci.yml / ci-gate`                                                           | `contents: read`                    | Stable required check                                                                                    |
| Pages build                                     | Successful CI on current `main` or manual            | Documentation owner      | `pages.yml / build-pages`                                                    | `contents: read`                    | Static Pages artifact                                                                                    |
| Pages deployment                                | Successful build of the verified current-main commit | GitHub Pages environment | `pages.yml / deploy-pages`                                                   | `pages: write`, `id-token: write`   | Public docs site                                                                                         |
| Release candidate verification                  | Manual dispatch                                      | Release owner            | `release.yml / verify-release`                                               | `contents: read`                    | Candidate summary                                                                                        |
| npm publication                                 | Approved publish dispatch                            | npm release environment  | `release.yml / publish-packages`                                             | `contents: read`, `id-token: write` | Three npm packages                                                                                       |
| Registry verification                           | Successful publication                               | Release engineering      | `release.yml / verify-registry-release`                                      | `contents: read`                    | Fresh registry consumer proof                                                                            |
| Git tag and GitHub Release                      | Successful registry verification                     | Release owner            | `release.yml / create-release-record`                                        | `contents: write`                   | Annotated tag and prerelease                                                                             |
| Scheduled drift detection                       | Weekly/manual                                        | Release engineering      | `nightly.yml`                                                                | `contents: read`                    | Full matrix and audit result                                                                             |

## Package responsibility

| Area                        | Owns                                                     | Must not own                                            |
| --------------------------- | -------------------------------------------------------- | ------------------------------------------------------- |
| `@vyrnforge/ui-core`        | Shared tokens, themes, density, CSS variables, utilities | React application components or data-grid behavior      |
| `@vyrnforge/ui-components`  | Shared React primitives and app components               | Data-grid-only behavior or consuming-app business state |
| `@vyrnforge/ui-data-grid`   | Enterprise data-management grid behavior                 | Global application state or unrelated shared tokens     |
| `apps/docs`                 | Human documentation viewer                               | Canonical API truth                                     |
| `examples/basic-playground` | Interactive examples                                     | Package implementation logic                            |
| `scripts/verify-*`          | Public-boundary and release evidence                     | Runtime feature behavior                                |
| `.github/workflows`         | Orchestration and permission boundaries                  | Package API or visual behavior                          |

## Change-to-workflow matrix

| Change                                    | CI scope                                                       | Release implication                              |
| ----------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------ |
| Markdown documentation only               | Docs build                                                     | No package release by itself                     |
| Docs app source                           | Docs build                                                     | No package release by itself                     |
| Playground example                        | Playground build                                               | No package release by itself                     |
| ui-core source                            | All package quality, payload, consumer, docs, playground       | Coordinated release when user-visible            |
| ui-components source                      | Components + grid quality, payload, consumer, docs, playground | Coordinated release when user-visible            |
| ui-data-grid source                       | Grid quality, payload, consumer, docs, playground              | Coordinated release when user-visible            |
| Package manifest/export/CSS entry/LICENSE | Package payload and consumer verification                      | Coordinated release if published payload changes |
| CI workflow or verification script        | Full CI                                                        | No package release unless package output changes |
| Release documentation                     | Docs build                                                     | No package release                               |
| Version manifests                         | Full release candidate verification                            | Required before publish mode                     |

## Intake boundaries

- Pull-request classifications are informational; the CI planner decides the
  executed scope.
- General CI/CD, Pages, branch-protection, nightly, or automation work uses the
  infrastructure issue form.
- Candidate-specific package, registry, provenance, dist-tag, consumer, or
  release-record failures use the release-readiness form.
- Product features, component defects, and accessibility concerns stay in their
  dedicated forms so infrastructure work does not distort the UI backlog.

## Approval boundaries

### Pull requests

- `ci-gate` is the stable G1 aggregate check. It fails when planned quality,
  package, consumer, or documentation work fails, is cancelled, or is skipped
  unexpectedly; later compatibility and release checks remain outside it.
- The compatibility checks `quality` and `external-consumer` remain during the
  branch-protection migration.
- No pull-request workflow may publish, deploy Pages, create tags, or create
  releases.

### npm publication

- Publication is manual through `release.yml`.
- Publish mode requires the `npm-release` environment.
- npm authorization is short-lived GitHub OIDC.
- Package order is ui-core → ui-components → ui-data-grid.
- The selected prerelease dist-tag must match the version channel.

### Repository release record

- The annotated tag and GitHub Release are created after registry verification.
- The release-record job receives repository write permission but no npm OIDC.
- A package publication failure or registry-consumer failure prevents the tag
  and GitHub Release from being created.

## Failure ownership

| Failure                                | First responder                     |
| -------------------------------------- | ----------------------------------- |
| Planner classifies a path incorrectly  | Release engineering                 |
| Package test/typecheck                 | Owning package maintainer           |
| Package payload or export verification | Release engineering + package owner |
| Packed consumer                        | Public API/package owner            |
| Docs/playground build                  | Documentation/example owner         |
| Pages deployment                       | Documentation owner + GitHub admin  |
| OIDC publication                       | Release owner + npm admin           |
| Registry metadata or fresh install     | Release engineering                 |
| Git tag/GitHub Release creation        | Release owner + GitHub admin        |
| Nightly dependency audit               | Release engineering                 |

## Current operating model

VyrnForge UI keeps coordinated package versions during alpha. CI testing is
package-impact aware, but publication remains coordinated. Independent package
versioning requires a separate approved release-governance change.
