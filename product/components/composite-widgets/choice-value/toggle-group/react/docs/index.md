# React ToggleGroup

## React setup

Import `ToggleGroupRoot` and `ToggleGroupItem` from `@vyrnforge/react/toggle-group`. Load the public `@vyrnforge/web/styles/toggle-group.css` stylesheet. Give the root an accessible name and each item a unique nonempty `value`.

## Selection state

Use `type="single"` (default) with a string value; the empty selection is an empty string. Use `type="multiple"` with an array of selected values. Pass `defaultValue` for uncontrolled selection or `value` and `onValueChange` for controlled selection.

## Icon-only items

Compose public Icon content inside ToggleGroupItem, apply the supported `data-vf-icon-only` marker, and supply an accessible name. There is no separate icon-only component.
