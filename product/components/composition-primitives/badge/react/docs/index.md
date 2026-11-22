# React Badge

## React setup

Import Badge and load its shared styling once.

```tsx
import { Badge } from '@vyrnforge/react/badge';
import '@vyrnforge/web/styles/badge.css';
```

The live examples cover anchored counts, dots, positioning/overlap, tones, maximum values, hidden zero and explicit visibility. See the separate API page for the source-backed types.

## React state and server rendering

Badge renders a stable, server-safe wrapper with its original child and a separate hidden-from-assistive-technology indicator; it has no state machine, browser globals or live announcements. Updates to `badgeContent`, `showZero`, `invisible`, `anchorOrigin` or `overlap` follow ordinary React rendering. The wrapped child owns native focus and interactions; supply its accessible name from the consumer's actual count or state.
