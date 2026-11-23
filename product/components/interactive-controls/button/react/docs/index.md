# React Button

React Button preserves the shared Button semantics with idiomatic JSX. Its public props and host-ref types belong in the separate API reference.

## React setup

```tsx
import { Button } from '@vyrnforge/react/button';

<Button type="button">Save changes</Button>
```

Application code supplies the action handler; the Button itself remains a native HTML button.

## Button family examples

Each example sits beside the shared concept it demonstrates. Use the checked-in React TSX source under that explanation rather than treating the examples as an unrelated gallery.

React handlers such as `onClick` and controlled `pressed` state belong to the consuming application. For a joined command set, compose public `Button` children in `Flow` and apply `data-vf-button-group` to that parent; no ButtonGroup runtime is exported. For icon-only actions, compose public `Icon` inside `Button iconOnly` and provide an authored button name.

For persistent pressed commands import `ToggleButton` from `@vyrnforge/react/toggle-button`; use the separate ToggleGroup when choices must be coordinated.
