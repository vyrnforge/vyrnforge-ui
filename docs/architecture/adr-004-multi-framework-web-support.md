# ADR-004: Multi-Framework Web Support

- Status: Accepted
- Scope: VyrnForge web renderer and package model
- Supersedes: React-only assumptions in earlier roadmap sequencing

## Context

VyrnForge is a reusable enterprise UI foundation, not only a React data-grid
package. Shared tokens, styling, accessibility rules, component contracts, and
portable behavior need to support more than one web framework without creating
separate inconsistent component libraries.

## Decision

VyrnForge uses this multi-framework web model:

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

## Package identity

The React package remains:

```text
@vyrnforge/ui-components
```

The synchronized non-grid beta group is:

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

## Renderer strategy

VyrnForge shares contracts and portable behavior, not one framework's rendering
model.

- React uses React components, props, hooks, children, and callbacks.
- Native HTML uses Custom Elements, DOM properties/attributes, events, methods,
  and Light DOM composition.
- Angular and Vue map their framework conventions to the native element
  contract.
- Thin framework adapters are allowed when they add real integration value,
  such as form/model translation; they must not duplicate rendering or
  accessibility logic.

## Styling decision

Light DOM is the default for native elements. Shared `--vf-*` variables remain
inheritable and overridable by consuming enterprise applications.

Shadow DOM is a component-level exception requiring an explicit documented
strategy for parts, slots, focus, overlays, styling, and testing.

## Consequences

This model keeps shared foundations portable, prevents the React runtime from
becoming a hidden dependency of other frameworks, and allows Angular/Vue
integration without maintaining separate component implementations.

The cost is that cross-framework contracts, browser behavior, forms, events,
typing, and accessibility require explicit verification.

## Non-decisions

This ADR does not:

- require separate Angular or Vue component packages;
- change React public APIs merely to mirror DOM event names;
- make the data grid multi-framework;
- select a large Web Component runtime;
- define a mobile-native renderer.
