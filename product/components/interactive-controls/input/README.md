# Input

Input is VyrnForge's native single-value entry primitive.

- Canonical styling lives in `@vyrnforge/web/styles/input.css`.
- Native Web and Elements consumers decorate a real `<input>` with `data-vf-input`; no custom-element wrapper is required.
- React and Vue expose a thin `Input` over the native element.
- Angular exposes `vfInput` on an authored native `<input>`.
- The approved type vocabulary is `text`, `email`, `password`, `search`, `tel`, `url`, `number`, `date`, `time`, `datetime-local`, `month`, `week`, and `color`.
- Type-specific browser UI remains native. VyrnForge does not replace number steppers, temporal pickers, or the color picker inside Input.
- Native value, form submission, reset, constraint validation, editing, focus, autofill, and keyboard behavior remain platform-owned.
- Input does not absorb checkbox, radio, switch, file, range, button, or hidden semantics.
- Input does not provide labels, descriptions, error messages, masking, validation orchestration, variants, size props, or a custom-element wrapper.
