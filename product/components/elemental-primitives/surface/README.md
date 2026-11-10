# Surface

Surface provides VyrnForge's shared visual containment boundary without becoming a layout or style-prop primitive.

- Canonical paint lives in `@vyrnforge/web/styles/surface.css`.
- Native Web uses `data-vf-surface` on the semantic block element the application owns.
- React and Vue expose a thin `Surface` component with an explicit `as` element.
- Angular exposes `vfSurface` as a directive on the authored semantic element.
- Elements exposes the neutral `<vf-surface>` custom element with explicit registration.
- Surface owns themed background, foreground, border, and surface radius only.
- Surface does not own padding, sizing, layout, interaction, state, roles, or arbitrary style props.
