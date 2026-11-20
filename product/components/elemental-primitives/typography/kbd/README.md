# Typography / Kbd

Kbd is the specialized keyboard-input text member of the Typography responsibility family.

- Native `kbd` semantics remain authoritative.
- Kbd owns keycap/keyboard-input presentation and intrinsic monospace identity.
- Kbd does not create a separate typography scale. Explicit Text hooks may supply a shared typography role while Kbd retains its intrinsic presentation.
- Kbd introduces no keyboard interaction, shortcut handling, focus behavior, or Core runtime dependency.

Canonical Web presentation is exposed from `@vyrnforge/web/styles/kbd.css`.

## React adapter

`@vyrnforge/react/kbd` provides a native `<kbd>` with React props/ref forwarding and the same Web `kbd.css`. An optional `variant` composes explicit Text hooks if `text.css` is also loaded. It does not capture key events or execute shortcuts.
