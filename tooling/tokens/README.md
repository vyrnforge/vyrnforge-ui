# Token tooling

`tooling/tokens/` owns repository-internal token source loading, typed alias/reference validation, deterministic transformation, rendering, deprecation forwarding, and generation checks used to keep generated token artifacts synchronized with the shared design-token contract.

`source.mjs` remains the canonical authoring source. Primitive/reference values stay repository-internal by default; runtime semantic definitions preserve their relationship to those references through `tokenReference(...)`. `model.mjs` resolves direct and chained references, rejects missing targets, type mismatches, and cycles, and validates deprecated public aliases before rendering. A deprecated public alias must forward to its replacement with `var(--replacement)` and include an accountable review/removal trigger; it must not become a second independently maintained value.

Keep transformation and generation mechanics here. Runtime token consumption, generated browser CSS, package exports, and framework integration belong to their owning packages. This capability must not become a second design-token source of truth, a runtime resolver, or a home for framework-specific styling behavior.