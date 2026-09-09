# ADR-005: Canonical Web Implementation Model

- Status: Accepted
- Scope: Non-grid web component implementation strategy
- Related: [Package Boundaries](01-package-boundaries.md), [ADR-006](adr-006-framework-package-strategy.md), [ADR-008](adr-008-framework-exception-policy.md)

## Context

VyrnForge supports React, Native HTML / Custom Elements, Angular, and Vue as
first-class non-grid web surfaces. First-class support is a product and
compatibility commitment; it does not require four independently maintained
renderers.

Maintaining independent browser implementations for every framework would
multiply DOM, behavior, styling, accessibility, focus, event, form, and bug-fix
ownership across the catalog.

## Decision

For non-grid web components, the **canonical browser implementation is the
native DOM / Custom Element implementation** in `@vyrnforge/ui-elements`.

Framework surfaces use that implementation through generated or generic facades
wherever the framework can preserve VyrnForge's public semantics,
accessibility, performance, compatibility, and idiomatic developer experience.

This is an implementation default, not a requirement that framework APIs expose
raw Custom Elements or raw DOM event names.

```text
canonical contracts / metadata
          |
      ui-core
          |
    ui-behaviors
          |
      ui-elements
 canonical browser implementation
          |
 +--------+---------+---------+---------+
 |                  |         |         |
Native             React    Angular    Vue
surface            surface  facade     facade
```

Current concrete dependency edges are canonical in
[Package Boundaries](01-package-boundaries.md) and package manifests.

## Canonical implementation responsibilities

The native/DOM implementation owns reusable browser behavior that should not be
reimplemented independently by each framework surface, including:

- DOM structure and semantic element selection;
- ARIA relationships and accessibility-state projection;
- canonical `vf-*` events and details;
- property/attribute reflection and public imperative methods;
- Light DOM composition and canonical slot semantics;
- form association and browser form behavior where applicable;
- package-owned component styling based on shared VyrnForge tokens;
- DOM-level focus, overlay, observer, and browser lifecycle integration where
  those concerns are not already framework-neutral behavior.

Framework-neutral state transitions and reusable decision logic belong in
`@vyrnforge/ui-behaviors`; tokens and theme foundations belong in
`@vyrnforge/ui-core`.

## Framework facade responsibilities

Framework integration translates the canonical implementation into idiomatic
framework conventions without duplicating product semantics:

- React: props, callbacks, refs, children/composition, controlled/uncontrolled
  conventions, lifecycle, SSR/hydration, and compatibility behavior;
- Angular: inputs/outputs, content projection, Forms integration, setup, typing,
  refs, and lifecycle translation;
- Vue: props/emits, slots, refs, `v-model`, plugin/setup, typing, and lifecycle;
- Native HTML: registration and direct DOM usage.

Facade code should be generated or generic wherever canonical metadata can
express the mapping.

## Framework-specific exceptions

A dedicated or handwritten framework implementation is allowed only when a
concrete technical constraint prevents the canonical-backed path from meeting a
required guarantee, such as:

- SSR/hydration incompatibility;
- measured performance regression;
- composition semantics that cannot preserve the public contract;
- accessibility, focus, or form behavior that cannot be preserved;
- imperative/ref or framework type-system constraints.

Preference, familiarity, or avoiding generator work are not valid reasons.
Every exception follows [ADR-008](adr-008-framework-exception-policy.md) and is
recorded in `docs/metadata/framework-exceptions.json` with scope, reason,
evidence, owner, and review/exit criteria.

## React convergence

React remains a first-class public surface through
`@vyrnforge/ui-components`. React-specific implementation remains only where
compatibility, developer experience, SSR, accessibility, or performance evidence
justifies it. Canonical-backed reuse must not break established React API,
behavior, typing, refs, SSR/hydration, accessibility, or performance guarantees.

## Native HTML

Native HTML remains a first-class public surface, not an internal implementation
detail. Consumers retain a direct, typed, documented
`@vyrnforge/ui-elements` path.

## Angular and Vue

`@vyrnforge/ui-angular` and `@vyrnforge/ui-vue` are first-class framework
packages. They remain thin/generated facades over the canonical implementation
with narrow handwritten integration only where framework semantics require it.

## Data-grid boundary

This decision applies to the non-grid catalog. `@vyrnforge/ui-data-grid`
remains a separate React alpha track and is not made multi-framework by this ADR.

## Consequences

Benefits:

- most DOM, accessibility, form, styling, and browser-behavior fixes have one
  implementation owner;
- Angular and Vue do not become independent component libraries;
- React can preserve idiomatic compatibility while reusing canonical behavior;
- generation has a clear default target and explicit exception boundary;
- Native HTML remains directly consumable.

Costs and risks:

- React facade quality must be proven against existing React guarantees;
- SSR/hydration and framework composition require explicit verification;
- some components may need narrow documented exceptions;
- canonical metadata must remain complete enough to generate mappings without
  undeclared component-specific branches.

## Rejected alternatives

### Four independently maintained renderers

Rejected because it duplicates behavior and accessibility ownership and creates
framework drift.

### Permanent independent React and native canonical renderers

Rejected as the default because it leaves two sources for catalog semantics.
Narrow React exceptions remain allowed when evidence justifies them.

### React as the canonical implementation

Rejected because Native HTML, Angular, and Vue must not acquire a hidden React
runtime dependency.

### A new framework-neutral virtual renderer runtime

Not adopted because the existing canonical native implementation plus shared
behaviors and generated facades meet the current architecture without another
permanent runtime layer.
