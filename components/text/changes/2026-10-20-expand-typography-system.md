# Expand Text into a full typography system

- Add display, heading, title, body, label, caption, and overline visual roles.
- Preserve the initial Text names as compatibility aliases.
- Expand public font-family, size, weight, line-height, and letter-spacing tokens.
- Add fluid CSS-first display typography with `clamp()`.
- Add `TextVariantOverrides` so applications can enable custom variants or disable built-in variants in the shared TypeScript contract.
- Keep custom styling on the canonical `data-vf-text-variant` hook rather than introducing a JavaScript theme registry.
- Validate the same built-in/custom variant contract across Native Web, React, Angular, and Vue.
