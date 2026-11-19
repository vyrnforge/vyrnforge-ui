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

## Inherited density and zero-style Input usage

By default, Input consumes the canonical control font, semantic colors, border, radius and comfortable medium control height/padding from the Web styling foundation. When `@vyrnforge/web/styles/foundation.css` is loaded, an inherited `data-vf-density="compact"` on the document or a subtree selects the compact medium control height (the public small control-height token) and the existing extra-small spacing token for Input block padding. The native color-input subtype follows the same height. Without foundation.css, Input retains its original comfortable height/padding fallback. Density does not change semantic type, native validation, text direction, focus treatment or input value. It is independent of theme, and no new React `density` or `size` prop or public token is added.

A React form can use `<Flow><label htmlFor="email">Email</label><Input id="email" type="email" /></Flow>` without inline sizing. Consumer applications still own the native label/help/error relationships. Explicit styles remain possible for genuinely application-specific layout. At 320 CSS px and enlarged text, inputs must retain access and native focus; compact is not permission to shrink text or focus targets.
