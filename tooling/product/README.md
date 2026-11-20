# Product Graph

This directory owns repository-internal discovery for VyrnForge product units and their projection into public packages.

The Product Graph discovers component owners under `product/components/<responsibility>/<optional-family>/<id>/` and projects their supported surfaces into public packages. Internal schema v3 exposes `responsibility` and `family`; invalid responsibility/family paths, missing metadata, duplicate IDs and manifest-only orphan components fail closed. Flat canonical component discovery is retired; package-owned evidence and non-component discovery remain. Grouping-level `changes/` may contain Markdown provenance only; it is not an owner or a location for component metadata.

## Rules

- Product units are authoring/ownership boundaries.
- Public packages remain versioning, compatibility, and distribution boundaries.
- The graph is repository-only tooling and must never become a runtime dependency of published packages.
- Public exports remain authoritative consumer contracts.
- Author component implementations in their responsibility-based product unit. Package shells own package metadata, entrypoints, and distribution verification.
- Package projection destinations are derived from package shape rather than from component-specific registries.
- Product-owned surfaces without an intentional package projection fail closed; Core is not inferred from component symmetry.
- Unprojected product drafts are excluded from distributable package projection.
- Independent hand-maintained inventories should be replaced only after the graph proves equivalent discovery and validation.
- `tooling/testing/discover-product-units.mjs` is shared discovery plumbing beneath this boundary; repository consumers should depend on the Product Graph rather than import that scanner directly.

## Package builds

Each public package build creates an ignored `.vf-projection/<package>/` staging tree from the existing package shell, overlays any publicly projected product-owned surfaces at their package distribution paths, builds the package with its existing public output shape, and removes the staging tree afterward. React, Vue, Elements, Core, Icons, and Web use projected TypeScript source; Web additionally copies canonical CSS/assets from the projected source tree. Angular preserves its ng-packagr primary/secondary-entrypoint structure in the staging tree and writes APF output to the existing `packages/angular/dist` boundary.

Component IDs and public package subpaths remain stable when an accepted concept changes source ownership. Retired abstractions are removed deliberately rather than preserved through projection.

Nx includes product metadata and each package’s component source directories in its inputs so affected selection and cached tasks follow the projection.

## Ownership migration comparison

For an ownership-only migration, run the explicit baseline comparison before candidate acceptance. Use clean checkouts of the approved baseline and candidate; this does not build or modify either checkout:

```sh
node tooling/product/compare-ownership-baseline.mjs /path/to/baseline /path/to/candidate
```

The comparison normalizes only the approved AD-16 v2-to-v3 ownership fields and AppShell/SideNav paths; it compares the full graph, package projections, five documentation catalogs, and per-path semantic impact for the moved subtree. This is a migration evidence tool, not a compatibility adapter, public API or permanent baseline registry. Verify exact candidate builds, packed consumers and browser/visual behavior separately. The existing `format:l5` and `lint:l5` command IDs remain technical compatibility names for the composite-widget tooling scope, not product taxonomy.

## React browser CSS delivery

The React package preserves the canonical Web CSS rather than copying or forking it. A browser build condition on each React public subpath selects a generated JS wrapper that imports the corresponding `@vyrnforge/web/styles/<id>.css` asset and re-exports the SSR-safe native component module. Package subpaths and their styles are derived from Product Graph exports; special composition dependencies are declared in the component owner's `component.json` under `styling.dependencies`. The root browser entry deliberately imports the Web aggregate and is less tree-shaking friendly than granular subpaths. Node/SSR selects the ordinary CSS-free ESM `import` export.

`tooling/product/react-browser-css.mjs` runs after React's projected TypeScript build and emits browser-only wrappers into `packages/react/dist`. These wrappers are marked as side effects while ordinary component source stays tree-shakeable; the opt-in reset is never auto-loaded. Standard package validation exercises Node and browser bundling separately. Consumer bundlers that do not honor the `browser` package export condition still need the explicit one-time Web stylesheet.
