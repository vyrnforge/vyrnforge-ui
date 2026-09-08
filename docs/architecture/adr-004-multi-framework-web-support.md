# ADR-004: Multi-Framework Web Support

- Status: Superseded historical evidence
- Scope: Architecture transition that established shared multi-framework foundations
- Superseded by: [System Overview](00-system-overview.md), [Package Boundaries](01-package-boundaries.md), [ADR-005](adr-005-canonical-web-implementation.md), [ADR-006](adr-006-framework-package-strategy.md), and [ADR-008](adr-008-framework-exception-policy.md)

## Document role

This ADR preserves the architectural transition that established VyrnForge as a
multi-framework UI foundation. It is not the current support or package model.
Current support status, package topology, canonical implementation strategy,
facade responsibilities, and exception policy are defined by current manifests,
metadata, package-boundary documentation, and the superseding ADRs above.

Do not use the historical hierarchy in this ADR to classify Angular or Vue as
lower-tier consumers. React, Native HTML / Custom Elements, Angular, and Vue are
first-class supported non-grid web surfaces.

## Historical context

The transition established:

1. shared tokens and design foundations in `@vyrnforge/ui-core`;
2. framework-neutral behavior contracts in `@vyrnforge/ui-behaviors`;
3. a first-class React package in `@vyrnforge/ui-components`;
4. browser-native Custom Elements in `@vyrnforge/ui-elements`;
5. Angular and Vue integration evidence over the native element surface;
6. an independently versioned React data-grid alpha track.

That stage proved the portability of VyrnForge semantics and the viability of a
native renderer without requiring Angular or Vue to own independent component
implementations.

## Current superseding model

The current first-class package model is:

```text
React       -> @vyrnforge/ui-components
Native HTML -> @vyrnforge/ui-elements
Angular     -> @vyrnforge/ui-angular
Vue         -> @vyrnforge/ui-vue
```

All four non-grid surfaces share one canonical component model. Native DOM /
Custom Elements are the default canonical browser implementation strategy.
Angular and Vue expose idiomatic facades over that implementation. React
preserves its public React contract while reusing canonical implementation where
compatible. Framework-specific implementation is a narrow, explicit,
evidence-backed exception rather than a parallel canonical renderer model.

Implementation strategy does not determine first-class support status.

## Styling decision retained

Light DOM remains the default for native elements. Shared `--vf-*` variables
remain inheritable and overridable. Shadow DOM remains a component-level
exception requiring an explicit strategy for parts, slots, focus, overlays,
styling, and testing.

## Historical value

ADR-004 remains only because it explains why VyrnForge adopted shared
foundations, portable behavior, and Native HTML before the current package model
was complete. It must not override current architecture, package manifests,
support metadata, or release evidence.
