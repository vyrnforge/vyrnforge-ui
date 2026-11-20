# Text

Text applies VyrnForge's consistent typography styles while preserving the meaning of the HTML element that contains the content. Visual appearance and document semantics are separate choices.

## When to use

Use Text when a heading, paragraph, label-like description, caption, or other authored text needs a deliberate visual role from the shared type scale. Choose a meaningful HTML element first, then select its visual treatment.

For long-form prose that needs automatic document typography, prefer the scoped native `data-vf-prose` recipe. Use explicit Text styling where a particular visual role is needed.

## When not to use

Do not use large text to imitate a heading without a heading element, or styled text to replace a real form label. Text does not handle editing, navigation, validation, copying, focus, or keyboard interaction. Use Code and Kbd for their specialized meanings, and the relevant Link, Button, or form-label contract for interactive content.

## Native baseline

The native element supplies meaning. A heading stays a heading, a paragraph stays a paragraph, and a visual role never changes the document outline.

Supported Text hosts are `span`, `p`, `div`, `h1`–`h6`, `blockquote`, `q`, `cite`, `strong`, `em`, `small`, `mark`, `abbr`, `sub`, `sup`, `del`, `ins`, `time`, and `figcaption`. Use Code and Kbd for code and keyboard notation.

## Visual roles

The 18 built-in roles are display-lg/md/sm, heading-lg/md/sm/xs, title-lg/md/sm, body-lg/md/sm, label-lg/md/sm, caption, and overline. The default is body-md.

Use display roles for prominent short titles, heading and title roles for hierarchy, body roles for readable copy, label roles for compact interface text, and caption/overline for supporting information. The token-driven type scale handles responsive typography without individual font-size overrides.

A `p` with a heading-like visual role is still a paragraph. A genuine `h2` styled as a title remains a second-level heading.

## Native Web

Load `@vyrnforge/web/styles/text.css`, apply `data-vf-text`, and set `data-vf-text-variant` for the desired visual role. Native elements retain their own semantic responsibility.

The scoped `data-vf-prose` recipe provides automatic document typography. Explicit Text styling remains available when a specific visual role is required.

## Accessibility

Text adds no ARIA role, focus behavior, keyboard interaction, or accessible-name behavior. Choose the correct HTML element and ensure typography does not stand in for headings, labels, or meaningful emphasis. The component does not make nonsemantic markup semantic.
