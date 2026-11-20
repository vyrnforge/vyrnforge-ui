# React Kbd

React Kbd displays a keyboard key name inside native `kbd`; it does not register shortcuts or handle key events.

## React setup

```tsx
import { Kbd } from '@vyrnforge/react/kbd';

<p>Press <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> to search.</p>
```

Application code owns the actual search shortcut and its discoverable non-shortcut alternative. Shared Kbd guidance covers semantics, accessibility and localization; React overview covers common styling and server-rendering setup.
