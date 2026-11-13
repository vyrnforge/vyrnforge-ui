# Layer 3 — Composition primitive source ownership

The `layout` product unit is the aggregate package projection for six accepted Layer 3 composition primitives:

- Stack
- Inline
- Cluster
- AutoGrid
- Container
- ControlGroup

It is an aggregate distribution surface, not evidence that every layout-related noun belongs in L3.

The retired concepts have explicit owners:

- AspectRatio → ordinary CSS `aspect-ratio`;
- Field → Forms composition recipe using semantic relationships plus Stack until a stronger component contract is proven;
- Fieldset → native `fieldset/legend`;
- RadioGroup → native radio grouping + native fieldset/legend + Stack/Cluster layout.

The public `Grid` name is retired in favor of `AutoGrid` because the implementation owns one intrinsic `auto-fit/minmax` algorithm rather than arbitrary CSS Grid.

React and Vue may render a chosen semantic host; Angular decorates the authored host. Elements applications use native HTML plus `@vyrnforge/web/styles/layout.css`; there is no `@vyrnforge/elements/layout` runtime surface.

The current Product Graph can project one product-unit ID to one stable component subpath. Splitting the six concepts into separate authoring units while keeping a single public `/layout` subpath would require new projection machinery solely for repository organization, so this revision deliberately keeps the aggregate `layout` owner rather than inventing a special-case runtime/tooling abstraction. The semantic responsibilities remain independently documented and tested.
