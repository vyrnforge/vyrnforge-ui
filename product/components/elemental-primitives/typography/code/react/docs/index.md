# React Code

Use the public React `Code` and `CodeBlock` wrappers for read-only inline and preformatted content. Shared Code guidance owns the semantic and accessibility expectations.

## React setup

```tsx
import { Code, CodeBlock } from '@vyrnforge/react/code';

<p>Run <Code>pnpm test</Code> before committing.</p>
<CodeBlock aria-label="Build and test commands">{'pnpm build\npnpm test'}</CodeBlock>
```

Inline Code renders `<code>`; CodeBlock renders `<pre><code>`. Neither needs a React provider, clipboard controller, or syntax-highlighting dependency.

## Semantic authoring

Use one CodeBlock for one read-only excerpt; do not pass a nested `<Code>` into `<CodeBlock>`. For a custom preformatted structure, author semantic native elements instead. Provide surrounding text for purpose, language, direction, and steps the application owns. Both components pass native attributes and refs through; neither implements editing, selection logic, or actions.

## Styling and server rendering

CSS-aware browser builds resolving the package `browser` export condition include canonical Web Code CSS through the component entrypoint. Plain Node/SSR imports stay CSS-free; consuming apps must deliver the extracted stylesheet in the client HTML. For bundlers without the required CSS extraction behavior, explicitly load the public Web aggregate once from the app entrypoint:

```ts
import '@vyrnforge/web/styles.css';
```

The optional reset is not automatically loaded. The optional shared `variant` reuses Text hooks when Text CSS is available, while the Code monospace identity remains unchanged. The React wrappers do not create a styling fork or claim independent assistive-technology certification.
