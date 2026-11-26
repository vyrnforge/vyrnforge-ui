# React ToggleButton

## React setup

Import `ToggleButton` from `@vyrnforge/react/toggle-button`. Supported CSS-aware browser bundlers load its component styles automatically. The default `type` is `button`.

## Controlled and uncontrolled state

Use `defaultPressed` for an initial uncontrolled value. Pass `pressed` and `onPressedChange` for controlled state; update the owner value to accept the requested transition. A cancelled native click or disabled button does not change state.

## Sizing and composition

Use public Icon content inside ToggleButton. Pass `iconOnly` only when there is no visible text. ToggleButton has no group-level selection or roving focus.
