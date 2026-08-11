# ADR-006: Public Framework Package Strategy

- Status: Accepted target architecture
- Task: MFD-1003
- Scope: Public non-grid framework package identity, install paths, and compatibility
- Depends on: MFD-1001
- Current-state reference: [ADR-004](adr-004-multi-framework-web-support.md)

## Context

VyrnForge now targets React, native HTML, Angular, and Vue as equally
first-class supported web surfaces. Each consumer should have one obvious
framework package to install and should not need to copy VyrnForge adapters,
forms bridges, composables, registration helpers, or event-forwarding
implementation into the application.

The current public package identities are already in use:

- `@vyrnforge/ui-components` for React;
- `@vyrnforge/ui-elements` for native HTML / Custom Elements.

Angular and Vue currently consume `@vyrnforge/ui-elements` directly and keep
reference integration code in consumer fixtures. They do not yet have public
framework packages.

Renaming the existing React and native packages solely to make every package
name symmetrical would create migration churn without improving runtime
architecture. Conversely, continuing to make Angular and Vue consumers assemble
integration pieces themselves would not satisfy the new first-class distribution
goal.

## Decision

VyrnForge will use **one canonical public install package per supported web
surface**, while preserving the existing React and native package names for
compatibility.

The target public framework package identities are:

| Surface | Canonical public package | Compatibility decision |
| --- | --- | --- |
| React | `@vyrnforge/ui-components` | Keep as the canonical React entrypoint. No forced rename. |
| Native HTML | `@vyrnforge/ui-elements` | Keep as the canonical native entrypoint. No forced rename. |
| Angular | `@vyrnforge/ui-angular` | New first-class Angular distribution package. |
| Vue | `@vyrnforge/ui-vue` | New first-class Vue distribution package. |

These names are the S10 package naming decision. Creating package directories,
manifests, exports, dependencies, or framework implementation is later work and
must follow MFD-1004 and the applicable generation/framework sprint tasks.

## Consumer install rule

Normal framework consumers should install their framework's package as the
obvious VyrnForge entrypoint:

```text
React       -> @vyrnforge/ui-components
Native HTML -> @vyrnforge/ui-elements
Angular     -> @vyrnforge/ui-angular
Vue         -> @vyrnforge/ui-vue
```

A facade package may bring required VyrnForge implementation packages as normal
package dependencies. Consumers should not need to know the internal renderer
or adapter topology merely to get standard component behavior.

Shared foundation packages such as `@vyrnforge/ui-core` and
`@vyrnforge/ui-behaviors` remain valid deliberate direct dependencies for
advanced or framework-neutral use cases, but they are not an extra mandatory
manual assembly step for normal framework component consumption unless a later
package-boundary decision demonstrates that such an install is technically
necessary.

## React compatibility

`@vyrnforge/ui-components` remains the canonical React package through the
S10-S15 convergence program.

VyrnForge will not introduce `@vyrnforge/ui-react` merely for naming symmetry.
Doing so would create two plausible React install paths, increase release and
documentation surface area, and force consumers to evaluate a rename with no
required product benefit.

Internal React implementation may converge toward the canonical native/DOM
implementation under MFD-1002 and S14 without changing this public package
identity.

If a future major version proposes a normalized package namespace, that must be
a separate evidence-backed migration decision rather than an implicit result of
this program.

## Native HTML compatibility

`@vyrnforge/ui-elements` remains the canonical native HTML package and retains
its typed Custom Element, registration, CSS, and Custom Elements Manifest
entrypoints.

VyrnForge will not add a second `@vyrnforge/ui-native` package in S10-S15. A
second alias would create ambiguity without reducing setup for existing native
consumers.

## Angular distribution

`@vyrnforge/ui-angular` is the target first-class Angular package.

It should own Angular-facing integration such as generated components or
directives, Angular-native typing, Forms/CVA translation, registration/setup,
and other Angular-specific facade behavior defined by later S10/S12 contracts.

Angular runtime dependencies or peer dependencies belong only in this framework
package where required. Shared foundations and the canonical renderer must not
acquire an Angular runtime dependency.

