# Text

Text is VyrnForge's shared typography treatment. Native HTML semantics remain the source of meaning; Text only supplies an opt-in visual role.

- Canonical tokens, built-in visual roles, and styling live in `@vyrnforge/web`.
- Native Web applies `data-vf-text` and `data-vf-text-variant` directly to the semantic element.
- The same Text hooks may compose on an element that also owns another VyrnForge contract. For example, an anchor can carry both `data-vf-link` and `data-vf-text`, and a button can carry both `data-vf-button` and `data-vf-text`.
- In that composition, Text owns typography. The semantic/component contract still owns semantics, interaction, state, color, borders, backgrounds, focus, and other component-specific presentation.
- Code and Kbd retain their monospace identity while an explicit Text role may control their size, weight, line height, and related shared typography.
- `data-vf-prose` remains the scoped automatic treatment for authored native content such as headings, paragraphs, blockquotes, figures, and lists. It does not create Heading or Paragraph components.
- React and Vue currently provide convenience `Text` components with an explicit `as` element; Angular provides the `vfText` directive. Their API expansion is intentionally outside this Native Web slice.
- No custom-element wrapper is provided because ordinary text semantics are already native HTML.
- Built-in roles cover display, heading, title, body, label, caption, and overline treatments.
- Applications can add or disable typed variants through `TextVariantOverrides` and style custom variants through the same stable Web hook.
- Existing `body`, `label`, `title`, and `heading` names remain compatibility aliases.

Native composition examples:

```html
<h1 data-vf-text data-vf-text-variant="heading-lg">Account settings</h1>

<a
  data-vf-link
  data-vf-text
  data-vf-text-variant="body-sm"
  href="/billing"
>
  Billing
</a>

<button
  data-vf-button
  data-vf-text
  data-vf-text-variant="label-sm"
  type="button"
>
  Save
</button>

<code data-vf-code data-vf-text data-vf-text-variant="body-lg">pnpm test</code>
```
