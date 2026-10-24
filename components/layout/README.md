# L3 Composition Primitives

L3 owns composition, grouping, and structural relationships without becoming a behavioral widget layer. The public set contains ten concepts.

## Spatial composition

- **Container** constrains page or section content width, centers it, and applies logical inline gutters.
- **Stack** arranges related children in block flow with shared spacing, alignment, and justification.
- **Inline** arranges related children in one non-wrapping inline row.
- **Cluster** arranges related children in inline flow and wraps them when space runs out.
- **Grid** arranges repeated peers in equal flexible tracks that reflow intrinsically from available space.
- **AspectRatio** reserves a stable preset media/content ratio without replacing ordinary CSS sizing.

## Form composition

- **Field** groups a label/control/description relationship spatially without owning validation or value state.
- **Fieldset** preserves native fieldset/legend grouping where the port can author native HTML; Elements exposes the equivalent grouping contract without pretending a custom element is a native fieldset.
- **InputGroup** visually composes adjacent controls while leaving their native semantics and state independent.

## Control relationship

- **RadioGroup** groups related radios and their orientation without owning radio selection. React, Angular, and Vue use native fieldset semantics; Elements exposes the equivalent radiogroup relationship.

All ten use canonical CSS from `@vyrnforge/web`. Framework ports implement the same concept idiomatically and do not introduce a shared component runtime.

The public spacing scale is shared by Stack, Inline, Cluster, Grid, Container gutters, Field, Fieldset, and RadioGroup. Grid deliberately exposes only `gap`; consumers may customize `--vf-grid-min-item-size` and use ordinary CSS Grid for more specialized track systems.

L3 does not own routing, application state, permissions, validation engines, form state, radio selection controllers, or application-shell behavior. Those responsibilities remain with native browser behavior, later component layers, framework/application code, or a future shell layer as appropriate.
