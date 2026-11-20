# React Kbd

`Kbd` is a noninteractive wrapper around the native `kbd` element. React only maps native attributes/ref/children to the canonical Web hook; it does not execute a keyboard shortcut or synthesize button/keyboard state.

## React setup

In a CSS-aware browser build that honors the package's `browser` export condition (validated with esbuild), importing `@vyrnforge/react/kbd` automatically includes **the canonical Native Web Kbd CSS**. No per-component stylesheet import is required. The root `@vyrnforge/react` entry selects the full Web aggregate, whereas granular component imports select just their component's CSS and declared styling dependencies.

For plain Node/SSR imports, the JS entry stays CSS-free. The consuming SSR framework must include the stylesheet emitted by its client build in the HTML; SSR alone does not install browser CSS. For bundlers that do not resolve `browser` conditions or cannot extract CSS, the supported fallback remains one explicit app-entrypoint import:

```ts
import '@vyrnforge/web/styles.css';
```

The optional reset is never auto-loaded. This is not a React styling fork.

```tsx
import { Kbd } from '@vyrnforge/react/kbd';
<p>Press <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> to search.</p>
```

Use `kbd` only for keyboard input or key names, not as an interactive keycap button. The public `variant` option applies existing Text styling hooks in browser builds using automatic component CSS, or when the application explicitly loads Text CSS through its SSR/legacy bundler setup. The native element, monospace identity, visual keycap, inherited theme and forced-colors treatment remain shared with Native Web.
