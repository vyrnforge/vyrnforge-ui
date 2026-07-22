# CSS Token Reference

VyrnForge UI uses CSS custom properties as the public styling contract.

- Shared semantic roles use `--vf-*` and are owned by `@vyrnforge/ui-core`.
- Grid-only roles use `--udg-*` and are owned by
  `@vyrnforge/ui-data-grid`.
- Component classes use `vf-*`; grid classes use `udg-*`.

The machine-readable canonical inventory is
`docs/metadata/design-tokens.json`. The typed JavaScript inventory is exported
from `@vyrnforge/ui-core`.

## Semantic surfaces

| Token                  | Purpose                                        |
| ---------------------- | ---------------------------------------------- |
| `--vf-surface-page`    | Application/page background.                   |
| `--vf-surface-canvas`  | Secondary canvas or workspace background.      |
| `--vf-surface-default` | Default component surface.                     |
| `--vf-surface-muted`   | Muted or disabled surface.                     |
| `--vf-surface-overlay` | Menus, popovers, dialogs, and raised overlays. |
| `--vf-surface-sunken`  | Inset or recessed region.                      |
| `--vf-surface-scrim`   | Modal backdrop/scrim.                          |

## Text and borders

| Token                  | Purpose                              |
| ---------------------- | ------------------------------------ |
| `--vf-text-primary`    | Default high-emphasis text.          |
| `--vf-text-secondary`  | Supporting text.                     |
| `--vf-text-tertiary`   | Low-emphasis metadata.               |
| `--vf-text-inverse`    | Text on strong/inverse backgrounds.  |
| `--vf-text-disabled`   | Disabled text.                       |
| `--vf-text-link`       | Link text.                           |
| `--vf-text-link-hover` | Hovered link text.                   |
| `--vf-border-subtle`   | Low-emphasis boundary.               |
| `--vf-border-default`  | Standard control/component boundary. |
| `--vf-border-emphasis` | Strong boundary or hover emphasis.   |
| `--vf-divider`         | Section/list divider.                |

## Interactive and focus roles

| Token family                  | Purpose                                                |
| ----------------------------- | ------------------------------------------------------ |
| `--vf-interactive-primary*`   | Primary default, hover, active, and text roles.        |
| `--vf-interactive-selected-*` | Selected background, border, and text.                 |
| `--vf-interactive-neutral-*`  | Neutral hover and active feedback.                     |
| `--vf-control-background*`    | Default, hover, active, and disabled control surfaces. |
| `--vf-control-border*`        | Default, hover, and disabled control borders.          |
| `--vf-control-disabled-text`  | Disabled control content.                              |
| `--vf-focus-color`            | Visible focus color.                                   |
| `--vf-focus-width`            | Focus outline width.                                   |
| `--vf-focus-offset`           | Focus outline offset.                                  |
| `--vf-focus-shadow`           | Optional focus halo.                                   |

Focus must remain visible in light, dark, and enterprise themes. Do not replace
focus with a color-only state.

## Status and feedback roles

Each status provides text, background, border, and indicator variants:

```text
--vf-status-{role}-text
--vf-status-{role}-background
--vf-status-{role}-border
--vf-status-{role}-indicator
```

Supported roles:

- `success`
- `warning`
- `error`
- `info`
- `pending`
- `neutral`

Status components must also provide text, iconography, shape, or another
non-color cue.

## Density and control sizing

Fixed scale tokens:

- `--vf-control-height-sm|md|lg`
- `--vf-control-padding-x-sm|md|lg`
- `--vf-control-padding-y-sm|md|lg`
- `--vf-icon-size-sm|md|lg`
- `--vf-row-height-sm|md|lg`
- `--vf-hit-target-min`

Active density aliases:

- `--vf-control-height`
- `--vf-control-padding-x`
- `--vf-control-padding-y`
- `--vf-icon-size`
- `--vf-row-height`
- `--vf-component-gap`

Canonical density selectors are `compact`, `balanced`, and `spacious`.
`standard` aliases `balanced`; `comfortable` aliases `spacious`.

