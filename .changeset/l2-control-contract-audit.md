---
'@vyrnforge/web': patch
'@vyrnforge/react': major
'@vyrnforge/angular': patch
'@vyrnforge/vue': patch
---

Tighten the retained Layer 2 control contracts against the canonical token, CSS, public API, and accessibility standards.

- Remove the React-only `textVariant` options from Button and Link so framework ports expose the same shared control contract.
- Keep `aria-pressed` and the native checkbox `indeterminate` property as the authoritative state instead of emitting redundant VyrnForge state mirrors.
- Restore native Textarea resize behavior.
- Strengthen required control boundaries to the shared non-text-contrast token where the control outline identifies the component.
- Raise Checkbox, Radio, and Switch actionable geometry to the WCAG 2.2 minimum-target baseline and make Switch thumb travel direction-aware in RTL.
- Preserve native semantics, form behavior, focus-visible, forced-colors, reduced-motion, and browser-owned interaction.

Migration for React consumers: remove `textVariant` from Button and Link. Typography inside interactive controls remains owned by the control contract rather than composed through the Layer 1 Text API.
