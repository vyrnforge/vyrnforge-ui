# Testing infrastructure

Testing follows product ownership. Reusable harnesses live here; evidence lives with the product or repository capability it proves.

## Ownership

- Shared component evidence is discovered from `product/<component>/`.
- Framework/package implementation evidence lives under `packages/<package>/test/...`.
- Reusable package-owned capabilities mirror their source owner under `packages/<package>/test/<kind>/<id>/`.
- Repository-wide reusable browser/type/SSR helpers live directly under `tooling/testing/`.
- Accessibility, compatibility, performance, and repository-wide visual infrastructure live in their named subdirectories here.

`tooling/impact/config.json` contains repository-level impact policy, package topology, validation tiers, global sentinels, and fail-closed roots. It does not enumerate normal components or reusable product instances; those are discovered from public surfaces and ownership conventions.

Normal product additions must not require editing a central testing registry, CI workflow, or validation executor. Expose the real product surface and provide its conventionally owned evidence. Product discovery and structure verification fail when required evidence is missing.

Browser-owned behavior is proven in real browsers. Cross-port conformance validates observable outcomes rather than identical internals. Packed-package consumer verification uses public package surfaces rather than monorepo-private imports.

Do not put product-specific tests here merely because they use a shared harness. The harness belongs here; the evidence belongs to its product owner.
