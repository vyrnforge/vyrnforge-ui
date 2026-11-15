---
"@vyrnforge/web": major
"@vyrnforge/react": major
"@vyrnforge/vue": major
"@vyrnforge/angular": major
"@vyrnforge/elements": major
---

Retire the transitional floating-positioning and dismissal-coordination Web entrypoints and the unused React/Vue floating-surface helpers after migration of their production consumers to native Popover and CSS Anchor Positioning. Placement props retain the same side/alignment values; migrate type imports from FloatingPlacement in @vyrnforge/web/floating-positioning to AnchorPlacement in @vyrnforge/web. No replacement overlay runtime is introduced.
