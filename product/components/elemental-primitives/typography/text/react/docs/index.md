# React Text

React Text renders native HTML using VyrnForge's shared typography roles. The `as` prop selects the element; `variant` selects the appearance.

## React setup

Import Text from its public React entrypoint:

```tsx
import { Text } from '@vyrnforge/react/text';

<Text as="h2" variant="heading-md">Account settings</Text>
<Text as="p">Settings apply to this workspace.</Text>
```

In CSS-aware browser builds that honor the package's `browser` export condition (verified with esbuild), the component imports its canonical Web CSS automatically. No per-component CSS import is required.

Server-side Node imports stay CSS-free. SSR applications must deliver styles extracted by their client build. If a bundler does not support automatic CSS delivery, import `@vyrnforge/web/styles.css` once at the application entrypoint. The optional reset remains explicit.

## Choosing a semantic host

Use `as="h2"` for a real second-level heading, regardless of its visual variant. Use `as="p"` for paragraphs and `as="time"` with `dateTime` for machine-readable dates. Visual roles never alter the document outline.

## Specialized typography

Use `@vyrnforge/react/code` for code and `@vyrnforge/react/kbd` for keyboard-input notation. They retain native `code`/`kbd` semantics and share the canonical Web styling foundation; their browser CSS entrypoints also include Text styles when required by the optional variant.
