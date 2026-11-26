# React Avatar

## React setup

Import Avatar and AvatarGroup from the React package. Supported CSS-aware browser bundlers load their component styles automatically.

```tsx
import { Avatar, AvatarGroup } from '@vyrnforge/react/avatar';
```

For icon avatars, use the public `Icon` component. The runnable React examples below demonstrate image, letter and icon content, shape, fallback and group composition without repeating the showcase in this setup.

## React state and server rendering

Avatar and AvatarGroup support server rendering and hydration without accessing browser globals during render. React reconciles images that fail before or after hydration, preserving the authored accessible name while switching to letters or the supplied icon. Updating `src` or responsive image candidates permits a retry. Changes to `limit` or `total` update only the rendered members and the +N remainder. Fetching identities, authorization, hidden-member navigation and interactive expansion remain application responsibilities.
