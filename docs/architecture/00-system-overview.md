# VyrnForge UI System Overview

VyrnForge UI is a native-first, dependency-minimal enterprise UI foundation.
The first multi-framework beta targets reusable **non-grid** components for
React and native HTML, with Angular and Vue verified as consumers of the native
Custom Element surface.

## Package architecture

```text
                         @vyrnforge/ui-core
       tokens · themes · density · typography · motion · layers · utilities
                                  |
                         @vyrnforge/ui-behaviors
       framework-neutral controllers · collections · selection · validation
                                  |
              +-------------------+-------------------+
              |                                       |
 @vyrnforge/ui-components                    @vyrnforge/ui-elements
 React renderer and adapters                 native Custom Elements
              |                                       |
              +----------- consuming applications ----+
                          React · HTML · Angular · Vue

Separate release track:
@vyrnforge/ui-data-grid — existing React alpha data-grid package
```

`ui-behaviors` and `ui-elements` are implemented package foundations approved by
GMF1. Their runtime work begins after this architecture sprint.

## Support levels

| Surface       | Support direction                                                    | Beta role                    |
| ------------- | -------------------------------------------------------------------- | ---------------------------- |
| React         | First-class renderer through `@vyrnforge/ui-components`              | Included                     |
| Native HTML   | First-class Custom Element renderer through `@vyrnforge/ui-elements` | Included                     |
| Angular       | Verified consumer of `@vyrnforge/ui-elements`                        | Included after GMF4 evidence |
| Vue           | Verified consumer of `@vyrnforge/ui-elements`                        | Included after GMF4 evidence |
| Data grid     | Existing React alpha package                                         | Excluded from non-grid beta  |
| Mobile-native | Separate future program                                              | Excluded                     |

## Core principles

- One semantic token and CSS-variable foundation.
- One framework-neutral behavior contract where behavior can be shared.
- Thin renderer adapters rather than duplicated state and accessibility logic.
- React remains the reference renderer and keeps its existing package name.
- Browser-native Custom Elements provide the plain HTML integration surface.
- Light DOM is the default for enterprise customization and interoperability.
- Angular and Vue wrappers are optional and integration-focused, not duplicate
  component implementations.
- Data-grid work does not block the non-grid beta release.

## State and rendering separation

The framework-neutral layer owns decisions and transitions. Renderers own
framework lifecycle and output. DOM adapters own focus, event listening,
positioning, observers, and browser execution.

```text
shared controller
  state transitions
  selection and collection rules
  keyboard decisions
  validation state
  canonical event reasons

DOM adapter
  focus execution
  event translation
  positioning and observers
  ARIA relationship application

renderer
  React JSX or Custom Element Light DOM
  framework lifecycle
  templates, children, or slots
```

No VyrnForge package owns application authentication, authorization, backend
requests, tenant state, business workflows, or global application storage.

## Canonical sources

- Multi-framework decision: `architecture/adr-004-multi-framework-web-support.md`
- Package boundaries: `architecture/01-package-boundaries.md`
- Component contracts: `architecture/09-component-contracts-and-events.md`
- Native element and form strategy:
  `architecture/10-custom-elements-and-form-association.md`
- Machine-readable support model: `metadata/multi-framework.json`
- Machine-readable component contracts: `metadata/component-contracts.json`
