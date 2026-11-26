# React Backdrop

React renders one native decorative div using the shared Web CSS. It is not a substitute for the native modal Dialog.

## React setup

```tsx
import { Backdrop } from '@vyrnforge/react/backdrop';
import '@vyrnforge/web/styles/backdrop.css';

<div style={{ position: 'relative' }}>
  <div>Region content</div>
  <Backdrop hidden={!busy} />
</div>
```

Backdrop forwards its HTMLDivElement ref and accepts id, className, style and hidden. Content and interaction ownership stay with the parent. Use ordinary authored layout, the Loading pattern, and native inert when blocking is justified.
