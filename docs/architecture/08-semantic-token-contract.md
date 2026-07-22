# Semantic Token Contract

This document is the human-readable contract for S3 tasks VF-3001 through
VF-3008. The machine-readable source is
`docs/metadata/design-tokens.json`; the typed package export is
`packages/ui-core/src/theme/tokenContract.ts`.

## Purpose

Shared visual decisions belong to `@vyrnforge/ui-core` when they describe a
role that can be reused across components, the data grid, documentation, or
consuming applications. Components should not invent local values for shared
surface, text, interaction, status, density, typography, motion, or layering
roles.

The contract remains native-first, CSS-variable-based, dependency-minimal, and
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

The historical tokens such as `--vf-bg`, `--vf-surface`, `--vf-text`,
`--vf-primary`, and status aliases remain compatibility sources during the S3
migration. Canonical roles read from them, so existing app overrides continue
to influence new semantic tokens.

New component work should use the canonical role names. VF-3009 and VF-3010
will migrate component and grid CSS. Compatibility sources are not removed in
S3.

## Themes

Light, dark, enterprise, and system themes expose the same semantic roles.

- Light values are the root defaults.
- Dark overrides preserve role meaning rather than component-specific colors.
- Enterprise is a light business-oriented variant with stronger hierarchy.
- System uses light defaults and applies the complete dark role set when the
  operating system requests dark color scheme.

Theme presets exported from TypeScript contain every theme-scoped semantic
token. This prevents JavaScript theme application from providing a partial
contract.

## Density

Canonical density names are:

- `compact`
- `balanced`
- `spacious`

`standard` remains an alias of `balanced`; `comfortable` remains an alias of
`spacious`. These aliases preserve current component and grid APIs until their
migration tasks are complete.

The active density contract controls:

- control height and padding
- icon size
- row height
- component gap
- body type size

`--vf-hit-target-min` is the minimum pointer target policy token. Components
must still consider context, adjacent target spacing, and accessibility.

## Typography

Named roles replace ad hoc combinations of font size, weight, line height, and
letter spacing. Shared utility classes are available as `vf-type-*`, but
package components may also consume the role variables directly.

Numeric presentation uses tabular numerals through `.vf-type-numeric`.

## Motion

No essential state change may depend on animation. Automatic
`prefers-reduced-motion: reduce` and explicit `data-motion="reduced"` /
`.vf-motion-reduced` modes shorten non-essential durations to `1ms` and use
linear easing while preserving state visibility.

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

Historical `--vf-z-*` variables alias these canonical levels. Dynamic overlay
stack offsets remain component-owned and must be added to the appropriate
semantic base layer.

## Verification

```bash
npm run test:design-tokens
npm run verify:design-tokens
npm run test:browser -- tests/browser/semantic-tokens.spec.ts
```

The verifier rejects missing categories, duplicate token names, incomplete
theme presets, broken compatibility bridges, missing density aliases, invalid
layer order, and missing reduced-motion fallbacks.
