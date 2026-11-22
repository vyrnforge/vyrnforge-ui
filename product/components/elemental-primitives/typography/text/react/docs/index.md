# React Text

React Text uses the shared type scale and native HTML semantics. Its `as` prop chooses the semantic host while `variant` selects presentation.

## React setup

```tsx
import { Text } from '@vyrnforge/react/text';

<Text as="h2" variant="heading-md">Account settings</Text>
<Text as="p">Your settings apply to this workspace.</Text>
```

## Semantic colors and custom themes

Use `tone="primary"`, `tone="secondary"`, `tone="accent"`, or `tone="danger"` to select a theme-aware text color without spelling out a CSS variable. For ordinary body text, omit `tone` to inherit its parent color:

```tsx
import { Text, ThemeScope } from '@vyrnforge/react';

<Text as="p" tone="secondary">Secondary information</Text>
<ThemeScope theme="dark">
  <Text as="p" tone="danger">Something needs attention</Text>
</ThemeScope>
```

`tone` references shared Web semantic tokens, so values adapt to light/dark/system and custom theme scopes. Choose `as` from native semantics first, independently of the visual `variant` and color `tone`. A custom text color can also use `colors` from the React root in ordinary `style`. Custom themes are consumer-owned CSS variable overrides, not a separate React palette.

## Choosing a semantic host

Choose a real heading element such as `as="h2"` when the content is a heading. The `variant` changes its appearance, not its document-outline level. For example, `<Text as="h2" variant="title-lg">` remains a second-level heading.
