# React Checkbox

## React setup

Import Checkbox from `@vyrnforge/react/checkbox` and load `@vyrnforge/web/styles/checkbox.css`. The forwarded ref points to the actual HTMLInputElement. Use native `name`, `value`, `id`, `required`, `disabled`, and accessible labeling attributes.

## Controlled and uncontrolled state

Use `defaultChecked` for uncontrolled state or `checked` with `onChange` for controlled state. Read `event.currentTarget.checked`. Do not switch between controlled and uncontrolled ownership.

## Indeterminate state

Pass the independent boolean `indeterminate` prop. React synchronizes the real DOM property after mount and activation. It is not an HTML attribute and cannot be serialized as a native mixed state before hydration. Keep the owner value synchronized with the selected items.

## Required and disabled states

A native form performs constraint validation and reset for uncontrolled checked values. Reset controlled state explicitly in the application. Associate error text with `aria-describedby` and use `aria-invalid` for application-owned validation.
