---
'@vyrnforge/web': major
'@vyrnforge/react': major
'@vyrnforge/angular': major
'@vyrnforge/vue': major
---

Clear the inherited Layer 1 candidate inventory and retire standalone Separator, ColorSwatch, and VisuallyHidden component surfaces.

Removed generic Separator surfaces:
- `@vyrnforge/web/styles/separator.css`
- `@vyrnforge/react/separator`
- `@vyrnforge/angular/separator`
- `@vyrnforge/vue/separator`
- generic `data-vf-separator*` / `vfSeparator` APIs

Migration: use native `<hr>` for thematic breaks, ordinary CSS for decorative division, and context-owned parts such as MenuSeparator or ToolbarSeparator where those component contracts require separator semantics.

Removed standalone ColorSwatch:
- `@vyrnforge/web/styles/color-swatch.css`
- generic `data-vf-color-swatch`

Migration: use the owning component's swatch part (for example ColorPickerSwatch) or consumer-authored presentation.

Reclassified VisuallyHidden as an accessibility-foundation utility. The public `data-vf-visually-hidden` hook remains in `@vyrnforge/web/styles/foundation.css`, but the redundant `@vyrnforge/web/styles/visually-hidden.css` entrypoint and React/Angular/Vue VisuallyHidden wrappers are removed.

Migration: apply `data-vf-visually-hidden` to the semantically appropriate native element while loading the foundation stylesheet.
