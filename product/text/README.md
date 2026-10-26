# Text

Text provides VyrnForge's shared, extensible typography system while preserving native HTML text semantics.

- Canonical tokens, built-in visual roles, and styling live in `@vyrnforge/web`.
- Native Web uses `data-vf-text` and `data-vf-text-variant` on the appropriate semantic element.
- React and Vue provide convenience `Text` components with an explicit `as` element.
- Angular provides the `vfText` directive so the authored element remains the semantic source of truth.
- No custom-element wrapper is provided because ordinary text semantics are already native HTML.
- Built-in roles cover display, heading, title, body, label, caption, and overline treatments.
- Applications can add or disable typed variants through `TextVariantOverrides` and style custom variants through the same stable Web hook.
- Existing `body`, `label`, `title`, and `heading` names remain compatibility aliases.
