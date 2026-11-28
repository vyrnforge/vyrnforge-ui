# React Slider

## React setup

Import Slider from `@vyrnforge/react/slider`. Supported CSS-aware browser bundlers load canonical styles automatically. The forwarded ref remains HTMLInputElement.

## Sizes and orientation

Pass size="sm", "md" or "lg" and orientation="horizontal" or "vertical".

## Values and marks

Pass marks to show a bounded set of step ticks, or pass an array of { value, label } definitions. Marks do not change the native step. The enhanced track reads the actual DOM value after rendering and native input events; direct script writes to input.value need an input event or React render to refresh decoration. The stable presentation wrapper keeps the same native input when decorations are toggled.

## Value labels and descriptive tooltips

Pass tooltip to enable the built-in moving value tooltip. No TooltipRoot, TooltipTrigger or TooltipContent import is necessary.

```tsx
<Slider aria-label="Volume" defaultValue={50} tooltip />

<Slider
  aria-label="Volume"
  defaultValue={50}
  tooltip={{
    display: 'always',
    placement: 'top',
    size: 'sm',
    arrow: true,
    format: value => value + '%',
  }}
/>
```

Default is false. An options object defaults to auto visibility, sm size, no arrow, and the orientation-appropriate placement. Native viewport collision handling and the shared Tooltip arrow follow the moving thumb, even at the minimum or maximum. All twelve Tooltip placements are supported. The default thumb clearance is 0.75rem (12px at a 16px root), measured to the arrow tip or arrowless surface. Set tooltip.offset in the centralized theme to override it; a local ThemeScope can limit the override to the Slider. During dragging the tooltip remains visible even if the pointer leaves the track. The numeric surface is not an accessible description; formatted values use aria-valuetext unless an explicit value text is supplied.

Migration: valueLabelDisplay and formatValue remain accepted for existing consumers. Prefer tooltip={{ display: 'auto', format: value => value + '%' }} for new usage. An explicitly supplied tooltip option takes precedence over the legacy visibility option; a legacy formatter remains a fallback for accessible value text. For explanatory text, use the standalone Tooltip separately.

## Controlled and uncontrolled state

Use defaultValue or value plus onChange. Use event.currentTarget.valueAsNumber for numeric state. Coordinate a numeric input through application state. Controlled form reset remains the owner's responsibility.

## Disabled and invalid states

Use disabled, aria-invalid and aria-describedby when appropriate. Do not add required or readonly to a range input.

## Accessibility and styling

Use React's typed slider token group, rather than raw CSS names. Configure it once with createTheme from @vyrnforge/react, or use a local scope:

```tsx
import { ThemeScope, colors } from '@vyrnforge/react';
import { Slider } from '@vyrnforge/react/slider';

<ThemeScope tokens={{ slider: { trackSize: '6px', thumbSize: '18px', fillColor: colors.accent } }}>
  <Slider aria-label="Volume" defaultValue={50} />
</ThemeScope>
```

The typed Slider group also supports trackColor, thumbColor, valueLabelFont and markLabelFont. The numeric tooltip inherits the centralized tooltip group (background, foreground, radius, font, maxWidth, offset and arrowSize); the existing slider.valueLabelFont overrides that font only when explicitly configured. The native input still owns interaction and accessibility. Shared CSS provides defaults.
