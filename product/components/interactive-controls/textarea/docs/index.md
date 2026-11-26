# Textarea

Textarea preserves the native multiline textarea with canonical shared styling.

## When to use

Use native rows, cols, wrap, maxLength, required, autocomplete, disabled and readOnly attributes. The browser owns multiline editing, selection, IME, resize, form participation and constraint validation. Use TextField multiline for label/help/error relationships and optional progressive autosize.

## Accessibility and native behavior

Always provide an accessible name, preferably a persistent visible label. Author explicit description IDs and error messages; aria-invalid signals application validation while user-invalid presents browser validity after interaction. Do not replace native editing or introduce a form runtime. Requiredness must be communicated in text when needed. Native attributes remain authoritative.

## Native Web

Load `@vyrnforge/web/styles/textarea.css` and use the native element with `data-vf-textarea`.
