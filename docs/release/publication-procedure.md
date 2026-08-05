# Publication Procedure

VyrnForge UI packages are available as early alpha prereleases. This document
defines the controlled process for future approved releases.

VyrnForge UI is source-available under the VyrnForge Source License 1.0. Production use and commercial use require a separate written commercial license. Do not publish packages until the release checklist passes and package tarballs still include the approved license text.

Do not include real npm tokens in repository files, workflows, docs, or examples.

## Current release history and next versions

- `@vyrnforge/ui-core@0.1.0-alpha.0` is the historical first public prerelease.
- `0.1.0-alpha.1` is the initial coordinated alpha, manually published for the
  original `ui-core`, `ui-components`, and `ui-data-grid` package set.
- `0.2.0-beta.1` was manually published as a package-registration bootstrap
  for the synchronized non-grid package set.
- The next controlled trusted-publishing candidate is `non-grid-beta` at
  `0.2.0-beta.2`; `data-grid-alpha` remains `0.1.0-alpha.2`.
- Use the `beta` dist-tag only for `non-grid-beta` and the `alpha` dist-tag only
  for `data-grid-alpha`. Registry-managed `latest` is not a stable-release
  signal during prerelease.

## Prerequisites

- Release scope is approved.
- VyrnForge Source License 1.0 metadata and package-local LICENSE files are verified.
- Repository is on a clean checkout of the intended commit.
- No credentials, private URLs, internal documents, generated archives, logs, or environment files are included.
- Changelog and release notes are prepared.
- Migration notes are prepared for breaking changes.
- `npm ci`, lint, typecheck, tests, package builds, package verification, docs build, and playground build pass.
- Package tarballs are reviewed before publication.
- npm organization access and package visibility are confirmed.

## Package order

Select one canonical release group before verification or publication.

For `non-grid-beta`, publish in dependency order:

1. `@vyrnforge/ui-core`
2. `@vyrnforge/ui-behaviors`
3. `@vyrnforge/ui-components`
4. `@vyrnforge/ui-elements`

For `data-grid-alpha`, publish only `@vyrnforge/ui-data-grid`. Its exact
`ui-core` and `ui-components` beta dependencies must already exist in the
registry.

Do not publish a package that depends on a package version that has not been
published or otherwise verified in the registry. Never publish
`ui-data-grid` as part of `non-grid-beta`.

## npm tags

| Release stage     | npm tag                                        |
| ----------------- | ---------------------------------------------- |
| Alpha             | `alpha`                                        |
| Beta              | `beta`                                         |
| Release candidate | `next` or an explicitly approved candidate tag |
| Stable            | `latest` after stable release approval         |

During prerelease, installation docs must use the explicit prerelease tag.
Registry-managed `latest` metadata is informational and must not be described as
stable.

## Controlled trusted publication

1. Confirm release issue, checklist approval, and a clean checkout on current `main`.
2. Manually dispatch `Controlled npm Release` with the canonical release group,
   its exact version, matching prerelease dist-tag, and `verify` mode. Verify
   mode never publishes and does not attach the `npm-release` environment or
   request OIDC.
3. Review the verification summary, registry availability checks, package
   payloads, and external-consumer evidence.
4. Manually dispatch the same candidate in `publish` mode only after approval.
   The job requires the protected `npm-release` environment.
5. npm trusted publishing uses GitHub Actions OIDC. No long-lived npm token is
   stored in the repository, workflow, or GitHub Actions secrets.
6. Packages publish in the dependency order declared by the selected release
   group. `non-grid-beta` publishes core, behaviors, components, and elements;
   `data-grid-alpha` publishes only the grid. The workflow verifies registry
   propagation and exact manifest dependencies after each required step.
7. Trusted publishing generates provenance automatically; do not add
   `--provenance` manually.
8. A read-only job installs the exact published versions from the public
   registry, verifies metadata and internal dependencies, requires provenance
   attestation metadata, cryptographically verifies npm registry signatures and
   attestations with `npm audit signatures`, and runs the external consumer
   typecheck and production build.
9. Only after registry verification passes, a separate job with
   `contents: write` creates the annotated `v<version>` tag and GitHub
   prerelease. That job has no npm OIDC permission.

## Responsibility separation

- Candidate verification has read-only repository access and no OIDC.
- npm publication has read-only repository access plus `id-token: write` and is
  protected by the `npm-release` environment.
- Registry verification is read-only and consumes public npm artifacts.
- Tag and GitHub Release creation has `contents: write` but no npm OIDC.
- Normal CI and Pages deployment cannot publish npm packages or create release
  records.

See [release-responsibility-matrix.md](release-responsibility-matrix.md).

## Trusted-publishing configuration

Before the first trusted publication, configure npm trusted publishers for each
publishable package to trust this repository and the `release.yml` workflow.
Keep the protected `npm-release` environment approval in place. Do not add npm
tokens, `NODE_AUTH_TOKEN`, personal access tokens, or other long-lived registry
credentials as a substitute for GitHub OIDC. The exact publisher fields,
credential-free dry-run command, and external evidence requirements are defined
in [trusted-publishing-provenance.md](trusted-publishing-provenance.md).

## Partial publication handling

If publication stops after some packages are published:

- Do not overwrite or republish the same npm version.
- Pause and document the partial state.
- Verify which packages and tags reached the registry.
- Prefer publishing the remaining approved packages when safe.
- Use a corrective patch or prerelease if a package that reached the registry contains a release-blocking problem.
- Deprecate a bad published version only when consumers need a clear warning not to use it.

## Rollback and correction

npm versions are immutable. A broken release is handled through:

- a corrective release;
- npm deprecation messaging when appropriate;
- release notes explaining the issue and replacement version;
- migration guidance when consumers need action.

Do not delete release history as a normal correction path.
