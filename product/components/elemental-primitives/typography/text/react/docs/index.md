# React Text

React uses the same framework-neutral typography roles and canonical Web stylesheet as Native Web. `Text` is a thin typed native-host authoring convenience; it is not a React-specific styling system.

## React setup

Load the canonical stylesheet **once in the application entrypoint**, not inside every component or example:

```ts
import '@vyrnforge/web/styles.css';
```

This is the **current explicit loading model**; importing a React component does not automatically load its CSS. Applications optimizing their CSS payload can instead import selected granular Web styles at their entrypoint.

```tsx
import { Text } from '@vyrnforge/react/text';
<Text as="h2" variant="heading-md">Account settings</Text>
<Text as="p">Your settings apply to this workspace.</Text>
```

Use `as` for the actual document semantics. `variant` only selects a visual role and defaults to `body-md`. A `span` styled like a heading does not become a heading.

## Specialized typography

Use `@vyrnforge/react/code` and `@vyrnforge/react/kbd` for code and keyboard-input notation. Their native elements and CSS hooks remain separate; neither becomes another Text host. When the application loads the single aggregate Web stylesheet above, Code and Kbd receive their canonical styling too; no additional component-level stylesheet imports are needed. No provider or React-only theme is required.
