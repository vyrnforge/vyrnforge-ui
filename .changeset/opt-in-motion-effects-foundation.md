---
'@vyrnforge/web': minor
---

Add opt-in, framework-neutral fade, grow, slide, zoom, fade-slide, and pop entrance recipes to the existing public Web foundation stylesheet. Select with `data-vf-motion` and optional logical `data-vf-motion-direction`, reusing public timing/easing tokens and respecting reduced-motion preferences. Implementation is privately factored under `styles/motion.css`, with no new package entrypoint or generic component. Presence, exit, focus, and dismissal remain component-owned.
