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

Use `multiline` for a fixed-height native Textarea, or simply `autosize` for an expanding Textarea. Both accept native textarea attributes. `autosize` alone selects Textarea on the first render; content never switches the native element. Input-only `type` and `multiline={false}` are incompatible with `autosize`. Changing the configured editing mode replaces the native element; keep the mode stable during active editing. Controlled values belong to the consumer. The visual fieldSize is distinct from native numeric size. Native attributes, className and style target the editing element; use a surrounding theme scope to customize the entire field.

Use existing Button and Icon for interactive adornments with authored accessible names and type="button". For controlled clear actions, update the owner value and restore the input focus intentionally. Do not toggle password type on every keystroke or parse on each composition event. Existing specialized composites remain the preferred owners of query clearing, password visibility and numeric stepping.

## Floating label and variants

Use `labelPlacement="floating"` independently of `variant="outlined"`, `"filled"` or `"underlined"`. The default outside label remains supported. TextField owns the label and its relationship; use Input and Textarea only when composing a custom field or native mode. The native placeholder is a hint, not a substitute for a label.

## Auto-expanding fields

```tsx
import { TextField } from '@vyrnforge/react/text-field';

<TextField label="Message" name="message" autosize minRows={1} maxRows={6} fullWidth />
<TextField label="Notes" multiline rows={4} />
```

The first field starts as a one-row native textarea and expands in supporting browsers. Textarea owns growth, row limits, overflow and resize. Use the standalone Textarea for a custom surrounding composition with the same visual language; the TextField adds the label and optional adornments.
