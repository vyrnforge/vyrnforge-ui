# React Backdrop

React renders one native decorative div using the shared Web CSS. It is not a substitute for the native modal Dialog.

## React setup

Supported CSS-aware browser bundlers load the component styles automatically.

```tsx
import { Backdrop } from '@vyrnforge/react/backdrop';

<div style={{ position: 'relative' }}>
  <div>Region content</div>
  <Backdrop hidden={!busy} />
</div>
```

Backdrop forwards its HTMLDivElement ref and accepts id, className, style and hidden. Content and interaction ownership stay with the parent. Use ordinary authored layout, the Loading pattern, and native inert when blocking is justified.

## React tokens

Use the typed `backdrop` token group. For app-wide configuration, pass the same group to `createTheme({ name: 'brand', tokens: ... })` from `@vyrnforge/react` and emit the stylesheet with `renderThemeCss`. For a local scope:

```tsx
import { ThemeScope } from '@vyrnforge/react';
import { Backdrop } from '@vyrnforge/react/backdrop';

<ThemeScope tokens={{ backdrop: { color: 'rgb(0 0 0 / 40%)' } }}>
  <Backdrop />
</ThemeScope>
```

Use ordinary CSS layout properties for geometry that belongs to the application. The canonical stylesheet provides the defaults; token overrides are optional. The Native Web guide documents CSS-level equivalents.
