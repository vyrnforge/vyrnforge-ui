# Project Source Of Truth

## Canonical positioning

VyrnForge UI is a native-first, dependency-minimal enterprise UI foundation for
internal tools, admin portals, customer portals, data-heavy applications,
workflow systems, reporting interfaces, dashboards, and related enterprise
platforms.

It is not only a component library or data-grid package.

## Current implemented package roles

The following table describes the repository state implemented through S9. It
must not be read as the complete S10-S15 target distribution topology.

| Package                    | Current role                                                                          | Release track     |
| -------------------------- | ------------------------------------------------------------------------------------- | ----------------- |
| `@vyrnforge/ui-core`       | Framework-neutral tokens, themes, density, typography, motion, layers, and utilities. | Non-grid beta     |
| `@vyrnforge/ui-behaviors`  | Framework-neutral component controllers, state rules, and reasoned events.            | Non-grid beta     |
| `@vyrnforge/ui-components` | First-class React renderer.                                                           | Non-grid beta     |
| `@vyrnforge/ui-elements`   | First-class native HTML Custom Element renderer.                                      | Non-grid beta     |
| `@vyrnforge/ui-data-grid`  | Specialized React data-grid package.                                                  | Independent alpha |

Exact current repository release versions and dependencies are canonical in
[`../metadata/release-groups.json`](../metadata/release-groups.json).

## Current implemented framework state

Through S9, React and native HTML are implemented as first-class VyrnForge web
renderers. Angular and Vue are verified consumers of `@vyrnforge/ui-elements`,
with thin forms/model reference adapters over the native element contract.

This implemented state is preserved as current-state evidence in
[ADR-004](../architecture/adr-004-multi-framework-web-support.md).

## Approved S10-S15 target architecture

The approved product support target is four equally first-class supported web
surfaces: React, native HTML, Angular, and Vue. Support status is distinct from
implementation strategy; VyrnForge is not creating four independent component
implementations.

Accepted target decisions currently establish:

- [ADR-005](../architecture/adr-005-canonical-web-implementation.md): the
  native/DOM implementation is the default canonical non-grid web
  implementation; generated or generic framework facades are preferred and
  dedicated renderers require explicit technical exceptions.
- [ADR-006](../architecture/adr-006-framework-package-strategy.md): React keeps
  `@vyrnforge/ui-components`, native HTML keeps `@vyrnforge/ui-elements`, and
  the target first-class Angular/Vue packages are `@vyrnforge/ui-angular` and
  `@vyrnforge/ui-vue`.

Target decisions define intended future architecture even when the corresponding
packages or dependency edges have not yet been implemented. Current manifests,
release metadata, and current-state ADRs remain authoritative for what exists in
the repository today.

The data grid remains React-only on its independent alpha track. Multi-framework
grid implementation is outside the S10-S15 program. Mobile-native platforms are
outside the current web program.

## Principles

- Native-first and browser-standards-oriented.
- One shared semantic token and CSS-variable foundation.
- Framework-neutral behavior where reuse provides value.
- Generated or thin framework facades rather than duplicated component behavior.
- Dependency-minimal and store-agnostic.
- Controlled and uncontrolled state contracts.
- Light DOM by default for native elements.
- Accessibility, keyboard behavior, focus management, internationalization,
  responsive behavior, performance, and reduced motion are core requirements.
- Enterprise density and data-management use cases matter.
- Business-specific logic remains in consuming applications.
- Documentation and metadata remain source-of-truth oriented.

## Non-goals

VyrnForge does not aim to be:

- a Material or Ant Design clone;
- a Tailwind, Radix, or TanStack wrapper;
- a required Redux or other application-store framework;
- four unrelated framework-specific component libraries;
- a mobile-native renderer in the current web program;
- a spreadsheet, BI pivot, charting, or report-generation platform.

## Source authority

Use the sources according to the question being answered:

- **Current implemented state:** package manifests, release metadata, current
  package-boundary metadata, and ADR-004/current implementation documentation.
- **Approved target architecture:** accepted S10 target ADRs and canonical
  contract metadata as those tasks land.
- **Program execution:** the approved S10-S15 workbook reflected by the master
  roadmap.
- **Historical evidence:** closure/evidence documents from prior sprints. These
  prove what was implemented or verified at that time but do not override later
  accepted target decisions.

## Canonical related sources

- [Documentation Index](../README.md)
- [System Overview](../architecture/00-system-overview.md)
- [Package Boundaries](../architecture/01-package-boundaries.md)
- [State and Adapter Ownership](../architecture/02-state-and-adapter-ownership.md)
- [Current-State Multi-Framework Evidence](../architecture/adr-004-multi-framework-web-support.md)
- [Canonical Web Implementation Target](../architecture/adr-005-canonical-web-implementation.md)
- [Framework Package Strategy Target](../architecture/adr-006-framework-package-strategy.md)
- [Current Roadmap](../roadmap/00-master-roadmap.md)
