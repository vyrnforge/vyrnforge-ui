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

Component browser fixtures are emitted under `dist/browser-fixtures/` and served by the testing-owned `browser-server.mjs`; reusable browser evidence must not depend on the documentation application or its output layout. Playwright derives the current port's eligible component specs from `discoverProductUnits()`, so a component is not run against a framework port that is absent from its real public package surface.

Every product browser fixture module exports an explicit `browserFixture` definition for its owner. Shared testing infrastructure validates and invokes that contract in-process. Generic page, stylesheet, bundling, discovery, and serving mechanics may be shared here, while component scenarios, semantics, and specialized fixture preparation remain owner-local. Fixture modules must not depend on argv mutation, child-process launchers, import-time side effects, or emitted-file guessing to establish eligibility.

Repository impact policy is executable in `tooling/impact/plan.mjs` and derives package/product topology from workspace configuration, public surfaces, and ownership conventions. Normal components and reusable product instances are not centrally enumerated.

Normal product additions must not require editing a central testing registry, CI workflow, or validation executor. Expose the real product surface and provide its conventionally owned evidence. Product discovery and owner-local tests fail when required evidence is missing.

## Browser accessibility and visual evidence

Browser-owned behavior is proven in real browsers. Cross-port conformance validates observable outcomes rather than identical internals. Packed-package consumer verification uses public package surfaces rather than monorepo-private imports.

Use `expectNoAxeViolations()` for the shared structural accessibility scan. Axe is a supplemental signal only: interactive acceptance must still assert the semantics that matter for the contract, including keyboard behavior, focus movement/restoration, accessible naming and relationships, disabled/read-only state, interaction outcomes, and browser-owned modality or form behavior where applicable. Repository validation rejects legacy raw axe injection so the shared configuration cannot silently diverge.

Visual regression is product-owned evidence and should capture only meaningful styling contracts. Prefer focused snapshots of states such as focus-visible, forced-colors, RTL, theme/density or validation/loading states when those states are part of the product contract; do not snapshot every incidental DOM state. Reduced-motion and other media-state behavior should be asserted as executable behavior when the contract is behavioral rather than merely pictorial.

Automated browser evidence does not prove blanket WCAG conformance, screen-reader interoperability, usability, announcement quality, browse-mode behavior, touch exploration, or platform/assistive-technology combinations. Manual assistive-technology and usability checks remain a separate evidence class and must be recorded/scoped by the owning product or release activity when required; they are never inferred from a passing axe scan, keyboard test, or screenshot.

Do not put product-specific tests, classification rules, baselines, or semantics here merely because they use a shared harness. The harness belongs here; owner-specific evidence and policy belong to the owner.
