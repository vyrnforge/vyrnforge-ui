# Input

Input preserves the native single-value input with canonical shared styling.

## When to use

Use native input types, including text, email, URL, search, telephone, number, password, temporal and color modes. The browser owns editing, selection, autofill, constraint validation and native picker UI. The numeric size attribute retains its HTML meaning; inherited density controls the default visual geometry. Use TextField for reusable label/help/error relationships and adornments, and existing specialized fields for custom stepping, search or password visibility.

## Native editing and relationships

Always provide an accessible name, preferably a persistent visible label. Author explicit description IDs and error messages; aria-invalid signals application validation while user-invalid presents browser validity after interaction. Do not replace native editing or introduce a form runtime. Requiredness must be communicated in text when needed. Native attributes remain authoritative.

## Native Web

Load `@vyrnforge/web/styles/input.css` and use the native element with `data-vf-input`.

## Presentation

Outlined is the default. Filled uses a tinted surface with an underline; underlined uses a transparent surface. Unstyled removes primitive border, background, and padding but retains visible keyboard focus, native semantics, and shared control typography. Native Web uses data-vf-editor-variant, data-vf-editor-size (sm/md/lg), data-vf-editor-full-width, and data-vf-editor-align (start/center/end). Omit size styling to inherit density; HTML size remains numeric. Use the shared control typography and semantic tokens through createTheme, or ordinary CSS for intentional instance customization. A composed surface may use data-vf-editor-surface around one unstyled native editor; the composition owns its padding, label relationships and surrounding layout.
