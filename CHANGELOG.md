# Changelog

Noteworthy public changes to VyrnForge UI will be documented here.

Versioned sections record public prereleases. Detailed component documentation
stays in the source-of-truth docs linked from `docs/README.md`.

Release readiness, versioning, publication, and migration policy live in [docs/release/](docs/release/).

## Unreleased

### Added

- Added dependency-aware CI planning, reusable quality/package/consumer/docs
  workflows, a stable `ci-gate`, Node 22/24 nightly validation, and a
  high-severity dependency audit.
- Added post-publication registry consumer verification, npm signature and
  provenance-attestation verification, and automated annotated Git tag plus
  GitHub prerelease creation with separated permissions.

### Changed

- Split normal CI, GitHub Pages deployment, npm OIDC publication, registry
  verification, and GitHub release recording into explicit responsibilities.
- Gated automatic GitHub Pages deployment on successful CI for the current
  `main` commit, preventing stale CI runs from deploying older documentation.
- Updated GitHub-maintained workflow actions to their Node 24 generations,
  including the current checkout, setup-node, and Pages action releases.
- Made the explicit prerelease dist-tag authoritative during alpha; npm's
  registry-managed `latest` tag is not treated as a stability signal.

- Prepared `@vyrnforge/ui-core`, `@vyrnforge/ui-components`, and
  `@vyrnforge/ui-data-grid` as the synchronized `0.1.0-alpha.1` corrective
  prerelease. It corrects registry-facing package status text and aligns all
  three package versions.

### Fixed

### Deprecated

### Removed

- Removed undocumented package-root exports for `useColumnResize`,
  `useColumnReorder`, `useControlledState`, and `useDebouncedValue`. These
  remain internal grid coordination hooks and were not supported public APIs.
- Removed `ToastViewport` and `ToastViewportProps` from the
  `@vyrnforge/ui-components` package root. The viewport is internal provider
  infrastructure, not an application API.

### Accessibility

### Security

### Migration Notes

- Use `useDataGridState` for documented experimental grid-state coordination.
  Use `UniversalDataGrid` props and the documented public state/core helpers
  for resizing, ordering, and other grid behavior. Do not replace removed
  exports with deep imports from package source files.
- Use `ToastProvider` for toast rendering. Do not replace the removed
  `ToastViewport` root export with an internal source import.

## 0.1.0-alpha.0

### Added

- Historical first public prerelease: `@vyrnforge/ui-core@0.1.0-alpha.0`.
  `@vyrnforge/ui-components` and `@vyrnforge/ui-data-grid` were not published
  in that prerelease.
