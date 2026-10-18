# Public documentation source

This directory contains the repository-owned source for the public VyrnForge documentation product.

Canonical engineering architecture and standards remain in Google Drive. Content here adapts those contracts into versioned consumer guidance. Framework-neutral material belongs under `shared/`; framework-specific integration material belongs under `frameworks/`; generated package and compatibility reference is built from authoritative repository data.

The static site is assembled by `tooling/docs/build.mjs` into `dist/docs/<channel>/`. The rebuild publishes only the `next` channel until a stable release exists.
