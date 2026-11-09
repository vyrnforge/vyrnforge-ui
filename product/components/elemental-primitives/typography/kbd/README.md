# Typography / Kbd

Kbd is the specialized keyboard-input text member of the Layer 1 Typography family.

- Native `kbd` semantics remain authoritative.
- Kbd owns keycap/keyboard-input presentation and intrinsic monospace identity.
- Kbd does not create a separate typography scale. Explicit Text hooks may supply a shared typography role while Kbd retains its intrinsic presentation.
- Kbd introduces no keyboard interaction, shortcut handling, focus behavior, or Core runtime dependency.

Canonical Web presentation is exposed from `@vyrnforge/web/styles/kbd.css`.
