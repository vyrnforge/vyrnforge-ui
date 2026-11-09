# Typography / Text

Typography is VyrnForge's Layer 1 textual presentation family. Text is the general-purpose semantic-host × visual-role primitive. Code and Kbd are specialized members of the same family.

## Text contract

Text preserves the authored native semantic element and applies an explicit visual typography role.

- `as` selects an approved textual semantic host.
- `variant` selects a visual typography role.
- Semantics and appearance are independent.
- Native Web uses `data-vf-text` and `data-vf-text-variant`.
- `data-vf-prose` remains the automatic, scoped document-typography mode.
- Explicit Text treatment wins when used inside prose.
- Link, Button, form Label, disclosure Summary, structural List/Figure/Table semantics, Code, and Kbd are not Text hosts because another contract owns their primary responsibility.
- No `vf-text` custom element is introduced for ordinary HTML semantics.

Initial Text semantic hosts are `span`, `p`, `div`, `h1`–`h6`, `blockquote`, `q`, `cite`, `strong`, `em`, `small`, `mark`, `abbr`, `sub`, `sup`, `del`, `ins`, `time`, and `figcaption`.

Built-in visual roles are the explicit sized variants: display-lg/md/sm, heading-lg/md/sm/xs, title-lg/md/sm, body-lg/md/sm, label-lg/md/sm, caption, and overline. The default is `body-md`. Unsized legacy aliases are not part of the canonical vocabulary.

## Examples

```html
<h1 data-vf-text data-vf-text-variant="heading-lg">Account settings</h1>
<blockquote data-vf-text data-vf-text-variant="body-lg">Design systems reduce repeated decisions.</blockquote>
<mark data-vf-text data-vf-text-variant="body-md">Important</mark>
```

```tsx
<Text as="h1" variant="heading-lg">Account settings</Text>
<Text as="blockquote" variant="body-lg">Design systems reduce repeated decisions.</Text>
<Text as="mark" variant="body-md">Important</Text>
<Text as="time" variant="caption" dateTime="2026-11-10">November 10</Text>
<Link href="/billing" textVariant="body-sm">Billing</Link>
<Button type="button" textVariant="label-sm">Save</Button>
```

Code and Kbd retain their specialized presentation and native semantics while consuming the same shared typography scale. They are not alternate typography systems.
