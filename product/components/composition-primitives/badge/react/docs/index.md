# React Badge

## React setup

Import Badge and load its shared styling once.

```tsx
import { Badge } from '@vyrnforge/react/badge';
import '@vyrnforge/web/styles/badge.css';
```

The live examples cover anchored counts, dots, positioning/overlap, tones, maximum values, hidden zero and explicit visibility. See the separate API page for the source-backed types.

## Composition with existing VyrnForge components

Badge is an indicator wrapper, **not** a substitute for the element it decorates. React examples use existing `Button`, `Avatar`, `Icon`, `Text` and `Flow` public APIs with their own shared styles, never hand-styled replacement buttons, identity spans or layout rows. Use any other existing supported VyrnForge component for its respective responsibility. If the needed component is not yet implemented for React, record that gap instead of inventing a component or claiming it exists; native elements are appropriate only where the library has no corresponding supported component or when verifying native semantics.

## React state and server rendering

Badge renders a stable, server-safe wrapper with its original child and a separate hidden-from-assistive-technology indicator; it has no state machine, browser globals or live announcements. Updates to `badgeContent`, `showZero`, `invisible`, `anchorOrigin` or `overlap` follow ordinary React rendering. The wrapped child owns native focus and interactions; supply its accessible name from the consumer's actual count or state.
