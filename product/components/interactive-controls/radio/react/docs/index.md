# React Radio

## React setup

Import Radio from `@vyrnforge/react/radio`. Supported CSS-aware browser bundlers load its component styles automatically. The ref points to the native HTMLInputElement.

## Controlled and uncontrolled state

Pass `defaultChecked` for an initial uncontrolled option. For controlled selection, pass `checked={selected === optionValue}` and update the shared selected value in `onChange`. Use a unique shared name for each group (React useId is useful when composing repeated groups).

## Required and disabled states

Use native required and disabled attributes. Uncontrolled form reset restores initial checked states; controlled values must be reset by their owner. Use a named fieldset and associate descriptions/errors with the appropriate native controls.

## Sizes

Pass `size="sm"`, `size="md"` (default), or `size="lg"`. These are visual sizes, not the numeric native text-input size. Use `Flow` for label alignment and group orientation and `Text` for independent typography. Use a unique ID and `aria-describedby` to associate descriptive text. Native `aria-invalid`, `required`, and `disabled` remain available.
