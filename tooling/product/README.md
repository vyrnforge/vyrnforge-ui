# Product Graph

This directory owns repository-internal discovery for VyrnForge product units and their projection into public packages.

The Product Graph is transitional infrastructure for the source-ownership migration defined by the canonical **Product Unit & Package Projection Architecture**. It must be able to describe both:

- the current package-local implementation layout (`packages/<package>/...` plus legacy `product/<component>/` slices); and
- the target product-owned layout (`product/components`, `product/capabilities`, `product/foundations`, and `product/catalogs`).

## Rules

- Product units are authoring/ownership boundaries.
- Public packages remain versioning, compatibility, and distribution boundaries.
- The graph is repository-only tooling and must never become a runtime dependency of published packages.
- Public exports remain authoritative consumer contracts.
- During migration, canonical product-owned source takes authoring precedence while legacy paths remain visible as migration evidence.
- Package projection destinations are derived from package shape rather than from component-specific registries.
- Product-owned surfaces without an intentional package projection fail closed; Core is not inferred from component symmetry.
- Unprojected product drafts are excluded from distributable package projection.
- Independent hand-maintained inventories should be replaced only after the graph proves equivalent discovery and validation.
- `tooling/testing/discover-product-units.mjs` is transitional discovery plumbing beneath this boundary; repository consumers should depend on the Product Graph rather than import that scanner directly.

## Current Phase

Phase 4 proves package projection before physical source migration.

Each public package build creates an ignored `.vf-projection/<package>/` staging tree from the existing package shell, overlays any publicly projected product-owned surfaces at their package distribution paths, builds the package with its existing public output shape, and removes the staging tree afterward. React, Vue, Elements, Core, Icons, and Web use projected TypeScript source; Web additionally copies canonical CSS/assets from the projected source tree. Angular preserves its ng-packagr primary/secondary-entrypoint structure in the staging tree and writes APF output to the existing `packages/angular/dist` boundary.

The projection layer changes repository build plumbing only. It does **not** change public package names, public subpaths, runtime contracts, package versions, or consumer import paths.

Button remains the first physical source-migration pilot after this projection layer passes repository evidence. Tabs, Dialog, and Icon follow only after the Button migration proves authoring, package, docs, impact, browser, and consumer evidence end to end.
