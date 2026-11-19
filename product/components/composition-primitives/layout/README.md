# Layout — canonical Web CSS composition recipes

The approved layout inventory is **Flow** and **AutoGrid** as CSS recipes, not UI components or framework runtime abstractions. Decision and execution: [#1418](https://github.com/vyrnforge/vyrnforge-ui/issues/1418). Native semantic HTML owns roles, relationships, keyboard/focus behavior and form participation; Web CSS owns presentation.

Import `@vyrnforge/web/styles/layout.css` explicitly from a Native Web, React, Angular, Vue, or Elements-consuming application. The stylesheet is token-driven and works without the optional global reset.

## Flow

A single flex recipe. Authored semantic HTML, not a VyrnForge wrapper:

```html
<section data-vf-flow data-vf-flow-gap="lg">...</section>
<nav aria-label="Actions" data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" data-vf-flow-gap="sm">...</nav>
```

- `data-vf-flow` — activates flex flow; default direction block (column)
- `data-vf-flow-direction="block|inline"` — block default, inline row
- `data-vf-flow-wrap="nowrap|wrap"` — inline-only wrapping, nowrap default
- `data-vf-flow-gap` — none, xs, sm, md, lg, xl, 2xl, 3xl; md default
- `data-vf-flow-align` — start, center, end, stretch, baseline; stretch block default, center inline default
- `data-vf-flow-justify` — start, center, end, space-between; start default

## AutoGrid

An intrinsic equal repeated-item track recipe: `repeat(auto-fit, minmax(min(100%, var(--vf-auto-grid-min-item-size, 16rem)), 1fr))`. The public `--vf-auto-grid-min-item-size` defaults to 16rem; `data-vf-auto-grid-gap` has the same spacing vocabulary as Flow. Arbitrary grid templates, spans and breakpoints are ordinary application CSS.

```html
<ul data-vf-auto-grid data-vf-auto-grid-gap="md" style="--vf-auto-grid-min-item-size: 12rem">
  <li>First</li><li>Second</li>
</ul>
```

## Migration from the former six-concept layout API

| Retired API | Replacement |
| --- | --- |
| React/Vue Stack, Angular vfStack, Web data-vf-stack | Native semantic host + block Flow |
| Inline / vfInline / data-vf-inline | Native semantic host + inline Flow (nowrap) |
| Cluster / vfCluster / data-vf-cluster | Native semantic host + inline Flow with wrap |
| React/Vue AutoGrid, Angular vfAutoGrid | Native semantic host + unchanged data-vf-auto-grid |
| Container / vfContainer / data-vf-container | Native semantic host + application max-inline-size, margin-inline:auto and padding-inline |
| ControlGroup / vfControlGroup / data-vf-control-group | Native independent controls; any justified joining belongs in a component/pattern CSS recipe. Keep native fieldset/legend when grouping is semantically required |
| Surface | Already retired; semantic HTML plus public surface tokens |

No runtime `@vyrnforge/web/layout`, `@vyrnforge/react/layout`, `@vyrnforge/vue/layout`, `@vyrnforge/angular/layout` or Elements layout entrypoint remains. No Box, Flex, Card, Row or Column alias is added. Historical component and change records are provenance only.

## Correctness

Flow and AutoGrid introduce no ARIA roles, state, roving focus, validation or owned browser behavior. Responsive styling uses intrinsic behavior before component queries and true viewport policy. Preserve source/focus order in LTR and RTL; explicit gap tokens are not automatically density remapped. Required verification: CSS import/reset/layer boundaries, narrow width and text enlargement, nested theme and density, forced colors, focus, all consuming framework SSR, package exports and visual acceptance.
