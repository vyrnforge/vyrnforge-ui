# Packages

VyrnForge package facts have a small set of owners. This directory intentionally
does not maintain one guide per package.

## Canonical owners

- [Package metadata](../metadata/packages.json) — package roles, dependency
  boundaries, public entrypoints, and release-track identity.
- Package `package.json` files — published exports, peer dependencies, engines,
  versions, and package-manager metadata.
- Package-local `README.md` files under `packages/*` — package-specific install,
  setup, and usage guidance shipped with the package.
- [Public API reference](../api/README.md) — consumer-facing API navigation.
- [Package Boundaries](../architecture/01-package-boundaries.md) — architecture
  rules between packages.
- [Release documentation](../release/README.md) — release governance and
  compatibility evidence.

Do not create a second package guide here merely to restate a package README,
manifest, or metadata record. Add authored documentation only when it explains a
cross-package concept that those canonical owners cannot express cleanly.
