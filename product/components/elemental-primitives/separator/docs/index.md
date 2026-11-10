# Separator

Separator is a small Layer 1 boundary primitive built on native `hr` semantics.

## Native baseline

Use a native `hr` element. Horizontal orientation is the default. A vertical separator additionally exposes `aria-orientation="vertical"` because ARIA separator orientation otherwise defaults to horizontal.

Separator owns only separator semantics, orientation, and its one-dimensional visual treatment. It does not own spacing, layout, dimensions beyond the boundary itself, focus, keyboard behavior, or interaction.

## Native Web

Load `@vyrnforge/web/styles/separator.css`, apply `data-vf-separator`, and set `data-vf-separator-orientation` to `horizontal` or `vertical`.

Elements consumers use this native HTML contract directly; no custom element is required.

## Accessibility

VyrnForge preserves native separator semantics and keeps the boundary perceivable in forced-colors mode. Consumers that intentionally need a purely decorative line may use the ordinary native `aria-hidden="true"` escape hatch.
