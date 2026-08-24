# Semantic Token Contract

The machine-readable source of truth is
`docs/metadata/design-tokens.json`; typed token and theme exports are owned by
`@vyrnforge/ui-core`.

## Purpose

Shared visual decisions belong to `@vyrnforge/ui-core` when they describe a
role reusable across components, the data grid, documentation, or consuming
applications. Components should not invent local values for shared surface,
text, interaction, status, density, typography, motion, or layering roles.

The contract is native-first, CSS-variable-based, dependency-minimal, and
store-agnostic.

## Ownership decision

| Decision                       | Owner                      | Prefix             | Examples                                |
| ------------------------------ | -------------------------- | ------------------ | --------------------------------------- |
| Shared semantic role           | `@vyrnforge/ui-core`       | `--vf-*`           | focus, surface, status, density, motion |
| Reusable component composition | `@vyrnforge/ui-components` | `vf-*`             | button layout, field structure          |
| Grid-only behavior             | `@vyrnforge/ui-data-grid`  | `--udg-*`, `udg-*` | grid row geometry, frozen columns       |
| Application presentation       | consuming application      | app prefix         | docs shell, product-specific branding   |

Component-local custom properties remain valid for measured geometry, dynamic
positions, or private composition. They are not a substitute for shared
semantic decisions.

## Contract categories

| Category    | Canonical roles                                                              |
| ----------- | ---------------------------------------------------------------------------- |
| Surface     | page, canvas, default, muted, overlay, sunken, scrim                         |
| Text        | primary, secondary, tertiary, inverse, disabled, link                        |
| Border      | subtle, default, emphasis, divider                                           |
| Interactive | primary, hover, active, selected, neutral, disabled, focus                   |
| Status      | success, warning, error, info, pending, neutral                              |
| Density     | compact, balanced, spacious sizing and active aliases                        |
| Typography  | display, page title, section title, label, body, caption, code, numeric      |
| Motion      | durations, easing, color/opacity/transform transitions                       |
| Layer       | base, raised, sticky, dropdown, popover, tooltip, scrim, modal, toast, debug |

See `../api/css-token-reference.md` for the complete token list.

## Compatibility bridge

Compatibility variables such as `--vf-bg`, `--vf-surface`, `--vf-text`,
`--vf-primary`, and status aliases remain supported bridges where declared by
the canonical contract. New component work must use canonical role names.

Shared components consume semantic roles directly. The data grid keeps
package-owned `--udg-*` roles for grid-specific semantics and geometry, with
defaults mapped to the shared contract. Compatibility aliases must not become a
second source of theme values.

## Themes

Light, dark, enterprise, and system themes expose the same semantic roles.

- Light values are the root defaults.
- Dark overrides preserve role meaning rather than component-specific colors.
- Enterprise is a light business-oriented variant with stronger hierarchy.
- System uses light defaults and applies the complete dark role set when the
  operating system requests dark color scheme.

Theme presets exported from TypeScript contain every theme-scoped semantic
token so JavaScript theme application cannot provide a partial contract.

## Density

Canonical density names are:

- `compact`
- `balanced`
- `spacious`

`standard` remains a compatibility alias of `balanced`; `comfortable`
remains a compatibility alias of `spacious`. Components and grid CSS accept
supported canonical and compatibility names according to their public contracts.

The active density contract controls control height and padding, icon size, row
height, component gap, and body type size. `--vf-hit-target-min` is the shared
minimum pointer-target policy token; components must still account for context,
adjacent target spacing, and accessibility.

## Typography

Named roles replace ad hoc combinations of font size, weight, line height, and
letter spacing. Shared utility classes are available as `vf-type-*`, while
package components may consume role variables directly. Numeric presentation
uses tabular numerals through `.vf-type-numeric`.

## Motion

No essential state change may depend on animation. Automatic
`prefers-reduced-motion: reduce` and explicit `data-motion="reduced"` /
`.vf-motion-reduced` modes shorten non-essential durations and use linear
easing while preserving state visibility.

## Layers

Layer values are unique and strictly increasing:

| Role     | Level |
| -------- | ----: |
| Base     |     0 |
| Raised   |    10 |
| Sticky   |    20 |
| Dropdown |    40 |
| Popover  |    50 |
| Tooltip  |    60 |
| Scrim    |    70 |
| Modal    |    80 |
| Toast    |    90 |
| Debug    |  9999 |

Compatibility z-index variables alias canonical levels. Dynamic overlay stack
offsets remain component-owned and must be added to the appropriate semantic
base layer.

## Package adoption boundary

- `@vyrnforge/ui-components` consumes canonical `--vf-*` roles for shared
  surfaces, text, borders, interaction, status, controls, typography, motion,
  focus, and layers.
- Component-local custom properties are limited to private geometry or dynamic
  state such as slider progress and measured overlay coordinates.
- `@vyrnforge/ui-data-grid` retains `--udg-*` only as grid-facing role and
  geometry contracts; their defaults map to canonical `--vf-*` roles.
- Light, dark, enterprise, and system grid themes inherit ui-core. Explicit
  package-specific themes remain narrow documented exceptions when the shared
  foundation does not yet own an equivalent contract.
- Typed data-grid presets derive from exported ui-core theme objects rather than
  duplicating theme color literals.

The historical `--udg-surface-ra-sm` spelling remains a compatibility alias
of `--udg-surface-raised`. New code must use the correctly named role.

## Verification

```bash
npm run test:design-tokens
npm run verify:design-tokens
npm run test:token-adoption
npm run verify:token-adoption
npm run test:browser -- tests/browser/semantic-tokens.spec.ts
npm run test:visual-regression
npm run verify:visual-regression
npm run test:visual
```

The verifiers reject missing categories, duplicate token names, incomplete theme
presets, broken compatibility bridges, invalid density aliases, invalid layer
order, missing reduced-motion fallbacks, hard-coded shared component colors,
duplicated grid theme maps, literal motion timings, and invalid grid-to-core
mappings.

Visual evidence is governed by
[Visual Regression Testing](../testing/visual-regression.md) and the canonical
`docs/metadata/visual-regression-matrix.json`.
