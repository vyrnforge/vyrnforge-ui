# React Skeleton

## React setup

Import `Skeleton` from `@vyrnforge/react/skeleton`. CSS-aware browser bundlers load shared styles automatically; no Loading wrapper is required.

`shape` selects line, block or circle; `animation` selects wave, pulse or none. Standard div style and className support logical dimensions, radius and theme variables. The component forwards its ref and is decorative.

## React tokens

Use the typed `skeleton` token group. For app-wide configuration, pass the same group to `createTheme({ name: 'brand', tokens: ... })` from `@vyrnforge/react` and emit the stylesheet with `renderThemeCss`. For a local scope:

```tsx
import { ThemeScope, colors } from '@vyrnforge/react';
import { Skeleton } from '@vyrnforge/react/skeleton';

<ThemeScope tokens={{ skeleton: { color: colors.surfacePressed, highlight: colors.surfaceHover, duration: '1.6s' } }}>
  <Skeleton />
</ThemeScope>
```

Use ordinary CSS layout properties for geometry that belongs to the application. The canonical stylesheet provides the defaults; token overrides are optional. The Native Web guide documents CSS-level equivalents.
