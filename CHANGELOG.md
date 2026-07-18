# Changelog

Noteworthy public changes to VyrnForge UI will be documented here.

Versioned sections will begin with the first public alpha release. Until then, pre-alpha changes remain under `Unreleased` and detailed component documentation stays in the source-of-truth docs linked from `docs/README.md`.

Release readiness, versioning, publication, and migration policy live in [docs/release/](docs/release/).

## Unreleased

### Added

### Changed

- Prepared `@vyrnforge/ui-core`, `@vyrnforge/ui-components`, and
  `@vyrnforge/ui-data-grid` as the synchronized `0.1.0-alpha.0` candidate.
  The candidate remains pre-release and source-available; it has not been
  published to npm.

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
