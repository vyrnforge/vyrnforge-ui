---
'@vyrnforge/web': major
'@vyrnforge/react': major
'@vyrnforge/angular': major
'@vyrnforge/vue': major
'@vyrnforge/elements': major
---

Reduce Layer 3 composition to six responsibility-owned primitives: Stack, Inline, Cluster, AutoGrid, Container, and ControlGroup.

Breaking changes:

- Rename Grid to AutoGrid because the public contract is one intrinsic auto-fit/minmax layout, not arbitrary CSS Grid.
  - React/Vue: Grid / GridProps -> AutoGrid / AutoGridProps
  - Angular: VfGridDirective / vfGrid / vfGridGap -> VfAutoGridDirective / vfAutoGrid / vfAutoGridGap
  - Native Web: data-vf-grid / data-vf-grid-gap -> data-vf-auto-grid / data-vf-auto-grid-gap
  - CSS token: --vf-grid-min-item-size -> --vf-auto-grid-min-item-size
- Remove AspectRatio from L3. Use native CSS aspect-ratio.
- Remove Field from L3. Use semantic field relationships plus Stack for spacing; Forms & Submission Patterns owns field UX.
- Remove Fieldset from L3. Use native <fieldset>/<legend>.
- Remove RadioGroup from L3. Native radios retain grouping/selection/keyboard behavior through shared name; use native fieldset/legend plus Stack or Cluster for layout.
- Remove the @vyrnforge/elements/layout entrypoint and all L3 Custom Elements. Elements applications use semantic/native HTML plus @vyrnforge/web/styles/layout.css hooks instead of wrapper elements.
- React and Vue ControlGroup now accept the same semantic host selection model as the other structural primitives rather than forcing a div.

No ButtonGroup, Box/Flex alias family, form runtime, selection controller, or new shared runtime is introduced.
