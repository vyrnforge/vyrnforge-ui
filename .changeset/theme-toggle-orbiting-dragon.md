---
"@vyrnforge/web": patch
---

Simplify Theme Toggle to one scalable orbiting dragon geometry shared by light and dark states. The dragon and orb now translate and rotate together while their palettes transition, avoiding SVG path morphing while preserving native switch semantics, RTL behavior, reduced-motion handling, forced-colors support, and existing public data-hook compatibility.
