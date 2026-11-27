# React TextField

Compose native Input or Textarea with automatic label and description associations. The forwarded ref targets the editing element, not the wrapper.

## React setup

Supported CSS-aware browser bundlers deliver canonical Web styles through the public import.

```tsx
import { TextField } from '@vyrnforge/react/text-field';

<TextField
  label="Email address"
  name="email"
  type="email"
  autoComplete="email"
  description="Use an address you can access."
  required
  fullWidth
/>;
```

Supply multiline for textarea attributes, including rows, cols and optional autosize. The visual fieldSize is distinct from native numeric size. Native attributes, className and style target the editing element; use a surrounding theme scope to customize the entire field.

Use existing Button and Icon for interactive adornments with authored accessible names and type="button". For controlled clear actions, update the owner value and restore the input focus intentionally. Do not toggle password type on every keystroke or parse on each composition event. Existing specialized composites remain the preferred owners of query clearing, password visibility and numeric stepping.

## Floating label and variants

Use `labelPlacement="floating"` independently of `variant="outlined"`, `"filled"` or `"underlined"`. The default outside label remains supported. TextField owns the label and its relationship; use Input and Textarea only when composing a custom field or native mode. The native placeholder is a hint, not a substitute for a label.

## React tokens

Use the typed `textField` token group. For app-wide configuration, pass the same group to `createTheme({ name: 'brand', tokens: ... })` from `@vyrnforge/react` and emit the stylesheet with `renderThemeCss`. For a local scope:

```tsx
import { ThemeScope, tokens } from '@vyrnforge/react';
import { TextField } from '@vyrnforge/react/text-field';

<ThemeScope tokens={{ textField: { labelFont: '600 0.875rem/1.5 ' + tokens.fontFamily.sans, radius: '8px' } }}>
  <TextField label="Email" />
</ThemeScope>
```

Use ordinary CSS layout properties for geometry that belongs to the application. The canonical stylesheet provides the defaults; token overrides are optional. The Native Web guide documents CSS-level equivalents.
