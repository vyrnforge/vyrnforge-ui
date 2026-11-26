# Input

Input preserves the native single-value input with canonical shared styling.

## When to use

Use native input types, including text, email, URL, search, telephone, number, password, temporal and color modes. The browser owns editing, selection, autofill, constraint validation and native picker UI. The numeric size attribute retains its HTML meaning; inherited density controls the default visual geometry. Use TextField for reusable label/help/error relationships and adornments, and existing specialized fields for custom stepping, search or password visibility.

## Accessibility and native behavior

Always provide an accessible name, preferably a persistent visible label. Author explicit description IDs and error messages; aria-invalid signals application validation while user-invalid presents browser validity after interaction. Do not replace native editing or introduce a form runtime. Requiredness must be communicated in text when needed. Native attributes remain authoritative.

## Native Web

Load `@vyrnforge/web/styles/input.css` and use the native element with `data-vf-input`.
