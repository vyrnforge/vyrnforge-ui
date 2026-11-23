# React ToggleButton

## React setup

Import `ToggleButton` from `@vyrnforge/react/toggle-button`. Its host is a native `button` with `aria-pressed`; canonical CSS is `@vyrnforge/web/styles/toggle-button.css`.

## Controlled and uncontrolled state

Pass `pressed` and `onPressedChange` for controlled state or `defaultPressed` for uncontrolled initial state. A cancelled native click or disabled Button does not update pressed state. The default `type` is `button` so toggles do not submit forms inadvertently.

## Sizing and composition

Use `size="sm|md|lg"` independently of inherited density. Compose Icon content with an authored label for icon-only toggles. ToggleButton has no group-level selection or roving focus; use the existing ToggleGroup, SegmentedControl or Toolbar where their behavior is needed.
