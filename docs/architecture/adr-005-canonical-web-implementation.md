# ADR-005: Shared Web Implementation Model

- Status: Accepted, clarified
- Scope: Non-grid web component implementation strategy
- Related: [Package Boundaries](01-package-boundaries.md), [ADR-006](adr-006-framework-package-strategy.md), [ADR-008](adr-008-framework-exception-policy.md)

## Context

VyrnForge supports Native HTML / Custom Elements, React, Angular, and Vue as
**equal first-class product surfaces**. VyrnForge itself owns the canonical UI
model; no framework surface is the semantic parent of another.

Maintaining four independent browser implementations for every component would
multiply DOM, behavior, styling, accessibility, focus, event, form, and bug-fix
ownership. Shared implementation is therefore desirable where it preserves each
surface's idiomatic public contract.

## Decision

For the current non-grid implementation, VyrnForge reuses the browser-native DOM
/ Custom Element implementation in `@vyrnforge/ui-elements` as a shared
implementation foundation where practical.

This is an **implementation reuse decision**, not a product hierarchy.

```text
                   VyrnForge canonical contracts
                              |
                     shared foundations
                              |
             reusable browser implementation
                         ui-elements
                              |
             +--------+-------+--------+-------+
             |        |       |        |       |
           Native   React   Angular    Vue
           surface  surface  surface   surface
```

Native, React, Angular, and Vue remain peers at the product level. A future
implementation may replace or reorganize the shared browser layer without
changing that support model.

## Shared browser implementation responsibilities

The reusable browser implementation may own browser-specific behavior that is
beneficial to solve once, including:

- DOM structure and semantic element selection;
- ARIA relationships and accessibility-state projection;
- canonical DOM events and details;
- property/attribute reflection and public imperative methods;
- Light DOM composition and slot semantics;
- form association and browser form behavior;
- package-owned component styling based on shared VyrnForge tokens;
- DOM-level focus, overlay, observer, and browser lifecycle integration where
  those concerns are not already framework-neutral behavior.

Framework-neutral state transitions belong in `@vyrnforge/ui-behaviors`;
tokens and theme foundations belong in `@vyrnforge/ui-core`.

## Surface responsibilities

Every first-class surface translates the shared VyrnForge model into an
idiomatic public API:

- Native HTML: registration, properties/attributes, DOM events, slots, methods;
- React: props, callbacks, refs, children/composition, controlled/uncontrolled
  conventions, lifecycle, SSR/hydration, and React compatibility behavior;
- Angular: inputs/outputs, content projection, Forms integration, setup, typing,
  refs, and lifecycle translation;
- Vue: props/emits, slots, refs, `v-model`, plugin/setup, typing, and lifecycle.

A framework consumer should not need to understand internal renderer reuse.

## Framework-specific exceptions

Dedicated or handwritten surface implementation is allowed when a concrete
technical constraint prevents shared implementation from meeting a required
public guarantee, such as SSR/hydration, composition, accessibility/focus,
forms, imperative refs, typing, or workload-specific performance.

Cross-framework benchmarking is not required to establish first-class status.
Performance evidence is required only where the component/module's actual
workload or a proposed implementation exception makes it relevant.

Every exception follows [ADR-008](adr-008-framework-exception-policy.md).

## React

React remains a first-class surface through `@vyrnforge/ui-components`. The
package name does not grant React ownership of the VyrnForge component model.
React-specific code remains where its idiomatic public contract requires it.

## Native HTML

Native HTML remains an equal first-class surface through
`@vyrnforge/ui-elements`. The fact that other surfaces may reuse its browser
implementation does not rank Native above those surfaces.

## Angular and Vue

`@vyrnforge/ui-angular` and `@vyrnforge/ui-vue` are equal first-class
framework packages. Generated/generic integration is preferred where it
preserves idiomatic framework behavior; narrow handwritten integration remains
allowed where framework semantics require it.

## Data Grid boundary

Data Grid is an optional advanced VyrnForge module, not a fifth framework
surface. The current `@vyrnforge/ui-data-grid` implementation is React-only
alpha. This ADR does not claim unimplemented Native, Angular, or Vue grid
surfaces, but future grid architecture should follow the same VyrnForge-first
contract and surface model.

## Consequences

Benefits:

- product semantics remain framework-neutral;
- Native, React, Angular, and Vue stay equal first-class surfaces;
- browser/accessibility/form fixes can still be implemented once where useful;
- framework APIs remain idiomatic;
- internal implementation can evolve without redefining product hierarchy.

Costs and risks:

- shared browser implementation must not leak awkward APIs into framework
  surfaces;
- SSR/hydration and framework composition still require explicit verification;
- canonical metadata must stay complete enough to drive mappings;
- historical package names can still be misread without clear documentation.

## Rejected alternatives

### Four independently maintained renderers

Rejected as the default because it duplicates implementation and accessibility
ownership unnecessarily.

### React as the canonical product model

Rejected because VyrnForge is framework-neutral and other surfaces must not
inherit React semantics or runtime dependencies.

### Native as the higher-ranked product surface

Rejected. Native may provide reusable browser implementation, but product-level
surface status remains equal.

### Mandatory cross-framework performance ranking

Rejected. Performance validation should be driven by actual component/module
requirements, not by ranking framework surfaces against one another.
