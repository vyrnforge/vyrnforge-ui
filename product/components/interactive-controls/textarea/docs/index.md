# Textarea

Textarea preserves the native multiline textarea with canonical shared styling.

## When to use

Use native rows, cols, wrap, maxLength, required, autocomplete, disabled and readOnly attributes. The browser owns multiline editing, selection, IME, resize, form participation and constraint validation. Use TextField multiline for label/help/error relationships ; Textarea itself owns progressive autosize.

## Native editing and relationships

Always provide an accessible name, preferably a persistent visible label. Author explicit description IDs and error messages; aria-invalid signals application validation while user-invalid presents browser validity after interaction. Do not replace native editing or introduce a form runtime. Requiredness must be communicated in text when needed. Native attributes remain authoritative.

## Native Web

Load `@vyrnforge/web/styles/textarea.css` and use the native element with `data-vf-textarea`.

## Presentation and multiline sizing

Textarea shares the Input editor presentation: outlined, filled, underlined, unstyled; inherited density or explicit fieldSize; fullWidth and logical textAlign. Native Web uses the same data-vf-editor-* hooks. Unstyled keeps keyboard focus and native editing, without primitive border, background or padding.

Opt into autosize with data-vf-textarea-autosize (React autosize). In supporting browsers CSS field-sizing grows with text and wraps at the available width. Set minRows/maxRows in React; row bounds and columns are instance sizing inputs, not global theme roles. Use rows/cols for the native fallback and cols for autosizing width when not fullWidth. Without field-sizing, native rows/cols and resize remain available; automatic growth and row limits are not promised. In autosize mode vertical drag resizing is disabled in supporting browsers; horizontal or both requests retain horizontal resizing. Without autosize, data-vf-textarea-resize accepts none, vertical, horizontal or both. CSS min/max block size remain available for instance overrides.

## Native Web customization

Native Web authors may use `--vf-textarea-min-rows`, `--vf-textarea-max-rows` and `--vf-textarea-cols` as instance sizing inputs. React consumers use the native props and typed theme API instead.
