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

For ordinary labeled forms, start with TextField. For an automatically expanding labeled field, use TextField with autosize; for an independently composed multiline editor, use Textarea. Input remains single-line. This primitive is for custom compositions and native editing semantics, not a second high-level field API.


### Independent editor appearance

```tsx
import { Input } from '@vyrnforge/react/input';

<Input aria-label="Search" variant="filled" fieldSize="lg" fullWidth />
<Input aria-label="Custom editor" variant="unstyled" size={20} />
```

Unstyled is for an authored surrounding composition; retain an accessible name and a visible keyboard focus indicator. The numeric size is the native HTML attribute, independent of fieldSize. Use createTheme for shared control typography and semantic tokens.

### Compose a custom search surface

```tsx
import { Input } from '@vyrnforge/react/input';

<div data-vf-editor-surface style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
  <span aria-hidden="true">⌕</span>
  <Input aria-label="Search commands" variant="unstyled" fullWidth />
</div>
```

The surrounding surface owns visual layout and focus paint; the native editor owns selection, editing, accessibility name and native events. Search execution belongs to the consuming application.
