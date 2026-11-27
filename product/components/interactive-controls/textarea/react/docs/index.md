# React Textarea

The React adapter forwards the native ref and supports the native attributes.

## React setup

Supported CSS-aware browser bundlers automatically load canonical styles through the public import.

```tsx
import { Textarea } from '@vyrnforge/react/textarea';

<><label htmlFor="notes">Notes</label><Textarea id="notes" name="notes" rows={4} maxLength={160} /></>
```

For a composite field with associated label, description, error and optional artwork, see TextField. For SSR, include the extracted client stylesheet in the rendered HTML.

## Choosing a field component

For ordinary labeled forms, start with TextField, including `<TextField label="Message" autosize />` when the field should grow. No separate multiline flag is required. Standalone Textarea uses the same editor appearance and typography without label or adornment chrome. This primitive is for custom compositions and native editing semantics, not a second high-level field API.


### Multiline editing and custom composition

```tsx
import { Textarea } from '@vyrnforge/react/textarea';

<Textarea aria-label="Message" variant="unstyled" fullWidth autosize minRows={2} maxRows={8} />
<Textarea aria-label="Notes" rows={4} resize="vertical" variant="filled" />
```

The browser owns text, selection, and editing events. Autosize is progressive enhancement; native rows and resize are the fallback. Consumers own composition and submission. Use the existing shared control typography and theme tokens rather than a separate theme.

### Compose a message editor

```tsx
import { Textarea } from '@vyrnforge/react/textarea';
import { Button } from '@vyrnforge/react/button';

<form onSubmit={onSubmit}>
  <div data-vf-editor-surface style={{ display: 'grid', gap: '0.5rem', padding: '0.75rem' }}>
    <Textarea aria-label="Message" name="message" variant="unstyled" fullWidth autosize minRows={2} maxRows={8} />
    <Button type="submit">Send</Button>
  </div>
</form>
```

The form handler is application-owned. Autosizing does not intercept submission, IME or keyboard editing; no separate composition runtime is required.

A one-row expanding standalone editor can be written as `<Textarea aria-label="Message" autosize minRows={1} maxRows={6} />`. The matching labeled composition is `<TextField label="Message" autosize minRows={1} maxRows={6} />`. Both use the native textarea from initial render.

## React tokens

Use the typed `textarea` token group. For app-wide configuration, pass the same group to `createTheme({ name: 'brand', tokens: ... })` from `@vyrnforge/react` and emit the stylesheet with `renderThemeCss`. For a local scope:

```tsx
import { ThemeScope, tokens } from '@vyrnforge/react';
import { Textarea } from '@vyrnforge/react/textarea';

<ThemeScope tokens={{ editor: { radius: '8px' }, textarea: { valueFont: '400 1rem/1.5 ' + tokens.fontFamily.sans } }}>
  <Textarea aria-label="Notes" />
</ThemeScope>
```

Use ordinary CSS layout properties for geometry that belongs to the application. The canonical stylesheet provides the defaults; token overrides are optional. The Native Web guide documents CSS-level equivalents.
