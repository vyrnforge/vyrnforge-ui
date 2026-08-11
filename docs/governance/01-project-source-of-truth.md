# Project Source Of Truth

## Canonical positioning

VyrnForge UI is a native-first, dependency-minimal enterprise UI foundation for
internal tools, admin portals, customer portals, data-heavy applications,
workflow systems, reporting interfaces, dashboards, and related enterprise
platforms.

It is not only a component library or data-grid package.

## Package roles

| Package                    | Role                                                                                  | Release track     |
| -------------------------- | ------------------------------------------------------------------------------------- | ----------------- |
| `@vyrnforge/ui-core`       | Framework-neutral tokens, themes, density, typography, motion, layers, and utilities. | Non-grid beta     |
| `@vyrnforge/ui-behaviors`  | Framework-neutral component controllers, state rules, and reasoned events.            | Non-grid beta     |
| `@vyrnforge/ui-components` | First-class React renderer.                                                           | Non-grid beta     |
| `@vyrnforge/ui-elements`   | First-class native HTML Custom Element renderer.                                      | Non-grid beta     |
| `@vyrnforge/ui-data-grid`  | Specialized React data-grid package.                                                  | Independent alpha |

Exact repository release versions and dependencies are canonical in
[`../metadata/release-groups.json`](../metadata/release-groups.json).

## Framework support model

React and native HTML are first-class VyrnForge web renderers.

Angular and Vue are verified consumers of `@vyrnforge/ui-elements`. Their forms
or model integrations remain thin adapters over the native element contract
rather than separate component implementations.

The data grid remains React-only on its independent alpha track. Mobile-native
platforms are outside the current web support model.

## Principles

- Native-first and browser-standards-oriented.
- One shared semantic token and CSS-variable foundation.
- Framework-neutral behavior where reuse provides value.
- Thin framework/rendering adapters rather than duplicated behavior.
- Dependency-minimal and store-agnostic.
- Controlled and uncontrolled state contracts.
- Light DOM by default for native elements.
- Accessibility, keyboard behavior, focus management, and reduced motion are
  core requirements.
- Enterprise density and data-management use cases matter.
- Business-specific logic remains in consuming applications.
- Documentation and metadata remain source-of-truth oriented.

## Non-goals

VyrnForge does not aim to be:

- a Material or Ant Design clone;
- a Tailwind, Radix, or TanStack wrapper;
- a required Redux or other application-store framework;
- separate unrelated component libraries for each frontend framework;
- a mobile-native renderer in the current web program;
- a spreadsheet, BI pivot, charting, or report-generation platform.

## Canonical related sources

- [System Overview](../architecture/00-system-overview.md)
- [Package Boundaries](../architecture/01-package-boundaries.md)
- [State and Adapter Ownership](../architecture/02-state-and-adapter-ownership.md)
- [Multi-Framework Web Support](../architecture/adr-004-multi-framework-web-support.md)
- [Current Roadmap](../roadmap/00-master-roadmap.md)
