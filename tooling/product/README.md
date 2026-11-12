# Product Graph

This directory owns repository-internal discovery for VyrnForge product units and their projection into public packages.

The Product Graph discovers component owners under `product/components/<layer>/<optional-category>/<id>/` and projects their supported surfaces into public packages. Discovery also recognizes legacy flat owners for compatibility and rejects duplicate component IDs across layouts.

## Rules

- Product units are authoring/ownership boundaries.
- Public packages remain versioning, compatibility, and distribution boundaries.
- The graph is repository-only tooling and must never become a runtime dependency of published packages.
- Public exports remain authoritative consumer contracts.
- Author component implementations in their layered product unit. Package shells own package metadata, entrypoints, and distribution verification.
- Package projection destinations are derived from package shape rather than from component-specific registries.
- Product-owned surfaces without an intentional package projection fail closed; Core is not inferred from component symmetry.
- Unprojected product drafts are excluded from distributable package projection.
- Independent hand-maintained inventories should be replaced only after the graph proves equivalent discovery and validation.
- `tooling/testing/discover-product-units.mjs` is transitional discovery plumbing beneath this boundary; repository consumers should depend on the Product Graph rather than import that scanner directly.

## Package builds

Each public package build creates an ignored `.vf-projection/<package>/` staging tree from the existing package shell, overlays any publicly projected product-owned surfaces at their package distribution paths, builds the package with its existing public output shape, and removes the staging tree afterward. React, Vue, Elements, Core, Icons, and Web use projected TypeScript source; Web additionally copies canonical CSS/assets from the projected source tree. Angular preserves its ng-packagr primary/secondary-entrypoint structure in the staging tree and writes APF output to the existing `packages/angular/dist` boundary.

Component IDs and public package subpaths remain stable when an accepted concept changes source ownership. Retired abstractions are removed deliberately rather than preserved through projection.

Nx includes product metadata and each package’s component source directories in its inputs so affected selection and cached tasks follow the projection.
