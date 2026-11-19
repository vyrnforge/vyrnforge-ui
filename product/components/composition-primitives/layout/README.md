# Layout — canonical Web CSS composition recipes

The **shared layout foundation** remains two visual CSS recipes, **Flow** and **AutoGrid**. React additionally exposes lightweight typed authoring components for these same recipes: [#1422](https://github.com/vyrnforge/vyrnforge-ui/issues/1422) deliberately amends the prior CSS-only React decision [#1418](https://github.com/vyrnforge/vyrnforge-ui/issues/1418). Native HTML owns semantics and browser interaction; Web CSS owns all presentation.

Import `@vyrnforge/web/styles/layout.css` once from the consuming app. React apps additionally import `Flow` and `AutoGrid` from `@vyrnforge/react/layout` (or package root). The stylesheet is token-driven and works without the optional reset. Angular, Vue, Native Web and Elements apps may use the same CSS hooks on semantic hosts; React's API does not create a dependency for other ports.

## React quick start

```tsx
import { Flow, AutoGrid } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/layout.css';

<Flow as="section" gap="lg" aria-labelledby="summary-title">
  <h2 id="summary-title">Workspace summary</h2>
  <AutoGrid as="ul" gap="md" minItemSize="14rem">
    <li>Projects</li><li>Members</li><li>Activity</li>
  </AutoGrid>
  <Flow direction="inline" wrap="wrap" gap="sm">
    <button type="button">Save</button>
    <button type="button">Cancel</button>
  </Flow>
</Flow>
```

Both components accept `as` (native structural element, default `div`), native attributes, `style`, `className`, and a forwarded host ref. `Flow` accepts `direction`, `wrap`, `gap`, `align`, `justify`; `AutoGrid` accepts `gap` and `minItemSize` (a CSS length, default `16rem`). There are no focus/ARIA controllers, custom DOM wrappers, application state, or React CSS forks.

## Native Web Flow

A single shared flex recipe on authored semantic HTML:

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

An intrinsic equal repeated-item track recipe: `repeat(auto-fit, minmax(min(100%, var(--vf-auto-grid-min-item-size, 16rem)), 1fr))`. The public `--vf-auto-grid-min-item-size` defaults to 16rem; `data-vf-auto-grid-gap` has the same spacing vocabulary as Flow. React's `minItemSize` prop sets this same CSS variable on the host. Arbitrary grid templates, spans and breakpoints are ordinary application CSS.

```html
<ul data-vf-auto-grid data-vf-auto-grid-gap="md" style="--vf-auto-grid-min-item-size: 12rem">
  <li>First</li><li>Second</li>
</ul>
```

## Migration from the former six-concept layout API

| Retired API | Replacement |
| --- | --- |
| Old Stack / vfStack / data-vf-stack | React `Flow` (block default); other ports use a semantic host with `data-vf-flow` |
| Old Inline / vfInline / data-vf-inline | React `Flow direction="inline"` (nowrap); other ports use an inline Flow CSS hook |
| Old Cluster / vfCluster / data-vf-cluster | React `Flow direction="inline" wrap="wrap"`; other ports use an inline wrapped Flow CSS hook |
| Old AutoGrid wrappers/directive | React `AutoGrid` (new reduced API); other ports use the shared `data-vf-auto-grid` hook |
| Container / vfContainer / data-vf-container | Native semantic host + application max-inline-size, margin-inline:auto and padding-inline |
| ControlGroup / vfControlGroup / data-vf-control-group | Native independent controls; any justified joining belongs in a component/pattern CSS recipe. Keep native fieldset/legend when grouping is semantically required |
| Surface | Already retired; semantic HTML plus public surface tokens |

`@vyrnforge/react/layout` is the **only new framework component entrypoint** for this bounded React authoring use case. `@vyrnforge/web/layout`, `@vyrnforge/vue/layout`, `@vyrnforge/angular/layout` and Elements layout runtime remain absent. No Stack, Inline, Cluster, Container, ControlGroup, Surface, Box, Flex, Card, Row or Column alias is added. Historical implementations are provenance, not public compatibility promises.

## Correctness

Flow and AutoGrid introduce no ARIA roles, state, roving focus, validation or owned browser behavior. Responsive styling uses intrinsic behavior before component queries and true viewport policy. Preserve source/focus order in LTR and RTL; explicit gap tokens are not automatically density remapped. Required verification: CSS import/reset/layer boundaries, narrow width and text enlargement, nested theme and density, forced colors, focus, all consuming framework SSR, package exports and visual acceptance.
