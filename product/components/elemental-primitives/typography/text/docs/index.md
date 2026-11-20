# Text

Apply a consistent typography role while preserving the meaning of native HTML.

## When to use

Use Text when a heading, title, paragraph, label, or caption needs a deliberate visual role from the VyrnForge type scale. Choose the element for its meaning first; choose `variant` for its appearance.

For ordinary document prose, the scoped `data-vf-prose` recipe can style native paragraphs and headings without wrapping every element in Text.

## When not to use

Do not use visual size to imitate an HTML heading, form label, or emphasis. Typography does not provide editing, truncation, clipboard actions, focus management, or navigation. Use Code for code, Kbd for keyboard notation, and Link or Button for actions.

## Native baseline

The rendered element determines semantics. A `p` remains a paragraph even with `variant="heading-lg"`; `as="h2"` remains a second-level heading even with `variant="title-md"`.

Supported native Text hosts: `span`, `p`, `div`, `h1`–`h6`, `blockquote`, `q`, `cite`, `strong`, `em`, `small`, `mark`, `abbr`, `sub`, `sup`, `del`, `ins`, `time`, and `figcaption`. Code and Kbd are separate typography components.

## Visual roles

The built-in roles use shared design tokens and support a consistent hierarchy:

- Display: `display-lg`, `display-md`, `display-sm` — prominent, short text.
- Headings: `heading-lg`, `heading-md`, `heading-sm`, `heading-xs` — section hierarchy.
- Titles: `title-lg`, `title-md`, `title-sm` — compact headings and UI titles.
- Body: `body-lg`, `body-md`, `body-sm` — paragraphs and supporting copy.
- Labels: `label-lg`, `label-md`, `label-sm` — concise interface labels.
- Supporting: `caption`, `overline` — metadata and small contextual text.

The default is `body-md`. Roles change presentation, not semantic structure. Prefer these tokens to per-instance font sizes.

## Native Web

Load `@vyrnforge/web/styles/text.css` for the native CSS recipe. Add `data-vf-text` and, where needed, `data-vf-text-variant` to the semantic element. The scoped `data-vf-prose` recipe provides an alternative for ordinary documents.

## Accessibility

Text does not create roles, accessible names, keyboard behavior, or focus management. Use real headings for document structure, real labels for form controls, and `strong` or `em` when emphasis conveys meaning. Keep the reading order understandable independently of the typography scale.
