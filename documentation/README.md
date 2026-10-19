# Public documentation source

This directory contains the repository-owned source for the public VyrnForge documentation product.

Canonical engineering architecture and standards remain in Google Drive. Content here adapts those contracts into versioned consumer guidance. Framework-neutral material belongs under `shared/`; framework-specific integration material belongs under `frameworks/`; generated package and compatibility reference is built from authoritative repository data.

Executable public examples live under `examples/`. An example is checked-in runnable source, not a copied documentation snippet: the documentation build compiles supported framework sources against the built public VyrnForge package entrypoints, embeds the same source in the public playground, and emits static preview artifacts. Component documentation can compose an example with the deliberately small `<div data-vf-example="component/example"></div>` marker; this marker is a composition hook, not a general documentation DSL.

The docs shell uses public VyrnForge Web tokens and component styling where those surfaces exist. Documentation-specific CSS owns only the documentation product's layout and presentation concerns.

The static site is assembled by `tooling/docs/build.mjs` into `dist/docs/<channel>/`. The rebuild publishes only the `next` channel until a stable release exists.
