# Surface

Surface is the Layer 1 visual containment primitive. It supplies themed surface paint without becoming a layout primitive, semantic wrapper, or style-prop runtime.

## Native baseline

Use the semantic native block element that already matches the content, then apply Surface presentation. Surface adds no role, landmark meaning, focus behavior, interaction, state, or ARIA.

Surface owns the shared background, foreground, one-pixel semantic boundary, surface radius, and stable root hook. It adds no default padding, margin, gap, sizing, positioning, flex, grid, elevation, or arbitrary style API.

## Native Web

Load `@vyrnforge/web/styles/surface.css` and apply `data-vf-surface` directly to the authored native element.

Elements consumers use this same Native Web contract. A dedicated `vf-surface` custom element is intentionally not part of the current L1 API because it adds no reusable behavior or semantics.

## Accessibility

Consumers choose the semantic element according to content. The visible boundary remains token-driven and is preserved in forced-colors mode. Surface presentation must not be treated as programmatic grouping semantics.
