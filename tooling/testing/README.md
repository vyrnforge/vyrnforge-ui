# Testing infrastructure

Testing follows ownership. Reusable repository harnesses live here; evidence and owner-specific semantics live with the product, package, application, or other source that defines them.

## Ownership

- Shared component evidence is discovered from `product/<component>/`.
- Framework/package implementation evidence lives under `packages/<package>/test/...`.
- Reusable package-owned capabilities mirror their source owner under `packages/<package>/test/<kind>/<id>/`.
- Repository-wide reusable browser/type/SSR helpers live directly under `tooling/testing/`.
- Compatibility environment-baseline metadata lives under `tooling/testing/compatibility/`.
- Product-owned shared accessibility, native-control, and performance support lives under `product/_test-support/`; it may depend on generic testing mechanisms here, but generic tooling must not depend on owner-specific semantics or evidence.
- Product-owned visual evidence belongs with the package or product that defines the visual contract; shared tooling may provide reusable visual harnesses only when more than one owner needs them.

Component browser fixtures are emitted under `dist/browser-fixtures/` and served by the testing-owned `browser-server.mjs`; reusable browser evidence must not depend on the documentation application or its output layout. `run-browser.mjs` uses the existing public-surface discovery graph to select only product owners that implement the requested port, prepares those fixtures before Playwright starts, and then runs their shared browser evidence. Unsupported ports are not treated as implicit passes or as missing pages.

`tooling/impact/config.json` contains repository-level impact policy, package topology, validation tiers, global sentinels, and fail-closed roots. It does not enumerate normal components or reusable product instances; those are discovered from public surfaces and ownership conventions.

Normal product additions must not require editing a central testing registry, CI workflow, or validation executor. Expose the real product surface and provide its conventionally owned evidence. Product discovery and owner-local tests fail when required evidence is missing.

Browser-owned behavior is proven in real browsers. Cross-port conformance validates observable outcomes rather than identical internals. Packed-package consumer verification uses public package surfaces rather than monorepo-private imports.

Do not put product-specific tests, classification rules, baselines, or semantics here merely because they use a shared harness. The harness belongs here; owner-specific evidence and policy belong to the owner.
