# React Text

React uses the same framework-neutral typography roles and canonical Web stylesheet as Native Web. `Text` is a thin typed native-host authoring convenience; it is not a React-specific styling system.

## React setup

In a CSS-aware browser build that honors the package's `browser` export condition (validated with esbuild), importing `@vyrnforge/react/text` automatically includes **the canonical Native Web Text CSS**. No per-component stylesheet import is required. The root `@vyrnforge/react` entry selects the full Web aggregate, whereas granular component imports select just their component's CSS and declared styling dependencies.

For plain Node/SSR imports, the JS entry stays CSS-free. The consuming SSR framework must include the stylesheet emitted by its client build in the HTML; SSR alone does not install browser CSS. For bundlers that do not resolve `browser` conditions or cannot extract CSS, the supported fallback remains one explicit app-entrypoint import:

```ts
import '@vyrnforge/web/styles.css';
```

The optional reset is never auto-loaded. This is not a React styling fork.

```tsx
import { Text } from '@vyrnforge/react/text';
<Text as="h2" variant="heading-md">Account settings</Text>
<Text as="p">Your settings apply to this workspace.</Text>
```

Use `as` for the actual document semantics. `variant` only selects a visual role and defaults to `body-md`. A `span` styled like a heading does not become a heading.

## Choosing a semantic host

React's `as` selects the native host and `variant` selects the canonical appearance. For example, use `<Text as="h2" variant="title-lg">` for a genuine second-level heading that visually resembles a title, and `<Text as="p" variant="body-md">` for a paragraph. The visual Text variant never changes the heading outline.

Examples below are executable from checked-in React sources. They demonstrate the full built-in type scale and a semantic article composed with the public Flow primitive; Flow owns spacing, not font styling.

## Specialized typography

Use `@vyrnforge/react/code` and `@vyrnforge/react/kbd` for code and keyboard-input notation. Their native elements and CSS hooks remain separate; neither becomes another Text host. Code and Kbd automatically import their canonical Web styles through the same browser condition. The Code/Kbd subpaths also include Text styles for the optional shared typography variant. No provider or React-only theme is required.
