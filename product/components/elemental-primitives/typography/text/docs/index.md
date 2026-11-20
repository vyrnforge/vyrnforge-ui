# Text

Text is the general elemental primitive in the Typography responsibility family for applying a visual typography role without replacing authored semantics.

## When to use

Use Text when an authored piece of text needs one of VyrnForge's consistent visual roles, such as a page heading, section title, introductory paragraph, supporting caption, or overline. Choose the native element for the content's actual meaning; `variant` only chooses its appearance.

In ordinary prose, prefer the scoped native `data-vf-prose` recipe when you want automatic document typography without wrapping every paragraph. Use explicit Text treatment for deliberate emphasis of a visual role within that content.

## When not to use

Do not use a large-looking `span` to fake a heading, a `div` to fake a form label, or a visual caption to replace a real `time` element. Text does not implement truncation, copying, editing, navigation, validation, focus, or keyboard interaction. Use the dedicated Code, Kbd, Link, Button, and form-label contracts for those responsibilities.

## Native baseline

Choose the correct native textual element first, then opt it into VyrnForge typography. A heading remains a heading, a paragraph remains a paragraph, and visual role names never create document semantics.

Approved Text hosts include `span`, `p`, `div`, `h1`–`h6`, `blockquote`, `q`, `cite`, `strong`, `em`, `small`, `mark`, `abbr`, `sub`, `sup`, `del`, `ins`, `time`, and `figcaption`. Code and Kbd remain specialized Typography members rather than Text hosts.

## Visual roles

The built-in roles are display-lg/md/sm, heading-lg/md/sm/xs, title-lg/md/sm, body-lg/md/sm, label-lg/md/sm, caption, and overline. The default role is body-md. These names describe presentation only, not heading hierarchy or document structure.

Use display roles for intentionally prominent short titles; heading and title roles for text hierarchy; body roles for long-form and supporting content; label roles for compact UI text; and caption/overline for metadata and small contextual identifiers. The Text scale is fluid and token-driven where the role requires it; avoid overriding font sizes per usage instance.

The visual role gallery is illustrative. Always select the semantic host independently: a paragraph with `variant="heading-lg"` remains a paragraph, while `as="h2" variant="title-md"` remains a second-level heading.

## Native Web

Load `@vyrnforge/web/styles/text.css`, apply `data-vf-text`, and set `data-vf-text-variant` to the requested visual role. The same element may also participate in another VyrnForge contract when that owner retains its semantic and behavioral responsibility.

Scoped `data-vf-prose` provides automatic native document typography. Explicit Text treatment remains the opt-in override when a specific visual role is required.

## Accessibility

Text adds no role, focus behavior, keyboard interaction, ARIA state, or accessible-name behavior. Consumers remain responsible for choosing semantic HTML appropriate to the content. Typography must not be used to fake headings, labels, emphasis, or other semantics.
