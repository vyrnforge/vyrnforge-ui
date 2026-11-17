# Token tooling

`tooling/tokens/` owns repository-internal token source loading, typed alias/reference validation, deterministic transformation, rendering, deprecation forwarding, and generation checks used to keep generated token artifacts synchronized with the shared design-token contract.

`source.mjs` remains the canonical authoring source. Primitive/reference values stay repository-internal by default; runtime semantic definitions preserve their relationship to those references through `tokenReference(...)`. `model.mjs` resolves direct and chained references, rejects missing targets, type mismatches, and cycles, and validates deprecated public aliases before rendering. A deprecated public alias must forward to its replacement with `var(--replacement)` and include an accountable review/removal trigger; it must not become a second independently maintained value.

Keep transformation and generation mechanics here. Runtime token consumption, generated browser CSS, package exports, and framework integration belong to their owning packages. This capability must not become a second design-token source of truth, a runtime resolver, or a home for framework-specific styling behavior.

## Authoring commands

- `pnpm generate:tokens` writes deterministic generated token CSS to `packages/web/src/styles/tokens.css` from the canonical `source.mjs` definitions. Review and commit the generated output if it changes.
- `pnpm verify:tokens` checks that the tracked CSS matches the current source and fails on drift without editing files.
- A direct `node tooling/tokens/generate.mjs` invocation defaults to read-only check mode; use explicit `--write` when invoking the script directly.
