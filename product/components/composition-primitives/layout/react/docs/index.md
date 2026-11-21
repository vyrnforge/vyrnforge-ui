# React Layout

Flow and AutoGrid are lightweight React authoring components over the canonical Web layout recipes. Shared layout rules remain in the Layout guide; public prop types belong in the API reference.

## React installation and first use

```tsx
import { Flow, AutoGrid } from '@vyrnforge/react/layout';
```

The first checked-in example demonstrates default Flow spacing with a labeled form control. No layout provider is required.

## Native separators in JSX

Use `<hr />` directly when two sections are thematically distinct. Style the native rule through ordinary CSS and shared border tokens; it does not need `role="separator"`, a keyboard handler, or a VyrnForge wrapper. For a merely decorative divider, apply a token-driven logical border to the owning element instead of inventing separator semantics. The checked-in **Native thematic break and visual divider** example shows both.

The generic React `Separator` component was retired. Do not import `@vyrnforge/react/separator`. For composition inside a real Menu or Toolbar, use `MenuSeparator` or `ToolbarSeparator` from the owning component's React entrypoint. These belong to those widgets, not to Layout.

## Semantic layout and accessibility

Use `as="nav"` with an accessible name for navigation groups, or `as="ul"` with native `li` children for lists. The `as` prop changes the semantic host, not the shared spacing algorithm. Keep `fieldset` and `legend` for named form groups; layout does not create form relationships or manage focus.
