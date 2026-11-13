---
'@vyrnforge/web': major
'@vyrnforge/react': major
'@vyrnforge/angular': major
'@vyrnforge/vue': major
'@vyrnforge/elements': major
---

Retire the public Surface abstraction after Layer 1 review determined that visual containment does not justify an independent component contract.

Removed public surfaces:

- `@vyrnforge/web/styles/surface.css` and `data-vf-surface`
- `@vyrnforge/react/surface` and the root `Surface` export
- `@vyrnforge/angular/surface` / `vfSurface`
- `@vyrnforge/vue/surface` and the root `Surface` export
- `@vyrnforge/elements/surface` / `vf-surface`

Migration: keep the native semantic element that owns the content, use VyrnForge Layer 3 composition primitives only for arrangement, and apply component- or application-owned CSS for visual containment using shared foundation tokens such as `--vf-color-surface`, `--vf-color-text`, `--vf-color-border-required`, and `--vf-radius-surface`. There is no replacement Surface component.
