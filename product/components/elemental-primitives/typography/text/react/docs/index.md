# React Text

React Text uses the shared type scale and native HTML semantics. Its `as` prop chooses the semantic host while `variant` selects presentation.

## React setup

```tsx
import { Text } from '@vyrnforge/react/text';

<Text as="h2" variant="heading-md">Account settings</Text>
<Text as="p">Your settings apply to this workspace.</Text>
```

## Choosing a semantic host

Choose a real heading element such as `as="h2"` when the content is a heading. The `variant` changes its appearance, not its document-outline level. For example, `<Text as="h2" variant="title-lg">` remains a second-level heading.
