# Textarea

Textarea is VyrnForge's native multiline text-entry primitive.

- Canonical styling lives in `@vyrnforge/web/styles/textarea.css`.
- Native Web and Custom Elements applications decorate a real `<textarea>` with `data-vf-textarea`.
- React and Vue expose a thin `Textarea` over the native element.
- Angular exposes `vfTextarea` on an authored native `<textarea>`.
- Native value, line breaks, form submission/reset, constraint validation, selection, focus, and resize behavior remain platform-owned.
- Textarea does not provide labels, descriptions, error messages, auto-grow, counters, validation orchestration, variants, size props, or a custom-element wrapper.
