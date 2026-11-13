# Text

Text is the general Layer 1 Typography primitive for applying a visual typography role without replacing authored semantics.

## Native baseline

Choose the correct native textual element first, then opt it into VyrnForge typography. A heading remains a heading, a paragraph remains a paragraph, and visual role names never create document semantics.

Approved Text hosts include `span`, `p`, `div`, `h1`–`h6`, `blockquote`, `q`, `cite`, `strong`, `em`, `small`, `mark`, `abbr`, `sub`, `sup`, `del`, `ins`, `time`, and `figcaption`. Code and Kbd remain specialized Typography members rather than Text hosts.

## Visual roles

The built-in roles are display-lg/md/sm, heading-lg/md/sm/xs, title-lg/md/sm, body-lg/md/sm, label-lg/md/sm, caption, and overline. The default role is body-md. These names describe presentation only.

## Native Web

Load `@vyrnforge/web/styles/text.css`, apply `data-vf-text`, and set `data-vf-text-variant` to the requested visual role. The same element may also participate in another VyrnForge contract when that owner retains its semantic and behavioral responsibility.

Scoped `data-vf-prose` provides automatic native document typography. Explicit Text treatment remains the opt-in override when a specific visual role is required.

## Accessibility

Text adds no role, focus behavior, keyboard interaction, ARIA state, or accessible-name behavior. Consumers remain responsible for choosing semantic HTML appropriate to the content. Typography must not be used to fake headings, labels, emphasis, or other semantics.
