# Publication Procedure

VyrnForge UI packages are available as early alpha prereleases. This document
defines the controlled process for future approved releases.

VyrnForge UI is source-available under the VyrnForge Source License 1.0. Production use and commercial use require a separate written commercial license. Do not publish packages until the release checklist passes and package tarballs still include the approved license text.

Do not include real npm tokens in repository files, workflows, docs, or examples.

## Current alpha history

- `@vyrnforge/ui-core@0.1.0-alpha.0` is the historical first public prerelease.
- `0.1.0-alpha.1` is the initial coordinated alpha, manually published for all
  three packages.
- The first trusted publication will use a future coordinated prerelease such
  as `0.1.0-alpha.2`.
- Use the `alpha` dist-tag for alpha publication. Do not assign `latest` to an
  alpha package.

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

Publish packages in dependency order:

1. `@vyrnforge/ui-core`
2. `@vyrnforge/ui-components`
3. `@vyrnforge/ui-data-grid`

Do not publish a package that depends on a package version that has not been published or otherwise verified in the registry.

## npm tags

| Release stage | npm tag |
| --- | --- |
| Alpha | `alpha` |
| Beta | `beta` |
| Release candidate | `next` or an explicitly approved candidate tag |
| Stable | `latest` only after stable release approval |

The `latest` tag must not point to unfinished alpha packages.

## Controlled trusted publication

1. Confirm release issue, checklist approval, and a clean checkout on current `main`.
2. Manually dispatch `Controlled npm Release` with the synchronized version,
   prerelease dist-tag, and `verify` mode. Verify mode never publishes and does
   not attach the `npm-release` environment or request OIDC.
3. Review the verification summary, registry availability checks, package
   payloads, and external-consumer evidence.
4. Manually dispatch the same candidate in `publish` mode only after approval.
   The job requires the protected `npm-release` environment.
5. npm trusted publishing uses GitHub Actions OIDC. No long-lived npm token is
   stored in the repository, workflow, or GitHub Actions secrets.
6. Packages publish in dependency order: `ui-core`, `ui-components`, then
   `ui-data-grid`. The workflow verifies registry propagation and exact internal
   dependencies after each required step.
7. Trusted publishing generates provenance automatically; do not add
   `--provenance` manually.
8. Verify registry versions and dist-tags, then update release notes or GitHub
   release material only when separately approved.

## Trusted-publishing configuration

Before the first trusted publication, configure npm trusted publishers for each
publishable package to trust this repository and the `release.yml` workflow.
Keep the protected `npm-release` environment approval in place. Do not add npm
tokens, `NODE_AUTH_TOKEN`, personal access tokens, or other long-lived registry
credentials as a substitute for GitHub OIDC.

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
