# React Badge

## React setup

Import Badge and load the shared style once.

```tsx
import { Badge } from '@vyrnforge/react/badge';
import '@vyrnforge/web/styles/badge.css';
```

The runnable React examples show text, counts, tones, sizes and named/decorative dots. The API reference lists the public types.

## React state and server rendering

Badge renders a stable span without browser globals, event state, effects, or automatic announcements. Consumers supply localized content and choose when to update it; parent components own any interaction. Do not use `aria-live` to turn a badge into a notification.
