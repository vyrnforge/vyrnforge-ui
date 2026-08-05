# Versioning Policy

VyrnForge UI intends to follow Semantic Versioning for public packages once
public releases begin. `@vyrnforge/ui-core@0.1.0-alpha.0` remains the historical
first public prerelease. `0.1.0-alpha.1` is the initial coordinated alpha that
was manually published for the original three-package set.

BT-8002 establishes the canonical release groups and next source versions in
[`../metadata/release-groups.json`](../metadata/release-groups.json). Future
publication uses the controlled manually dispatched trusted-publishing workflow
and must select one of those release groups explicitly.

## Release groups

### `non-grid-beta`

The first multi-framework non-grid beta is synchronized at
`0.2.0-beta.1` with the `beta` dist-tag:

1. `@vyrnforge/ui-core`
2. `@vyrnforge/ui-behaviors`
3. `@vyrnforge/ui-components`
4. `@vyrnforge/ui-elements`

All four packages publish together and use exact internal `0.2.0-beta.1`
dependencies. The synchronized version does not promote component maturity by
itself; component maturity remains owned by the component metadata and evidence
policy.

### `data-grid-alpha`

`@vyrnforge/ui-data-grid` remains on the independent `data-grid-alpha` release
line. Its next source version is `0.1.0-alpha.2` with the `alpha` dist-tag.

The grid package is not part of `non-grid-beta`. Its package dependencies point
to the exact non-grid foundation versions it consumes:

- `@vyrnforge/ui-core@0.2.0-beta.1`
- `@vyrnforge/ui-components@0.2.0-beta.1`

A grid-alpha publication is a separate release action and cannot change the
`beta` dist-tag of any non-grid package.

Packages remain synchronized **within their approved release group** unless a
future approved policy says otherwise.

## Prerelease identifiers

| Identifier | Use                                                       |
| ---------- | --------------------------------------------------------- |
| `alpha`    | Public validation releases with expected API churn.       |
| `beta`     | Validation releases with mostly stable package contracts. |
| `rc`       | Release candidates when a stable release is finalized.    |

Initial prereleases use the matching npm tag: `alpha` for alpha and `beta` for
beta. Consumers must install through the explicit prerelease tag. npm may retain
a registry-managed `latest` tag for package metadata, but VyrnForge does not
treat it as a stable-release signal before stable approval.

## Inter-package alignment

- `@vyrnforge/ui-behaviors` may depend on `@vyrnforge/ui-core`.
- `@vyrnforge/ui-components` may depend on `ui-core` and `ui-behaviors`.
- `@vyrnforge/ui-elements` may depend on `ui-core` and `ui-behaviors`.
- `@vyrnforge/ui-data-grid` may depend on `ui-core` and `ui-components`.
- Inter-package versions are exact and derive from the canonical release-group
  manifest.
- The non-grid beta must not depend on a grid prerelease.
- A package must not depend on an unpublished or mismatched release unless the
  release plan explicitly covers that state.
- The release workflow must require `non-grid-beta` or `data-grid-alpha`; a
  dist-tag alone is not sufficient release scope.

## Breaking changes

During `0.x`, breaking changes may occur in minor versions, but they must be
called out in the changelog and migration notes. Patch releases should avoid
breaking public behavior.

Breaking changes include:

- Removing or renaming public TypeScript exports.
- Changing React component props in a way that breaks existing use.
- Removing or changing documented Custom Element tags, properties, attributes,
  events, slots, methods, or form-submission behavior.
- Changing Angular or Vue adapter contracts after they are part of a supported
  release.
- Removing CSS subpath imports.
- Removing or changing documented `--vf-*`, `vf-*`, `--udg-*`, or `udg-*`
  contracts.
- Changing theme, density, focus, or accessibility behavior in a way consumers
  must adapt to.
- Changing data-grid state, adapter, persistence, server, or export contracts.

## Compatibility expectations

- Shared styling remains under `--vf-*` variables and `vf-*` classes.
- Data-grid styling remains under `--udg-*` variables and `udg-*` classes.
- Public CSS variables and classes require migration notes before removal or
  incompatible behavior changes.
- TypeScript public API changes require changelog entries and migration
  guidance.
- Accessibility-impacting changes require explicit review and release notes.

## Before 1.0

Before a 1.0 release is considered, the project must have:

- Approved publication status.
- VyrnForge Source License 1.0 package metadata and package-local LICENSE files
  remain verified.
- Stable package entry points and CSS imports.
- Documented public APIs.
- Completed migration guidance for known breaking changes.
- External package-consumer validation.
- Real application validation.
- Release checklist completion.