## Typography roles

Every role exposes `font-family`, `font-size`, `font-weight`, `line-height`,
and `letter-spacing` tokens:

```text
--vf-type-{role}-{property}
```

Supported roles:

- `display`
- `page-title`
- `section-title`
- `label`
- `body`
- `caption`
- `code`
- `numeric`

Matching utility classes are available as `.vf-type-{role}`.

## Motion

| Token                              | Purpose                                |
| ---------------------------------- | -------------------------------------- |
| `--vf-motion-duration-instant`     | Immediate state updates.               |
| `--vf-motion-duration-fast`        | Small color or control feedback.       |
| `--vf-motion-duration-standard`    | Standard visibility/position change.   |
| `--vf-motion-duration-slow`        | Larger contextual transition.          |
| `--vf-motion-duration-deliberate`  | Rare deliberate transition.            |
| `--vf-motion-easing-standard`      | Standard motion easing.                |
| `--vf-motion-easing-enter`         | Entrance easing.                       |
| `--vf-motion-easing-exit`          | Exit easing.                           |
| `--vf-motion-easing-emphasized`    | Emphasized but non-essential motion.   |
| `--vf-motion-transition-color`     | Shared color/border/shadow transition. |
| `--vf-motion-transition-opacity`   | Shared opacity transition.             |
| `--vf-motion-transition-transform` | Shared transform transition.           |

`prefers-reduced-motion: reduce`, `[data-motion="reduced"]`, and
`.vf-motion-reduced` shorten non-essential durations and use linear easing.

## Layering

| Token                 | Level | Intended use                                     |
| --------------------- | ----: | ------------------------------------------------ |
| `--vf-layer-base`     |     0 | Normal document flow.                            |
| `--vf-layer-raised`   |    10 | Raised cards and local elevation.                |
| `--vf-layer-sticky`   |    20 | Sticky headers/columns.                          |
| `--vf-layer-dropdown` |    40 | Dropdown content.                                |
| `--vf-layer-popover`  |    50 | Popovers and menus requiring stronger elevation. |
| `--vf-layer-tooltip`  |    60 | Tooltips.                                        |
| `--vf-layer-scrim`    |    70 | Modal backdrop.                                  |
| `--vf-layer-modal`    |    80 | Dialogs and modal drawers.                       |
| `--vf-layer-toast`    |    90 | Toast viewport.                                  |
| `--vf-layer-debug`    |  9999 | Development/debug overlays only.                 |

Historical `--vf-z-*` tokens remain aliases during migration.

## Compatibility sources

Existing app overrides using `--vf-bg`, `--vf-surface`, `--vf-text`,
`--vf-primary`, status aliases, and `--vf-focus-ring` continue to feed the new
semantic roles. New work should prefer canonical names.

## App override

```css
.my-app {
  --vf-interactive-primary: #003b71;
  --vf-interactive-primary-hover: #002f5b;
  --vf-focus-color: #005ea8;
  --vf-radius-md: 10px;
}
```

During the compatibility period, apps with old component versions may also
retain their existing `--vf-primary*` overrides.

## Grid override

```css
.my-app .udg {
  --udg-row-height: 42px;
  --udg-header-bg: var(--vf-surface-canvas);
}
```

Use `--udg-*` only for decisions that are genuinely grid-specific.

## Package consumption rules

`@vyrnforge/ui-components` consumes canonical `--vf-*` roles directly.
`@vyrnforge/ui-data-grid` exposes grid-facing `--udg-*` roles that map to these
shared roles by default. Override canonical tokens when an application-wide
decision should change; override a `--udg-*` role only for a grid-specific
exception.

```css
.my-app {
  --vf-interactive-primary: #003b71;
  --vf-focus-color: #005ea8;
}

.my-app .udg {
  --udg-row-height: 40px;
}
```

Do not introduce new package CSS references to historical aliases such as
`--vf-primary`, `--vf-text`, or `--vf-surface`. These remain compatibility
sources for consuming applications only.
