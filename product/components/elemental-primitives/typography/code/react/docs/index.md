# React Code

Use `Code` for inline native `code` and `CodeBlock` for read-only native `pre > code`. These components only expose ergonomic React props/refs and the shared Web styling hooks. They do not add a syntax highlighter, editor, clipboard action, or custom keyboard behavior.

## React setup

In a CSS-aware browser build that honors the package's `browser` export condition (validated with esbuild), importing `@vyrnforge/react/code` automatically includes **the canonical Native Web Code CSS**. No per-component stylesheet import is required. The root `@vyrnforge/react` entry selects the full Web aggregate, whereas granular component imports select just their component's CSS and declared styling dependencies.

For plain Node/SSR imports, the JS entry stays CSS-free. The consuming SSR framework must include the stylesheet emitted by its client build in the HTML; SSR alone does not install browser CSS. For bundlers that do not resolve `browser` conditions or cannot extract CSS, the supported fallback remains one explicit app-entrypoint import:

```ts
import '@vyrnforge/web/styles.css';
```

The optional reset is never auto-loaded. This is not a React styling fork.

```tsx
import { Code, CodeBlock } from '@vyrnforge/react/code';
<p>Run <Code>pnpm test</Code>.</p>
<CodeBlock aria-label="Build and test commands">{'pnpm build\npnpm test'}</CodeBlock>
```

Both wrappers pass native HTML attributes through. The block is one `pre` containing one `code` in DOM order; long lines use the existing Web Code overflow behavior. Consumers own accessible surrounding instructions and language/direction where needed. `Code` may take a shared `variant` in browser builds using automatic component CSS, or when the application explicitly loads Text CSS through its SSR/legacy bundler setup; this adds the same `data-vf-text` hooks as native markup, while Code retains its monospace identity. Default Code has no redundant Text treatment. Do not supply nested `<Code>` to `<CodeBlock>`; use a native `pre` with authored `code` instead for more complex structures.
