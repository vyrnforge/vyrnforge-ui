# React Textarea

The React adapter forwards the native ref and supports the native attributes.

## React setup

Supported CSS-aware browser bundlers automatically load canonical styles through the public import.

```tsx
import { Textarea } from '@vyrnforge/react/textarea';

<><label htmlFor="notes">Notes</label><Textarea id="notes" name="notes" rows={4} maxLength={160} /></>
```

For a composite field with associated label, description, error and optional artwork, see TextField. For SSR, include the extracted client stylesheet in the rendered HTML.
