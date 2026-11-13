# L3 Composition Primitives

L3 owns composition, grouping, and structural relationships without becoming a behavioral widget layer. The public inventory contains ten concepts, but they are not ten equivalent runtime-component classes.

## Core spatial composition

- **Stack** arranges related children in block flow with shared spacing, alignment, and justification.
- **Inline** arranges related children in one non-wrapping inline row.
- **Cluster** arranges related children in inline flow and wraps them when space runs out.
- **Grid** arranges repeated peers in equal flexible tracks that reflow intrinsically from available space.
- **Container** constrains page or section content width, centers it, and applies logical inline gutters.

These are reusable structural primitives. They remain semantic-neutral unless the consumer chooses a meaningful authored element.

## Layout utility

- **AspectRatio** reserves a stable preset media/content ratio without replacing ordinary CSS sizing.

AspectRatio is intentionally a small layout utility rather than a semantic grouping abstraction. Arbitrary ratios, object fitting, cropping, media behavior, and responsive art direction remain ordinary CSS or consumer composition.

## Form composition

- **Field** groups an authored label/control/description/message relationship spatially without owning IDs, validation, messages, values, or form state.
- **Fieldset** is a native-backed composition concept. Native Web and Elements applications use a real `<fieldset data-vf-fieldset>` with a real `<legend>`; React and Vue render a real `<fieldset>`; Angular decorates an authored real `<fieldset>`. VyrnForge does not provide a `vf-fieldset` custom element because `role="group"` cannot reproduce native fieldset/legend semantics or disabled propagation.

## Control composition

- **ControlGroup** visually joins adjacent independently operable controls in horizontal or vertical orientation while leaving their native semantics, state, value, disabled state, size, variant, validation, focus, activation, and form behavior independent. It does not add `role="group"` automatically. Internal seams use logical border-side suppression so adjacency does not assume a child border width and remains direction-safe.

Button-only adjacency is a valid ControlGroup composition and does **not** justify a separate ButtonGroup primitive. If buttons share selection state, managed arrow-key navigation, or another behavioral contract, use the semantic component that owns that behavior instead (for example RadioGroup, ToggleGroup, or Toolbar) rather than adding behavior to ControlGroup.

## Native control relationship

- **RadioGroup** is a native-backed relationship/layout concept for related native radios. Native Web and Elements applications use a real `<fieldset data-vf-radio-group>` with a real `<legend>`; React and Vue render a real `<fieldset>`; Angular decorates an authored real `<fieldset>`. Native radio inputs retain their shared `name`, checked state, focus, keyboard behavior, disabled/validation state, and form submission. VyrnForge does not provide a `vf-radio-group` custom element or a second radio-selection controller.

## Shared contracts and boundaries

All ten concepts use canonical CSS from `@vyrnforge/web`. Framework integrations implement the same concept idiomatically; catalog symmetry is not a reason to manufacture a Custom Element when native HTML already completes the semantic contract.

The public spacing scale is shared by Stack, Inline, Cluster, Grid, Container gutters, Field, Fieldset, and RadioGroup. Grid deliberately exposes only `gap`; canonical Web layout CSS owns the public Grid component token `--vf-grid-min-item-size` (a dimension with a `16rem` fallback), consumers may override it through the normal CSS cascade, and more specialized track systems remain ordinary CSS Grid.

Do not add generic Box/Flex/Row/Column/Wrap/Spacer/Center aliases merely to mirror another design system. A new L3 primitive requires a distinct reusable composition responsibility that cannot be expressed cleanly by an existing L3 concept plus semantic HTML and ordinary CSS.

L3 does not own routing, application state, permissions, validation engines, form state, radio selection controllers, toggle selection, toolbar navigation, or application-shell behavior. Those responsibilities remain with native browser behavior, later component layers, framework/application code, or an owning pattern.
