# React packed consumer fixture

MFD-1417 verifies the first-class React package path from a clean packed
installation. Application code imports components, types, and styles only from
`@vyrnforge/ui-components`; it does not import, register, type, or otherwise
know about `@vyrnforge/ui-elements`, `@vyrnforge/ui-core`, or
`@vyrnforge/ui-behaviors`.

Internal VyrnForge packages may be installed transitively because they are
implementation dependencies of the React package. They are not part of the
normal React consumer setup or public application code.

The fixture verifies typecheck, production Vite build, SSR-safe package import,
canonical-backed runtime behavior, keyboard accessibility, and Chromium
interaction from packed artifacts.
