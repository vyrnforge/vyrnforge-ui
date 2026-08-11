# ADR-004: Multi-Framework Web Support

- Status: Accepted current-state architecture evidence
- Scope: Implemented VyrnForge web renderer and package model through S9
- Supersedes: React-only assumptions in earlier roadmap sequencing
- Target architecture: [ADR-005](adr-005-canonical-web-implementation.md), [ADR-006](adr-006-framework-package-strategy.md)

## Document role

This ADR records the multi-framework architecture that was implemented and
verified through the S4-S9 program. It remains authoritative evidence for the
current repository state until target S10-S15 changes are implemented.

It is **not** the target architecture source for the S10-S15 Multi-Framework
Distribution Architecture program. Where this document differs from an accepted
S10 target ADR, the S10 ADR defines the intended future state while this file
continues to describe the implemented/historical state.

## Context

VyrnForge is a reusable enterprise UI foundation, not only a React data-grid
package. Shared tokens, styling, accessibility rules, component contracts, and
portable behavior need to support more than one web framework without creating
separate inconsistent component libraries.

## Implemented decision through S9

The implemented multi-framework web model is:

1. React is a first-class renderer through `@vyrnforge/ui-components`.
2. Native HTML is a first-class renderer through browser-native Custom Elements
   in `@vyrnforge/ui-elements`.
3. Angular and Vue are verified consumers of the native element surface.
4. `@vyrnforge/ui-behaviors` owns portable component controllers and state
   transitions shared by renderers where appropriate.
5. `@vyrnforge/ui-core` remains the shared token, theme, density, typography,
   motion, layer, and utility foundation.
6. `@vyrnforge/ui-data-grid` remains an independently versioned React alpha
   package outside the synchronized non-grid beta group.
7. Mobile-native rendering is a separate future concern.

## Implemented package identity

The current React package is:

```text
@vyrnforge/ui-components
```

The current synchronized non-grid beta group is:

```text
@vyrnforge/ui-core
@vyrnforge/ui-behaviors
@vyrnforge/ui-components
@vyrnforge/ui-elements
```

The data grid remains:

```text
@vyrnforge/ui-data-grid
```

on its independent alpha track.

These implemented package identities remain valid. ADR-006 preserves the React
and native package names while defining new first-class Angular and Vue target
packages for later implementation.

## Implemented renderer strategy

Through S9, VyrnForge shares contracts and portable behavior rather than one
renderer implementation across every framework:

- React uses React components, props, hooks, children, and callbacks.
- Native HTML uses Custom Elements, DOM properties/attributes, events, methods,
  and Light DOM composition.
- Angular and Vue map their framework conventions to the native element
  contract.
- Thin framework adapters are allowed when they add real integration value,
  such as form/model translation; they must not duplicate rendering or
  accessibility logic.

ADR-005 changes the **target** implementation default for future non-grid work:
the native/DOM implementation becomes canonical and framework surfaces converge
through generated or generic facades unless an explicit technical exception is
approved.

## Styling decision

Light DOM is the default for native elements. Shared `--vf-*` variables remain
inheritable and overridable by consuming enterprise applications.

Shadow DOM is a component-level exception requiring an explicit documented
strategy for parts, slots, focus, overlays, styling, and testing.

## Consequences

This implemented model established portable shared foundations, prevented React
from becoming a hidden dependency of Angular/Vue/native consumers, and produced
verified Angular/Vue consumption without independent component libraries.

Its remaining limitation is distribution ownership: Angular and Vue still rely
on consumer-side integration rather than first-class framework packages. The
S10-S15 target program addresses that limitation without discarding the evidence
captured here.

## Historical non-decisions

At the time ADR-004 was accepted, it did not:

- require separate Angular or Vue component packages;
- change React public APIs merely to mirror DOM event names;
- make the data grid multi-framework;
- select a large Web Component runtime;
- define a mobile-native renderer.

The first item has since been superseded as a **target distribution decision** by
ADR-006, which selects first-class Angular and Vue facade packages. The other
non-decisions remain unchanged unless a later accepted ADR explicitly changes
them.
