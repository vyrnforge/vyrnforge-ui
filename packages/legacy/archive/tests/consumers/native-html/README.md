# Native HTML packed consumer fixture

CF-7001 upgrades this fixture from an architecture-only example to a clean,
packed-package runtime consumer. It installs tarballs for
`@vyrnforge/ui-core`, `@vyrnforge/ui-behaviors`, and
`@vyrnforge/ui-elements`, then runs TypeScript, a production Vite build, and
Chromium interaction evidence.

The fixture proves explicit registration, VyrnForge CSS imports, typed
`HTMLElementTagNameMap` creation and queries, typed canonical events, slots,
property-only models, and `ElementInternals` form submission without a
framework runtime.
