# Versioning Policy

VyrnForge UI intends to follow Semantic Versioning for public packages once public releases begin. `@vyrnforge/ui-core@0.1.0-alpha.0` remains the historical first public prerelease. The current synchronized corrective candidate is `0.1.0-alpha.1` for all three publishable packages; it remains prerelease, source-available, and pending the manual alpha release steps. `@vyrnforge/ui-components` and `@vyrnforge/ui-data-grid` have no earlier public prerelease.

## Packages

Versioning applies to:

- `@vyrnforge/ui-core`
- `@vyrnforge/ui-components`
- `@vyrnforge/ui-data-grid`

During the early lifecycle, package versions should remain synchronized unless a future approved policy says otherwise. Synchronized versions make package compatibility easier to explain while the public API is still forming.

## Prerelease identifiers

| Identifier | Use |
| --- | --- |
| `alpha` | First public validation releases with expected API churn. |
| `beta` | Later validation releases with mostly stable APIs. |
| `rc` | Release candidates when a stable release is being finalized. |

Initial prereleases should use the matching npm tag: `alpha` for alpha, `beta` for beta. The `latest` tag is reserved for explicitly approved stable releases and must remain absent for the alpha series.

## Inter-package alignment

- `@vyrnforge/ui-components` may depend on `@vyrnforge/ui-core`.
- `@vyrnforge/ui-data-grid` may depend on `@vyrnforge/ui-core` and `@vyrnforge/ui-components`.
- Inter-package dependency ranges should align with the synchronized release version during early releases.
- A package must not depend on an unpublished or mismatched peer release unless the release plan explicitly covers the partial state.

## Breaking changes

During `0.x`, breaking changes may occur in minor versions, but they must be called out in the changelog and migration notes. Patch releases should avoid breaking public behavior.

Breaking changes include:

- Removing or renaming public TypeScript exports.
- Changing React component props in a way that breaks existing use.
- Removing CSS subpath imports.
- Removing or changing documented `--vf-*`, `vf-*`, `--udg-*`, or `udg-*` contracts.
- Changing theme, density, focus, or accessibility behavior in a way consumers must adapt to.
- Changing data-grid state, adapter, persistence, server, or export contracts.

## Compatibility expectations

- Shared styling remains under `--vf-*` variables and `vf-*` classes.
- Data-grid styling remains under `--udg-*` variables and `udg-*` classes.
- Public CSS variables and classes require migration notes before removal or incompatible behavior changes.
- TypeScript public API changes require changelog entries and migration guidance.
- Accessibility-impacting changes require explicit review and release notes.

## Before 1.0

Before a 1.0 release is considered, the project must have:

- Approved publication status.
- VyrnForge Source License 1.0 package metadata and package-local LICENSE files remain verified.
- Stable package entry points and CSS imports.
- Documented public APIs.
- Completed migration guidance for known breaking changes.
- External package-consumer validation.
- Real application validation.
- Release checklist completion.
