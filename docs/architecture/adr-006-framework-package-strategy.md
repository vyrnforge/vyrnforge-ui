# ADR-006: Public Framework Package Strategy

- Status: Accepted
- Scope: Public non-grid framework package identity, install paths, and compatibility
- Related: [Package Boundaries](01-package-boundaries.md), [ADR-005](adr-005-canonical-web-implementation.md)

## Context

VyrnForge supports React, Native HTML / Custom Elements, Angular, and Vue as
first-class non-grid web surfaces. Each consumer should have one obvious
framework package and should not need to copy VyrnForge adapters, forms bridges,
registration helpers, or event-forwarding implementation into the application.

Renaming existing React and native packages solely for naming symmetry would
create migration churn and duplicate install paths without improving the
architecture.

## Decision

VyrnForge uses **one canonical public install package per supported web surface**:

| Surface | Canonical public package | Compatibility decision |
| --- | --- | --- |
| React | `@vyrnforge/ui-components` | Keep the established React entrypoint. |
| Native HTML | `@vyrnforge/ui-elements` | Keep the established native entrypoint. |
| Angular | `@vyrnforge/ui-angular` | First-class Angular facade package. |
| Vue | `@vyrnforge/ui-vue` | First-class Vue facade package. |

Normal framework consumers install their framework package as the obvious
VyrnForge component entrypoint:

```text
React       -> @vyrnforge/ui-components
Native HTML -> @vyrnforge/ui-elements
Angular     -> @vyrnforge/ui-angular
Vue         -> @vyrnforge/ui-vue
```

A facade package may depend on required VyrnForge implementation packages.
Consumers should not need to understand the internal renderer topology for
standard component use.

`@vyrnforge/ui-core` and `@vyrnforge/ui-behaviors` remain valid deliberate direct
dependencies for framework-neutral or advanced use cases; they are not extra
manual assembly steps for ordinary framework component consumption.

## React compatibility

`@vyrnforge/ui-components` remains the canonical React package. VyrnForge does
not add `@vyrnforge/ui-react` merely for naming symmetry. React implementation
may reuse the canonical native/DOM implementation under ADR-005 without changing
this public package identity.

A future package rename requires a separate compatibility and migration decision.

## Native HTML compatibility

`@vyrnforge/ui-elements` remains the canonical Native HTML / Custom Elements
package and retains typed registration, DOM APIs, CSS, and Custom Elements
Manifest entrypoints. VyrnForge does not publish a duplicate
`@vyrnforge/ui-native` alias by default.

## Angular distribution

`@vyrnforge/ui-angular` owns Angular-facing setup, generated bindings, typed
inputs/outputs, content projection, element references, imperative method
proxies, and optional Angular Forms integration.

Angular runtime dependencies and peers stay isolated to the Angular package and
consumer. Shared foundations and the canonical renderer do not acquire Angular
runtime dependencies.

Direct `@vyrnforge/ui-elements` use remains a lower-level interoperability path,
but the Angular package is the normal first-class Angular path.

## Vue distribution

`@vyrnforge/ui-vue` owns Vue-facing setup, generated components, typed
props/emits, slots, refs, `v-model` translation, plugin registration, and
Vue-specific typing.

Vue remains supplied by the consumer as a framework peer. Shared foundations and
the canonical renderer do not acquire Vue runtime dependencies.

Direct `@vyrnforge/ui-elements` use remains a lower-level interoperability path,
but the Vue package is the normal first-class Vue path.

## Package ownership principles

Concrete dependency edges are canonical in
[Package Boundaries](01-package-boundaries.md) and package manifests. The package
strategy preserves these higher-level rules:

- framework runtime dependencies stay isolated to the applicable framework
  package or consuming application;
- `ui-core`, `ui-behaviors`, and `ui-elements` remain framework-neutral with
  respect to React, Angular, and Vue runtimes;
- framework packages do not become independent design systems or duplicate
  canonical product semantics;
- applications do not copy VyrnForge-owned integration implementation into their
  source trees;
- public packages expose typed documented entrypoints rather than requiring deep
  imports into implementation packages.

## Release and versioning implications

Release-group membership, versions, dist-tags, dependency closure, and package
selection are owned by current release metadata, especially
`docs/metadata/release-groups.json`, rather than by this ADR.

The non-grid framework packages share the current non-grid release group. The
data grid remains independently versioned on its separate React alpha track.

No package publication is implied by this architecture decision; publication
follows the repository release procedure and explicit release authorization.

## Rejected alternatives

### Rename all framework packages for symmetry

Rejected because it creates unnecessary migration churn and duplicate install
paths while the established React and native names remain valid.

### Keep Angular and Vue as documentation-only integrations

Rejected because first-class support requires VyrnForge-owned, distributed
framework integration rather than application-local copied adapters.

### One universal package containing all framework runtimes

Rejected because it would mix framework peer/runtime dependencies, weaken
isolation, and force consumers to install integration for frameworks they do not
use.

### Publish thin aliases for every surface

Rejected by default because aliases increase release, provenance,
documentation, and deprecation surface without solving a demonstrated
compatibility problem.
