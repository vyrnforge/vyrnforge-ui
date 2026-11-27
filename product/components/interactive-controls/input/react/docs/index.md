# React Input

The React adapter forwards the native ref and supports the native attributes.

## React setup

Supported CSS-aware browser bundlers automatically load canonical styles through the public import.

```tsx
import { Input } from '@vyrnforge/react/input';

<><label htmlFor="email">Email</label><Input id="email" name="email" type="email" autoComplete="email" required /></>
```

For a composite field with associated label, description, error and optional artwork, see TextField. For SSR, include the extracted client stylesheet in the rendered HTML.

## Choosing a field component

For ordinary labeled forms, start with TextField. This primitive is for custom compositions and native editing semantics, not a second high-level field API.


### Independent editor appearance

```tsx
import { Input } from '@vyrnforge/react/input';

<Input aria-label="Search" variant="filled" fieldSize="lg" fullWidth />
<Input aria-label="Custom editor" variant="unstyled" size={20} />
```

Unstyled is for an authored surrounding composition; retain an accessible name and a visible keyboard focus indicator. The numeric size is the native HTML attribute, independent of fieldSize. Use createTheme for shared control typography and semantic tokens.
