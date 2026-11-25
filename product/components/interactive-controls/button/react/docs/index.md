# React Button

React Button preserves the shared Button semantics with idiomatic JSX. Its public props and host-ref types belong in the separate API reference.

## React setup

```tsx
import { Button } from '@vyrnforge/react/button';

<Button type="button">Save changes</Button>
```

Application code supplies the action handler; the Button itself remains a native HTML button.

## Icon actions

Compose the public `Icon` inside `Button iconOnly` and provide an authored accessible name. Use ordinary Button padding when an icon accompanies visible text. Application code owns action handlers and asynchronous work.
