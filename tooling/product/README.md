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
- Independent hand-maintained inventories should be replaced only after the graph proves equivalent discovery and validation.
- `tooling/testing/discover-product-units.mjs` is transitional discovery plumbing beneath this boundary; repository consumers should depend on the Product Graph rather than import that scanner directly.

## Current Phase

Phase 3 makes the Product Graph a shared repository model. Impact analysis, component documentation/example discovery, and package/public-entrypoint verification consume the graph instead of maintaining their own direct dependency on the legacy testing scanner.

This phase still does **not** move runtime source and does **not** change public package entrypoints. Package projection/compiler changes and physical source migration remain later phases.

Representative migration pilots remain Button, Tabs, Dialog, and Icon.
