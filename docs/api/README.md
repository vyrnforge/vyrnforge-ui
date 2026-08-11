# VyrnForge UI Public API Reference

This directory documents the public package surface that consuming applications
may rely on.

Public API includes documented package-root exports, documented component and
element contracts, documented CSS entrypoints, documented CSS variables and
classes, and documented grid state/adapter contracts. Anything else is internal
unless explicitly stated otherwise.

## Packages

| Package                    | Public role                                                                     | Release channel |
| -------------------------- | ------------------------------------------------------------------------------- | --------------- |
| `@vyrnforge/ui-core`       | Framework-neutral design tokens, themes, density, utilities, and theme helpers. | `beta`          |
| `@vyrnforge/ui-behaviors`  | Framework-neutral controller and behavior contracts.                            | `beta`          |
| `@vyrnforge/ui-components` | First-class React renderer.                                                     | `beta`          |
| `@vyrnforge/ui-elements`   | First-class native HTML Custom Element renderer.                                | `beta`          |
| `@vyrnforge/ui-data-grid`  | Specialized React enterprise data grid.                                         | `alpha`         |

React and native HTML are first-class renderers. Angular and Vue consume
`@vyrnforge/ui-elements` through verified framework integration patterns.

## Start here

- [Import and Setup](import-and-setup.md)
- [ui-core API](ui-core-api.md)
- [ui-behaviors API](ui-behaviors-api.md)
- [ui-components API](ui-components-api.md)
- [ui-elements API](ui-elements-api.md)
- [ui-data-grid API](ui-data-grid-api.md)
- [CSS Token Reference](css-token-reference.md)
- [CSS Class Reference](css-class-reference.md)
- [Public vs Internal API](public-vs-internal-api.md)

The canonical component catalog and maturity records live in
[`../metadata/components.json`](../metadata/components.json). The generated
framework/component view lives in
[`../generated/component-reference.json`](../generated/component-reference.json).
Do not maintain another hand-written component inventory here.

## Multi-framework contract

Cross-framework behavior and renderer contracts are defined by:

- [Package Boundaries](../architecture/01-package-boundaries.md)
- [Component Contracts and Events](../architecture/09-component-contracts-and-events.md)
- [Custom Elements and Form Association](../architecture/10-custom-elements-and-form-association.md)
- [Multi-Framework Migration and Limitations](../release/multi-framework-migration-and-limitations.md)

## CSS

Load `@vyrnforge/ui-core` styles before renderer or grid styles. Import only the
packages used by the application.

```ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
```

For native elements, use `@vyrnforge/ui-elements/styles/index.css` after core.
For the React data grid, use `@vyrnforge/ui-data-grid/styles/index.css` after
core and component styles.

See [Import and Setup](import-and-setup.md) for complete examples.

## Source of truth

Markdown documents own human-readable architecture and usage decisions.
`docs/metadata/components.json` is the canonical structured component catalog,
and other metadata files provide machine-readable indexes for verification,
documentation generation, and AI tooling.
