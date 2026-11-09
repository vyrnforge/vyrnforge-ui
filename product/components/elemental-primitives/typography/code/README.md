# Typography / Code

Code is the specialized code-text member of the Layer 1 Typography family.

- Native `code` and `pre` semantics remain authoritative.
- Code owns code-specific presentation such as monospace identity, inline/block surface treatment, spacing, overflow, and forced-colors behavior.
- Code does not create a separate typography scale. Explicit Text hooks may supply a shared typography role while Code retains intrinsic monospace presentation.
- Code introduces no custom keyboard model, editor behavior, syntax engine, selection model, or Core runtime dependency.
- CodeEditor and other editable coding experiences are higher-level interactive concepts and are not Layer 1 Typography.

Canonical Web presentation is exposed from `@vyrnforge/web/styles/code.css`.
