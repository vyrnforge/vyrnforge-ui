# ADR-004: Multi-Framework Web Support

- Status: Superseded historical evidence
- Scope: Multi-framework architecture implemented before the current convergence model
- Superseded by: [System Overview](00-system-overview.md), [ADR-005](adr-005-canonical-web-implementation.md), [ADR-006](adr-006-framework-package-strategy.md), [ADR-007](adr-007-framework-facade-package-boundaries.md), and [ADR-008](adr-008-framework-exception-policy.md)

## Document role

This ADR preserves the architectural transition that established VyrnForge as a
multi-framework UI foundation. It is no longer the current support model.
Current support status, package topology, canonical implementation strategy,
facade responsibilities, and exception policy are defined by the System
Overview, current package manifests/metadata, and the later accepted ADRs.

Do not use the historical hierarchy in this ADR to classify Angular or Vue as
lower-tier consumers. React, Native HTML / Custom Elements, Angular, and Vue are
now first-class supported non-grid web surfaces.

## Historical context

VyrnForge needed to move beyond React-only assumptions without creating separate
inconsistent component libraries. The pre-convergence architecture established:

1. shared tokens and design foundations in `@vyrnforge/ui-core`;
2. framework-neutral behavior contracts in `@vyrnforge/ui-behaviors`;
3. a first-class React package in `@vyrnforge/ui-components`;
4. browser-native Custom Elements in `@vyrnforge/ui-elements`;
5. Angular and Vue integration evidence over the native element surface;
6. an independently versioned React data-grid alpha track.

That stage proved the portability of VyrnForge semantics and the viability of a
native renderer without requiring Angular or Vue to own independent component
implementations.

## Superseding architecture

The later multi-framework distribution program converted the historical
consumer model into the current first-class package model:

```text
React       -> @vyrnforge/ui-components
Native HTML -> @vyrnforge/ui-elements
Angular     -> @vyrnforge/ui-angular
Vue         -> @vyrnforge/ui-vue
```

All four non-grid surfaces share one canonical component model. Native DOM /
Custom Elements are the default canonical browser implementation strategy.
Angular and Vue expose idiomatic framework facades over that implementation.
React preserves its public React contract while converging toward canonical-
backed implementation where compatible. Framework-specific implementation is a
narrow, explicit, evidence-backed exception rather than a parallel canonical
renderer model.

This distinction is important: implementation strategy does not determine
first-class support status.

## Styling decision retained

Light DOM remains the default for native elements. Shared `--vf-*` variables
remain inheritable and overridable by consuming enterprise applications.
Shadow DOM remains a component-level exception requiring an explicit strategy
for parts, slots, focus, overlays, styling, and testing.

## Historical value

ADR-004 remains useful for explaining why VyrnForge adopted shared foundations,
portable behavior, and Native HTML before the first-class Angular/Vue packages
and React convergence were complete. It must not override current architecture,
current package manifests, current support metadata, or current release
evidence.
