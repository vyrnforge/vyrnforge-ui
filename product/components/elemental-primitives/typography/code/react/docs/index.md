# React Code

Use `Code` for inline native `code` and `CodeBlock` for read-only native `pre > code`. These components only expose ergonomic React props/refs and the shared Web styling hooks. They do not add a syntax highlighter, editor, clipboard action, or custom keyboard behavior.

## React setup

Load the canonical stylesheet **once in the application entrypoint**, not inside every component or example:

```ts
import '@vyrnforge/web/styles.css';
```

This is the **current explicit loading model**; importing a React component does not automatically load its CSS. Applications optimizing their CSS payload can instead import selected granular Web styles at their entrypoint.

```tsx
import { Code, CodeBlock } from '@vyrnforge/react/code';
<p>Run <Code>pnpm test</Code>.</p>
<CodeBlock aria-label="Build and test commands">{'pnpm build\npnpm test'}</CodeBlock>
```

Both wrappers pass native HTML attributes through. The block is one `pre` containing one `code` in DOM order; long lines use the existing Web Code overflow behavior. Consumers own accessible surrounding instructions and language/direction where needed. `Code` may take a shared `variant` when Text styling is loaded by the application-wide stylesheet (or equivalent granular Text CSS); this adds the same `data-vf-text` hooks as native markup, while Code retains its monospace identity. Default Code has no redundant Text treatment. Do not supply nested `<Code>` to `<CodeBlock>`; use a native `pre` with authored `code` instead for more complex structures.
