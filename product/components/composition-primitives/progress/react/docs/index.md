# React Progress

## React setup

Import `Progress` from `@vyrnforge/react/progress`. CSS-aware browser bundlers load shared styles automatically; no Loading wrapper is required.

`value` and `max` retain native progress semantics. Omit value for indeterminate progress. Standard native progress attributes, style, className and ref are supported. Provide an accessible name.

## React tokens

Use the typed `progress` token group. For app-wide configuration, pass the same group to `createTheme({ name: 'brand', tokens: ... })` from `@vyrnforge/react` and emit the stylesheet with `renderThemeCss`. For a local scope:

```tsx
import { ThemeScope, colors } from '@vyrnforge/react';
import { Progress } from '@vyrnforge/react/progress';

<ThemeScope tokens={{ progress: { size: '8px', color: colors.accent, trackColor: colors.border } }}>
  <Progress aria-label="Upload" value={48} max={100} />
</ThemeScope>
```

Use ordinary CSS layout properties for geometry that belongs to the application. The canonical stylesheet provides the defaults; token overrides are optional. The Native Web guide documents CSS-level equivalents.
