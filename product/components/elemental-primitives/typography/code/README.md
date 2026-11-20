# Typography / Code

Code is the specialized code-text member of the Typography responsibility family.

- Native `code` and `pre` semantics remain authoritative.
- Code owns code-specific presentation such as monospace identity, inline/block surface treatment, spacing, overflow, and forced-colors behavior.
- Code does not create a separate typography scale. Explicit Text hooks may supply a shared typography role while Code retains intrinsic monospace presentation.
- Code introduces no custom keyboard model, editor behavior, syntax engine, selection model, or Core runtime dependency.
- CodeEditor and other editable coding experiences are higher-level interactive concepts and are not elementary typography.

Canonical Web presentation is exposed from `@vyrnforge/web/styles/code.css`.

## React adapter

`@vyrnforge/react/code` now supplies typed `Code` and `CodeBlock` components over native `<code>` and `<pre><code>`. Import the same Web `code.css` as Native Web; `Code` composes optional shared Text variant hooks when `text.css` is loaded too. No React-only CSS or editor runtime is introduced.
