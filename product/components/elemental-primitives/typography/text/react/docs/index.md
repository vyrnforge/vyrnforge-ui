# React Text

React Text uses the same visual roles and Web styling as other VyrnForge surfaces. Its `as` prop selects the native element and `variant` controls presentation.

## React setup

Import Text from its public React entrypoint. Choose the HTML element for meaning and the variant for appearance.

```tsx
import { Text } from '@vyrnforge/react/text';

<Text as="h2" variant="heading-md">Account settings</Text>
<Text as="p">Your settings apply to this workspace.</Text>
```

## Choosing a semantic host

Use `as="h2"` for a real second-level heading and `as="p"` for a paragraph. For example, `<Text as="h2" variant="title-lg">` is a second-level heading with title styling. A `span` that looks like a heading does not enter the heading outline.

The examples show the complete type scale and a semantic article using the public Flow primitive. Flow handles layout spacing; Text handles visual typography.

## Styling and server rendering

In supported CSS-aware browser builds that honor the package's `browser` export condition (verified with esbuild), importing `@vyrnforge/react/text` automatically includes the canonical Web Text CSS. You do not need a separate CSS import for each component. The aggregate `@vyrnforge/react` entry selects the full Web stylesheet; granular imports select the relevant component CSS and its styling dependencies.

Node/SSR imports do not load CSS. Server-rendered applications must deliver the stylesheet extracted by the client build. If a bundler does not honor browser conditions or extract CSS, load the supported fallback once in the application's entrypoint:

```ts
import '@vyrnforge/web/styles.css';
```

The optional reset is not loaded automatically. Text does not introduce a React-only theme or styling layer.

## Specialized typography

Use `@vyrnforge/react/code` for inline or block code and `@vyrnforge/react/kbd` for keyboard notation. These components use native semantics and the canonical Web styles; neither is an alternative Text host. Their browser entrypoints also include the Text styles needed for the optional shared typography variant.
