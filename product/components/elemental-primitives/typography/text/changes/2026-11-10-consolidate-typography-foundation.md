# Consolidate Layer 1 Typography

Layer 1 Typography is standardized as one responsibility family.

- Text is the general semantic-host × visual-role primitive.
- Code and Kbd are specialized Typography product units, not parallel typography systems.
- Mark is no longer a standalone product unit; native `mark` is an approved Text semantic host.
- React and Vue Text support the approved textual semantic-host set.
- Angular retains the authored native host through `vfText`.
- React Text preserves host-specific native attributes through polymorphic typing.
- The canonical default is `body-md`.
- Unsized `body`, `heading`, `title`, and `label` aliases are removed.
- Interactive, form-relationship, disclosure, and structural semantics stay with their owning contracts and may compose Typography presentation separately.

This is a deliberate rebuild-era breaking correction rather than a compatibility-preserving extension.
