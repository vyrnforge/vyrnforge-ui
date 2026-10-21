# Input

Input is VyrnForge's native text-entry primitive.

- Canonical styling lives in `@vyrnforge/web/styles/input.css`.
- Native Web and Custom Elements applications decorate a real `<input>` with `data-vf-input`.
- React and Vue expose a thin `Input` over the native element.
- Angular exposes `vfInput` on an authored native `<input>`.
- The initial type vocabulary is `text`, `email`, `password`, `search`, `tel`, and `url`.
- Native value, form submission, reset, constraint validation, editing, focus, autofill, and keyboard behavior remain platform-owned.
- Input does not provide labels, descriptions, error messages, masking, validation orchestration, variants, size props, or a custom-element wrapper.
