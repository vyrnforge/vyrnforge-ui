# React Code

React Code and CodeBlock display read-only inline and preformatted source using the shared Web semantics and styling.

## React setup

```tsx
import { Code, CodeBlock } from '@vyrnforge/react/code';

<p>Run <Code>pnpm test</Code> before committing.</p>
<CodeBlock aria-label="Build and test commands">{'pnpm build\npnpm test'}</CodeBlock>
```

## Semantic authoring

CodeBlock renders a native `pre` containing `code`. Pass the source as text instead of nesting another `Code` inside `CodeBlock`. Code and CodeBlock are not editors, syntax highlighters or interactive copy controls; application-owned affordances must be implemented separately.
