# Publication Procedure

VyrnForge UI packages are not publicly published yet. This document describes the intended process after licensing and release approval are complete.

Do not include real npm tokens in repository files, workflows, docs, or examples.

## Prerequisites

- Release scope is approved.
- Licensing approval is complete.
- Repository is on a clean checkout of the intended commit.
- No credentials, private URLs, internal documents, generated archives, logs, or environment files are included.
- Changelog and release notes are prepared.
- Migration notes are prepared for breaking changes.
- `npm ci`, lint, typecheck, tests, package builds, docs build, and playground build pass.
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

## Initial controlled/manual publication

1. Confirm release issue and checklist approval.
2. Confirm licensing gate is closed.
3. Start from a clean checkout.
4. Run required validation.
5. Build packages.
6. Create package tarballs with npm dry-run or pack review.
7. Inspect package contents for expected declarations, CSS files, README files, and package metadata.
8. Publish in dependency order using the approved npm tag.
9. Verify each package appears in the registry with the expected version and tag.
10. Verify a fresh consumer project can install and import the packages.
11. Update release notes and GitHub release material only after publication is confirmed.

## Future trusted-publishing/OIDC publication

Future trusted publishing should use GitHub Actions OIDC and npm trusted publishing when that workstream is explicitly implemented. Until then:

- Do not claim trusted publishing is configured.
- Do not add npm tokens to repository secrets as part of this document.
- Do not replace manual approval gates with automatic publication.

The future workflow should still keep the package order, release checklist, tarball review, npm tag policy, and post-release verification.

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
