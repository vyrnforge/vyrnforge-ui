# React Button

React Button preserves the shared Button semantics with idiomatic JSX. Its public props and host-ref types belong in the separate API reference.

## React setup

```tsx
import { Button } from '@vyrnforge/react/button';

<Button type="button">Save changes</Button>
```

Application code supplies the action handler; the Button itself remains a native HTML button.

## Button family examples

The React guide includes live patterns for Flow-separated actions, joined and vertically joined Button groups, independent ToggleButton states, named icon-only/icon-with-text Buttons, busy/disabled states, and comfortable/compact density. ButtonGroup is a native grouping **style recipe**, not a React runtime component. Use `<Flow role="group" aria-label="..." direction="inline" gap="none" data-vf-button-group="">` with direct Button children.

For icon-only actions, pass `iconOnly` to the existing `Button`, compose `Icon` as its child, supply a stable `aria-label` or `aria-labelledby`, and explicitly choose the appropriate emphasis (usually `variant="ghost"`). The shared Button CSS renders a square target without introducing IconButton or a separate icon-slot API. Text-and-icon Buttons omit `iconOnly`.

Import a standalone pressed ToggleButton from `@vyrnforge/react/toggle-button`. For coordinated choices use the distinct ToggleGroup composite widget.
