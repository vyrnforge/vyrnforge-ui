# React Layout

Flow and AutoGrid are lightweight React authoring components over the canonical Web layout recipes. Shared layout rules remain in the Layout guide; public prop types belong in the API reference.

## React installation and first use

```tsx
import { Flow, AutoGrid } from '@vyrnforge/react/layout';
```

The first checked-in example demonstrates default Flow spacing with a labeled form control. No layout provider is required.

## Native separators in JSX

Use `<hr />` directly when two sections are thematically distinct. Style the native rule through ordinary CSS and shared border tokens; it does not need `role="separator"`, a keyboard handler, or a VyrnForge wrapper. For a merely decorative divider, use the token-driven visual `Divider` from `@vyrnforge/react/divider` (or an application-owned logical border) without inventing separator semantics. The checked-in native thematic-break example demonstrates `<hr />`; the separate **Divider** guide provides actual horizontal and vertical visual lines.

The generic semantic React `Separator` component was retired. For visual-only lines, use `Divider`; do not import `@vyrnforge/react/separator`. For composition inside a real Menu or Toolbar, use `MenuSeparator` or `ToolbarSeparator` from the owning component's React entrypoint. These belong to those widgets, not to Layout.

## Semantic layout and accessibility

Use `as="nav"` with an accessible name for navigation groups, or `as="ul"` with native `li` children for lists. The `as` prop changes the semantic host, not the shared spacing algorithm. Keep `fieldset` and `legend` for named form groups; layout does not create form relationships or manage focus.

## React tokens

Use `AutoGrid minItemSize` for an individual layout. To change the default for multiple grids, use `createTheme({ name: 'brand', tokens: { autoGrid: { minItemSize: '18rem' } } })` from `@vyrnforge/react`, or the same group in `ThemeScope tokens`. Explicit instance props remain authoritative.
