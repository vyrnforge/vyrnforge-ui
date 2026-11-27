# React Tooltip

## React setup

Import TooltipRoot, TooltipTrigger and TooltipContent from `@vyrnforge/react/tooltip`. Browser bundlers load canonical CSS automatically. Compose a focusable public Button or another suitable native trigger. Keep its accessible name distinct from the supplemental description.

Use placement to select the preferred native anchor placement, openDelay and closeDelay for hover timing, and open/defaultOpen/onOpenChange for controlled or uncontrolled state. No extra wrapper or global overlay provider is needed.

## React tokens

Use the centralized typed Tooltip group rather than literal CSS variable keys. The six named roles are background, foreground, radius, font, maxWidth and offset. Defaults come from the shared Web stylesheet: inverse theme colors, control radius, regular small text, 16rem width cap and a small anchor clearance. Customize only the roles you need; the other roles inherit the shared defaults.

```tsx
import { createTheme, renderThemeCss, colors, tokens } from '@vyrnforge/react';

const brand = createTheme({
  name: 'brand-help',
  tokens: {
    tooltip: {
      background: colors.accent,
      foreground: colors.onAccent,
      radius: '8px',
      font: `400 ${tokens.fontSize.sm}/1.5 ${tokens.fontFamily.sans}`,
      maxWidth: '14rem',
      offset: '6px',
    },
  },
});

const css = renderThemeCss(brand);
```

Load the resulting stylesheet once and apply the theme name through ThemeScope. For a local override, pass tokens={{ tooltip: { radius: '8px' } }} to ThemeScope. For an instance-level style use tokenStyle from the same React package. Tooltip has no separate provider, per-component styling props, or alternate palette.

Keep sufficient contrast and preserve a short hover-transfer gap. Tooltip appearance remains separate from Slider's numeric value indicator; customize numeric typography using the slider valueLabelFont role.
