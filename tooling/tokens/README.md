# Token tooling

`tooling/tokens/` owns repository-internal token source loading, typed alias/reference validation, deterministic transformation, rendering, deprecation forwarding, and generation checks used to keep generated token artifacts synchronized with the shared design-token contract.

`source.mjs` remains the canonical authoring source. Primitive/reference values stay repository-internal by default; runtime semantic definitions preserve their relationship to those references through `tokenReference(...)`. `model.mjs` resolves direct and chained references, rejects missing targets, type mismatches, and cycles, and validates deprecated public aliases before rendering. A deprecated public alias must forward to its replacement with `var(--replacement)` and include an accountable review/removal trigger; it must not become a second independently maintained value.

Keep transformation and generation mechanics here. Runtime token consumption, generated browser CSS, package exports, and framework integration belong to their owning packages. This capability must not become a second design-token source of truth, a runtime resolver, or a home for framework-specific styling behavior.

## Authoring commands

- `pnpm generate:tokens` writes deterministic generated token CSS to `packages/web/src/styles/tokens.css` from the canonical `source.mjs` definitions. Review and commit the generated output if it changes.
- `pnpm verify:tokens` checks that the tracked CSS matches the current source and fails on drift without editing files.
- A direct `node tooling/tokens/generate.mjs` invocation defaults to read-only check mode; use explicit `--write` when invoking the script directly.

## Semantic feedback color roles

Use the public `--vf-color-{success,warning,info,danger}-{foreground,background,border}` roles for contextual feedback on a tinted or ordinary surface. The existing danger background and border retain their values and meaning. The new foreground role is suitable for text and icons; do not use the border role as a text-contrast guarantee. The background is a subtle fill, not a solid-action fill. Accent remains the action/selection role and is not informational severity.

The notification selection standard defines informational, success, warning, error and critical as semantic meanings. Informational maps to info paint; error and critical may share danger paint and must be distinguishable by authored wording/icon/context, not a separate palette or automatic assertive announcement. These tokens are visual roles, not an operation state machine or live-region policy. Forced-colors remains the responsibility of rendered consumers; use system colors and retain non-color cues. Custom themes are responsible for their own contrast. React aliases map directly to canonical Web variables; component-specific tone expansion is separate work.

Default foreground/surface and foreground/tint pairs meet 4.5:1; default borders against the surface and tint meet 3:1 in light and dark. Tests cover these specific pairs, not arbitrary theme values or rendered component accessibility.
