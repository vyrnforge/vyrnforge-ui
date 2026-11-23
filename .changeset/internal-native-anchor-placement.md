---
'@vyrnforge/web': patch
---

Consolidate repeated Popover, Tooltip and PreviewCard native CSS Anchor Positioning values into one private, component-consumed Web CSS recipe. Preserve each widget's defaults, placement vocabulary, RTL resolution, collision/fit fallbacks and interaction ownership; add Web browser placement regression coverage without a new public entrypoint or overlay runtime.
