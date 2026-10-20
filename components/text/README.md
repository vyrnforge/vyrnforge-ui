# Text

Text establishes VyrnForge's shared typography vocabulary while preserving native HTML text semantics.

- Canonical tokens and styling live in `@vyrnforge/web`.
- Native Web uses `data-vf-text` and `data-vf-text-variant` on the appropriate semantic element.
- React and Vue provide convenience `Text` components with an explicit `as` element.
- Angular provides the `vfText` directive so the authored element remains the semantic source of truth.
- No custom-element wrapper is provided because ordinary text semantics are already native HTML.
