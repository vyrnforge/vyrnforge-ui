# React Text

React uses the same framework-neutral typography roles and canonical Web stylesheet as Native Web. `Text` is a thin typed native-host authoring convenience; it is not a React-specific styling system.

## React setup

```tsx
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/text.css';

<Text as="h2" variant="heading-md">Account settings</Text>
<Text as="p">Your settings apply to this workspace.</Text>
```

Use `as` for the actual document semantics. `variant` only selects a visual role and defaults to `body-md`. A `span` styled like a heading does not become a heading.

## Specialized typography

Use `@vyrnforge/react/code` and `@vyrnforge/react/kbd` for code and keyboard-input notation. Their native elements and CSS hooks remain separate; neither becomes another Text host. Load the matching Web Code/Kbd stylesheet, or the aggregate Web stylesheet. No provider or React-only theme is required.
