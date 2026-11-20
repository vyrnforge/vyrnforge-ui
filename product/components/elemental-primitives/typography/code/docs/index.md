# Code

Code displays computer-readable text such as an inline command, filename, code identifier, or a read-only multi-line excerpt. It is specialized typography, not an editor.

## When to use

- Use inline code for short commands, identifiers, or literals within a sentence.
- Use a preformatted code block for an excerpt whose line breaks and whitespace are meaningful.
- Pair commands with surrounding instructions so people understand what to run and when.

## When not to use

- Do not use Code for editable input, diagnostics, syntax-aware editing, autocomplete, or code execution. Those require an explicitly designed editor or application workflow.
- Do not apply code styling merely to emphasize ordinary prose; use Text roles or semantic emphasis.
- Use Kbd for a key or shortcut a person should press, rather than Code.

## Native baseline

Inline Code is native `<code>`. Block Code is a native `<pre>` containing `<code>`, preserving whitespace and reading order. Neither wrapper installs a keyboard interaction or code processing engine.

## Visual styling

The canonical Code styling uses `@vyrnforge/web/styles/code.css` and preserves monospace identity. Shared Text variants may be composed on the same native code element when the applicable Text stylesheet is available. Code remains visually distinct from a normal paragraph and does not change the surrounding semantics.

## Accessibility

- Provide a meaningful description, caption, or surrounding instruction for examples when their purpose is not obvious.
- Keep source text selectable and readable at narrow widths and zoom. Preformatted examples may scroll horizontally without clipping their content or trapping focus.
- Preserve directionality for mixed-language commands and localize explanatory prose; never treat visual code styling as an accessible name.
- A read-only snippet should not imply that it is an editor, executable control, or copy button.

## Native Web

Use `<code data-vf-code>` for inline code and `<pre data-vf-code-block><code>…</code></pre>` for a block. Load `@vyrnforge/web/styles/code.css` (or the aggregate Web stylesheet). React maps `Code` and `CodeBlock` to the same semantics; no alternate code styling system is introduced.
