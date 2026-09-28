# VyrnForge UI Public API Reference

This directory documents public package surfaces that consuming applications may
rely on. It does not own the package inventory or release classification.

Public API includes documented package-root exports, component and element
contracts, CSS entrypoints, CSS custom properties and classes, framework facade
contracts, and documented data-grid state/adapter contracts. Anything else is
internal unless explicitly stated otherwise.

## Package API ownership

Current package identity, relationships, public entrypoints, and release-group
membership are owned by `docs/metadata/packages.json`, release metadata, package
manifests, and verified public entrypoints. See the
[Project Source Of Truth](../governance/01-project-source-of-truth.md) for the
human-readable package roles.

Native HTML / Custom Elements, React, Angular, and Vue are first-class VyrnForge
surfaces over shared foundations. The data grid is an optional specialized React
package on its independent release track.

## Start here

- [Import and Setup](import-and-setup.md)
- [ui-core API](ui-core-api.md)
- [ui-behaviors API](ui-behaviors-api.md)
- [ui-components API](ui-components-api.md)
- [ui-elements API](ui-elements-api.md)
- Angular package guidance: [ui-angular](../../packages/ui-angular/README.md)
- Vue package guidance: [ui-vue](../../packages/ui-vue/README.md)
- [ui-data-grid API](ui-data-grid-api.md)
- [CSS Token Reference](css-token-reference.md)
- [CSS Class Reference](css-class-reference.md)
- [Public vs Internal API](public-vs-internal-api.md)

The canonical component catalog and maturity records live in
[`../metadata/components.json`](../metadata/components.json). Generated
component/framework facts derive from canonical metadata and contracts; do not
maintain another hand-written component inventory here.

## Multi-framework contract

Cross-framework behavior and renderer contracts are defined by:

- [Package Boundaries](../architecture/01-package-boundaries.md)
- [Component Contracts and Events](../architecture/09-component-contracts-and-events.md)
- [Custom Elements and Form Association](../architecture/10-custom-elements-and-form-association.md)
- [Canonical Web Implementation](../architecture/adr-005-canonical-web-implementation.md)
- [Framework Package Strategy](../architecture/adr-006-framework-package-strategy.md)
- [Multi-Framework Migration and Limitations](../release/multi-framework-migration-and-limitations.md)

## CSS

Load `@vyrnforge/ui-core` styles before renderer or grid styles. Import only the
packages used by the application.

```ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
```

For Native HTML / Custom Elements, use
`@vyrnforge/ui-elements/styles/index.css` after core. Framework facade styling
follows the shared VyrnForge styling contract rather than defining independent
design systems. For the React data grid, use
`@vyrnforge/ui-data-grid/styles/index.css` after core and component styles.

See [Import and Setup](import-and-setup.md) for complete examples.

## Source of truth

Markdown owns human-readable architecture and usage decisions. Structured
metadata and package manifests own queryable package/component/API facts and
verification state. Generated references must remain reproducible projections of
those canonical inputs.
