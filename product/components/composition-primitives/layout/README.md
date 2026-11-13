# L3 Composition Primitives

L3 owns composition, grouping, and structural relationships without becoming a behavioral widget layer. The public set contains ten concepts.

## Spatial composition

- **Container** constrains page or section content width, centers it, and applies logical inline gutters.
- **Stack** arranges related children in block flow with shared spacing, alignment, and justification.
- **Inline** arranges related children in one non-wrapping inline row.
- **Cluster** arranges related children in inline flow and wraps them when space runs out.
- **Grid** arranges repeated peers in equal flexible tracks that reflow intrinsically from available space.
- **AspectRatio** reserves a stable preset media/content ratio without replacing ordinary CSS sizing.

## Form and control composition

- **Field** groups a label/control/description relationship spatially without owning validation or value state.
- **Fieldset** preserves native fieldset/legend grouping where the port can author native HTML; Elements exposes `role="group"` only as an equivalent grouping contract and does not pretend a custom element is a native fieldset. Elements consumers provide the group name explicitly with `aria-label` or `aria-labelledby`; a child that looks like a legend does not acquire native `<legend>` semantics.
- **ControlGroup** visually joins adjacent independently operable controls in horizontal or vertical orientation while leaving their native semantics, state, value, disabled state, size, and variant independent. It does not add `role="group"` automatically; consumers add semantic grouping and an accessible name only when the task requires them. Internal seams are collapsed with logical border-side suppression on later eligible children, not a fixed negative overlap, so adjacency does not assume a particular child border width and remains direction-safe.

## Control relationship

- **RadioGroup** groups related radios and their orientation without owning radio selection. React, Angular, and Vue use native `<fieldset>` / `<legend>` semantics; Elements exposes `role="radiogroup"` plus `aria-orientation` and requires an authored accessible name. In every port, native radio inputs retain their own shared `name`, checked state, focus, keyboard behavior, and form submission.

All ten use canonical CSS from `@vyrnforge/web`. Framework ports implement the same concept idiomatically and do not introduce a shared component runtime.

The public spacing scale is shared by Stack, Inline, Cluster, Grid, Container gutters, Field, Fieldset, and RadioGroup. Grid deliberately exposes only `gap`; canonical Web layout CSS owns the public Grid component token `--vf-grid-min-item-size` (a dimension with a `16rem` fallback), consumers may override it through the normal CSS cascade, and more specialized track systems remain ordinary CSS Grid.

L3 does not own routing, application state, permissions, validation engines, form state, radio selection controllers, or application-shell behavior. Those responsibilities remain with native browser behavior, later component layers, framework/application code, or a future shell layer as appropriate.
