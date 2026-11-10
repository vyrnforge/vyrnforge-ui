---
"@vyrnforge/elements": major
---

Remove the redundant `@vyrnforge/elements/surface` custom-element surface. Surface is a non-interactive visual treatment with no Elements-specific behavior; Elements consumers should apply `data-vf-surface` to semantic native HTML and load `@vyrnforge/web/styles/surface.css`.
