---
'@vyrnforge/web': patch
---

Map Popover and PreviewCard default elevation to the canonical medium shadow while retaining the existing `--vf-shadow-popover` customization hook. Remove fixed z-index styling from native Popover, PreviewCard, and Tooltip surfaces, leaving top-layer stacking to the browser. No new public component, global stacking scale, or overlay runtime is introduced.
