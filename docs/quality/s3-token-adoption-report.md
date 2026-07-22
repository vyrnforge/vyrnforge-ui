# S3 Semantic Token Adoption Report

## Scope

This report records VF-3009 (`@vyrnforge/ui-components`) and VF-3010
(`@vyrnforge/ui-data-grid`). It builds on the canonical token foundation from
VF-3001 through VF-3008.

## VF-3009 — shared component adoption

The component package now uses canonical semantic roles for:

- surfaces, text, borders, and dividers
- primary, neutral, selected, disabled, and focus interaction states
- success, warning, error, info, pending, and neutral feedback
- control geometry and density
- named typography hierarchy
- motion durations/easing and reduced-motion-compatible transitions
- shared overlay and sticky layer levels

Compatibility source variables remain in ui-core, not in component CSS. Private
component variables remain valid only for runtime geometry or local composition.

## VF-3010 — data-grid alignment

The grid keeps package-owned roles such as `--udg-row-bg`,
`--udg-header-height`, and `--udg-cell-padding-x`, but their defaults map to the
shared semantic contract. Repeated light, dark, enterprise, and system color
maps were removed from grid CSS.

Typed grid theme presets are generated from the ui-core preset objects. This
preserves current public exports while eliminating a second hard-coded theme
source. `--udg-surface-ra-sm` remains a compatibility alias.

The high-contrast grid theme is the only hard-coded package color exception. It
is documented and verified because ui-core does not yet expose a high-contrast
theme contract.

## Enforcement

```bash
npm run test:token-adoption
npm run verify:token-adoption
npm run test:browser -- tests/browser/semantic-tokens.spec.ts
```

The checks prove:

1. package CSS does not reference historical shared aliases;
2. component CSS contains no hard-coded colors or literal motion timing;
3. grid roles map to required semantic roles;
4. non-high-contrast grid themes inherit ui-core rather than duplicating maps;
5. typed grid presets derive from ui-core; and
6. representative components and the grid resolve the same roles in real light
   and dark browser contexts.

## Deferred

- VF-3011: broad visual regression coverage for theme and density combinations.
- VF-3012: final token documentation audit and G3 closure.