Existing applications that directly consume `@vyrnforge/ui-elements` remain a
supported compatibility path during migration. The S12 cutover must prove the
new package before fixture-local VyrnForge integration code is removed.

## Vue distribution

`@vyrnforge/ui-vue` is the target first-class Vue package.

It should own Vue-facing integration such as generated components, props/emits,
slots, refs, `v-model` translation, plugin/registration setup, and Vue-specific
typing defined by later S10/S13 contracts.

Vue runtime dependencies or peer dependencies belong only in this framework
package where required. Shared foundations and the canonical renderer must not
acquire a Vue runtime dependency.

Existing applications that directly consume `@vyrnforge/ui-elements` remain a
supported compatibility path during migration. The S13 cutover must prove the
new package before fixture-local VyrnForge integration code is removed.

## Aliases and compatibility packages

No additional React or native alias packages are introduced by default.

Compatibility should prefer stable existing package names, export continuity,
deprecation guidance, and migration documentation over publishing duplicate
meta-packages. An alias package may be introduced later only if a concrete
migration requirement cannot be met cleanly through the canonical packages.

Angular and Vue's previous direct-`ui-elements` integration remains a supported
low-level interoperability path; the new framework packages become the normal
first-class path once their release gates pass.

## Package ownership principles

MFD-1004 defines the exact dependency graph, but this naming decision establishes
these ownership constraints:

- framework runtime dependencies remain isolated to the applicable framework
  facade package;
- `ui-core`, `ui-behaviors`, and the canonical native/DOM implementation remain
  framework-neutral with respect to React, Angular, and Vue runtimes;
- framework packages do not become independent design systems or duplicate the
  canonical component implementation;
- applications do not copy VyrnForge-owned integration implementation into
  their source trees;
- public framework packages expose deliberate, typed, documented entrypoints
  rather than requiring deep imports into implementation packages.

## Release and versioning implications

The current four-package non-grid beta group describes the implemented state and
is not modified by this ADR alone.

MFD-1013 and S15 must make release metadata capable of representing the new
framework packages without fixed package counts, historical task IDs, or a
single hard-coded release topology. Angular and Vue package publication begins
only when their implementation and release gates authorize it.

The data grid remains outside this framework package expansion.

## Migration model

The migration strategy is additive:

1. Existing React consumers continue using `@vyrnforge/ui-components`.
2. Existing native consumers continue using `@vyrnforge/ui-elements`.
3. Angular consumers may continue direct native consumption until the official
   Angular package passes G12, then migrate integration ownership into
   `@vyrnforge/ui-angular`.
4. Vue consumers may continue direct native consumption until the official Vue
   package passes G13, then migrate integration ownership into
   `@vyrnforge/ui-vue`.
5. Direct `ui-elements` usage remains available as an interoperability escape
   hatch where a framework consumer intentionally wants native DOM semantics.

No existing package is renamed or removed as part of MFD-1003.

## Rejected alternatives

### Rename all framework packages for symmetry

For example, introducing new React/native names alongside Angular/Vue was
rejected because it creates unnecessary migration churn and duplicate install
paths while the current React and native names are already public.

### Keep Angular and Vue as documentation-only integrations

Rejected because first-class support requires VyrnForge to own and distribute
framework integration rather than requiring each consuming application to copy
or recreate adapters.

### One universal package containing all framework runtimes

Rejected because it would mix framework peer/runtime dependencies, weaken tree
shaking and dependency boundaries, and make consumers install integration for
frameworks they do not use.

### Publish thin aliases for every surface

Rejected as the default because aliases increase release, provenance,
documentation, and deprecation surface without solving a demonstrated
compatibility problem.

## Acceptance mapping

MFD-1003 requires one obvious install path for each supported surface and a
documented compatibility path for existing consumers.

This ADR keeps the existing React and native public packages, establishes
`@vyrnforge/ui-angular` and `@vyrnforge/ui-vue` as the future first-class
framework packages, avoids duplicate aliases by default, and defines additive
migration from the existing direct-native Angular/Vue integrations.
